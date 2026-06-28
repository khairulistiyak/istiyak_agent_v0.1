import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { exec } from "child_process";

export class DiffTool extends BaseTool {
  name = "git_diff";
  description = "Runs git diff in the workspace directory to inspect local changes.";
  parameterSchema = {};

  async execute(params: any, context: ToolContext): Promise<string> {
    return new Promise((resolve) => {
      exec("git diff", { cwd: context.workspacePath }, (error, stdout, stderr) => {
        resolve(stdout || stderr || (error ? error.message : "No local changes (git diff is empty)"));
      });
    });
  }
}
