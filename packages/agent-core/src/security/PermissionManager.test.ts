import { describe, it, expect } from "vitest";
import { PermissionManager } from "./PermissionManager.js";
import path from "path";

describe("PermissionManager", () => {
  const workspacePath = path.resolve("./mock_workspace");

  it("blocks empty or blank commands", () => {
    const res1 = PermissionManager.checkPermission("");
    expect(res1.allowed).toBe(false);
    expect(res1.reason).toBe("Empty command");

    const res2 = PermissionManager.checkPermission("   ");
    expect(res2.allowed).toBe(false);
  });

  it("blocks critically dangerous commands", () => {
    const res1 = PermissionManager.checkPermission("rm -rf /");
    expect(res1.allowed).toBe(false);
    expect(res1.reason).toContain("blocked pattern");

    const res2 = PermissionManager.checkPermission("rm -rf /*");
    expect(res2.allowed).toBe(false);

    const res3 = PermissionManager.checkPermission("mkfs.ext4 /dev/sda1");
    expect(res3.allowed).toBe(false);

    const res4 = PermissionManager.checkPermission(":(){ :|:& };:"); // fork bomb
    expect(res4.allowed).toBe(false);
  });

  it("allows safe workspace-scoped commands", () => {
    const res1 = PermissionManager.checkPermission("ls -la");
    expect(res1.allowed).toBe(true);
    expect(res1.requiresApproval).toBeUndefined();

    const res2 = PermissionManager.checkPermission("git status");
    expect(res2.allowed).toBe(true);
  });

  it("requires approval for potentially destructive or elevated commands", () => {
    const res1 = PermissionManager.checkPermission("rm my_file.ts");
    expect(res1.allowed).toBe(true);
    expect(res1.requiresApproval).toBe(true);
    expect(res1.reason).toContain("matches approval-required pattern");

    const res2 = PermissionManager.checkPermission("sudo apt update");
    expect(res2.allowed).toBe(true);
    expect(res2.requiresApproval).toBe(true);

    const res3 = PermissionManager.checkPermission("docker build .");
    expect(res3.allowed).toBe(true);
    expect(res3.requiresApproval).toBe(true);
  });

  it("detects paths accessed outside workspace in commands", () => {
    const res1 = PermissionManager.checkPermission("python /etc/passwd", workspacePath);
    expect(res1.allowed).toBe(false);
    expect(res1.requiresApproval).toBe(true);
    expect(res1.reason).toContain("Command accesses paths outside workspace");
  });

  it("returns correct human-readable security report", () => {
    const reportSafe = PermissionManager.getSecurityReport("ls");
    expect(reportSafe).toContain("✅ Command is safe");

    const reportBlock = PermissionManager.getSecurityReport("rm -rf /");
    expect(reportBlock).toContain("❌ Blocked");

    const reportApproval = PermissionManager.getSecurityReport("sudo ls");
    expect(reportApproval).toContain("⚠️ Requires approval");
  });
});
