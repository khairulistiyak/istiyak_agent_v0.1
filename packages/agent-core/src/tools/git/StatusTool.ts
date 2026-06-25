import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { exec } from "child_process";

export class StatusTool extends BaseTool<any, string> {
  public readonly name = "git_status";
  public readonly description = "Checks the git status of the current workspace repository.";
  public readonly parametersSchema = { type: "object", properties: {} };

  public execute(params: any, context: ToolContext): Promise<string> {
    return new Promise((resolve) => {
      exec("git status", { cwd: context.workspacePath }, (err: any, stdout: string, stderr: string) => {
        resolve(stdout + stderr);
      });
    });
  }
}

export default StatusTool;
