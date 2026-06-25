import mongoose from "mongoose";

const ipLogSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
      unique: true,
    },
    count: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const IpLog = mongoose.model("IpLog", ipLogSchema);
