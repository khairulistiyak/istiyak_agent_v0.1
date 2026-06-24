import { streamLLM } from "./llm.js";
import { estimateTokens } from "./costTracker.js";

const MAX_HISTORY_TOKENS = 6000; // Compress history if it exceeds this

// Map to hold pending permission resolvers
export const pendingPermissions = new Map();

async function requestPermission(reqId, command) {
  return new Promise((resolve) => {
    pendingPermissions.set(reqId, resolve);
  });
}

/**
 * Compresses chat history to keep token count under limits.
 * Retains system prompt, first user message, and last 4 messages.
 * Summarizes or drops intermediate messages.
 * @param {Array} messages 
 * @returns {Array} compressed messages
 */
export function compressHistory(messages) {
  let totalTokens = messages.reduce((acc, m) => acc + estimateTokens(m.content), 0);
  if (totalTokens <= MAX_HISTORY_TOKENS) {
    return messages;
  }

  console.log(`[runner.js] History size (${totalTokens} tokens) exceeds limit. Compressing...`);
  
  if (messages.length <= 6) {
    return messages;
  }

  // Keep system message if it exists
  const systemMsg = messages.find((m) => m.role === "system");
  // Keep first message
  const firstMsg = messages.filter((m) => m.role !== "system")[0];
  // Keep last 4 messages
  const lastFour = messages.slice(-4);

  const compressed = [];
  if (systemMsg) compressed.push(systemMsg);
  if (firstMsg && firstMsg.id !== lastFour[0]?.id) compressed.push(firstMsg);
  
  compressed.push({
    role: "system",
    content: "... [Intermediate message history compressed to save tokens] ...",
  });

  lastFour.forEach((m) => {
    if (!compressed.some((existing) => existing.id === m.id || (existing.role === m.role && existing.content === m.content))) {
      compressed.push(m);
    }
  });

  return compressed;
}

/**
 * Runs the agent engine loop.
 * @param {Array} messages - List of messages
 * @param {string} provider - 'gemini' | 'openai' | 'claude' | 'ollama' | 'custom'
 * @param {string} model - Specific model string
 * @param {string} authMethod - 'apiKey' | 'serviceAccount'
 * @param {string} apiKey - API key
 * @param {string} serviceAccountPath - Service account key file path
 * @param {string} projectId - GCP project ID
 * @param {string} location - GCP location region
 * @param {string} workspacePath - Active project workspace path
 * @param {boolean} googleSearchEnabled - Google search tool enabled flag
 * @param {Function} onChunk - Streaming text chunk callback
 * @returns {Promise<Object>} Output text and token usage details
 */
