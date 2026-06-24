import express from "express";
import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Ephemeral Sandbox Execution Endpoint
router.post("/execute", authenticateToken, async (req, res) => {
  // Pro license gatekeeping
  if (!req.user.isActive) {
    return res.status(403).json({ error: "Access denied. Cloud Sandbox requires an active Pro license subscription." });
  }

  const { command, files } = req.body;
  if (!command) {
    return res.status(400).json({ error: "command is required" });
  }

  // Create temporary unique workspace directory
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "istiyak-sandbox-"));

  try {
    // Sync code files to sandbox workspace
    if (files && typeof files === "object") {
      for (const [relPath, content] of Object.entries(files)) {
        const fullPath = path.resolve(tempDir, relPath);
        if (!fullPath.startsWith(tempDir)) {
          throw new Error(`Security Violation: Path traversal blocked: ${relPath}`);
        }
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, content, "utf-8");
      }
    }

    // Write temp script inside container
    const scriptName = `.exec_${Date.now()}.sh`;
    const scriptPath = path.join(tempDir, scriptName);
    await fs.writeFile(scriptPath, command, "utf-8");

    // Ephemeral resource-constrained command execution
    const dockerCmd = `docker run --rm --network none --memory="512m" --cpus="0.5" -v "${tempDir}:/workspace" -w /workspace node:20-alpine sh ${scriptName}`;

    exec(dockerCmd, async (error, stdout, stderr) => {
      // Clean sandbox directory
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupErr) {
        console.error("[Sandbox Cleanup] Failed to delete temp directory:", cleanupErr);
      }

      const output = [];
      if (stdout) output.push(stdout);
      if (stderr) output.push(stderr);
      if (error) {
        if (error.message.includes("docker: command not found") || error.message.includes("Cannot connect to the Docker daemon")) {
          output.push(`[SaaS Cloud Sandbox Warning] Docker host daemon is not configured or running on the SaaS backend server.\nExecution fallback error details: ${error.message}`);
        } else {
          output.push(`Execution error: ${error.message}`);
        }
      }

      res.json({
        output: output.join("\n"),
        success: !error
      });
    });

  } catch (err) {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      // ignore
    }
    console.error("[Sandbox] Initialization error:", err);
    res.status(500).json({ error: `Sandbox initialization failed: ${err.message}` });
  }
});

export default router;
