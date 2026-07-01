import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { searchWorkspace } from "@istiyak/agent-memory";

export class SearchTool extends BaseTool {
  name = "search_workspace";
  description = "Searches the codebase using semantic keyword ranking (RAG).";
  parameterSchema = {
    type: "object",
    required: ["query"],
    properties: {
      query: { type: "string" },
      limit: { type: "number" }
    }
  };

  async execute(params: { query: string; limit?: number }, context: ToolContext): Promise<any> {
    return searchWorkspace(params.query, params.limit || 5, context.workspacePath);
  }
}
