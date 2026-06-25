import express from "express";
import fs from "fs";
import path from "path";
import os from "os";
import { 
  startWatcher, 
  stopWatcher, 
  getTodos, 
  getLocks, 
  lockFile, 
  unlockFile 
} from "../watcher/watcher.js";

const router = express.Router();

router.post("/start", (req, res) => {
  const { workspacePath } = req.body;
  if (!workspacePath) {
    return res.status(400).json({ error: "workspacePath is required" });
  }
  const success = startWatcher(workspacePath);
  res.json({ success, message: success ? "Watcher started" : "Failed to start watcher" });
});

router.post("/stop", (req, res) => {
  stopWatcher();
  res.json({ success: true, message: "Watcher stopped" });
});

router.get("/todos", (req, res) => {
  res.json(getTodos());
});

router.get("/locks", (req, res) => {
  res.json(getLocks());
});

router.post("/lock", (req, res) => {
  const { filePath, owner } = req.body;
  if (!filePath || !owner) {
    return res.status(400).json({ error: "filePath and owner are required" });
  }
  const success = lockFile(filePath, owner);
  res.json({ success, message: success ? "File locked" : "Failed to lock file" });
});

router.post("/unlock", (req, res) => {
  const { filePath } = req.body;
  if (!filePath) {
    return res.status(400).json({ error: "filePath is required" });
  }
  const success = unlockFile(filePath);
  res.json({ success, message: success ? "File unlocked" : "Failed to unlock file" });
});

router.post("/oauth-callback", (req, res) => {
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

export default router;
