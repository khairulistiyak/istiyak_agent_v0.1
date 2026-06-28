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
    return `Results merged successfully: ${params.results}`;
  }
}
