import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { exec } from "child_process";

export class DiffTool extends BaseTool<any, string> {
  public readonly name = "git_diff";
  public readonly description = "Shows uncommitted changes in the repository using git diff.";
  public readonly parametersSchema = { type: "object", properties: {} };

  public execute(params: any, context: ToolContext): Promise<string> {
    return new Promise((resolve) => {
      exec("git diff", { cwd: context.workspacePath }, (err: any, stdout: string, stderr: string) => {
        resolve(stdout + stderr);
      });
    });
  }
}

export default DiffTool;
