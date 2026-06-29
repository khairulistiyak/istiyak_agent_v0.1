import path from "path";

/**
 * Validates commands against security policies before execution.
 * Checks workspace boundaries, dangerous patterns, and maintains
 * allow/deny lists for comprehensive command validation.
 */
export class PermissionManager {
  /** Commands that are always blocked — no override possible */
  private static readonly BLOCKED_COMMANDS = [
    "rm -rf /", "rm -rf /*",
    "mkfs", "fdisk", "dd if=",
    "> /dev/sda", "> /dev/disk",
    "shutdown", "reboot", "halt", "init 0",
    ":(){ :|:& };:",   // Fork bomb
    "curl | sh", "curl | bash", "wget -O - | sh",
  ];

  /** Commands that are always safe — workspace-scoped */
  private static readonly SAFE_COMMANDS = [
    "ls", "dir", "cat", "head", "tail", "wc",
    "echo", "printf", "pwd", "whoami",
    "git status", "git log", "git diff", "git branch",
    "npm list", "npm ls", "npm outdated", "npm audit",
    "node --version", "npm --version", "tsc --version",
    "grep", "find", "which", "type",
  ];

  /** Commands that require explicit approval */
  private static readonly REQUIRES_APPROVAL = [
    "rm", "rmdir", "del",
    "sudo", "su ",
    "kill", "killall", "pkill",
    "chmod", "chown",
    "npm publish", "yarn publish",
    "git push --force", "git push -f",
    "docker", "kubectl",
    "env", "printenv",
  ];

  /**
   * Validates a command against security policies.
   * Returns an object with allowed status and reason.
   */
  static checkPermission(
    command: string,
    workspacePath?: string
  ): { allowed: boolean; reason?: string; requiresApproval?: boolean } {
    if (!command || command.trim().length === 0) {
      return { allowed: false, reason: "Empty command" };
    }

    const cmd = command.toLowerCase().trim();

    // Check blocked list first — absolute deny
    for (const blocked of PermissionManager.BLOCKED_COMMANDS) {
      if (cmd.includes(blocked.toLowerCase())) {
        return {
          allowed: false,
          reason: `Command contains blocked pattern: "${blocked}"`,
        };
      }
    }

    // Check safe list — always allow
    for (const safe of PermissionManager.SAFE_COMMANDS) {
      if (cmd.startsWith(safe.toLowerCase())) {
        return { allowed: true };
      }
    }

    // Check if command tries to access paths outside workspace
    if (workspacePath) {
      const outsidePaths = PermissionManager.findOutsideWorkspacePaths(command, workspacePath);
      if (outsidePaths.length > 0) {
        return {
          allowed: false,
          requiresApproval: true,
          reason: `Command accesses paths outside workspace: ${outsidePaths.join(", ")}`,
        };
      }
    }

    // Check requires-approval list
    for (const pattern of PermissionManager.REQUIRES_APPROVAL) {
      if (cmd.includes(pattern.toLowerCase())) {
        return {
          allowed: true,
          requiresApproval: true,
          reason: `Command matches approval-required pattern: "${pattern}"`,
        };
      }
    }

    // Check for output redirection to system paths
    if (cmd.match(/>\s*\/(?!tmp)/)) {
      return {
        allowed: true,
        requiresApproval: true,
        reason: "Command redirects output to a system path",
      };
    }

    // Check for piping to dangerous commands
    if (cmd.includes("| rm") || cmd.includes("| sudo") || cmd.includes("| sh") || cmd.includes("| bash")) {
      return {
        allowed: true,
        requiresApproval: true,
        reason: "Command pipes output to a potentially dangerous command",
      };
    }

    // Default: allow
    return { allowed: true };
  }

  /**
   * Finds absolute paths in a command that are outside the workspace.
   */
  private static findOutsideWorkspacePaths(command: string, workspacePath: string): string[] {
    const outside: string[] = [];
    const resolvedWorkspace = path.resolve(workspacePath);

    // Extract potential paths from command
    const parts = command.split(/\s+/);
    for (const part of parts) {
      if (part.startsWith("/") && !part.startsWith("/dev/null")) {
        const resolvedPart = path.resolve(part);
        if (!resolvedPart.startsWith(resolvedWorkspace) && !resolvedPart.startsWith("/tmp")) {
          outside.push(part);
        }
      }
    }

    return outside;
  }

  /**
   * Returns a human-readable security report for a command.
   */
  static getSecurityReport(command: string, workspacePath?: string): string {
    const result = PermissionManager.checkPermission(command, workspacePath);
    if (result.allowed && !result.requiresApproval) {
      return `✅ Command is safe: ${command}`;
    }
    if (result.requiresApproval) {
      return `⚠️ Requires approval: ${result.reason}`;
    }
    return `❌ Blocked: ${result.reason}`;
  }
}
