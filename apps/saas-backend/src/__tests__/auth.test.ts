import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../server.js";
import mongoose from "mongoose";
import { User } from "@istiyak/database";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

describe("Auth Endpoints", () => {
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
    // Clear the users collection before each test
    await User.deleteMany({});
  });

  const testUser = {
    email: "test@example.com",
    password: "Password123!",
    name: "Test User"
  };

  it("POST /api/auth/register should create a new user (201)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);
    
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.token).toBeDefined();
  });

  it("POST /api/auth/register should reject duplicate email (409)", async () => {
    // Create first user
    await request(app).post("/api/auth/register").send(testUser);
    
    // Attempt duplicate
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);
      
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("POST /api/auth/login should return JWT for valid credentials (200)", async () => {
    // Create user
    await request(app).post("/api/auth/register").send(testUser);
    
    // Login
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password
      });
      
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.token).toBeDefined();
  });

  it("POST /api/auth/login should reject wrong password (401)", async () => {
    // Create user
    await request(app).post("/api/auth/register").send(testUser);
    
    // Login with wrong password
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: "WrongPassword!"
      });
      
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
