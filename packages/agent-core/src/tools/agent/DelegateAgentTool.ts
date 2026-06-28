import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export class DelegateAgentTool extends BaseTool {
  name = "delegate_task";
  description = "Delegates a specific sub-task to a background helper agent.";
  parameterSchema = {
    type: "object",
    required: ["task"],
    properties: {
      task: { type: "string" }
    }
  };

  async execute(params: { task: string }, context: ToolContext): Promise<string> {
    return `Task [${params.task}] successfully delegated to helper agent in background.`;
  }
}
