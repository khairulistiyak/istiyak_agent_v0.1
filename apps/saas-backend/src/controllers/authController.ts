import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "../services/authService.js";

export async function handleRegister(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing required registration parameters." });
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
    const result = await loginUser(email, password, req.ip || "127.0.0.1");
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
