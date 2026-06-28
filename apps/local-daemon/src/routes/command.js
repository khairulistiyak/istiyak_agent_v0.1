import express from "express";
import { ToolRegistry } from "@istiyak/agent-core";

const router = express.Router();

router.post("/run-command", async (req, res) => {
  const { workspacePath, command } = req.body;
  if (!workspacePath || !command) {
    return res.status(400).json({ error: "workspacePath and command are required" });
  }
  try {
    const output = await ToolRegistry.execute("run_command", { command }, { workspacePath });
    res.json({ output });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
