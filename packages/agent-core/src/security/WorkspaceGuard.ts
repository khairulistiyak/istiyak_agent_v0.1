import path from "path";
import fs from "fs";

/**
 * Enforces workspace boundary rules.
 * Prevents the agent from reading or writing files outside the designated workspace.
 */
export class WorkspaceGuard {
  /** Sensitive system paths that should NEVER be read */
  private static readonly BLOCKED_READ_PATHS = [
    "/etc/passwd", "/etc/shadow", "/etc/hosts", "/etc/sudoers",
    "~/.ssh", "~/.aws", "~/.gnupg",
    ".env", ".env.local", ".env.production", ".env.secret",
  ];

  /**
   * Checks if a target path is inside the workspace directory.
   * Returns true if safe, false if outside workspace.
   */
  static isInsideWorkspace(workspacePath: string, targetPath: string): boolean {
    const resolvedWorkspace = path.resolve(workspacePath);
    const resolvedTarget = path.resolve(resolvedWorkspace, targetPath);
    return resolvedTarget.startsWith(resolvedWorkspace + path.sep) || resolvedTarget === resolvedWorkspace;
  }

  /**
   * Validates a file path for reading.
   * Throws an error if the path is outside the workspace or blocked.
   */
  static validateReadPath(workspacePath: string, targetPath: string): void {
    // Check for path traversal attacks
    if (targetPath.includes("..") && !WorkspaceGuard.isInsideWorkspace(workspacePath, targetPath)) {
      throw new Error(`Security violation: Path traversal detected. "${targetPath}" is outside the workspace.`);
    }

    // Check blocked sensitive paths
    const normalizedTarget = targetPath.replace(/\\/g, "/").toLowerCase();
    for (const blocked of WorkspaceGuard.BLOCKED_READ_PATHS) {
      if (normalizedTarget.includes(blocked.toLowerCase())) {
        throw new Error(`Security violation: Reading "${blocked}" is not allowed.`);
      }
    }
  }

  /**
   * Validates a file path for writing.
   * Throws an error if the path would write outside the workspace.
   */
  static validateWritePath(workspacePath: string, targetPath: string): void {
    if (!WorkspaceGuard.isInsideWorkspace(workspacePath, targetPath)) {
      throw new Error(`Security violation: Cannot write to "${targetPath}". Target is outside the workspace "${workspacePath}".`);
    }
  }

  /**
   * Resolves a relative path safely within the workspace.
   * Returns the absolute path.
   */
  static resolveSafe(workspacePath: string, relativePath: string): string {
    const resolved = path.resolve(workspacePath, relativePath);
    if (!resolved.startsWith(path.resolve(workspacePath))) {
      throw new Error(`Security violation: Resolved path "${resolved}" is outside workspace.`);
    }
    return resolved;
  }

  /**
   * Checks if a symlink would escape the workspace.
   */
  static checkSymlink(workspacePath: string, targetPath: string): boolean {
    try {
      const stat = fs.lstatSync(targetPath);
      if (stat.isSymbolicLink()) {
        const realPath = fs.realpathSync(targetPath);
        return realPath.startsWith(path.resolve(workspacePath));
      }
    } catch {
      // If we can't stat it, it doesn't exist yet — that's fine
    }
    return true;
  }
}
