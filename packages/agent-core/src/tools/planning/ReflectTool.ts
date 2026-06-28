import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export class ReflectTool extends BaseTool {
  name = "reflect";
  description = "Triggers a self-reflection assessment of the task state.";
  parameterSchema = {};

  async execute(params: any, context: ToolContext): Promise<string> {
    return "Self-reflection complete. Ready to proceed.";
  }
}
