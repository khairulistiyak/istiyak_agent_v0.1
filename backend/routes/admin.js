import express from "express";
import { User } from "../models/User.js";

const router = express.Router();

// Route to Block a User
router.post("/user/block", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isBlocked = true;
    await user.save();

    res.json({ message: `User ${user.email} has been blocked successfully.` });
  } catch (error) {
    console.error("Block Error:", error);
    res.status(500).json({ error: "Internal server error blocking user" });
  }
});

// Route to Unblock a User
router.post("/user/unblock", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isBlocked = false;
    await user.save();

    res.json({ message: `User ${user.email} has been unblocked successfully.` });
  } catch (error) {
    console.error("Unblock Error:", error);
    res.status(500).json({ error: "Internal server error unblocking user" });
  }
});

// Route to get all registered users
router.get("/users", async (req, res) => {
  try {
    // Retrieve users, sorted by registration date (newest first)
    const users = await User.find({}, "email isActive isBlocked createdAt registeredIp").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Fetch Users Error:", error);
    res.status(500).json({ error: "Internal server error fetching users list" });
  }
});

export default router;
