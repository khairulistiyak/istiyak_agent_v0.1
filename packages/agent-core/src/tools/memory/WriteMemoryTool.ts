import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { WorkspaceMemoryStore } from "@istiyak/agent-memory";

// Cache stores per workspace path to avoid creating a new instance (and disk read)
// on every single write_memory call within the same agent session.
const storeCache = new Map<string, WorkspaceMemoryStore>();
function getStore(workspacePath: string): WorkspaceMemoryStore {
  if (!storeCache.has(workspacePath)) {
    storeCache.set(workspacePath, new WorkspaceMemoryStore(workspacePath));
  }
  return storeCache.get(workspacePath)!;
}

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
    const store = getStore(context.workspacePath);
    await store.setRule(params.key, params.value);
    return `Successfully saved [${params.key}] to workspace memory.`;
  }
}
