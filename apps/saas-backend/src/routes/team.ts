import express from "express";
import { createTeam, getMyTeams, addTeamMember, removeTeamMember } from "../controllers/teamController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply JWT authentication to all team routes
router.use(authenticateToken);

router.post("/create", createTeam);
router.get("/my-teams", getMyTeams);
router.post("/add-member", addTeamMember);
router.post("/remove-member", removeTeamMember);

export default router;
