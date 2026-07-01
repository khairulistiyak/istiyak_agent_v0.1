import { Message } from "@istiyak/shared-types";
import { streamLLM } from "../llm/ProviderManager.js";
import { estimateTokens } from "../llm/TokenCounter.js";
import { PromptBuilder } from "./PromptBuilder.js";
import { ExceptionHandler } from "./ExceptionHandler.js";
import { ApprovalManager } from "./ApprovalManager.js";
import { SecretMasker } from "../security/SecretMasker.js";
import { ContextBuilder, compressHistory } from "./ContextBuilder.js";
export { compressHistory };
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
  dockerSandboxEnabled?: boolean;
  sandboxImage?: string;
  token?: string;
  agentMode?: "chat" | "plan" | "assist" | "agent";
  requestPermission?: (reqId: string, command: string) => Promise<boolean>;
  abortSignal?: AbortSignal;
}

function isConversationalMessage(text: string): boolean {
  const clean = text.trim().toLowerCase();
  const conversationalShortcuts = [
    "hi",
    "hello",
    "hey",
    "hola",
    "hi there",
    "hello there",
    "tumi ke",
    "who are you",
    "what is your name",
    "amar nam ki",
    "ki khobor",
    "how are you",
    "how's it going",
    "fine",
    "good",
    "dhonnobad",
    "thanks",
    "thank you",
    "great",
    "awesome",
    "bye",
    "goodbye",
    "see you",
    "tumi kemon acho",
    "kemon acho",
  ];
  if (clean.length < 25) {
    if (conversationalShortcuts.some((s) => clean.includes(s))) {
      return true;
    }
  }
  return false;
}

