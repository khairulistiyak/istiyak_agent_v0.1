import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import os from "os";
import commandRouter from "./routes/command.js";
import agentRouter from "./routes/agent.js";
import ragRouter from "./routes/rag.js";
import watcherRouter from "./routes/watcher.js";
import gitRouter from "./routes/git.js";
import {
  getStats,
  runAgent,
  calculateCost,
  pendingPermissions,
  resetSessionCost,
} from "@istiyak/agent-core";
import { setTodoCallback, unlockFile } from "./watcher/watcher.js";

function loadLocalConfig() {
  try {
    const home = os.homedir();
    const configPath = path.join(home, ".istiyak_agent_config.json");
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
  } catch (err) {
    console.error("[Config Loader] Failed to load config:", err.message);
  }
  return {};
}

let isAgentRunning = false;
let currentAbortController = null;

async function onTodoFound(filePath, todoText) {
  if (isAgentRunning) {
    // NOTE: Do NOT call unlockFile here — the lock is held by the currently running agent.
    // Releasing it prematurely would cause a race condition where the developer or another
    // process could overwrite the file mid-execution.
    console.log(
      `[Auto-Pilot] Agent is already executing a task. Skipping TODO: "${todoText}" in ${filePath}`
    );
    return;
  }

  isAgentRunning = true;
  console.log(`[Auto-Pilot] Initializing background task to resolve TODO in ${filePath}...`);

  try {
    const config = loadLocalConfig();
    const workspacePath = config.WORKSPACE_PATH || process.cwd();
    const relativePath = path.relative(workspacePath, filePath);

    const messages = [
      {
        role: "user",
        content: `Please resolve the following TODO comment in the file [${relativePath}]:\n"${todoText}"\n\nModify the file in-place and remove the TODO comment once complete.`,
      },
    ];

    console.log(`[Auto-Pilot] Running Agent for ${relativePath}...`);

    await runAgent({
      messages,
      provider: config.PROVIDER || "gemini",
      model: config.SELECTED_MODEL || "gemini-2.5-flash",
      authMethod: config.AUTH_METHOD || "apiKey",
      apiKey: config.API_KEY || "",
      serviceAccountPath: config.SERVICE_ACCOUNT_PATH || "",
      projectId: config.PROJECT_ID || "",
      location: config.LOCATION || "global",
      workspacePath,
      googleSearchEnabled: !!config.GOOGLE_SEARCH_ENABLED,
      onChunk: (chunk) => {
        process.stdout.write(chunk);
      },
      cloudSandboxEnabled: !!config.CLOUD_SANDBOX_ENABLED,
      token: config.TOKEN || "",
    });
    console.log(`[Auto-Pilot] Successfully resolved TODO in ${relativePath}.`);
  } catch (err) {
    console.error(`[Auto-Pilot] Failed to resolve TODO in ${filePath}:`, err.message);
  } finally {
    unlockFile(filePath);
    isAgentRunning = false;
  }
}

export function startDaemon() {
  // Register the todo callback for Auto-Pilot
  setTodoCallback(onTodoFound);
  const app = express();
  const PORT = process.env.PORT || 3001;

  const allowedOrigins = [
    "tauri://localhost",
    "https://tauri.localhost",
    "http://localhost:1420",
    "http://localhost:5173",
  ];

  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const isLocalhost =
          origin.startsWith("http://localhost:") ||
          origin.startsWith("https://localhost:") ||
          origin === "http://localhost" ||
          origin === "https://localhost";
        if (allowedOrigins.includes(origin) || isLocalhost) {
          return callback(null, true);
        } else {
          return callback(null, false);
        }
      },
    })
  );
  app.use(express.json({ limit: "50mb" }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: "UI" });
  });

  // Mount split API routes
  app.use("/api", commandRouter);
  app.use("/api/agent", agentRouter);
  app.use("/api/rag", ragRouter);
  app.use("/api/watcher", watcherRouter);
  app.use("/api/git", gitRouter);

  // Telemetry Stats route
  app.get("/api/telemetry/stats", (req, res) => {
    res.json(getStats());
  });

  // Chat endpoint (streams response back to React)
  app.post("/api/chat", async (req, res) => {
    if (currentAbortController) {
      console.log("[daemon] Aborting previous agent run for new request.");
      currentAbortController.abort();
      currentAbortController = null;
    }

    resetSessionCost();
    // Create abort controller for this chat session
    currentAbortController = new globalThis.AbortController();

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
      dockerSandboxEnabled,
      sandboxImage,
      token,
      agentMode,
    } = req.body;

    if (!messages || !Array.isArray(messages)) {
      currentAbortController = null;
      return res.status(400).json({ error: "Invalid messages list" });
    }

    // Set streaming headers — do NOT manually set Transfer-Encoding for HTTP/2 compatibility
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
      let currentOutput = "";

      const agentResult = await runAgent({
        messages,
        provider: provider || "gemini",
        model: model || "gemini-2.5-flash",
        authMethod: authMethod || "apiKey",
        apiKey,
        serviceAccountPath,
        projectId,
        location,
        workspacePath,
        googleSearchEnabled,
        onChunk: (chunk) => {
          currentOutput += chunk;
          res.write(chunk);
        },
        cloudSandboxEnabled,
        dockerSandboxEnabled,
        sandboxImage,
        token,
        agentMode,
        abortSignal: currentAbortController.signal,
        requestPermission: (reqId, command) => {
          return new Promise((resolve) => {
            pendingPermissions.set(reqId, resolve);
            // Auto-reject after 5 minutes if user doesn't respond
            setTimeout(
              () => {
                if (pendingPermissions.has(reqId)) {
                  console.warn(
                    `[daemon] Permission request ${reqId} timed out after 5 minutes. Auto-rejecting.`
                  );
                  pendingPermissions.delete(reqId);
                  resolve(false);
                }
              },
              5 * 60 * 1000
            );
          });
        },
      });

      // Append metadata at the end of the stream
      const totalTokens = agentResult.inputTokens + agentResult.outputTokens;
      const cost = calculateCost(
        provider || "gemini",
        agentResult.inputTokens,
        agentResult.outputTokens
      );

      res.write(
        `\n\n---\n*Session Cost: $${cost.toFixed(6)} | Tokens: ${totalTokens} (${agentResult.inputTokens} in / ${agentResult.outputTokens} out)*`
      );
      res.end();
    } catch (error) {
      console.error("[daemon.js] Error in chat execution:", error);
      res.write(
        `\n\n<agent_step step="0" status="error">Engine Error: ${(error.message || error).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</agent_step>`
      );
      res.end();
    } finally {
      currentAbortController = null;
    }
  });

  // Abort running agent
  app.post("/api/agent/abort", (req, res) => {
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
      res.json({ success: true, message: "Agent execution aborted." });
    } else {
      res.json({ success: false, message: "No agent is currently running." });
    }
  });

  // Check if agent is running
  app.get("/api/agent/status", (req, res) => {
    res.json({
      running: !!currentAbortController,
      message: currentAbortController ? "Agent is currently executing a task." : "Agent is idle.",
    });
  });

  app.listen(PORT, () => {
    console.log(`🚀 Istiyak Companion Engine listening in UI mode on port ${PORT}`);
  });
}
