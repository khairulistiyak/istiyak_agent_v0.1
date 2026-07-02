import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { execFile } from "child_process";
import { promisify } from "util";

const execFilePromise = promisify(execFile);

export class CommitTool extends BaseTool {
  name = "git_commit_changes";
  description = "Stages all changes and commits them with the given message.";
  parameterSchema = {
    type: "object",
    required: ["message"],
    properties: {
      message: { type: "string" }
    }
  };

  async execute(params: { message: string }, context: ToolContext): Promise<string> {
    const cwd = context.workspacePath;
    try {
      await execFilePromise("git", ["add", "."], { cwd });
      const { stdout, stderr } = await execFilePromise("git", ["commit", "-m", params.message], { cwd });
      return stdout || stderr || "git commit succeeded";
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const execErr = error as { stdout?: string; stderr?: string };
      return execErr.stdout || execErr.stderr || errMsg;
    }
  }
}
