import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { SQLiteMemoryStore } from "@istiyak/agent-memory";

export interface SummarizeParams {
  key: string;
}

export class SummarizeMemoryTool extends BaseTool<SummarizeParams, string> {
  public readonly name = "summarize_memory";
  public readonly description = "Generates a textual summary of memory values associated with a key.";
  public readonly parametersSchema = {
    type: "object",
    properties: {
      key: { type: "string", description: "The memory key to summarize." }
    },
    required: ["key"]
  };

  public async execute(params: SummarizeParams, context: ToolContext): Promise<string> {
    const store = new SQLiteMemoryStore(context.workspacePath);
    const value = store.get(params.key);
    if (!value) {
      return "No memory content found for key: " + params.key;
    }

    const valueStr = typeof value === "string" ? value : JSON.stringify(value);
    // Simple summary generator
    return `Summary of memory key '${params.key}': Content length is ${valueStr.length} characters. Value holds: ${valueStr.slice(0, 100)}...`;
  }
}

export default SummarizeMemoryTool;
