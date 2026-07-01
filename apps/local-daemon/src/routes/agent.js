import express from "express";
import { pendingPermissions } from "@istiyak/agent-core";

const router = express.Router();

router.post("/approve", (req, res) => {
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
    // Permission may have timed out or agent already moved on
    res.status(404).json({
      error: "No pending permission request found for this ID. The agent may have timed out or already completed.",
      hint: "This is usually safe to ignore — the agent handles missing permissions gracefully."
    });
  }
});

export default router;
