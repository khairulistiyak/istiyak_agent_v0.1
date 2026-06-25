import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { SQLiteMemoryStore } from "@istiyak/agent-memory";

export interface WriteMemoryParams {
  key: string;
  value: any;
}

export class WriteMemoryTool extends BaseTool<WriteMemoryParams, { success: boolean }> {
  public readonly name = "write_memory";
  public readonly description = "Writes a value to the persistent agent memory by key.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      key: { type: "string", description: "The memory key under which to save." },
      value: { type: "any", description: "The value data to save (primitive, object, array, etc.)." }
    },
    required: ["key", "value"]
  };

  public async execute(params: WriteMemoryParams, context: ToolContext) {
    const store = new SQLiteMemoryStore(context.workspacePath);
    store.set(params.key, params.value);
    return { success: true };
  }
}

export default WriteMemoryTool;
