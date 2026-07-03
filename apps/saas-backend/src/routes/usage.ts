import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { UsageLog } from "@istiyak/database";

const router = express.Router();

// Apply JWT authentication to all usage endpoints
router.use(authenticateToken);

/**
 * GET /api/usage/summary
 * Retrieve aggregated usage stats (total cost, total tokens, total requests)
 */
router.get("/summary", async (req: any, res, next) => {
  try {
    const userId = req.user._id;

    const aggregateResult = await UsageLog.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalCost: { $sum: "$cost" },
          totalInputTokens: { $sum: "$inputTokens" },
          totalOutputTokens: { $sum: "$outputTokens" },
          totalRequests: { $sum: 1 },
        },
      },
    ]);

    const summary = aggregateResult[0] || {
      totalCost: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalRequests: 0,
    };

    return res.status(200).json({
      status: "success",
      summary: {
        totalCost: Number(summary.totalCost.toFixed(4)),
        totalTokens: summary.totalInputTokens + summary.totalOutputTokens,
        totalInputTokens: summary.totalInputTokens,
        totalOutputTokens: summary.totalOutputTokens,
        totalRequests: summary.totalRequests,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/usage/daily
 * Retrieve daily usage stats for the last 7 days
 */
router.get("/daily", async (req: any, res, next) => {
  try {
    const userId = req.user._id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await UsageLog.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          cost: { $sum: "$cost" },
          tokens: { $sum: { $add: ["$inputTokens", "$outputTokens"] } },
          requests: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing days with zero values to return a clean 7-day array
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      const found = dailyStats.find((stat) => stat._id === dateStr);
      result.push({
        date: dateStr,
        cost: found ? Number(found.cost.toFixed(4)) : 0,
        tokens: found ? found.tokens : 0,
        requests: found ? found.requests : 0,
      });
    }

    return res.status(200).json({
      status: "success",
      daily: result,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
