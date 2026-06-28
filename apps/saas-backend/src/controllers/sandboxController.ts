import { Request, Response, NextFunction } from "express";
import { startSandboxSession, stopSandboxSession, executeCommandInSandbox } from "../services/sandboxService.js";

export async function createSandbox(req: Request, res: Response, next: NextFunction) {
  try {
    const { image, name } = req.body;
    const session = await startSandboxSession(image || "node:20-alpine", name || "agent-sandbox");
    return res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}

export async function deleteSandbox(req: Request, res: Response, next: NextFunction) {
  try {
    const { containerId } = req.body;
    if (!containerId) {
      return res.status(400).json({ error: "containerId parameter is required." });
    }
    const result = await stopSandboxSession(containerId);
    return res.status(200).json({ message: "Sandbox stopped successfully.", result });
  } catch (err) {
    next(err);
  }
}

export async function executeSandboxCommand(req: any, res: Response, next: NextFunction) {
  try {
    const { command, files } = req.body;
    if (!command) {
      return res.status(400).json({ error: "command is required." });
    }

    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: "User unauthorized." });
    }

    // Set headers for chunked streaming response
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    await executeCommandInSandbox(String(userId), command, files || {}, (chunk: string) => {
      res.write(chunk);
    });

    res.end();
  } catch (err) {
    // If headers have not been sent, we can forward to next error handler
    if (!res.headersSent) {
      next(err);
    } else {
      res.write(`\n\n[Execution Error: ${err.message || err}]`);
      res.end();
    }
  }
}

