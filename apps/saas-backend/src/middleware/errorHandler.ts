import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(`[Error] Global handler caught exception:`, err);
  const status = err.status || 400; // Default to 400 Bad Request for user validation errors
  const message = err.message || "An internal server error occurred.";
  return res.status(status).json({ error: message });
}

