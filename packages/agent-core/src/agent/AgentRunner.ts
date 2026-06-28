import { Message } from "@istiyak/shared-types";
import { streamLLM } from "../llm/ProviderManager.js";
import { estimateTokens } from "../llm/TokenCounter.js";
import { PromptBuilder } from "./PromptBuilder.js";
import { ExceptionHandler } from "./ExceptionHandler.js";
import { searchWorkspace } from "@istiyak/agent-memory";
import { parseResponse } from "../llm/ResponseParser.js";
import { ToolRegistry } from "../tools/registry/ToolRegistry.js";
import { loadAllTools } from "../tools/registry/ToolLoader.js";

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
}

export function compressHistory(messages: Message[]): Message[] {
  const maxHistoryTokens = 6000;
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
  let cleanMessages = compressHistory(options.messages);

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
  if (hasSystemMsg) {
    agentHistory = agentHistory.map(m => m.role === "system" ? { ...m, content: PromptBuilder.buildSystemPrompt() } : m);
  } else {
    agentHistory.unshift({ role: "system", content: PromptBuilder.buildSystemPrompt() });
  }

  let inputTokensTotal = 0;
  let outputTokensTotal = 0;
  const maxSteps = 40;

  for (let step = 1; step <= maxSteps; step++) {
    options.onChunk(`<agent_step step="${step}" status="thought">Asking AI for next step...</agent_step>`);

    let rawResponse = "";
    try {
      rawResponse = await streamLLM(
        agentHistory,
        options.provider,
        options.model,
        options.authMethod,
        options.apiKey,
        options.serviceAccountPath,
        options.projectId,
        options.location,
        // Pass through the real onChunk callback so tokens stream to the UI in real-time.
        // Previously this was () => {} which silently discarded all streaming chunks.
        options.onChunk
      );
    } catch (err: any) {
      options.onChunk(`<agent_step step="${step}" status="error">LLM request failed: ${err.message}</agent_step>`);
      throw err;
    }

    inputTokensTotal += estimateTokens(JSON.stringify(agentHistory));
    outputTokensTotal += estimateTokens(rawResponse);

    agentHistory.push({ role: "assistant", content: rawResponse });

    let decision: any;
    try {
      decision = parseResponse(rawResponse);
    } catch (parseErr: any) {
      const clean = rawResponse.trim();
      // If it looks like a plain text response rather than malformed JSON, wrap it as done
      if (!clean.startsWith("{") && !clean.startsWith("```json")) {
        decision = {
          thought: "Responding to user request directly.",
          action: "done",
          params: {
            summary: rawResponse
          }
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

    let toolResult = "";
    try {
      const toolContext = {
        workspacePath: options.workspacePath,
        cloudSandboxEnabled: options.cloudSandboxEnabled,
        token: options.token
      };

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
    } catch (toolErr: any) {
      const formattedError = ExceptionHandler.handle(toolErr);
      toolResult = `Action [${action}] failed: ${formattedError}`;
      options.onChunk(`<agent_step step="${step}" status="error">Action failed: ${formattedError}</agent_step>`);
    }

    agentHistory.push({
      role: "user",
      content: `[System Tool Response for Step ${step}]\n${toolResult}`
    });
  }

  return {
    content: "Done",
    inputTokens: inputTokensTotal,
    outputTokens: outputTokensTotal,
    messagesUsed: agentHistory
  };
}
