import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "../services/authService.js";

/** Basic email format validation */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Password strength: min 6 chars, at least one letter and one digit */
function isStrongPassword(password: string): boolean {
  return password.length >= 6 && /[a-zA-Z]/.test(password) && /\d/.test(password);
}

export async function handleRegister(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing required registration parameters." });
    }

    if (typeof email !== "string" || !isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    if (typeof password !== "string" || !isStrongPassword(password)) {
      return res.status(400).json({
        error: "Password must be at least 6 characters with at least one letter and one digit.",
      });
    }

    if (name && (typeof name !== "string" || name.length > 100)) {
      return res.status(400).json({ error: "Name must be a string under 100 characters." });
    }

    const displayName = name || email.split("@")[0] || "User";
    const result = await registerUser(email, password, displayName, req.ip || "127.0.0.1");
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Email and password must be strings." });
    }

    const result = await loginUser(email, password, req.ip || "127.0.0.1");
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
