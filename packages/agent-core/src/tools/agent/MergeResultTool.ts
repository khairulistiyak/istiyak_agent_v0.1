import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export class MergeResultTool extends BaseTool {
  name = "merge_results";
  description = "Combines the results from sub-agents back into the main loop.";
  parameterSchema = {
    type: "object",
    required: ["results"],
    properties: {
      results: { type: "string" }
    }
  };

  async execute(params: { results: string }, context: ToolContext): Promise<string> {
    // Not yet implemented — sub-agent spawning is not available, so there are no results
    // to merge. Return honest response so the agent does not build on false assumptions.
    return "[NOT_IMPLEMENTED] Sub-agent result merging is not yet available. All task results are already present in the current agent context.";
  }
}
