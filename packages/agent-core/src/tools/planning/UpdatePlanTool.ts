import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { SQLiteMemoryStore } from "@istiyak/agent-memory";
import fs from "fs/promises";
import path from "path";

export interface UpdatePlanParams {
  updatedContent: string;
}

export class UpdatePlanTool extends BaseTool<UpdatePlanParams, { success: boolean }> {
  public readonly name = "update_plan";
  public readonly description = "Updates the implementation plan with revised instructions.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      updatedContent: { type: "string", description: "The full updated plan content." }
    },
    required: ["updatedContent"]
  };

  public async execute(params: UpdatePlanParams, context: ToolContext) {
    const store = new SQLiteMemoryStore(context.workspacePath);
    store.set("implementation_plan", params.updatedContent);

    const planPath = path.join(context.workspacePath, "implementation_plan.md");
    await fs.writeFile(planPath, params.updatedContent, "utf8");

    return { success: true };
  }
}

export default UpdatePlanTool;
