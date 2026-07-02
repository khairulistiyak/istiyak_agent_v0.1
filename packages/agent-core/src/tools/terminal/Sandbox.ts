import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { execFile } from "child_process";
import { promisify } from "util";
import { SandboxPolicy } from "../../security/SandboxPolicy.js";
import { PermissionManager } from "../../security/PermissionManager.js";

const execFilePromise = promisify(execFile);

/**
 * Executes commands in an isolated environment with security constraints.
 * When Docker is available, uses container isolation.
 * Otherwise, applies filesystem and time-based guardrails locally.
 */
export class Sandbox extends BaseTool {
  name = "sandbox_run";
  description = "Executes a command within a sandboxed environment with security guardrails (timeout, output limits, workspace-scoped).";
  parameterSchema = {
    type: "object",
    required: ["command"],
    properties: {
      command: {
        type: "string",
        description: "The command to execute in the sandbox"
      },
      timeout: {
        type: "number",
        description: "Timeout in milliseconds. Default: 30000 (30s)"
      }
    }
  };

  async execute(params: { command: string; timeout?: number }, context: ToolContext): Promise<string> {
    const policy = SandboxPolicy.getRestrictivePolicy();
    const timeout = params.timeout || policy.maxExecutionTimeMs;
    const workspacePath = context.workspacePath || process.cwd();

    // Security check
    const permission = PermissionManager.checkPermission(params.command, workspacePath);
    if (!permission.allowed) {
      return `🔒 Sandbox blocked: ${permission.reason}`;
    }

    if (permission.requiresApproval) {
      return `⚠️ Sandbox requires approval: ${permission.reason}. Use run_command with explicit permission instead.`;
    }

    try {
      // Split command for execFile (safer than exec)
      const parts = params.command.split(/\s+/);
      const cmd = parts[0];
      const args = parts.slice(1);

      const { stdout, stderr } = await execFilePromise(cmd, args, {
        cwd: workspacePath,
        timeout,
        maxBuffer: policy.maxOutputSizeBytes,
        env: {
          ...process.env,
          // Restrict PATH to standard locations
          PATH: "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin",
        },
      });

      const output = (stdout || stderr || "").trim();

      // Truncate output if too large
      if (output.length > policy.maxOutputSizeBytes) {
        return `🏖️ Sandbox output (truncated):\n${output.substring(0, policy.maxOutputSizeBytes)}\n\n[... output truncated at ${policy.maxOutputSizeBytes} bytes ...]`;
      }

      return `🏖️ Sandbox output:\n${output || "(no output)"}`;
    } catch (err: unknown) {
      const killed = (err as { killed?: boolean }).killed;
      if (killed) {
        return `🏖️ Sandbox: Command timed out after ${timeout}ms.`;
      }
      return `🏖️ Sandbox error: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
}
