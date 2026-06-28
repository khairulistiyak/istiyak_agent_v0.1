import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { exec } from "child_process";

export class BranchTool extends BaseTool {
  name = "git_branch";
  description = "Lists all local branches or creates a new branch if requested.";
  parameterSchema = {
    type: "object",
    properties: {
      createNew: { type: "boolean" },
      branchName: { type: "string" }
    }
  };

  async execute(params: { createNew?: boolean; branchName?: string }, context: ToolContext): Promise<string> {
    const cwd = context.workspacePath;
    if (params.createNew && params.branchName) {
      const sanitized = params.branchName.replace(/[^a-zA-Z0-9_/-]/g, "");
      return new Promise((resolve) => {
        exec(`git branch "${sanitized}"`, { cwd }, (error, stdout, stderr) => {
          resolve(stdout || stderr || (error ? error.message : `Created branch: ${sanitized}`));
        });
      });
    }
    return new Promise((resolve) => {
      exec("git branch", { cwd }, (error, stdout, stderr) => {
        resolve(stdout || stderr || (error ? error.message : "Success"));
      });
    });
  }
}
