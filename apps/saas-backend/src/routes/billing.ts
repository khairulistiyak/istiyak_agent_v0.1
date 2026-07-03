import express from "express";
import { createCheckout } from "../controllers/billingController.js";
import { authenticateToken } from "../middleware/auth.js";
import { Subscription } from "@istiyak/database";

const router = express.Router();

// Apply JWT authentication
router.use(authenticateToken);

router.post("/checkout", createCheckout);

/**
 * GET /api/billing/status
 * Get current user subscription details
 */
router.get("/status", async (req: any, res, next) => {
  try {
    const userId = req.user._id;
    let subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      subscription = new Subscription({
        userId,
        plan: "free",
        status: "active",
      });
      await subscription.save();
    }

    return res.status(200).json({
      status: "success",
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/billing/upgrade-mock
 * Directly toggle user subscription plan between free and pro for testing
 */
router.post("/upgrade-mock", async (req: any, res, next) => {
  try {
    const userId = req.user._id;
    const { plan } = req.body; // "free" | "pro"

    if (!plan || !["free", "pro"].includes(plan)) {
      return res.status(400).json({ error: "Invalid plan type. Use 'free' or 'pro'." });
    }

    let subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      subscription = new Subscription({ userId });
    }

    subscription.plan = plan;
    subscription.status = "active";
    if (plan === "pro") {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      subscription.currentPeriodEnd = nextMonth;
    } else {
      subscription.currentPeriodEnd = undefined;
    }

    await subscription.save();

    return res.status(200).json({
      status: "success",
      message: `Successfully updated subscription plan to ${plan}.`,
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;

