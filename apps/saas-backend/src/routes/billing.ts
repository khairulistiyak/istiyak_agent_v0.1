import express from "express";
import { createCheckout } from "../controllers/billingController.js";
import { authenticateToken } from "../middleware/auth.js";
import { Subscription } from "@istiyak/database";
import { createStripePortalSession } from "../services/stripeService.js";

const router = express.Router();

// Apply JWT authentication
router.use(authenticateToken);

router.post("/checkout", createCheckout);

/**
 * POST /api/billing/portal
 * Create a Stripe Customer Portal session redirect url
 */
router.post("/portal", async (req: any, res, next) => {
  try {
    const userId = req.user._id.toString();
    const { returnUrl } = req.body;
    const session = await createStripePortalSession(userId, returnUrl);
    return res.status(200).json({ url: session.url });
  } catch (err) {
    next(err);
  }
});

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
 * POST /api/billing/upgrade
 * Upgrade user subscription to Pro plan via Stripe
 */
router.post("/upgrade", async (req: any, res, next) => {
  try {
    const userId = req.user._id;
    const { priceId } = req.body; // Stripe price ID for Pro plan

    if (!priceId) {
      return res.status(400).json({ error: "priceId is required" });
    }

    const user = await req.user;
    let subscription = await Subscription.findOne({ userId });

    // If user has active Pro subscription
    if (subscription?.plan === "pro" && subscription?.status === "active") {
      return res.status(400).json({ error: "User already has an active Pro subscription" });
    }

    // If user doesn't have Stripe customer, create checkout session
    if (!user.stripeCustomerId) {
      const { createStripeCheckoutSession } = await import("../services/stripeService.js");
      const session = await createStripeCheckoutSession(
        priceId,
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/billing?success=true`,
        `${process.env.FRONTEND_URL || "http://localhost:3000"}/billing?canceled=true`,
        userId.toString()
      );
      return res.status(200).json({ 
        checkoutUrl: session.url,
        message: "Redirecting to Stripe checkout"
      });
    }

    // If user has Stripe customer but no active subscription, create new subscription
    const { stripe } = await import("../services/stripeService.js");
    const stripeSubscription = await stripe.subscriptions.create({
      customer: user.stripeCustomerId,
      items: [{ price: priceId }],
      metadata: { userId: userId.toString() },
    }) as any;

    // Update local subscription record
    if (!subscription) {
      subscription = new Subscription({ userId });
    }
    subscription.plan = "pro";
    subscription.status = "active";
    subscription.stripeSubscriptionId = stripeSubscription.id;
    subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
    await subscription.save();

    return res.status(200).json({
      status: "success",
      message: "Successfully upgraded to Pro plan",
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
 * POST /api/billing/cancel
 * Cancel the user's active subscription at period end in Stripe
 */
router.post("/cancel", async (req: any, res, next) => {
  try {
    const userId = req.user._id;
    const subscription = await Subscription.findOne({ userId, status: "active", plan: "pro" });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return res.status(400).json({ error: "No active Pro subscription found." });
    }

    const { stripe } = await import("../services/stripeService.js");
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    subscription.canceledAt = new Date();
    await subscription.save();

    return res.status(200).json({
      status: "success",
      message: "Subscription will be cancelled at the end of the current billing period.",
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/billing/downgrade
 * Downgrade from Pro to Free at period end (same as cancel)
 */
router.post("/downgrade", async (req: any, res, next) => {
  try {
    const userId = req.user._id;
    const subscription = await Subscription.findOne({ userId, status: "active", plan: "pro" });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return res.status(400).json({ error: "No active Pro subscription to downgrade." });
    }

    const { stripe } = await import("../services/stripeService.js");
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    subscription.canceledAt = new Date();
    await subscription.save();

    return res.status(200).json({
      status: "success",
      message: "Your subscription will downgrade to Free at the end of the current billing period.",
      currentPeriodEnd: subscription.currentPeriodEnd,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

