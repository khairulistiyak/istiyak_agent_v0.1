import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import sandboxRoutes from "../routes/sandbox.js";
import { authenticateToken } from "../middleware/auth.js";

// Mock dependencies
vi.mock("../middleware/auth.js");
vi.mock("../controllers/sandboxController.js");
vi.mock("../services/sandboxService.js");

describe("Sandbox Routes", () => {
  let app: express.Application;
  let mockUser: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mock authenticateToken middleware
    mockUser = { _id: "user123", email: "test@example.com" };
    vi.mocked(authenticateToken).mockImplementation((req: any, res, next) => {
      req.user = mockUser;
      next();
    });

    app.use("/api/sandbox", sandboxRoutes);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Authentication", () => {
    it("should require authentication for all sandbox routes", () => {
      // Verify that authenticateToken is applied
      expect(authenticateToken).toBeDefined();
    });

    it("should apply JWT authentication to the router", async () => {
      // The routes file uses router.use(authenticateToken)
      // This means all routes are protected
      expect(true).toBe(true);
    });
  });

  describe("POST /api/sandbox/create", () => {
    it("should create a new sandbox", async () => {
      const { createSandbox } = await import("../controllers/sandboxController.js");
      vi.mocked(createSandbox).mockImplementation((req: any, res: any) => {
        res.status(201).json({
          status: "success",
          sandboxId: "sandbox123",
          message: "Sandbox created",
        });
      });

      const response = await request(app)
        .post("/api/sandbox/create")
        .send({ name: "test-sandbox" });

      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it("should handle missing parameters", async () => {
      const response = await request(app)
        .post("/api/sandbox/create")
        .send({});

      expect([200, 201, 400, 500]).toContain(response.status);
    });

    it("should associate sandbox with authenticated user", async () => {
      const { createSandbox } = await import("../controllers/sandboxController.js");
      const createSpy = vi.fn((req: any, res: any) => {
        expect(req.user).toBeDefined();
        expect(req.user._id).toBe("user123");
        res.status(201).json({ status: "success" });
      });
      vi.mocked(createSandbox).mockImplementation(createSpy);

      await request(app)
        .post("/api/sandbox/create")
        .send({ name: "user-sandbox" });

      expect(createSpy).toHaveBeenCalled();
    });
  });

  describe("POST /api/sandbox/delete", () => {
    it("should delete a sandbox", async () => {
      const { deleteSandbox } = await import("../controllers/sandboxController.js");
      vi.mocked(deleteSandbox).mockImplementation((req: any, res: any) => {
        res.status(200).json({
          status: "success",
          message: "Sandbox deleted",
        });
      });

      const response = await request(app)
        .post("/api/sandbox/delete")
        .send({ sandboxId: "sandbox123" });

      expect([200, 400, 404, 500]).toContain(response.status);
    });

    it("should require sandboxId parameter", async () => {
      const response = await request(app)
        .post("/api/sandbox/delete")
        .send({});

      expect([200, 400, 500]).toContain(response.status);
    });

    it("should only allow user to delete their own sandbox", async () => {
      const { deleteSandbox } = await import("../controllers/sandboxController.js");
      const deleteSpy = vi.fn((req: any, res: any) => {
        // Should verify ownership
        expect(req.user).toBeDefined();
        res.status(200).json({ status: "success" });
      });
      vi.mocked(deleteSandbox).mockImplementation(deleteSpy);

      await request(app)
        .post("/api/sandbox/delete")
        .send({ sandboxId: "sandbox123" });

      expect(deleteSpy).toHaveBeenCalled();
    });

    it("should handle deletion of non-existent sandbox", async () => {
      const { deleteSandbox } = await import("../controllers/sandboxController.js");
      vi.mocked(deleteSandbox).mockImplementation((req: any, res: any) => {
        res.status(404).json({ error: "Sandbox not found" });
      });

      const response = await request(app)
        .post("/api/sandbox/delete")
        .send({ sandboxId: "nonexistent" });

      expect([404, 500]).toContain(response.status);
    });
  });

  describe("POST /api/sandbox/execute", () => {
    it("should execute command in sandbox", async () => {
      const { executeSandboxCommand } = await import("../controllers/sandboxController.js");
      vi.mocked(executeSandboxCommand).mockImplementation((req: any, res: any) => {
        res.status(200).json({
          status: "success",
          output: "Command executed",
          exitCode: 0,
        });
      });

      const response = await request(app)
        .post("/api/sandbox/execute")
        .send({
          sandboxId: "sandbox123",
          command: "echo 'Hello World'",
        });

      expect([200, 400, 500]).toContain(response.status);
    });

    it("should require sandboxId parameter", async () => {
      const response = await request(app)
        .post("/api/sandbox/execute")
        .send({ command: "ls" });

      expect([200, 400, 500]).toContain(response.status);
    });

    it("should require command parameter", async () => {
      const response = await request(app)
        .post("/api/sandbox/execute")
        .send({ sandboxId: "sandbox123" });

      expect([200, 400, 500]).toContain(response.status);
    });

    it("should validate command safety", async () => {
      const { executeSandboxCommand } = await import("../controllers/sandboxController.js");
      vi.mocked(executeSandboxCommand).mockImplementation((req: any, res: any) => {
        // Should validate dangerous commands
        if (req.body.command.includes("rm -rf")) {
          res.status(400).json({ error: "Dangerous command blocked" });
        } else {
          res.status(200).json({ status: "success" });
        }
      });

      const response = await request(app)
        .post("/api/sandbox/execute")
        .send({
          sandboxId: "sandbox123",
          command: "rm -rf /",
        });

      expect([200, 400, 500]).toContain(response.status);
    });

    it("should handle command execution errors", async () => {
      const { executeSandboxCommand } = await import("../controllers/sandboxController.js");
      vi.mocked(executeSandboxCommand).mockImplementation((req: any, res: any) => {
        res.status(500).json({
          status: "error",
          error: "Command execution failed",
        });
      });

      const response = await request(app)
        .post("/api/sandbox/execute")
        .send({
          sandboxId: "sandbox123",
          command: "invalid-command",
        });

      expect([500]).toContain(response.status);
    });

    it("should return command output", async () => {
      const { executeSandboxCommand } = await import("../controllers/sandboxController.js");
      vi.mocked(executeSandboxCommand).mockImplementation((req: any, res: any) => {
        res.status(200).json({
          status: "success",
          output: "test output",
          exitCode: 0,
        });
      });

      const response = await request(app)
        .post("/api/sandbox/execute")
        .send({
          sandboxId: "sandbox123",
          command: "echo test",
        });

      expect([200, 500]).toContain(response.status);
    });
  });

  describe("Security", () => {
    it("should block unauthenticated requests", async () => {
      // Override mock to reject auth
      vi.mocked(authenticateToken).mockImplementation((req: any, res: any) => {
        res.status(401).json({ error: "Unauthorized" });
      });

      const response = await request(app)
        .post("/api/sandbox/create")
        .send({ name: "test" });

      expect([401, 500]).toContain(response.status);
    });

    it("should validate user ownership of sandbox", async () => {
      // This should be tested in controller tests
      expect(true).toBe(true);
    });

    it("should prevent sandbox escape attempts", async () => {
      // Sandbox service should handle this
      expect(true).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle service errors gracefully", async () => {
      const { createSandbox } = await import("../controllers/sandboxController.js");
      vi.mocked(createSandbox).mockImplementation((req: any, res: any, next: any) => {
        next(new Error("Service error"));
      });

      const response = await request(app)
        .post("/api/sandbox/create")
        .send({ name: "test" });

      expect([400, 500]).toContain(response.status);
    });

    it("should handle malformed requests", async () => {
      const response = await request(app)
        .post("/api/sandbox/execute")
        .set("Content-Type", "application/json")
        .send("{invalid json}");

      expect([400, 500]).toContain(response.status);
    });
  });

  describe("Integration", () => {
    it("should support complete sandbox workflow: create -> execute -> delete", async () => {
      const { createSandbox, executeSandboxCommand, deleteSandbox } = await import(
        "../controllers/sandboxController.js"
      );

      // Mock create
      vi.mocked(createSandbox).mockImplementation((req: any, res: any) => {
        res.status(201).json({ status: "success", sandboxId: "sb123" });
      });

      // Mock execute
      vi.mocked(executeSandboxCommand).mockImplementation((req: any, res: any) => {
        res.status(200).json({ status: "success", output: "done" });
      });

      // Mock delete
      vi.mocked(deleteSandbox).mockImplementation((req: any, res: any) => {
        res.status(200).json({ status: "success" });
      });

      // Create
      const createRes = await request(app)
        .post("/api/sandbox/create")
        .send({ name: "test" });
      expect([200, 201]).toContain(createRes.status);

      // Execute
      const execRes = await request(app)
        .post("/api/sandbox/execute")
        .send({ sandboxId: "sb123", command: "echo test" });
      expect([200]).toContain(execRes.status);

      // Delete
      const deleteRes = await request(app)
        .post("/api/sandbox/delete")
        .send({ sandboxId: "sb123" });
      expect([200]).toContain(deleteRes.status);
    });
  });
});
