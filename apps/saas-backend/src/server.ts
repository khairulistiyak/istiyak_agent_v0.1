import "./config/env.js";
import express from "express";
import cors from "cors";
import passport from "passport";
import * as Sentry from "@sentry/node";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import billingRoutes from "./routes/billing.js";
import updateRoutes from "./routes/update.js";
import sandboxRoutes from "./routes/sandbox.js";
import { connectDatabase } from "@istiyak/database";
import { errorHandler } from "./middleware/errorHandler.js";
import { initPassport } from "./config/passport.js";

// Initialize passport strategies
initPassport();

const app = express();
app.use(passport.initialize());
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
const allowedOrigins = [
  "tauri://localhost",
  "https://tauri.localhost",
  "http://localhost:1420",
  "http://localhost:5173",
];
const envOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isLocalhost = origin.startsWith("http://localhost:") || 
                        origin.startsWith("https://localhost:") || 
                        origin === "http://localhost" || 
                        origin === "https://localhost";
    if (allowedOrigins.includes(origin) || isLocalhost || envOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(null, false);
    }
  }
}));
app.use(express.json());

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

app.use(errorHandler);

// Establish MongoDB Connection and Start Server
connectDatabase(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 SaaS Backend listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
