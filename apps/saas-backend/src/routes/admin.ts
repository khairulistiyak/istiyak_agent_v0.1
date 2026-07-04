import express from "express";
import { getStats, getAllUsers, blockUser, unblockUser } from "../controllers/adminController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Apply JWT authentication and admin guards
router.use(authenticateToken, requireAdmin);

router.get("/metrics", getStats);
router.get("/users", getAllUsers);
router.post("/user/block", blockUser);
router.post("/user/unblock", unblockUser);

export default router;

