import { Response, NextFunction } from "express";
import crypto from "crypto";
import { ApiKey } from "@istiyak/database";
import { sha256 } from "@istiyak/shared-utils";

export async function listApiKeys(req: any, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    const keys = await ApiKey.find({ userId: user._id, isActive: true })
      .select("prefix name createdAt lastUsedAt expiresAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({ status: "success", keys });
  } catch (err) {
    next(err);
  }
}

export async function generateApiKey(req: any, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    const { name } = req.body;

    const rawKey = `istiyak_api_${crypto.randomBytes(24).toString("hex")}`;
    const hashedKey = sha256(rawKey);
    const prefix = rawKey.substring(0, 16); // "istiyak_api_xxxx"

    const newKey = new ApiKey({
      userId: user._id,
      key: hashedKey,
      prefix,
      name: name || "Developer Key",
      isActive: true,
    });

    await newKey.save();

    // The raw key is returned to the user ONLY ONCE upon creation
    return res.status(201).json({
      status: "success",
      message: "API key generated successfully.",
      key: {
        id: newKey._id,
        name: newKey.name,
        prefix: newKey.prefix,
        rawKey, // Explicit raw key for display once
        createdAt: newKey.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function revokeApiKey(req: any, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    const { keyId } = req.params;

    const key = await ApiKey.findOne({ _id: keyId, userId: user._id });
    if (!key) {
      return res.status(404).json({ error: "API key not found." });
    }

    key.isActive = false;
    await key.save();

    return res.status(200).json({
      status: "success",
      message: "API key revoked successfully.",
    });
  } catch (err) {
    next(err);
  }
}
