import { Request, Response, NextFunction } from "express";

// Simple in-memory sliding-window rate limiter
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 30;  // per window
const ipHits = new Map<string, { count: number; resetAt: number }>();

// Periodic cleanup to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipHits) {
    if (entry.resetAt < now) ipHits.delete(ip);
  }
}, 60_000);

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const entry = ipHits.get(ip);

  if (!entry || entry.resetAt < now) {
    ipHits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  entry.count++;
  if (entry.count > MAX_REQUESTS) {
    return res.status(429).json({
      error: "Too many requests. Please try again later.",
      retryAfterMs: entry.resetAt - now,
    });
  }

  next();
}
