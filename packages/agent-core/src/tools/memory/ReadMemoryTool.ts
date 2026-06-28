import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { WorkspaceMemoryStore } from "@istiyak/agent-memory";

export class ReadMemoryTool extends BaseTool {
  name = "read_memory";
  description = "Reads a specific persistent key-value from workspace memory.";
  parameterSchema = {
    type: "object",
    required: ["key"],
    properties: {
      key: { type: "string" }
    }
  };

  async execute(params: { key: string }, context: ToolContext): Promise<string> {
    const store = new WorkspaceMemoryStore(context.workspacePath);
    const value = await store.getRule(params.key);
    return value ? String(value) : `Key [${params.key}] not found in memory.`;
  }
}
