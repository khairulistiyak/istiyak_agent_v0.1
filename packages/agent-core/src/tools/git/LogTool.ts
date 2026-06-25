import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { exec } from "child_process";

export interface LogParams {
  limit?: number;
}

export class LogTool extends BaseTool<LogParams, string> {
  public readonly name = "git_log";
  public readonly description = "Displays git commit history logs.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      limit: { type: "number", description: "Number of commits to retrieve. Defaults to 10." }
    }
  };

  public execute(params: LogParams, context: ToolContext): Promise<string> {
    return new Promise((resolve) => {
      const limit = params.limit ?? 10;
      exec(`git log -n ${limit}`, { cwd: context.workspacePath }, (err: any, stdout: string, stderr: string) => {
        resolve(stdout + stderr);
      });
    });
  }
}

export default LogTool;
