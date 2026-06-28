import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import fs from "fs/promises";
import path from "path";

export class CreatePlanTool extends BaseTool {
  name = "create_plan";
  description = "Creates a markdown planning checklist named [workspace_plan.md] in the workspace root.";
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
    return "workspace_plan.md created successfully.";
  }
}
