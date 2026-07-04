import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { handleRegister, handleLogin } from "../controllers/authController.js";
import { renderSuccessPage, renderNotConfiguredPage } from "../utils/authTemplates.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable is required. Set it in apps/saas-backend/.env");
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

const GOOGLE_CONFIGURED = !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
const GITHUB_CONFIGURED = !!(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET);

// Standard register & login routes
router.post("/register", handleRegister);
router.post("/login", handleLogin);

// OAuth configuration status endpoint
router.get("/status", (req, res) => {
  res.json({
    google: {
      configured: GOOGLE_CONFIGURED,
      authUrl: "/api/auth/google",
    },
    github: {
      configured: GITHUB_CONFIGURED,
      authUrl: "/api/auth/github",
    },
    message:
      GOOGLE_CONFIGURED || GITHUB_CONFIGURED
        ? "OAuth providers are configured. Use the auth buttons to sign in."
        : "No OAuth providers configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, and GITHUB_CLIENT_SECRET in your .env file.",
  });
});

// Google Auth routes
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
  router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login" }),
    (req: any, res) => {
      const user = req.user;
      const token = jwt.sign({ userId: user.id || user._id, email: user.email }, JWT_SECRET, {
        expiresIn: "7d",
      });
      renderSuccessPage(res, token, user.email);
    }
  );
} else {
  // Google OAuth not configured — show helpful message
  router.get("/google", (req, res) => {
    renderNotConfiguredPage(res, "Google");
  });
  router.get("/google/callback", (req, res) => {
    renderNotConfiguredPage(res, "Google");
  });
  router.post("/google/callback", (req, res) => {
    renderNotConfiguredPage(res, "Google");
  });
}

// GitHub Auth routes
if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
  router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));
  router.get(
    "/github/callback",
    passport.authenticate("github", { session: false, failureRedirect: "/login" }),
    (req: any, res) => {
      const user = req.user;
      const token = jwt.sign({ userId: user.id || user._id, email: user.email }, JWT_SECRET, {
        expiresIn: "7d",
      });
      renderSuccessPage(res, token, user.email);
    }
  );
} else {
  // GitHub OAuth not configured — show helpful message
  router.get("/github", (req, res) => {
    renderNotConfiguredPage(res, "GitHub");
  });
  router.get("/github/callback", (req, res) => {
    renderNotConfiguredPage(res, "GitHub");
  });
  router.post("/github/callback", (req, res) => {
    renderNotConfiguredPage(res, "GitHub");
  });
}

export default router;

