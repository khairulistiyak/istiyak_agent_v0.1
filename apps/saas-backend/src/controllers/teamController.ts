import { Request, Response, NextFunction } from "express";
import { Team, User } from "@istiyak/database";

export async function createTeam(req: any, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    const ownerId = req.user._id;

    if (!name) {
      return res.status(400).json({ error: "Team name is required" });
    }

    const team = new Team({
      name,
      ownerId,
      members: [{ userId: ownerId, role: "owner", joinedAt: new Date() }],
      plan: "free",
    });

    await team.save();
    return res.status(201).json({ status: "success", team });
  } catch (err) {
    next(err);
  }
}

export async function getMyTeams(req: any, res: Response, next: NextFunction) {
  try {
    const userId = req.user._id;
    const teams = await Team.find({
      "members.userId": userId,
    }).populate("ownerId", "name email");

    return res.status(200).json({ status: "success", teams });
  } catch (err) {
    next(err);
  }
}

export async function addTeamMember(req: any, res: Response, next: NextFunction) {
  try {
    const { teamId, userEmail, role = "member" } = req.body;
    const requesterId = req.user._id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Check if requester is owner or admin
    const requesterMember = team.members.find(
      (m: any) => m.userId.toString() === requesterId.toString()
    );
    if (!requesterMember || !["owner", "admin"].includes(requesterMember.role)) {
      return res.status(403).json({ error: "Only team owners/admins can add members" });
    }

    const userToAdd = await User.findOne({ email: userEmail });
    if (!userToAdd) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user is already a member
    const existingMember = team.members.find(
      (m: any) => m.userId.toString() === userToAdd._id.toString()
    );
    if (existingMember) {
      return res.status(400).json({ error: "User is already a team member" });
    }

    team.members.push({
      userId: userToAdd._id,
      role,
      joinedAt: new Date(),
    } as any);
    await team.save();

    return res.status(200).json({ status: "success", team });
  } catch (err) {
    next(err);
  }
}

export async function removeTeamMember(req: any, res: Response, next: NextFunction) {
  try {
    const { teamId, userId } = req.body;
    const requesterId = req.user._id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    // Check if requester is owner or admin
    const requesterMember = team.members.find(
      (m: any) => m.userId.toString() === requesterId.toString()
    );
    if (!requesterMember || !["owner", "admin"].includes(requesterMember.role)) {
      return res.status(403).json({ error: "Only team owners/admins can remove members" });
    }

    // Cannot remove owner
    const memberToRemove = team.members.find(
      (m: any) => m.userId.toString() === userId
    );
    if (memberToRemove && memberToRemove.role === "owner") {
      return res.status(400).json({ error: "Cannot remove team owner" });
    }

    // Use pull() to remove subdocument from DocumentArray
    team.members.pull({ userId: userId });
    await team.save();

    return res.status(200).json({ status: "success", team });
  } catch (err) {
    next(err);
  }
}
