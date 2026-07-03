import express from "express";
import { getStats } from "../controllers/adminController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Apply JWT authentication and admin guards
router.use(authenticateToken, requireAdmin);

router.get("/users", getStats);

export default router;

