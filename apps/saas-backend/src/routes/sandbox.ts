import express from "express";
import { createSandbox, deleteSandbox, executeSandboxCommand } from "../controllers/sandboxController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply JWT authentication to ALL sandbox routes
router.use(authenticateToken);

router.post("/create", createSandbox);
router.post("/delete", deleteSandbox);
router.post("/execute", executeSandboxCommand);

export default router;

