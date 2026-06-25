import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { SQLiteMemoryStore } from "@istiyak/agent-memory";

export interface ReflectParams {
  thoughts: string;
}

export class ReflectTool extends BaseTool<ReflectParams, { success: boolean }> {
  public readonly name = "reflect";
  public readonly description = "Registers agent reflection thoughts to evaluate progress.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      thoughts: { type: "string", description: "Reflection details, errors analyzed, or completion state." }
    },
    required: ["thoughts"]
  };

  public async execute(params: ReflectParams, context: ToolContext) {
    const store = new SQLiteMemoryStore(context.workspacePath);
    const history = store.get("reflection_history") || [];
    history.push({ thoughts: params.thoughts, timestamp: Date.now() });
    store.set("reflection_history", history);

    return { success: true };
  }
}

export default ReflectTool;
