import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../server.js";
import mongoose from "mongoose";
import { User } from "@istiyak/database";
import jwt from "jsonwebtoken";
import { MongoMemoryServer } from "mongodb-memory-server";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
let mongoServer: MongoMemoryServer;

describe("Admin Endpoints", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it("GET /api/admin/users should reject request without token (401)", async () => {
    const res = await request(app).get("/api/admin/users");
    expect(res.status).toBe(401);
  });

  it("GET /api/admin/users should reject request with non-admin token (403)", async () => {
    // Create standard user
    const standardUser = await User.create({
      email: "standard@example.com",
      password: "Password123!",
      name: "Standard User",
      role: "user",
      registeredIp: "127.0.0.1"
    });

    const token = jwt.sign({ userId: standardUser._id }, JWT_SECRET, { expiresIn: "1h" });

    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${token}`);
      
    expect(res.status).toBe(403);
  });
});
