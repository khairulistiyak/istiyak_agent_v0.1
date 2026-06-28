import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { exec } from "child_process";

export class CheckoutTool extends BaseTool {
  name = "git_checkout_branch";
  description = "Switches/checkouts git branch. Can create new branch if createNew is true.";
  parameterSchema = {
    type: "object",
    required: ["branchName"],
    properties: {
      branchName: { type: "string" },
      createNew: { type: "boolean" }
    }
  };

  async execute(params: { branchName: string; createNew?: boolean }, context: ToolContext): Promise<string> {
    const flag = params.createNew ? "-b" : "";
    const sanitized = params.branchName.replace(/[^a-zA-Z0-9_/-]/g, "");
    return new Promise((resolve) => {
      exec(`git checkout ${flag} "${sanitized}"`, { cwd: context.workspacePath }, (error, stdout, stderr) => {
        resolve(stdout || stderr || (error ? error.message : `Checked out branch: ${sanitized}`));
      });
    });
  }
}
