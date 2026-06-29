import { Message } from "@istiyak/shared-types";
import { streamLLM } from "../llm/ProviderManager.js";
import { estimateTokens } from "../llm/TokenCounter.js";
import { PromptBuilder } from "./PromptBuilder.js";
import { ExceptionHandler } from "./ExceptionHandler.js";
import { ApprovalManager } from "./ApprovalManager.js";
import { SecretMasker } from "../security/SecretMasker.js";
import { ContextBuilder } from "./ContextBuilder.js";
import { StreamManager } from "../llm/StreamManager.js";
import { recordMetric } from "../telemetry/Metrics.js";
import { UsageTracker } from "../telemetry/UsageTracker.js";
import { Tracing } from "../telemetry/Tracing.js";
import { calculateCost } from "../llm/CostTracker.js";
import { searchWorkspace } from "@istiyak/agent-memory";
import { parseResponse } from "../llm/ResponseParser.js";
import { ToolRegistry } from "../tools/registry/ToolRegistry.js";
import { loadAllTools } from "../tools/registry/ToolLoader.js";
import { AgentWorkflow } from "./AgentWorkflow.js";
import { Reflection } from "./Reflection.js";
import { LIMITS } from "../config/Limits.js";
import { sleep } from "../shared/helpers/index.js";

// Load tools statically on module loading
loadAllTools();

export const pendingPermissions = new Map<string, (approved: boolean) => void>();

export interface RunnerOptions {
  messages: Message[];
  provider: string;
  model: string;
  authMethod: string;
  apiKey: string;
  serviceAccountPath: string;
  projectId: string;
  location: string;
  workspacePath: string;
  googleSearchEnabled: boolean;
  onChunk: (text: string) => void;
  cloudSandboxEnabled?: boolean;
  token?: string;
  requestPermission?: (reqId: string, command: string) => Promise<boolean>;
  abortSignal?: AbortSignal;
}

export function compressHistory(messages: Message[]): Message[] {
  const maxHistoryTokens = LIMITS.MAX_HISTORY_TOKENS;
  const totalTokens = messages.reduce((acc, m) => acc + estimateTokens(m.content), 0);
  if (totalTokens <= maxHistoryTokens || messages.length <= 6) {
    return messages;
  }

  console.log(`[runner] History size (${totalTokens} tokens) exceeds limit. Compressing...`);
  
  const systemMsg = messages.find((m) => m.role === "system");
  const firstMsg = messages.filter((m) => m.role !== "system")[0];
  const lastFour = messages.slice(-4);

  const compressed: Message[] = [];
  if (systemMsg) compressed.push(systemMsg);
  if (firstMsg && (!firstMsg.id || !lastFour[0]?.id || firstMsg.id !== lastFour[0]?.id)) {
    compressed.push(firstMsg);
  }
  
  compressed.push({
    role: "system",
    content: "... [Intermediate message history compressed to save tokens] ...",
  });

  lastFour.forEach((m) => {
    if (!compressed.some((existing) => 
      (existing.id && m.id && existing.id === m.id) || 
      (existing.role === m.role && existing.content === m.content)
    )) {
      compressed.push(m);
    }
  });

  return compressed;
}