export async function runAgent(
  messages,
  provider,
  model,
  authMethod,
  apiKey,
  serviceAccountPath,
  projectId,
  location,
  workspacePath,
  googleSearchEnabled,
  onChunk,
  cloudSandboxEnabled = false,
  token = ""
) {
  // 1. Compress history
  let cleanMessages = compressHistory(messages);

  // Auto RAG context lookup and injection
  if (workspacePath) {
    try {
      const lastUserMsg = cleanMessages.filter(m => m.role === "user").slice(-1)[0];
      if (lastUserMsg) {
        const { searchWorkspace } = await import("./rag.js");
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
    } catch (err) {
      console.warn("[runner.js] Automatic RAG search context retrieval failed:", err.message);
    }
  }

  // System Prompt for multi-step execution agent
  const AGENT_SYSTEM_PROMPT = `You are ISTIYAK AGENT, an autonomous senior software engineering expert. 
Your goal is to solve the user's task step-by-step by utilizing the tools provided.

At each step, you must think and determine the next action. You can use one tool per turn.
Your response MUST be a valid JSON object matching the following TypeScript schema:

interface AgentResponse {
  thought: string; // Detail your step-by-step thinking process and analysis of the current state.
  action: 'scan_project' | 'read_file' | 'write_file' | 'run_command' | 'search_workspace' | 'git_checkout_branch' | 'git_commit_changes' | 'done';
  params: {
    relPath?: string;      // Required for read_file, write_file
    content?: string;      // Required for write_file (always write the COMPLETE, working file content, never placeholders)
    command?: string;      // Required for run_command
    query?: string;        // Required for search_workspace
    branchName?: string;   // Required for git_checkout_branch
    createNew?: boolean;   // Optional for git_checkout_branch
    message?: string;      // Required for git_commit_changes
    summary?: string;      // Required for done
  };
}

CRITICAL RULES:
1. ONLY output the raw JSON object. Do not wrap it in markdown codeblocks except standard JSON. Do not write text outside the JSON.
2. Before modifying files, you should read them using read_file.
3. If a command execution returns an error, examine the error message carefully and fix the files using write_file in the next steps.
4. When you are confident the task is successfully resolved (and verified via tests/builds if possible), set action to "done".
5. Never write partial files, draft edits, or comments like "// rest of code goes here". Always write the entire file cleanly.
`;

  // Build the conversation history with system prompt
  let agentHistory = [...cleanMessages];
  const hasSystemMsg = agentHistory.some(m => m.role === "system");
  if (hasSystemMsg) {
    agentHistory = agentHistory.map(m => m.role === "system" ? { ...m, content: AGENT_SYSTEM_PROMPT } : m);
  } else {
    agentHistory.unshift({ role: "system", content: AGENT_SYSTEM_PROMPT });
  }

  let inputTokensTotal = 0;
  let outputTokensTotal = 0;
  const maxSteps = 20; // Safe loop step limit for MVP

  for (let step = 1; step <= maxSteps; step++) {
    onChunk(`<agent_step step="${step}" status="thought">Asking AI for next step...</agent_step>`);

    let rawResponse = "";
    try {
      rawResponse = await streamLLM(
        agentHistory,
        provider,
        model,
        authMethod,
        apiKey,
        serviceAccountPath,
        projectId,
        location,
        () => {} // Do not stream raw intermediate JSON directly to standard bubble text
      );
    } catch (err) {
      onChunk(`<agent_step step="${step}" status="error">LLM request failed: ${err.message}</agent_step>`);
      throw err;
    }

    inputTokensTotal += estimateTokens(JSON.stringify(agentHistory));
    outputTokensTotal += estimateTokens(rawResponse);

    agentHistory.push({ role: "assistant", content: rawResponse });

    let decision;
    try {
      let cleanText = rawResponse.trim();
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText.substring(7);
      } else if (cleanText.startsWith("```")) {
        cleanText = cleanText.substring(3);
      }
      if (cleanText.endsWith("```")) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
      }
      decision = JSON.parse(cleanText.trim());
    } catch (parseErr) {
      const errorMsg = `Error: Your response was not a valid JSON. Please output strict JSON matching the schema. Details: ${parseErr.message}`;
      agentHistory.push({ role: "user", content: errorMsg });
      onChunk(`<agent_step step="${step}" status="error">Received invalid JSON. Retrying with auto-correction prompt...</agent_step>`);
      continue;
    }

    const { thought, action, params } = decision;

    if (thought) {
      // Escape tags
      const escapedThought = thought.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      onChunk(`<agent_step step="${step}" status="thought">${escapedThought}</agent_step>`);
    }

    if (action === "done") {
      onChunk(`<agent_step step="${step}" status="success">Finished: ${params?.summary || "Task completed."}</agent_step>`);
      onChunk(`\n\n### Task Summary\n${params?.summary || "Completed successfully."}`);
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
    onChunk(`<agent_step step="${step}" status="action" name="${action}"${paramAttrs}></agent_step>`);

    let toolResult = "";
    try {
      const { tools } = await import("./tools/index.js");

      if (action === "scan_project") {
        const files = await tools.scan_project(workspacePath);
        toolResult = `scan_project output: Scanned project. Available relative files: ${JSON.stringify(files)}`;
      } 
      else if (action === "read_file") {
        const content = await tools.read_file(workspacePath, params.relPath);
        toolResult = `read_file [${params.relPath}] output:\n${content}`;
      } 
      else if (action === "write_file") {
        await tools.write_file(workspacePath, params.relPath, params.content);
        toolResult = `write_file [${params.relPath}] output: File saved and locked successfully.`;
      } 
      else if (action === "run_command") {
        const reqId = `req-${Date.now()}`;
        const escapedCmd = params.command.replace(/"/g, '&quot;');
        onChunk(`<permission_request type="run_command" command="${escapedCmd}" id="${reqId}"></permission_request>`);
        
        // Block loop thread until resolve() is called from Express router via frontend click
        const approved = await requestPermission(reqId, params.command);
        if (!approved) {
          toolResult = `run_command [${params.command}] output: Execution blocked by user. You must find another way to compile or verify.`;
        } else {
          const cliOutput = await tools.run_command(workspacePath, params.command, cloudSandboxEnabled, token);
          toolResult = `run_command [${params.command}] output:\n${cliOutput}`;
        }
      } 
      else if (action === "search_workspace") {
        const matches = await tools.search_workspace(workspacePath, params.query);
        toolResult = `search_workspace output: Matches: ${JSON.stringify(matches)}`;
      } 
      else if (action === "git_checkout_branch") {
        const output = await tools.git_checkout_branch(workspacePath, params.branchName, params.createNew);
        toolResult = `git_checkout_branch output: ${output}`;
      } 
      else if (action === "git_commit_changes") {
        const output = await tools.git_commit_changes(workspacePath, params.message);
        toolResult = `git_commit_changes output: ${output}`;
      } 
      else {
        toolResult = `Error: Action tool '${action}' is not supported. Use valid action names.`;
      }

      onChunk(`<agent_step step="${step}" status="success">Completed action: ${action}</agent_step>`);
    } catch (toolErr) {
      toolResult = `Action [${action}] failed: ${toolErr.message}`;
      onChunk(`<agent_step step="${step}" status="error">Action failed: ${toolErr.message}</agent_step>`);
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
