import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { SQLiteMemoryStore } from "@istiyak/agent-memory";

export interface MergeParams {
  key: string;
  subResult: any;
}

export class MergeResultTool extends BaseTool<MergeParams, { success: boolean }> {
  public readonly name = "merge_result";
  public readonly description = "Merges sub-agent execution outputs back into main workspace state.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      key: { type: "string", description: "The memory key to merge into." },
      subResult: { type: "any", description: "The result payload to merge." }
    },
    required: ["key", "subResult"]
  };

  public async execute(params: MergeParams, context: ToolContext) {
    const store = new SQLiteMemoryStore(context.workspacePath);
    const existing = store.get(params.key) || {};
    
    let merged: any;
    if (typeof existing === "object" && typeof params.subResult === "object") {
      merged = { ...existing, ...params.subResult };
    } else if (Array.isArray(existing)) {
      merged = [...existing, params.subResult];
    } else {
      merged = params.subResult;
    }

    store.set(params.key, merged);
    return { success: true };
  }
}

export default MergeResultTool;
