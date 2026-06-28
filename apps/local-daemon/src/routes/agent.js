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
    res.status(404).json({ error: "No pending permission request found for this ID." });
  }
});

export default router;
