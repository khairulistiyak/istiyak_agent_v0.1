import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { exec } from "child_process";

export class StatusTool extends BaseTool {
  name = "git_status";
  description = "Runs git status in the workspace directory.";
  parameterSchema = {};

  async execute(params: any, context: ToolContext): Promise<string> {
    return new Promise((resolve) => {
      exec("git status", { cwd: context.workspacePath }, (error, stdout, stderr) => {
        resolve(stdout || stderr || (error ? error.message : "git status succeeded"));
      });
    });
  }
}
