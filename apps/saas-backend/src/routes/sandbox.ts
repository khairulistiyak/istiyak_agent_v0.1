import express from "express";
import { createSandbox, deleteSandbox, executeSandboxCommand } from "../controllers/sandboxController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/create", createSandbox);
router.post("/delete", deleteSandbox);
router.post("/execute", authenticateToken, executeSandboxCommand);

export default router;

