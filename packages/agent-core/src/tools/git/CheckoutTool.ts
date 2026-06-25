import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { exec } from "child_process";

export interface CheckoutParams {
  branchOrFile: string;
}

export class CheckoutTool extends BaseTool<CheckoutParams, string> {
  public readonly name = "git_checkout";
  public readonly description = "Checks out a specific branch or file path.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      branchOrFile: { type: "string", description: "Target branch name or file path." }
    },
    required: ["branchOrFile"]
  };

  public execute(params: CheckoutParams, context: ToolContext): Promise<string> {
    return new Promise((resolve) => {
      exec(`git checkout ${params.branchOrFile}`, { cwd: context.workspacePath }, (err: any, stdout: string, stderr: string) => {
        resolve(stdout + stderr);
      });
    });
  }
}

export default CheckoutTool;
