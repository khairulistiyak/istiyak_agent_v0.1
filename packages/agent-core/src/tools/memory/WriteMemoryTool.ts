import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { WorkspaceMemoryStore } from "@istiyak/agent-memory";

export class WriteMemoryTool extends BaseTool {
  name = "write_memory";
  description = "Writes a specific persistent key-value to workspace memory.";
  parameterSchema = {
    type: "object",
    required: ["key", "value"],
    properties: {
      key: { type: "string" },
      value: { type: "string" }
    }
  };

  async execute(params: { key: string; value: string }, context: ToolContext): Promise<string> {
    const store = new WorkspaceMemoryStore(context.workspacePath);
    await store.setRule(params.key, params.value);
    return `Successfully saved [${params.key}] to workspace memory.`;
  }
}
