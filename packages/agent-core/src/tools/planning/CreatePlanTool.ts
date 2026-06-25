import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { SQLiteMemoryStore } from "@istiyak/agent-memory";
import fs from "fs/promises";
import path from "path";

export interface CreatePlanParams {
  planContent: string;
}

export class CreatePlanTool extends BaseTool<CreatePlanParams, { success: boolean; filePath: string }> {
  public readonly name = "create_plan";
  public readonly description = "Creates a new implementation plan in the workspace and persists it in memory.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      planContent: { type: "string", description: "The plan content in Markdown format." }
    },
    required: ["planContent"]
  };

  public async execute(params: CreatePlanParams, context: ToolContext) {
    const store = new SQLiteMemoryStore(context.workspacePath);
    store.set("implementation_plan", params.planContent);

    const planPath = path.join(context.workspacePath, "implementation_plan.md");
    await fs.writeFile(planPath, params.planContent, "utf8");

    return { success: true, filePath: "implementation_plan.md" };
  }
}

export default CreatePlanTool;
