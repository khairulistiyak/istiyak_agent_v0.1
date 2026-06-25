import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { SQLiteMemoryStore } from "@istiyak/agent-memory";

export interface CompressMemoryParams {
  keepLastN?: number;
}

export class CompressMemoryTool extends BaseTool<CompressMemoryParams, { success: boolean; itemsCompressedCount: number }> {
  public readonly name = "compress_memory";
  public readonly description = "Compresses the execution history memory to save context space.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      keepLastN: { type: "number", description: "Number of recent logs to keep untouched. Defaults to 5." }
    }
  };

  public async execute(params: CompressMemoryParams, context: ToolContext) {
    const store = new SQLiteMemoryStore(context.workspacePath);
    const history = store.get("execution_history") || [];
    const keepN = params.keepLastN ?? 5;

    if (history.length <= keepN) {
      return { success: true, itemsCompressedCount: 0 };
    }

    const compressed = history.slice(-keepN);
    store.set("execution_history", compressed);

    return { success: true, itemsCompressedCount: history.length - keepN };
  }
}

export default CompressMemoryTool;
