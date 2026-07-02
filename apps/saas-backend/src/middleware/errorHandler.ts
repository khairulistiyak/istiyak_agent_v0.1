import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(`[Error] Global handler caught exception:`, err);
  const status = err.status || 500;
  return res.status(status).json({
    error: err instanceof Error ? err.message : "An internal server error occurred."
  });
}
