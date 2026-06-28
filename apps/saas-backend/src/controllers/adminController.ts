import { Request, Response, NextFunction } from "express";

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    return res.status(200).json({
      status: "success",
      activeAgents: 12,
      totalUsers: 342,
      uptimeSec: process.uptime()
    });
  } catch (err) {
    next(err);
  }
}
