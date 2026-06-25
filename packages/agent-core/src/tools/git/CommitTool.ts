import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { exec } from "child_process";

export interface CommitParams {
  message: string;
}

export class CommitTool extends BaseTool<CommitParams, string> {
  public readonly name = "git_commit";
  public readonly description = "Stages all files and commits them with the given message.";
  public readonly approveRequired = true;
  public readonly parametersSchema = {
    type: "object",
    properties: {
      message: { type: "string", description: "The commit message description." }
    },
    required: ["message"]
  };

  public execute(params: CommitParams, context: ToolContext): Promise<string> {
    return new Promise((resolve) => {
      // Escape commit message double quotes
      const msg = params.message.replace(/"/g, '\\"');
      exec(`git add -A && git commit -m "${msg}"`, { cwd: context.workspacePath }, (err: any, stdout: string, stderr: string) => {
        resolve(stdout + stderr);
      });
    });
  }
}

export default CommitTool;
