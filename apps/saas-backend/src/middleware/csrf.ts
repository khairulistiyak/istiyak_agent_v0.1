import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString("hex");
const CSRF_TOKEN_LENGTH = 32;

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

/**
 * Validate CSRF token from request
 */
function validateCsrfToken(token: string, cookieToken: string): boolean {
  if (!token || !cookieToken) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(cookieToken));
}

/**
 * Middleware to set CSRF token cookie
 * Should be applied to GET routes that render forms
 */
export function csrfTokenMiddleware(req: any, res: Response, next: NextFunction) {
  const existingToken = req.cookies?._csrf;
  
  if (!existingToken) {
    const newToken = generateCsrfToken();
    res.cookie("_csrf", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000, // 1 hour
    });
    req.csrfToken = newToken;
  } else {
    req.csrfToken = existingToken;
  }
  
  next();
}

/**
 * Middleware to validate CSRF token on state-changing requests
 * Should be applied to POST, PUT, PATCH, DELETE routes
 */
export function csrfProtection(req: any, res: Response, next: NextFunction) {
  // Skip CSRF for safe methods
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Skip CSRF for webhook endpoints (they use signature verification)
  if (req.path.includes("/webhook")) {
    return next();
  }

  const tokenFromHeader = req.headers["x-csrf-token"] || req.headers["csrf-token"];
  const tokenFromBody = req.body?._csrf;
  const tokenFromCookie = req.cookies?._csrf;

  const submittedToken = tokenFromHeader || tokenFromBody;

  if (!submittedToken || !tokenFromCookie) {
    return res.status(403).json({ 
      error: "CSRF token missing. Please refresh the page and try again." 
    });
  }

  try {
    if (!validateCsrfToken(submittedToken, tokenFromCookie)) {
      return res.status(403).json({ 
        error: "Invalid CSRF token. Please refresh the page and try again." 
      });
    }
    next();
  } catch (err) {
    return res.status(403).json({ 
      error: "CSRF validation failed. Please refresh the page and try again." 
    });
  }
}

/**
 * Endpoint to get CSRF token for client-side requests
 */
export function getCsrfToken(req: any, res: Response) {
  const token = req.csrfToken || generateCsrfToken();
  res.cookie("_csrf", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600000,
  });
  res.json({ csrfToken: token });
}
