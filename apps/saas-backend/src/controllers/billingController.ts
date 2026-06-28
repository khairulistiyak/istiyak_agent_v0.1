import { Request, Response, NextFunction } from "express";
import { createStripeCheckoutSession } from "../services/stripeService.js";

export async function createCheckout(req: Request, res: Response, next: NextFunction) {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;
    if (!priceId) {
      return res.status(400).json({ error: "priceId parameter is required." });
    }
    const session = await createStripeCheckoutSession(priceId, successUrl, cancelUrl);
    return res.status(200).json({ url: session.url });
  } catch (err) {
    next(err);
  }
}
