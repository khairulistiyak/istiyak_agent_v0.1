import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export class SummarizeMemoryTool extends BaseTool {
  name = "summarize_memory";
  description = "Generates a summarized breakdown of historical sessions.";
  parameterSchema = {};

  async execute(params: any, context: ToolContext): Promise<string> {
    // Not yet implemented — return an honest response so the agent does not
    // falsely believe a memory summary was generated.
    return "[NOT_IMPLEMENTED] Memory summarization is not yet available in this version. Proceed with the task directly without summarizing memory.";
  }
}
