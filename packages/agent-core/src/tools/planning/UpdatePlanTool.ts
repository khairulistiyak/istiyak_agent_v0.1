import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import fs from "fs/promises";
import path from "path";

export class UpdatePlanTool extends BaseTool {
  name = "update_plan";
  description = "Updates the [workspace_plan.md] checklist file in the workspace.";
  parameterSchema = {
    type: "object",
    required: ["content"],
    properties: {
      content: { type: "string" }
    }
  };

  async execute(params: { content: string }, context: ToolContext): Promise<string> {
    const targetPath = path.resolve(context.workspacePath, "workspace_plan.md");
    await fs.writeFile(targetPath, params.content, "utf-8");
    return "workspace_plan.md updated successfully.";
  }
}