export async function runAgent(options: RunnerOptions) {
  const streamManager = new StreamManager();
  // Do NOT forward raw LLM JSON streaming chunks directly to the UI,
  // as it causes raw JSON text to render in the chat bubbles.
  // The UI is fully updated using structured <agent_step> tags instead.

  const workflow = new AgentWorkflow(`agent-${Date.now()}`);
  const recentToolNames: string[] = [];

  let cleanMessages = ContextBuilder.buildOptimizedContext(options.messages);

  const lastUserMsg = cleanMessages.filter((m) => m.role === "user").slice(-1)[0];
  const taskDescription = lastUserMsg?.content || "";
  const isConversational = isConversationalMessage(taskDescription);
  const agentMode = options.agentMode || (isConversational ? "chat" : "agent");
  const isDirectResponseMode = agentMode === "chat" || agentMode === "plan";

  // Auto RAG context lookup (Only when mode allows workspace context)
  if (options.workspacePath && !isDirectResponseMode) {
    try {
      if (lastUserMsg) {
        const matches = searchWorkspace(lastUserMsg.content, 3, options.workspacePath);
        if (matches.length > 0) {
          const contextText =
            "\n\n[System RAG Context: The following relevant codebase snippets were automatically retrieved from the workspace index. Use them to answer accurately if applicable]\n" +
            matches
              .map(
                (m) =>
                  `File: ${m.relativePath} (Lines ${m.startLine}-${m.endLine})\n\`\`\`\n${m.text}\n\`\`\``
              )
              .join("\n\n");

          cleanMessages = cleanMessages.map((m) => {
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
  const hasSystemMsg = agentHistory.some((m) => m.role === "system");

  // Build system prompt with workspace-specific rules if available
  let systemPromptContent: string;
  if (agentMode === "chat") {
    systemPromptContent =
      "You are ISTIYAK AGENT in CHAT mode. Respond directly and conversationally in the same language the user used. Do not output JSON. Do not use tools. Do not claim you read files or ran commands.";
  } else if (agentMode === "plan") {
    systemPromptContent =
      "You are ISTIYAK AGENT in PLAN mode. Give analysis, options, and implementation plans only. Do not output JSON. Do not use tools. Do not modify files, run commands, or claim you did.";
  } else {
    if (options.workspacePath) {
      try {
        systemPromptContent = await PromptBuilder.buildSystemPromptWithWorkspace(
          options.workspacePath
        );
      } catch {
        systemPromptContent = PromptBuilder.buildSystemPrompt();
      }
    } else {
      systemPromptContent = PromptBuilder.buildSystemPrompt();
    }
  }

  if (hasSystemMsg) {
    agentHistory = agentHistory.map((m) =>
      m.role === "system" ? { ...m, content: systemPromptContent } : m
    );
  } else {
    agentHistory.unshift({ role: "system", content: systemPromptContent });
  }

  if (isDirectResponseMode) {
    let directResponse = "";
    let streamedDirectResponse = false;
    directResponse = await streamLLM(
      agentHistory,
      options.provider,
      options.model,
      options.authMethod,
      options.apiKey,
      options.serviceAccountPath,
      options.projectId,
      options.location,
      (chunk) => {
        streamedDirectResponse = true;
        directResponse += chunk;
        options.onChunk(chunk);
      }
    );

    if (!streamedDirectResponse && directResponse) {
      options.onChunk(directResponse);
    }

    if (!directResponse) {
      directResponse = "";
    }

    return {
      content: directResponse,
      inputTokens: estimateTokens(JSON.stringify(agentHistory)),
      outputTokens: estimateTokens(directResponse),
      messagesUsed: [...agentHistory, { role: "assistant", content: directResponse }],
      streamStats: streamManager.getStats(),
    };
  }

  // Workflow: start task
  const rootSpan = Tracing.startSpan(`agent-run-${Date.now()}`);
  rootSpan.log(`Task: ${taskDescription.substring(0, 100)}`);
  await workflow.startTask(taskDescription);

  let inputTokensTotal = 0;
  let outputTokensTotal = 0;
  const maxSteps = LIMITS.MAX_STEPS;
  let lastToolResult = "";
  let consecutiveParseErrors = 0;

  for (let step = 1; step <= maxSteps; step++) {
    // Check abort signal
    if (options.abortSignal?.aborted) {
      options.onChunk(
        `<agent_step step="${step}" status="aborted">Task aborted by user.</agent_step>`
      );
      rootSpan.log("Task aborted");
      rootSpan.end();
      break;
    }

    // Reflection check: every N steps or after errors
    if (step > 1 && Reflection.shouldReflect(step, lastToolResult, recentToolNames)) {
      const safeResult = String(lastToolResult || "");
      const reflectionPrompt = Reflection.buildReflectionPrompt(
        agentHistory,
        step,
        safeResult.toLowerCase().includes("error") || safeResult.toLowerCase().includes("failed")
          ? safeResult
          : undefined
      );
      agentHistory.push({ role: "user", content: reflectionPrompt });
      options.onChunk(
        `<agent_step step="${step}" status="reflecting">Self-reflection triggered at step ${step}...</agent_step>`
      );
    }

    options.onChunk(
      `<agent_step step="${step}" status="thought">Asking AI for next step...</agent_step>`
    );

    // Security: Mask secrets in messages before sending to LLM
    const maskedHistory = agentHistory.map((m) => ({
      ...m,
      content: SecretMasker.mask(m.content),
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
        options.onChunk(
          `<agent_step step="${step}" status="error">Rate limit hit. Waiting 30 seconds before retry...</agent_step>`
        );
        await sleep(30000);
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
          options.onChunk(
            `<agent_step step="${step}" status="error">LLM request failed after retry: ${retryErr.message}</agent_step>`
          );
          await workflow.failTask(retryErr.message);
          throw retryErr;
        }
      } else {
        options.onChunk(
          `<agent_step step="${step}" status="error">LLM request failed: ${err.message}</agent_step>`
        );
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
    UsageTracker.trackUsage(
      options.provider,
      options.model,
      stepInputTokens,
      stepOutputTokens,
      stepCost
    );

    // Budget guard: stop if session cost exceeds limit
    const totalCostSoFar = calculateCost(options.provider, inputTokensTotal, outputTokensTotal);
    if (totalCostSoFar > LIMITS.MAX_SESSION_COST_USD) {
      options.onChunk(
        `<agent_step step="${step}" status="error">Session cost ($${totalCostSoFar.toFixed(4)}) exceeded budget limit ($${LIMITS.MAX_SESSION_COST_USD}). Stopping.</agent_step>`
      );
      rootSpan.log(`Budget exceeded: $${totalCostSoFar.toFixed(4)}`);
      rootSpan.end();
      break;
    }

    agentHistory.push({ role: "assistant", content: rawResponse });

    let decision: any;
    try {
      decision = parseResponse(rawResponse);
      consecutiveParseErrors = 0; // Reset on successful parse
    } catch (parseErr: any) {
      consecutiveParseErrors++;

      const text = rawResponse.trim();
      const hasJsonBrackets = text.includes("{") || text.includes("}") || text.includes('"action"');

      // If the response is plain text (no json brackets) OR we've had consecutive parsing failures,
      // treat it as a conversational answer and wrap it in a synthetic done action to stop the loop.
      if ((!hasJsonBrackets && text.length > 0) || consecutiveParseErrors >= 2) {
        console.log(
          `[AgentRunner] Wrapping conversational/plain response in synthetic done action (errors: ${consecutiveParseErrors}).`
        );
        decision = {
          thought:
            "The model responded with plain text or conversational greeting. Wrapping in done action to complete.",
          action: "done",
          params: {
            summary: text,
          },
        };
      } else {
        const errorMsg = `CRITICAL ERROR: Your last response was NOT a valid JSON object. You MUST respond with ONLY a single raw JSON object matching the schema (no markdown formatting, no explanations outside the JSON).

Example response format:
{
  "thought": "I will read the target file first",
  "action": "read_file",
  "params": {
    "relPath": "src/index.ts"
  }
}

Your invalid response started with: "${rawResponse.substring(0, 150)}"
Error details: ${parseErr.message}`;

        agentHistory.push({ role: "user", content: errorMsg });
        options.onChunk(
          `<agent_step step="${step}" status="error">Received invalid JSON. Retrying with auto-correction prompt...</agent_step>`
        );
        continue;
      }
    }

    // Map action_input back to params.summary if LLM outputs action_input instead of params
    if (decision.action_input && (!decision.params || !decision.params.summary)) {
      decision.params = {
        summary:
          typeof decision.action_input === "string"
            ? decision.action_input
            : JSON.stringify(decision.action_input),
      };
    }

    const { thought, action, params } = decision;

    if (thought && (action !== "done" || recentToolNames.length > 0)) {
      const escapedThought = thought.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      options.onChunk(`<agent_step step="${step}" status="thought">${escapedThought}</agent_step>`);
    }

    if (action === "done") {
      if (recentToolNames.length === 0) {
        options.onChunk(params?.summary || "Completed successfully.");
      } else {
        options.onChunk(
          `<agent_step step="${step}" status="success">Finished: ${params?.summary || "Task completed."}</agent_step>`
        );
        options.onChunk(`\n\n### Task Summary\n${params?.summary || "Completed successfully."}`);
      }
      await workflow.completeTask(params?.summary || "Task completed.");
      rootSpan.log("Task completed successfully");
      rootSpan.end();
      break;
    }

    if (agentMode === "assist") {
      const assistAllowedTools = new Set([
        "scan_project",
        "list_files",
        "read_file",
        "search_workspace",
        "git_status",
        "git_diff",
        "git_log",
        "walkthrough",
        "reflect",
      ]);

      if (!assistAllowedTools.has(action)) {
        const blockedSummary = `Assist mode blocked action [${action}]. Switch to Agent mode to allow file edits, terminal commands, or other write operations.`;
        options.onChunk(`<agent_step step="${step}" status="error">${blockedSummary}</agent_step>`);
        options.onChunk(`\n\n${blockedSummary}`);
        await workflow.completeTask(blockedSummary);
        rootSpan.log(blockedSummary);
        rootSpan.end();
        break;
      }
    }

    let paramAttrs = "";
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (key !== "content") {
          paramAttrs += ` ${key}="${String(val).replace(/"/g, "&quot;")}"`;
        }
      });
    }
    options.onChunk(
      `<agent_step step="${step}" status="action" name="${action}"${paramAttrs}></agent_step>`
    );

    // Track tool name for loop detection
    recentToolNames.push(action);
    if (recentToolNames.length > 10) recentToolNames.shift();

    let toolResult = "";
    const stepSpan = rootSpan.startChild(`step-${step}-${action}`);
    try {
      const toolContext = {
        workspacePath: options.workspacePath,
        cloudSandboxEnabled: options.cloudSandboxEnabled,
        dockerSandboxEnabled: options.dockerSandboxEnabled,
        sandboxImage: options.sandboxImage,
        googleSearchEnabled: options.googleSearchEnabled,
        token: options.token,
        _agentConfig: options,
      };

      // Security: Check if action requires approval via ApprovalManager
      if (ApprovalManager.requiresApproval(action, params, options.workspacePath)) {
        if (options.requestPermission) {
          const reqId = `approval-${Date.now()}`;
          const displayCommand =
            action === "run_command"
              ? params.command
              : `${action.toUpperCase().replace(/_/g, " ")}: ${params.relPath || params.path || ""}`;
          const reason = ApprovalManager.getApprovalReason(action);
          const escapedCmd = displayCommand.replace(/"/g, "&quot;");
          options.onChunk(
            `<permission_request type="${action}" command="${escapedCmd}" id="${reqId}" reason="${reason}"></permission_request>`
          );
          const approved = await options.requestPermission(reqId, displayCommand);
          if (!approved) {
            toolResult = `Action [${action}] blocked by user: ${reason}`;
            agentHistory.push({
              role: "user",
              content: `[System Tool Response for Step ${step}]\n${toolResult}`,
            });
            await workflow.nextStep(step, action, toolResult);
            lastToolResult = toolResult;
            continue;
          }
        } else {
          toolResult = `Action [${action}] requires user approval but no permission handler is available. Skipping dangerous operation.`;
          agentHistory.push({
            role: "user",
            content: `[System Tool Response for Step ${step}]\n${toolResult}`,
          });
          await workflow.nextStep(step, action, toolResult);
          lastToolResult = toolResult;
          continue;
        }
      }

      let rawResult: any;
      rawResult = await ToolRegistry.execute(action, params, toolContext);

      toolResult =
        typeof rawResult === "string"
          ? rawResult
          : rawResult === undefined || rawResult === null
            ? ""
            : JSON.stringify(rawResult, null, 2);

      options.onChunk(
        `<agent_step step="${step}" status="success">Completed action: ${action}</agent_step>`
      );
      stepSpan.log(`Result: ${String(toolResult || "").substring(0, 200)}`);
      stepSpan.end();
    } catch (toolErr: any) {
      const formattedError = ExceptionHandler.handle(toolErr);
      toolResult = `Action [${action}] failed: ${formattedError}`;
      options.onChunk(
        `<agent_step step="${step}" status="error">Action failed: ${formattedError}</agent_step>`
      );
      stepSpan.error = formattedError;
      stepSpan.end();
    }

    lastToolResult = String(toolResult || "");

    // Notify workflow of step completion
    await workflow.nextStep(step, action, toolResult);

    agentHistory.push({
      role: "user",
      content: `[System Tool Response for Step ${step}]\n${toolResult}`,
    });
  }

  if (rootSpan.status === "running") {
    rootSpan.log("Reached max steps");
    rootSpan.end();
  }
  streamManager.complete();

  return {
    content: "Done",
    inputTokens: inputTokensTotal,
    outputTokens: outputTokensTotal,
    messagesUsed: agentHistory,
    streamStats: streamManager.getStats(),
  };
}
