import { Request, Response, NextFunction } from "express";
import { stripe } from "../services/stripeService.js";
import { Subscription } from "@istiyak/database";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function handleStripeWebhook(req: Request, res: Response, next: NextFunction) {
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("❌ STRIPE_WEBHOOK_SECRET is missing. Webhook signature verification bypassed or rejected.");
    return res.status(500).json({ error: "Webhook secret configuration missing." });
  }

  const sig = req.headers["stripe-signature"];
  if (!sig) {
    return res.status(400).json({ error: "Missing stripe-signature header." });
  }

  let event;

  try {
    // Construct event using the raw body buffer
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    console.log(`🔔 Stripe Webhook Received: Event type: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const userId = session.metadata?.userId;
        const stripeSubscriptionId = session.subscription as string;

        if (!userId) {
          console.warn("⚠️ checkout.session.completed received without userId in metadata.");
          break;
        }

        // Fetch subscription details from Stripe to get period end dates
        const subDetails = (await stripe.subscriptions.retrieve(stripeSubscriptionId)) as any;

        let subscription = await Subscription.findOne({ userId });
        if (!subscription) {
          subscription = new Subscription({ userId });
        }

        subscription.stripeSubscriptionId = stripeSubscriptionId;
        subscription.plan = "pro";
        subscription.status = "active";
        subscription.currentPeriodStart = new Date(subDetails.current_period_start * 1000);
        subscription.currentPeriodEnd = new Date(subDetails.current_period_end * 1000);
        subscription.canceledAt = null;

        await subscription.save();
        console.log(`✅ Subscription created/updated for user: ${userId} (Stripe Sub: ${stripeSubscriptionId})`);
        break;
      }

      case "customer.subscription.updated": {
        const subDetails = event.data.object as any;
        const stripeSubscriptionId = subDetails.id;
        const status = subDetails.status;
        const plan = status === "active" ? "pro" : "free";

        const subscription = await Subscription.findOne({ stripeSubscriptionId });
        if (subscription) {
          subscription.status = status;
          subscription.plan = plan;
          subscription.currentPeriodStart = new Date(subDetails.current_period_start * 1000);
          subscription.currentPeriodEnd = new Date(subDetails.current_period_end * 1000);
          subscription.canceledAt = subDetails.canceled_at ? new Date(subDetails.canceled_at * 1000) : null;
          await subscription.save();
          console.log(`🔄 Subscription updated for Stripe Sub: ${stripeSubscriptionId} (New Status: ${status})`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subDetails = event.data.object as any;
        const stripeSubscriptionId = subDetails.id;

        const subscription = await Subscription.findOne({ stripeSubscriptionId });
        if (subscription) {
          subscription.status = "canceled";
          subscription.plan = "free";
          subscription.canceledAt = new Date();
          await subscription.save();
          console.log(`❌ Subscription canceled for Stripe Sub: ${stripeSubscriptionId}`);
        }
        break;
      }

      default:
        console.log(`ℹ️ Unhandled webhook event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
}
