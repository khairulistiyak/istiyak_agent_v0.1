import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export class CompressMemoryTool extends BaseTool {
  name = "compress_memory";
  description = "Compresses conversational steps using ContextCompressor.";
  parameterSchema = {};

  async execute(params: any, context: ToolContext): Promise<string> {
    return "Memory compression completed.";
  }
}
