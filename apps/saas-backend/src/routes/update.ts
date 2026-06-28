import express from "express";
import { checkUpdate } from "../controllers/updateController.js";

const router = express.Router();

router.get("/check", checkUpdate);

export default router;
