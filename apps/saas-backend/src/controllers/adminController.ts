import { Request, Response, NextFunction } from "express";
import { User, Subscription, ApiKey } from "@istiyak/database";

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const totalUsers = await User.countDocuments();
    const proUsers = await Subscription.countDocuments({ plan: "pro", status: "active" });
    const totalApiKeys = await ApiKey.countDocuments();

    return res.status(200).json({
      status: "success",
      totalUsers,
      proUsers,
      freeUsers: totalUsers - proUsers,
      totalApiKeys,
      uptimeSec: Math.floor(process.uptime()),
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

export async function blockUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isBlocked = true;
    await user.save();

    return res.status(200).json({ status: "success", message: "User blocked successfully." });
  } catch (err) {
    next(err);
  }
}

export async function unblockUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.isBlocked = false;
    await user.save();

    return res.status(200).json({ status: "success", message: "User unblocked successfully." });
  } catch (err) {
    next(err);
  }
}

