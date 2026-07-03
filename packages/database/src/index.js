import mongoose from "mongoose";
import { User } from "./models/User.js";
import { IpLog } from "./models/IpLog.js";
import { Subscription } from "./models/Subscription.js";
import { ApiKey } from "./models/ApiKey.js";
import { UsageLog } from "./models/UsageLog.js";
import { Session } from "./models/Session.js";
import { PasswordReset } from "./models/PasswordReset.js";

export { User, IpLog, Subscription, ApiKey, UsageLog, Session, PasswordReset };

export async function connectDatabase(uri) {
  try {
    await mongoose.connect(uri);
    console.log("🍃 Successfully connected to MongoDB database from shared packages/database.");
  } catch (err) {
    console.error("❌ MongoDB connection error in shared packages/database:", err);
    throw err;
  }
}