export async function runAgent(options: RunnerOptions) {
  const streamManager = new StreamManager();
  streamManager.onChunk((chunk) => {
    options.onChunk(chunk);
  });

  const workflow = new AgentWorkflow(`agent-${Date.now()}`);
  const recentToolNames: string[] = [];

  let cleanMessages = ContextBuilder.buildOptimizedContext(options.messages);

  // Auto RAG context lookup
  if (options.workspacePath) {
    try {
      const lastUserMsg = cleanMessages.filter(m => m.role === "user").slice(-1)[0];
      if (lastUserMsg) {
        const matches = searchWorkspace(lastUserMsg.content, 3);
        if (matches.length > 0) {
          const contextText = "\n\n[System RAG Context: The following relevant codebase snippets were automatically retrieved from the workspace index. Use them to answer accurately if applicable]\n" + 
            matches.map(m => `File: ${m.relativePath} (Lines ${m.startLine}-${m.endLine})\n\`\`\`\n${m.text}\n\`\`\``).join("\n\n");
          
          cleanMessages = cleanMessages.map(m => {
            if (m.role === "user" && m.content === lastUserMsg.content) {
              return { ...m, content: m.content + contextText };
            }
            return m;
          });
        }
      }
    } catch (err: any) {
      console.warn("[runner] Automatic RAG search context retrieval failed:", err.message);
    }
  }

  let agentHistory = [...cleanMessages];
  const hasSystemMsg = agentHistory.some(m => m.role === "system");

  // Build system prompt with workspace-specific rules if available
  let systemPromptContent: string;
  if (options.workspacePath) {
    try {
      systemPromptContent = await PromptBuilder.buildSystemPromptWithWorkspace(options.workspacePath);
    } catch {
      systemPromptContent = PromptBuilder.buildSystemPrompt();
    }
  } else {
    systemPromptContent = PromptBuilder.buildSystemPrompt();
  }

  if (hasSystemMsg) {
    agentHistory = agentHistory.map(m => m.role === "system" ? { ...m, content: systemPromptContent } : m);
  } else {
    agentHistory.unshift({ role: "system", content: systemPromptContent });
  }

  // Workflow: start task
  const lastUserMsg = cleanMessages.filter(m => m.role === "user").slice(-1)[0];
  const taskDescription = lastUserMsg?.content || "";
  const rootSpan = Tracing.startSpan(`agent-run-${Date.now()}`);
  rootSpan.log(`Task: ${taskDescription.substring(0, 100)}`);
  await workflow.startTask(taskDescription);

  let inputTokensTotal = 0;
  let outputTokensTotal = 0;
  const maxSteps = LIMITS.MAX_STEPS;
  let lastToolResult = "";

  for (let step = 1; step <= maxSteps; step++) {
    // Check abort signal
    if (options.abortSignal?.aborted) {
      options.onChunk(`<agent_step step="${step}" status="aborted">Task aborted by user.</agent_step>`);
      rootSpan.log("Task aborted");
      rootSpan.end();
      break;
    }

    // Reflection check: every N steps or after errors
    if (step > 1 && Reflection.shouldReflect(step, lastToolResult, recentToolNames)) {
      const reflectionPrompt = Reflection.buildReflectionPrompt(agentHistory, step, 
        lastToolResult.toLowerCase().includes("error") || lastToolResult.toLowerCase().includes("failed") 
          ? lastToolResult 
          : undefined
      );
      agentHistory.push({ role: "user", content: reflectionPrompt });
      options.onChunk(`<agent_step step="${step}" status="reflecting">Self-reflection triggered at step ${step}...</agent_step>`);
    }

    options.onChunk(`<agent_step step="${step}" status="thought">Asking AI for next step...</agent_step>`);

    // Security: Mask secrets in messages before sending to LLM
    const maskedHistory = agentHistory.map(m => ({
      ...m,
      content: SecretMasker.mask(m.content)
    }));

    const llmStartTime = Date.now();
    let rawResponse = "";
    try {
      rawResponse = await streamLLM(
        maskedHistory,
        options.provider,
        options.model,
        options.authMethod,
        options.apiKey,
        options.serviceAccountPath,
        options.projectId,
        options.location,
        (chunk) => streamManager.append(chunk)
      );
    } catch (err: any) {
      // Retry logic for rate limit (429) errors
      if (err.message?.includes("429") || err.message?.toLowerCase().includes("rate limit")) {
        options.onChunk(`<agent_step step="${step}" status="error">Rate limit hit. Waiting 15 seconds before retry...</agent_step>`);
        await sleep(15000);
        try {
          rawResponse = await streamLLM(
            maskedHistory,
            options.provider,
            options.model,
            options.authMethod,
            options.apiKey,
            options.serviceAccountPath,
            options.projectId,
            options.location,
            (chunk) => streamManager.append(chunk)
          );
        } catch (retryErr: any) {
          options.onChunk(`<agent_step step="${step}" status="error">LLM request failed after retry: ${retryErr.message}</agent_step>`);
          await workflow.failTask(retryErr.message);
          throw retryErr;
        }
      } else {
        options.onChunk(`<agent_step step="${step}" status="error">LLM request failed: ${err.message}</agent_step>`);
        await workflow.failTask(err.message);
        throw err;
      }
    }

    const latencyMs = Date.now() - llmStartTime;
    const stepInputTokens = estimateTokens(JSON.stringify(agentHistory));
    const stepOutputTokens = estimateTokens(rawResponse);
    inputTokensTotal += stepInputTokens;
    outputTokensTotal += stepOutputTokens;

    // Record telemetry
    const stepCost = calculateCost(options.provider, stepInputTokens, stepOutputTokens);
    recordMetric(options.provider, options.model, latencyMs, stepInputTokens, stepOutputTokens);
    UsageTracker.trackUsage(options.provider, options.model, stepInputTokens, stepOutputTokens, stepCost);

    agentHistory.push({ role: "assistant", content: rawResponse });

    let decision: any;
    try {
      decision = parseResponse(rawResponse);
    } catch (parseErr: any) {
      const clean = rawResponse.trim();
      if (!clean.startsWith("{") && !clean.startsWith("```json")) {
        decision = {
          thought: "Responding to user request directly.",
          action: "done",
          params: { summary: rawResponse }
        };
      } else {
        const errorMsg = `Error: Your response was not a valid JSON. Please output strict JSON matching the schema. Details: ${parseErr.message}`;
        agentHistory.push({ role: "user", content: errorMsg });
        options.onChunk(`<agent_step step="${step}" status="error">Received invalid JSON. Retrying with auto-correction prompt...</agent_step>`);
        continue;
      }
    }

    // Map action_input back to params.summary if LLM outputs action_input instead of params
    if (decision.action_input && (!decision.params || !decision.params.summary)) {
      decision.params = {
        summary: typeof decision.action_input === "string" 
          ? decision.action_input 
          : JSON.stringify(decision.action_input)
      };
    }

    const { thought, action, params } = decision;

    if (thought) {
      const escapedThought = thought.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      options.onChunk(`<agent_step step="${step}" status="thought">${escapedThought}</agent_step>`);
    }

    if (action === "done") {
      options.onChunk(`<agent_step step="${step}" status="success">Finished: ${params?.summary || "Task completed."}</agent_step>`);
      options.onChunk(`\n\n### Task Summary\n${params?.summary || "Completed successfully."}`);
      await workflow.completeTask(params?.summary || "Task completed.");
      rootSpan.log("Task completed successfully");
      rootSpan.end();
      break;
    }

    let paramAttrs = "";
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (key !== "content") {
          paramAttrs += ` ${key}="${String(val).replace(/"/g, '&quot;')}"`;
        }
      });
    }
    options.onChunk(`<agent_step step="${step}" status="action" name="${action}"${paramAttrs}></agent_step>`);

    // Track tool name for loop detection
    recentToolNames.push(action);
    if (recentToolNames.length > 10) recentToolNames.shift();

    let toolResult = "";
    const stepSpan = rootSpan.startChild(`step-${step}-${action}`);
    try {
      const toolContext = {
        workspacePath: options.workspacePath,
        cloudSandboxEnabled: options.cloudSandboxEnabled,
        token: options.token,
        _agentConfig: options
      };

      // Security: Check if action requires approval via ApprovalManager
      if (ApprovalManager.requiresApproval(action, params, options.workspacePath)) {
        if (options.requestPermission) {
          const reqId = `approval-${Date.now()}`;
          const reason = ApprovalManager.getApprovalReason(params?.command || action);
          options.onChunk(`<permission_request type="${action}" command="${params?.command || action}" id="${reqId}" reason="${reason}"></permission_request>`);
          const approved = await options.requestPermission(reqId, params?.command || action);
          if (!approved) {
            toolResult = `Action [${action}] blocked by user: ${reason}`;
            agentHistory.push({
              role: "user",
              content: `[System Tool Response for Step ${step}]\n${toolResult}`
            });
            await workflow.nextStep(step, action, toolResult);
            lastToolResult = toolResult;
            continue;
          }
        } else {
          toolResult = `Action [${action}] requires user approval but no permission handler is available. Skipping dangerous operation.`;
          agentHistory.push({
            role: "user",
            content: `[System Tool Response for Step ${step}]\n${toolResult}`
          });
          await workflow.nextStep(step, action, toolResult);
          lastToolResult = toolResult;
          continue;
        }
      }

      if (action === "run_command" && options.requestPermission) {
        const reqId = `req-${Date.now()}`;
        const escapedCmd = params.command.replace(/"/g, '&quot;');
        options.onChunk(`<permission_request type="run_command" command="${escapedCmd}" id="${reqId}"></permission_request>`);
        
        const approved = await options.requestPermission(reqId, params.command);
        if (!approved) {
          toolResult = `run_command [${params.command}] output: Execution blocked by user. You must find another way to compile or verify.`;
        } else {
          toolResult = await ToolRegistry.execute(action, params, toolContext);
        }
      } else {
        toolResult = await ToolRegistry.execute(action, params, toolContext);
      }

      options.onChunk(`<agent_step step="${step}" status="success">Completed action: ${action}</agent_step>`);
      stepSpan.log(`Result: ${toolResult.substring(0, 200)}`);
      stepSpan.end();
    } catch (toolErr: any) {
      const formattedError = ExceptionHandler.handle(toolErr);
      toolResult = `Action [${action}] failed: ${formattedError}`;
      options.onChunk(`<agent_step step="${step}" status="error">Action failed: ${formattedError}</agent_step>`);
      stepSpan.error = formattedError;
      stepSpan.end();
    }

    lastToolResult = toolResult;

    // Notify workflow of step completion
    await workflow.nextStep(step, action, toolResult);

    agentHistory.push({
      role: "user",
      content: `[System Tool Response for Step ${step}]\n${toolResult}`
    });
  }

  rootSpan.log("Reached max steps");
  rootSpan.end();
  streamManager.complete();

  return {
    content: "Done",
    inputTokens: inputTokensTotal,
    outputTokens: outputTokensTotal,
    messagesUsed: agentHistory,
    streamStats: streamManager.getStats()
  };
}
