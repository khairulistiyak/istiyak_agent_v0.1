import { Request, Response, NextFunction } from "express";
import { createStripeCheckoutSession } from "../services/stripeService.js";

export async function createCheckout(req: any, res: Response, next: NextFunction) {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;
    const userId = req.user?._id?.toString();

    if (!priceId) {
      return res.status(400).json({ error: "priceId parameter is required." });
    }
    const session = await createStripeCheckoutSession(priceId, successUrl, cancelUrl, userId);
    return res.status(200).json({ url: session.url });
  } catch (err) {
    next(err);
  }
}
