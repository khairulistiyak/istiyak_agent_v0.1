import { Request, Response, NextFunction } from "express";

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || "unknown";
  console.log(`[RateLimiter] Checking limits for ${ip}`);
  next();
}
