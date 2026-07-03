import express from "express";
import authRoutes from "./auth.js";
import adminRoutes from "./admin.js";
import billingRoutes from "./billing.js";
import sandboxRoutes from "./sandbox.js";
import updateRoutes from "./update.js";
import keysRoutes from "./keys.js";
import usageRoutes from "./usage.js";
import licenseRoutes from "./license.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/billing", billingRoutes);
router.use("/sandbox", sandboxRoutes);
router.use("/update", updateRoutes);
router.use("/keys", keysRoutes);
router.use("/usage", usageRoutes);
router.use("/license", licenseRoutes);

export default router;

