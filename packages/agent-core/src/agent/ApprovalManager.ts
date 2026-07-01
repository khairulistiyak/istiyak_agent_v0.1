import path from "path";

/**
 * Controls which commands and actions require explicit user approval.
 * Acts as a security gate to prevent the agent from executing
 * potentially dangerous operations without user consent.
 */
export class ApprovalManager {
  /** Commands that are always dangerous and require approval */
  private static readonly DANGEROUS_COMMANDS = [
    "rm -rf", "rm -r", "rmdir", "del /s",                    // Mass deletion
    "sudo", "su ",                                             // Privilege escalation
    "kill", "killall", "pkill",                               // Process termination
    "chmod 777", "chown",                                      // Permission changes
    "mkfs", "fdisk", "dd ", "format",                         // Disk operations
    "shutdown", "reboot", "halt",                              // System control
    "curl | sh", "curl | bash", "wget -O - |",                // Pipe-to-shell
    "> /dev/", ">> /dev/",                                     // Device writes
    "npm publish", "yarn publish",                             // Package publishing
    "git push --force", "git push -f",                        // Force push
    "drop database", "drop table", "truncate table",          // Database destruction
    "env", "printenv",                                         // Environment exposure
    "npm install", "npm i ", "yarn add", "pnpm add",          // Package installation (may install malicious packages)
    "pip install", "pip3 install",                              // Python package installation
    "npx ",                                                     // Execute remote packages
  ];

  /** Commands that are always safe and never need approval */
  private static readonly SAFE_COMMANDS = [
    "ls", "dir", "cat", "head", "tail", "less", "more",      // Read-only
    "echo", "printf", "wc",                                    // Output
    "pwd", "whoami", "hostname",                               // System info
    "git status", "git log", "git diff", "git branch",        // Read-only git
    "npm list", "npm ls", "npm outdated", "npm audit",        // Read-only npm
    "npm run build", "npm run test", "npm run dev",            // Standard npm scripts
    "npm run lint", "npm run start", "npm run preview",        // Standard npm scripts
    "npx tsc", "npx vitest", "npx jest", "npx eslint",       // Standard dev tools
    "tsc", "vitest", "jest",                                   // Direct dev tool calls
    "node --version", "npm --version", "tsc --version",       // Version checks
    "grep", "find", "which", "type",                          // Search
  ];

  /**
   * Determines whether a command requires explicit user approval.
   * Returns true if the command matches any dangerous pattern and
   * does not match a safe pattern override.
   */
  static requiresApproval(action: string, params: any, workspacePath?: string): boolean {
    // Only dangerous file operations need explicit approval
    // write_file and precise_edit are auto-approved within workspace for speed
    const dangerousFileActions = ["delete_file"];
    if (dangerousFileActions.includes(action)) {
      return true;
    }

    if (action !== "run_command") return false;

    const command = (params?.command || "").toLowerCase().trim();
    if (!command) return false;

    // Check safe list first — these never need approval
    const isSafe = ApprovalManager.SAFE_COMMANDS.some(safe => command.startsWith(safe));
    if (isSafe) return false;

    // Check dangerous command patterns
    const isDangerous = ApprovalManager.DANGEROUS_COMMANDS.some(danger =>
      command.includes(danger.toLowerCase())
    );
    if (isDangerous) return true;

    // Check if command tries to access paths outside the workspace
    if (workspacePath && params?.command) {
      const cmdParts = params.command.split(/\s+/);
      for (const part of cmdParts) {
        if (part.startsWith("/") && !part.startsWith(path.resolve(workspacePath))) {
          // Absolute path outside workspace — needs approval
          return true;
        }
      }
    }

    // Check for output redirection that could overwrite system files
    if (command.includes("> /") || command.includes(">> /")) {
      return true;
    }

    // Pipe to potentially dangerous commands
    if (command.includes("| rm") || command.includes("| sudo") || command.includes("| sh")) {
      return true;
    }

    // Default: no approval needed for unrecognized commands
    return false;
  }

  /**
   * Returns a human-readable reason why approval is required.
   */
  static getApprovalReason(commandOrAction: string): string {
    const cmd = commandOrAction.toLowerCase();
    if (cmd === "write_file") return "This action creates or overwrites a file.";
    if (cmd === "precise_edit") return "This action modifies specific parts of an existing file.";
    if (cmd === "delete_file") return "This action deletes a file from the workspace.";
    if (cmd === "create_directory") return "This action creates a new folder in the workspace.";
    if (cmd === "move_file") return "This action moves a file or directory.";
    if (cmd === "rename_file") return "This action renames a file or directory.";

    if (cmd.includes("rm") || cmd.includes("del")) return "This command deletes files or directories.";
    if (cmd.includes("sudo") || cmd.includes("su ")) return "This command requires elevated privileges.";
    if (cmd.includes("kill")) return "This command terminates running processes.";
    if (cmd.includes("chmod") || cmd.includes("chown")) return "This command changes file permissions.";
    if (cmd.includes("push --force") || cmd.includes("push -f")) return "This command force-pushes to a remote repository.";
    if (cmd.includes("publish")) return "This command publishes a package to a public registry.";
    return "This command has been flagged as potentially dangerous.";
  }
}
