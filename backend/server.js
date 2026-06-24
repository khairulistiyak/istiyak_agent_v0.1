import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import * as Sentry from "@sentry/node";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import billingRoutes from "./routes/billing.js";
import updateRoutes from "./routes/update.js";
import sandboxRoutes from "./routes/sandbox.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/istiyak_saas";

// Initialize Sentry Monitoring
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
  console.log("🛡️ Sentry Monitoring initialized on SaaS Backend.");
}

// Configure Express
app.use(cors({ origin: "*" }));
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Register API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/update", updateRoutes);
app.use("/api/sandbox", sandboxRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "SaaS Backend Gateway" });
});

// Sentry Error Handler
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// Establish MongoDB Connection and Start Server
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("🍃 Successfully connected to MongoDB database.");
    app.listen(PORT, () => {
      console.log(`🚀 SaaS Backend listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
