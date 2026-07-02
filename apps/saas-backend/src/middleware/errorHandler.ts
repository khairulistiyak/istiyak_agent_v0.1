import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(`[Error] Global handler caught exception:`, err);
  const status = err.status || 500;
  const message = status === 500 ? "An internal server error occurred." : err.message;
  return res.status(status).json({ error: message });
}
