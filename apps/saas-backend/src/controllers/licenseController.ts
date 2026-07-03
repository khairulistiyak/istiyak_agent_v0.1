import { Response, NextFunction } from "express";
import { ApiKey, Subscription } from "@istiyak/database";
import { sha256 } from "@istiyak/shared-utils";

export async function checkLicense(req: any, res: Response, next: NextFunction) {
  try {
    let userId = req.user?._id;

    // Fallback: Check if x-api-key header is provided
    const apiKeyHeader = req.headers["x-api-key"];
    if (!userId && apiKeyHeader && typeof apiKeyHeader === "string") {
      const hashedKey = sha256(apiKeyHeader);
      const keyRecord = await ApiKey.findOne({ key: hashedKey, isActive: true });
      if (keyRecord) {
        userId = keyRecord.userId;
        
        // Update lastUsedAt timestamp asynchronously
        keyRecord.lastUsedAt = new Date();
        await keyRecord.save();
      }
    }

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized. Missing authentication token or valid API key." });
    }

    const subscription = await Subscription.findOne({ userId });
    const isPro = subscription ? (subscription.plan === "pro" && subscription.status === "active") : false;

    return res.status(200).json({
      status: "success",
      pro: isPro,
      plan: subscription ? subscription.plan : "free",
    });
  } catch (err) {
    next(err);
  }
}
