import { describe, it, expect } from "vitest";
import { WorkspaceGuard } from "./WorkspaceGuard.js";
import path from "path";

describe("WorkspaceGuard", () => {
  const workspacePath = path.resolve("./mock_workspace");

  it("allows path inside workspace", () => {
    const targetPath = path.join(workspacePath, "src/index.ts");
    expect(WorkspaceGuard.isInsideWorkspace(workspacePath, targetPath)).toBe(true);
  });

  it("blocks path outside workspace", () => {
    const targetPath = path.resolve(workspacePath, "../../outside.ts");
    expect(WorkspaceGuard.isInsideWorkspace(workspacePath, targetPath)).toBe(false);
  });

  it("allows exact workspace directory", () => {
    expect(WorkspaceGuard.isInsideWorkspace(workspacePath, workspacePath)).toBe(true);
  });

  it("throws on traversal read outside workspace", () => {
    expect(() => {
      WorkspaceGuard.validateReadPath(workspacePath, "../passwd");
    }).toThrow("Security violation");
  });

  it("throws on blocked sensitive paths", () => {
    expect(() => {
      WorkspaceGuard.validateReadPath(workspacePath, "src/.env");
    }).toThrow("Security violation: Reading \".env\" is not allowed.");
    
    expect(() => {
      WorkspaceGuard.validateReadPath(workspacePath, "/etc/passwd");
    }).toThrow("Security violation: Reading \"/etc/passwd\" is not allowed.");
  });

  it("throws on traversal write outside workspace", () => {
    expect(() => {
      WorkspaceGuard.validateWritePath(workspacePath, "../index.ts");
    }).toThrow("Security violation: Cannot write to");
  });

  it("resolves relative path safely inside workspace", () => {
    const resolved = WorkspaceGuard.resolveSafe(workspacePath, "src/utils.ts");
    expect(resolved).toBe(path.resolve(workspacePath, "src/utils.ts"));
  });

  it("throws when resolving relative path outside workspace", () => {
    expect(() => {
      WorkspaceGuard.resolveSafe(workspacePath, "../../etc/passwd");
    }).toThrow("Security violation");
  });
});
