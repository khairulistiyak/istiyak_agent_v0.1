import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { WorkspaceMemoryStore } from "@istiyak/agent-memory";

// Cache stores per workspace path to avoid creating a new instance (and disk read)
// on every single read_memory call within the same agent session.
const storeCache = new Map<string, WorkspaceMemoryStore>();
function getStore(workspacePath: string): WorkspaceMemoryStore {
  if (!storeCache.has(workspacePath)) {
    storeCache.set(workspacePath, new WorkspaceMemoryStore(workspacePath));
  }
  return storeCache.get(workspacePath)!;
}

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
    const store = getStore(context.workspacePath);
    const value = await store.getRule(params.key);
    return value ? String(value) : `Key [${params.key}] not found in memory.`;
  }
}
