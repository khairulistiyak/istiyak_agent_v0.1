import { Message } from "@istiyak/shared-types";
import { estimateTokens } from "../llm/TokenCounter.js";
import { SummaryEngine } from "./SummaryEngine.js";

/**
 * Token-aware context compression for LLM conversation history.
 * Strategies:
 *   1. System messages are always preserved in full
 *   2. Recent messages are preserved in full
 *   3. Older messages are summarized
 *   4. Very long tool results are truncated
 */
export class ContextCompressor {
  /** Default token budget for compressed output */
  private static readonly DEFAULT_MAX_TOKENS = 6000;

  /** Number of recent messages to always keep in full */
  private static readonly KEEP_RECENT = 6;

  /** Max length for individual tool result content before truncation */
  private static readonly MAX_TOOL_RESULT_CHARS = 4000;

  /**
   * Basic compression — shorthand for full compress with defaults.
   */
  static compress(messages: Message[], maxTokens?: number): Message[] {
    return ContextCompressor.compressWithStrategy(messages, maxTokens || ContextCompressor.DEFAULT_MAX_TOKENS);
  }

  /**
   * Full token-aware compression with configurable budget.
   */
  static compressWithStrategy(messages: Message[], maxTokens: number): Message[] {
    if (messages.length === 0) return [];

    // First pass: truncate oversized tool results
    const truncated = messages.map(msg => ContextCompressor.truncateToolResult(msg));

    // Check if we're already within budget
    const totalTokens = truncated.reduce((sum, m) => sum + estimateTokens(m.content), 0);
    if (totalTokens <= maxTokens || truncated.length <= ContextCompressor.KEEP_RECENT) {
      return truncated;
    }

    // Separate system messages (always keep)
    const systemMessages = truncated.filter(m => m.role === "system");
    const conversationMessages = truncated.filter(m => m.role !== "system");

    // Keep the most recent N messages in full
    const recentCount = Math.min(ContextCompressor.KEEP_RECENT, conversationMessages.length);
    const recentMessages = conversationMessages.slice(-recentCount);
    const olderMessages = conversationMessages.slice(0, -recentCount);

    // Calculate remaining token budget after system + recent
    const systemTokens = systemMessages.reduce((sum, m) => sum + estimateTokens(m.content), 0);
    const recentTokens = recentMessages.reduce((sum, m) => sum + estimateTokens(m.content), 0);
    const budgetForSummary = Math.max(200, maxTokens - systemTokens - recentTokens);

    // Summarize older messages if any
    const result: Message[] = [...systemMessages];

    if (olderMessages.length > 0) {
      const olderText = olderMessages.map(m => `[${m.role}]: ${m.content}`).join("\n");
      const summaryMaxChars = budgetForSummary * 4; // ~4 chars per token
      const summary = SummaryEngine.summarize(olderText, summaryMaxChars);

      result.push({
        role: "system",
        content: `[Compressed History — ${olderMessages.length} messages summarized]\n${summary}`,
      });
    }

    result.push(...recentMessages);
    return result;
  }

  /**
   * Truncates very long tool result messages to prevent context explosion.
   */
  private static truncateToolResult(msg: Message): Message {
    if (msg.content.length <= ContextCompressor.MAX_TOOL_RESULT_CHARS) {
      return msg;
    }

    // Only truncate tool results (system role messages containing "[System Tool Response")
    if (!msg.content.includes("[System Tool Response") && msg.role !== "user") {
      return msg;
    }

    // Preserve the first and last portions
    const keepHead = Math.floor(ContextCompressor.MAX_TOOL_RESULT_CHARS * 0.7);
    const keepTail = Math.floor(ContextCompressor.MAX_TOOL_RESULT_CHARS * 0.2);
    const truncatedContent =
      msg.content.substring(0, keepHead) +
      "\n\n[... output truncated for context length ...]\n\n" +
      msg.content.substring(msg.content.length - keepTail);

    return { ...msg, content: truncatedContent };
  }
}
