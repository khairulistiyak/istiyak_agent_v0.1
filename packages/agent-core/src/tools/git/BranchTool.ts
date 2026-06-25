import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { exec } from "child_process";

export interface BranchParams {
  branchName?: string;
  create?: boolean;
}

export class BranchTool extends BaseTool<BranchParams, string> {
  public readonly name = "git_branch";
  public readonly description = "Lists, creates, or manages git branches.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      branchName: { type: "string", description: "Name of branch to create or manage." },
      create: { type: "boolean", description: "Create branch if set to true." }
    }
  };

  public execute(params: BranchParams, context: ToolContext): Promise<string> {
    return new Promise((resolve) => {
      let command = "git branch";
      if (params.branchName) {
        if (params.create) {
          command = `git branch ${params.branchName}`;
        } else {
          command = `git branch -d ${params.branchName}`;
        }
      }
      exec(command, { cwd: context.workspacePath }, (err: any, stdout: string, stderr: string) => {
        resolve(stdout + stderr);
      });
    });
  }
}

export default BranchTool;
