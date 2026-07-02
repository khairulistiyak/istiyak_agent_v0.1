import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { execFile } from "child_process";
import { promisify } from "util";

const execFilePromise = promisify(execFile);

export class StashTool extends BaseTool {
  name = "git_stash";
  description = "Runs git stash commands (save, pop, list).";
  parameterSchema = {
    type: "object",
    required: ["action"],
    properties: {
      action: { type: "string", enum: ["save", "pop", "list"] },
      message: { type: "string" }
    }
  };

  async execute(params: { action: "save" | "pop" | "list"; message?: string }, context: ToolContext): Promise<string> {
    const cwd = context.workspacePath;
    try {
      let args: string[] = [];
      if (params.action === "save") {
        args = ["stash", "push"];
        if (params.message) {
          args.push("-m", params.message);
        }
      } else if (params.action === "pop") {
        args = ["stash", "pop"];
      } else {
        args = ["stash", "list"];
      }
      const { stdout, stderr } = await execFilePromise("git", args, { cwd });
      return stdout || stderr || `Success executing: git ${args.join(" ")}`;
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const execErr = error as { stdout?: string; stderr?: string };
      return execErr.stdout || execErr.stderr || errMsg;
    }
  }
}
