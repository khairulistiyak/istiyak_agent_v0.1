import express from "express";
import crypto from "crypto";
import { User } from "@istiyak/database";

const router = express.Router();

// Email Verification Mock Endpoints
router.post("/verify-email", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found." });

    const token = crypto.randomBytes(20).toString("hex");
    console.log(`[MOCK EMAIL VERIFICATION] Verification link for ${email}: http://localhost:3000/verify-email?token=${token}&email=${encodeURIComponent(email)}`);

    return res.status(200).json({
      status: "success",
      message: "Verification email sent (logged to server console).",
      token,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/verify", async (req, res, next) => {
  try {
    const { token, email } = req.query;
    if (!token || !email) return res.status(400).json({ error: "Token and email are required." });

    const user = await User.findOne({ email: (email as string).toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found." });

    user.isActive = true;
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Email verified successfully! You can now sign in.",
    });
  } catch (err) {
    next(err);
  }
});

export default router;
