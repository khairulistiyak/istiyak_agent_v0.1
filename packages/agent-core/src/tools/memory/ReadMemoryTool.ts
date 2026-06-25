import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { SQLiteMemoryStore } from "@istiyak/agent-memory";

export interface ReadMemoryParams {
  key: string;
}

export class ReadMemoryTool extends BaseTool<ReadMemoryParams, any> {
  public readonly name = "read_memory";
  public readonly description = "Reads a value from the persistent agent memory by key.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      key: { type: "string", description: "The memory key to retrieve." }
    },
    required: ["key"]
  };

  public async execute(params: ReadMemoryParams, context: ToolContext): Promise<any> {
    const store = new SQLiteMemoryStore(context.workspacePath);
    return store.get(params.key);
  }
}

export default ReadMemoryTool;
