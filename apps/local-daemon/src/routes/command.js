import express from "express";
import { runCommand } from "../tools/index.js";

const router = express.Router();

router.post("/run-command", async (req, res) => {
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

export default router;
