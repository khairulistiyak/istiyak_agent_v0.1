import { Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { User, Subscription } from "@istiyak/database";

export async function getProfile(req: any, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    
    // Find or create default free subscription
    let subscription = await Subscription.findOne({ userId: user._id });
    if (!subscription) {
      subscription = new Subscription({
        userId: user._id,
        plan: "free",
        status: "active",
      });
      await subscription.save();
    }

    return res.status(200).json({
      id: user._id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req: any, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    const { name, password, newPassword } = req.body;

    if (name) {
      if (typeof name !== "string" || name.length > 100) {
        return res.status(400).json({ error: "Name must be a string under 100 characters." });
      }
      user.name = name;
    }

    if (password && newPassword) {
      const isMatch = await bcrypt.compare(password, user.password).catch(() => false);
      if (!isMatch) {
        return res.status(400).json({ error: "Incorrect current password." });
      }

      if (newPassword.length < 6 || !/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
        return res.status(400).json({
          error: "New password must be at least 6 characters with at least one letter and one digit.",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    next(err);
  }
}
