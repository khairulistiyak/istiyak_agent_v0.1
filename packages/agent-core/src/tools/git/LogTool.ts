import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { exec } from "child_process";

export class LogTool extends BaseTool {
  name = "git_log";
  description = "Runs git log in the workspace directory to read commit history.";
  parameterSchema = {
    type: "object",
    properties: {
      limit: { type: "number" }
    }
  };

  async execute(params: { limit?: number }, context: ToolContext): Promise<string> {
    const limit = params.limit || 10;
    return new Promise((resolve) => {
      exec(`git log -n ${limit} --oneline`, { cwd: context.workspacePath }, (error, stdout, stderr) => {
        resolve(stdout || stderr || (error ? error.message : "Empty log"));
      });
    });
  }
}
