import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { User, PasswordReset } from "@istiyak/database";

const router = express.Router();

// Password Reset Mock Endpoints
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found." });

    const token = crypto.randomBytes(20).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

    const resetRecord = new PasswordReset({
      userId: user._id,
      token,
      expiresAt,
    });
    await resetRecord.save();

    console.log(`[MOCK PASSWORD RESET] Reset link for ${email}: http://localhost:3000/reset-password?token=${token}&email=${encodeURIComponent(email)}`);

    return res.status(200).json({
      status: "success",
      message: "Password reset link sent (logged to server console).",
      token,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const { token, email, newPassword } = req.body;
    if (!token || !email || !newPassword) {
      return res.status(400).json({ error: "Token, email, and newPassword are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found." });

    const resetRecord = await PasswordReset.findOne({
      userId: user._id,
      token,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return res.status(400).json({ error: "Invalid, used, or expired password reset token." });
    }

    if (newPassword.length < 6 || !/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return res.status(400).json({
        error: "Password must be at least 6 characters with at least one letter and one digit.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    resetRecord.isUsed = true;
    await resetRecord.save();

    return res.status(200).json({
      status: "success",
      message: "Password reset successful! You can now log in with your new password.",
    });
  } catch (err) {
    next(err);
  }
});

export default router;
