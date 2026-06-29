import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { SummaryEngine } from "../../memory/SummaryEngine.js";

export class SummarizeMemoryTool extends BaseTool {
  name = "summarize_memory";
  description = "Generates a summarized breakdown of the current conversation history, highlighting key decisions, actions taken, and results.";
  parameterSchema = {
    type: "object",
    properties: {
      maxLength: {
        type: "number",
        description: "Maximum character length for the summary. Default: 1000"
      }
    }
  };

  async execute(params: { maxLength?: number }, context: ToolContext): Promise<string> {
    try {
      const messages = (context as any).messages || [];
      if (messages.length === 0) {
        return "No conversation history to summarize.";
      }

      const maxLength = params.maxLength || 1000;

      // Summarize the conversation
      const summary = SummaryEngine.summarizeConversation(
        messages.map((m: any) => ({ role: m.role, content: m.content })),
        maxLength
      );

      // Build a structured summary
      const userMessages = messages.filter((m: any) => m.role === "user").length;
      const assistantMessages = messages.filter((m: any) => m.role === "assistant").length;
      const toolResults = messages.filter((m: any) =>
        m.content && m.content.includes("[System Tool Response")
      ).length;

      return `## Conversation Summary\n\n` +
        `**Messages:** ${messages.length} total (${userMessages} user, ${assistantMessages} assistant, ${toolResults} tool results)\n\n` +
        `**Summary:**\n${summary}`;
    } catch (err: any) {
      return `Failed to summarize memory: ${err.message}`;
    }
  }
}
