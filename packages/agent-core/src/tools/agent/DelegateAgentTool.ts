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
    // This tool is not yet implemented. Returning an honest NOT_IMPLEMENTED response
    // so the agent does not falsely believe the task was delegated and proceed incorrectly.
    return `[NOT_IMPLEMENTED] Sub-agent task delegation is not yet available in this version. Please complete the task "${params.task}" directly without delegation.`;
  }
}
