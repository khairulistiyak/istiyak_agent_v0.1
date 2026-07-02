import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { ContextCompressor } from "../../memory/ContextCompressor.js";
import { Message } from "@istiyak/shared-types";

export class CompressMemoryTool extends BaseTool {
  name = "compress_memory";
  description =
    "Compresses the conversation history to reduce token usage while preserving important context.";
  parameterSchema = {
    type: "object",
    properties: {
      maxTokens: {
        type: "number",
        description: "Maximum token budget for the compressed output. Default: 6000",
      },
    },
  };

  async execute(params: { maxTokens?: number }, context: ToolContext): Promise<string> {
    try {
      // Access session messages from context if available
      const ctx = context as ToolContext & { messages?: Message[] };
      const messages = ctx.messages || [];
      if (messages.length === 0) {
        return "No conversation history to compress.";
      }

      const maxTokens = params.maxTokens || 6000;
      const originalCount = messages.length;

      const compressed = ContextCompressor.compress(messages, maxTokens);
      const compressedCount = compressed.length;
      const ratio = originalCount > 0 ? Math.round((1 - compressedCount / originalCount) * 100) : 0;

      return (
        `Memory compressed successfully.\n` +
        `- Original messages: ${originalCount}\n` +
        `- Compressed messages: ${compressedCount}\n` +
        `- Compression ratio: ${ratio}%\n` +
        `- Token budget: ${maxTokens}`
      );
    } catch (err: unknown) {
      return `Failed to compress memory: ${err instanceof Error ? err.message : String(err)}`;
    }
  }
}
