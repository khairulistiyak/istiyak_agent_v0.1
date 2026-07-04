import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, enum: ["owner", "admin", "member"], default: "member" },
    joinedAt: { type: Date, default: Date.now },
  }],
  plan: { type: String, enum: ["free", "team_pro"], default: "free" },
  createdAt: { type: Date, default: Date.now },
});

export const Team = mongoose.model("Team", TeamSchema);
export default Team;
