import express from "express";
import cors from "cors";
import readline from "readline";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import os from "os";
import { runAgent, pendingPermissions } from "./runner.js";
import { calculateCost } from "./costTracker.js";
import { 
  startWatcher, 
  stopWatcher, 
  getTodos, 
  getLocks, 
  lockFile, 
  unlockFile 
} from "./watcher.js";
import { runCommand } from "./tools/index.js";
import { indexWorkspace } from "./rag.js";
import { getStats } from "./telemetry.js";

// Load dotenv just in case
dotenv.config();

const args = process.argv.slice(2);
const isTerminalMode = args.includes("--terminal");

if (isTerminalMode) {
  startTerminalMode();
} else {
  startUiMode();
}

/**
 * Starts the Express server for Tauri UI mode.
 */
function startUiMode() {
  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(cors({ origin: "*" }));
  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: "UI" });
  });

  // Watcher Endpoints
  app.post("/api/watcher/start", (req, res) => {
    const { workspacePath } = req.body;
    if (!workspacePath) {
      return res.status(400).json({ error: "workspacePath is required" });
    }
    const success = startWatcher(workspacePath);
    res.json({ success, message: success ? "Watcher started" : "Failed to start watcher" });
  });

  app.post("/api/watcher/stop", (req, res) => {
    stopWatcher();
    res.json({ success: true, message: "Watcher stopped" });
  });

  app.get("/api/watcher/todos", (req, res) => {
    res.json(getTodos());
  });

  app.get("/api/watcher/locks", (req, res) => {
    res.json(getLocks());
  });

  app.post("/api/watcher/lock", (req, res) => {
    const { filePath, owner } = req.body;
    if (!filePath || !owner) {
      return res.status(400).json({ error: "filePath and owner are required" });
    }
    const success = lockFile(filePath, owner);
    res.json({ success, message: success ? "File locked" : "Failed to lock file (already locked by other owner)" });
  });

  app.post("/api/watcher/unlock", (req, res) => {
    const { filePath } = req.body;
    if (!filePath) {
      return res.status(400).json({ error: "filePath is required" });
    }
    const success = unlockFile(filePath);
    res.json({ success, message: success ? "File unlocked" : "Failed to unlock file" });
  });

  // Direct Run Command endpoint for terminal panel
  app.post("/api/run-command", async (req, res) => {
    const { workspacePath, command } = req.body;
    if (!workspacePath || !command) {
      return res.status(400).json({ error: "workspacePath and command are required" });
    }
    try {
      const output = await runCommand(workspacePath, command);
      res.json({ output });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Endpoint to approve/reject terminal commands requested by the agent
  app.post("/api/agent/approve", (req, res) => {
    const { requestId, approved } = req.body;
    if (!requestId) {
      return res.status(400).json({ error: "requestId is required" });
    }
    const resolver = pendingPermissions.get(requestId);
    if (resolver) {
      resolver(!!approved);
      pendingPermissions.delete(requestId);
      res.json({ success: true, message: `Permission resolved as: ${approved}` });
    } else {
      res.status(404).json({ error: "No pending permission request found for this ID." });
    }
  });

  // RAG Re-indexing endpoint
  app.post("/api/rag/reindex", (req, res) => {
    const { workspacePath } = req.body;
    if (!workspacePath) {
      return res.status(400).json({ error: "workspacePath is required" });
    }
    const success = indexWorkspace(workspacePath);
    res.json({ success, message: success ? "Workspace indexed successfully" : "Failed to index workspace" });
  });

  // Git Status endpoint
  app.get("/api/git/status", async (req, res) => {
    const { workspacePath } = req.query;
    if (!workspacePath) {
      return res.status(400).json({ error: "workspacePath is required" });
    }
    try {
      const output = await runCommand(workspacePath, "git rev-parse --abbrev-ref HEAD");
      const branchName = output.trim();
      const isCleanOutput = await runCommand(workspacePath, "git status --porcelain");
      const hasChanges = isCleanOutput.trim().length > 0;
      res.json({ 
        initialized: !branchName.toLowerCase().includes("error"), 
        branch: branchName.toLowerCase().includes("error") ? "unknown" : branchName,
        hasChanges 
      });
    } catch (err) {
      res.json({ initialized: false, branch: "none", hasChanges: false, error: err.message });
    }
  });

  // Telemetry Stats route
  app.get("/api/telemetry/stats", (req, res) => {
    res.json(getStats());
  });

  // OAuth token writeback route
  app.post("/api/watcher/oauth-callback", (req, res) => {
    const { token, email } = req.body;
    if (!token || !email) {
      return res.status(400).json({ error: "token and email are required" });
    }
    try {
      const home = os.homedir();
      const configPath = path.join(home, ".istiyak_agent_config.json");
      let currentConfig = {};
      if (fs.existsSync(configPath)) {
        currentConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      }
      currentConfig.TOKEN = token;
      currentConfig.USER_EMAIL = email;
      fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2), "utf-8");
      console.log(`[OAuth connection callback] Successfully connected browser login session for ${email}`);
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to write OAuth session back to local config:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Chat endpoint (streams response back to React)
  app.post("/api/chat", async (req, res) => {
    const { 
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
      cloudSandboxEnabled,
      token
    } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages list" });
    }

    // Set streaming headers
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    try {
      let currentOutput = "";
      
      const agentResult = await runAgent(
        messages,
        provider || "gemini",
        model || "gemini-2.5-flash",
        authMethod || "apiKey",
        apiKey,
        serviceAccountPath,
        projectId,
        location,
        workspacePath,
        googleSearchEnabled,
        (chunk) => {
          currentOutput += chunk;
          res.write(chunk);
        },
        cloudSandboxEnabled,
        token
      );

      // Append metadata at the end of the stream
      const totalTokens = agentResult.inputTokens + agentResult.outputTokens;
      const cost = calculateCost(provider || "gemini", agentResult.inputTokens, agentResult.outputTokens);
      
      res.write(`\n\n---\n*Session Cost: $${cost.toFixed(6)} | Tokens: ${totalTokens} (${agentResult.inputTokens} in / ${agentResult.outputTokens} out)*`);
      res.end();
    } catch (error) {
      console.error("[agent2.js] Error in chat execution:", error);
      res.write(`\n\n[Engine Error: ${error.message || error}]`);
      res.end();
    }
  });

  app.listen(PORT, () => {
    console.log(`🚀 Istiyak Companion Engine listening in UI mode on port ${PORT}`);
  });
}

/**
 * Starts the CLI Terminal mode.
 */
function startTerminalMode() {
  console.log("Welcome to ISTIYAK AI Companion - Terminal Mode");
  console.log("-----------------------------------------------");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const provider = process.env.AI_PROVIDER || "gemini";
  const model = process.env.AI_MODEL || "gemini-2.5-flash";
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: API key is missing. Set GEMINI_API_KEY or OPENAI_API_KEY environment variables.");
    process.exit(1);
  }

  const messages = [
    {
      role: "system",
      content: "You are ISTIYAK AGENT, an autonomous software engineering expert.",
    },
  ];

  function promptUser() {
    rl.question("\nYou: ", async (userInput) => {
      const trimmed = userInput.trim();
      if (trimmed.toLowerCase() === "exit") {
        console.log("Goodbye!");
        rl.close();
        process.exit(0);
      }

      messages.push({ role: "user", content: trimmed });
      process.stdout.write("Assistant: ");

      try {
        let responseBuffer = "";
        const agentResult = await runAgent(
          messages,
          provider,
          model,
          apiKey,
          (chunk) => {
            responseBuffer += chunk;
            process.stdout.write(chunk);
          }
        );

        messages.push({ role: "assistant", content: responseBuffer });

        const totalTokens = agentResult.inputTokens + agentResult.outputTokens;
        const cost = calculateCost(provider, agentResult.inputTokens, agentResult.outputTokens);
        console.log("\n-----------------------------------------------");
        console.log(`Cost: $${cost.toFixed(6)} | Tokens: ${totalTokens}`);
        console.log("-----------------------------------------------");
      } catch (err) {
        console.error(`\n❌ Error: ${err.message}`);
      }

      promptUser();
    });
  }

  promptUser();
}
