import Stripe from "stripe";
import { User } from "@istiyak/database";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.warn("⚠️ STRIPE_SECRET_KEY is missing in your environment configuration. Stripe operations will fail.");
}

const stripe = new Stripe(STRIPE_SECRET_KEY || "sk_test_dummy_key_for_start_up", {
  apiVersion: "2022-11-15" as any,
});

export async function createStripeCheckoutSession(
  priceId: string,
  successUrl?: string,
  cancelUrl?: string,
  userId?: string
) {
  if (!STRIPE_SECRET_KEY) {
    throw new Error("Stripe integration is not configured on the server.");
  }

  let stripeCustomerId = null;

  if (userId) {
    const user = await User.findById(userId);
    if (user) {
      if (user.stripeCustomerId) {
        stripeCustomerId = user.stripeCustomerId;
      } else {
        // Create new customer in Stripe
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name || user.email.split("@")[0],
          metadata: { userId: user._id.toString() },
        });
        stripeCustomerId = customer.id;
        user.stripeCustomerId = customer.id;
        await user.save();
      }
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId || undefined,
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl || "http://localhost:3000/success",
    cancel_url: cancelUrl || "http://localhost:3000/cancel",
    metadata: {
      userId: userId || "",
    },
    subscription_data: {
      metadata: {
        userId: userId || "",
      },
    },
  });

  return {
    id: session.id,
    url: session.url,
  };
}
export { stripe };
