import express from "express";
import { indexWorkspace } from "@istiyak/agent-memory";

const router = express.Router();

router.post("/reindex", (req, res) => {
  const { workspacePath } = req.body;
  if (!workspacePath) {
    return res.status(400).json({ error: "workspacePath is required" });
  }
  const success = indexWorkspace(workspacePath);
  res.json({ success, message: success ? "Workspace indexed successfully" : "Failed to index workspace" });
});

export default router;
