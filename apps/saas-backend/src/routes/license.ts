import express from "express";
import { checkLicense } from "../controllers/licenseController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Authenticate via JWT if present, otherwise proceed directly to allow API key validation fallback
router.get(
  "/check",
  (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    
    if (token) {
      return authenticateToken(req, res, next);
    }
    next();
  },
  checkLicense
);

export default router;
