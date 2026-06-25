import mongoose from "mongoose";
import { User } from "./models/User.js";
import { IpLog } from "./models/IpLog.js";

export { User, IpLog };

export async function connectDatabase(uri) {
  try {
    await mongoose.connect(uri);
    console.log("🍃 Successfully connected to MongoDB database from shared packages/database.");
  } catch (err) {
    console.error("❌ MongoDB connection error in shared packages/database:", err);
    throw err;
  }
}
