import express from "express";
import cors from "cors";
import commandRouter from "./routes/command.js";
import agentRouter from "./routes/agent.js";
import ragRouter from "./routes/rag.js";
import watcherRouter from "./routes/watcher.js";
import { getStats } from "./engine/telemetry.js";
import { runAgent } from "./engine/runner.js";
import { calculateCost } from "./engine/costTracker.js";

export function startDaemon() {
  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(cors({ origin: "*" }));
  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: "UI" });
  });

  // Mount split API routes
  app.use("/api", commandRouter);
  app.use("/api/agent", agentRouter);
  app.use("/api/rag", ragRouter);
  app.use("/api/watcher", watcherRouter);

  // Telemetry Stats route
  app.get("/api/telemetry/stats", (req, res) => {
    res.json(getStats());
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
      console.error("[daemon.js] Error in chat execution:", error);
      res.write(`\n\n[Engine Error: ${error.message || error}]`);
      res.end();
    }
  });

  app.listen(PORT, () => {
    console.log(`🚀 Istiyak Companion Engine listening in UI mode on port ${PORT}`);
  });
}
