import express from "express";
import { listApiKeys, generateApiKey, revokeApiKey } from "../controllers/apiKeyController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply JWT authentication to all API key endpoints
router.use(authenticateToken);

router.get("/", listApiKeys);
router.post("/", generateApiKey);
router.delete("/:keyId", revokeApiKey);

export default router;
