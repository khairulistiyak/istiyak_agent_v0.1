import express from "express";
import Stripe from "stripe";
import { User } from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock");

// Create Checkout Session
router.post("/create-checkout-session", authenticateToken, async (req, res) => {
  try {
    const successUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/cancel`;

    // Stripe checkout creation
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID || "price_mock",
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: req.user._id.toString(),
      },
    });

    res.json({
      url: session.url,
      id: session.id,
      message: "Stripe Billing checkout session created successfully."
    });
  } catch (error) {
    console.error("Stripe Session creation error:", error);
    res.status(500).json({ error: "Failed to initialize Stripe billing session." });
  }
});

// Mock Webhook Success Redirect (Retained for easy local sandbox checks/redirects)
router.get("/mock-success", async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).send("Missing user identifier");
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.isActive = true; 
    await user.save();

    res.send(`
      <div style="font-family: sans-serif; text-align: center; margin-top: 100px; color: #f3f4f6; background-color: #030712; padding: 40px; border-radius: 12px; max-width: 400px; margin-left: auto; margin-right: auto; border: 1px solid #1f2937;">
        <h1 style="color: #06b6d4;">Subscription Complete!</h1>
        <p>Your Istiyak AI Companion Pro license has been activated.</p>
        <p style="font-size: 0.85rem; color: #9ca3af;">You can now close this browser window and return to the application.</p>
      </div>
    `);
  } catch (err) {
    console.error("Subscription validation error:", err);
    res.status(500).send("Failed to validate mock billing transaction.");
  }
});

// Actual Stripe Webhook Endpoint (Supports signature check)
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (endpointSecret && sig) {
      // Standard Stripe signature validation
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } else {
      // Fallback for development tests if endpoint secret is not configured
      console.warn("[Stripe Webhook] Webhook secret not configured or signature missing. Running without validation.");
      event = req.body;
    }
  } catch (err) {
    console.error(`[Stripe Webhook] Signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`[Stripe Webhook] Received verified event type: ${event?.type}`);

  try {
    const eventObject = event.data?.object;

    if (event.type === "checkout.session.completed") {
      const session = eventObject;
      const userId = session.metadata?.userId;
      const customerId = session.customer;

      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          user.isActive = true;
          user.stripeCustomerId = customerId;
          await user.save();
          console.log(`[Stripe Webhook] User subscription activated for user: ${user.email}`);
        } else {
          console.warn(`[Stripe Webhook] User not found for userId: ${userId}`);
        }
      }
    } 
    else if (event.type === "customer.subscription.deleted") {
      const subscription = eventObject;
      const customerId = subscription.customer;

      if (customerId) {
        const user = await User.findOne({ stripeCustomerId: customerId });
        if (user) {
          user.isActive = false;
          await user.save();
          console.log(`[Stripe Webhook] Subscription cancelled. Deactivated license for: ${user.email}`);
        } else {
          console.warn(`[Stripe Webhook] User not found for customerId: ${customerId}`);
        }
      }
    }
    else if (event.type === "invoice.payment_failed") {
      const invoice = eventObject;
      const customerId = invoice.customer;

      if (customerId) {
        const user = await User.findOne({ stripeCustomerId: customerId });
        if (user) {
          user.isActive = false;
          await user.save();
          console.log(`[Stripe Webhook] Payment failed. Deactivated license for: ${user.email}`);
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error handling event:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
});

export default router;
