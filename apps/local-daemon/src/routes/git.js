import express from "express";
import { ToolRegistry } from "@istiyak/agent-core";

const router = express.Router();

router.get("/status", async (req, res) => {
  const { workspacePath } = req.query;
  if (!workspacePath) {
    return res.status(400).json({ error: "workspacePath query parameter is required" });
  }
  try {
    const result = await ToolRegistry.execute("git_status", {}, { workspacePath });
    // Parse git status output to extract branch name and initialized state
    const branchMatch = result.match(/On branch ([^\n]+)/);
    const branch = branchMatch ? branchMatch[1].trim() : "main";
    const initialized = !result.includes("not a git repository");
    res.json({ initialized, branch, raw: result });
  } catch (err) {
    // git_status tool throws if not a git repo
    res.json({ initialized: false, branch: "none", raw: err.message });
  }
});

router.get("/log", async (req, res) => {
  const { workspacePath, count } = req.query;
  if (!workspacePath) {
    return res.status(400).json({ error: "workspacePath is required" });
  }
  try {
    const result = await ToolRegistry.execute("git_log", { count: parseInt(count) || 10 }, { workspacePath });
    res.json({ log: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/diff", async (req, res) => {
  const { workspacePath } = req.query;
  if (!workspacePath) {
    return res.status(400).json({ error: "workspacePath is required" });
  }
  try {
    const result = await ToolRegistry.execute("git_diff", {}, { workspacePath });
    res.json({ diff: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
