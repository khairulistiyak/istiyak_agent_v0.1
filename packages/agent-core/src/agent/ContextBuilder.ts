import { Message } from "@istiyak/shared-types";
import { compressHistory } from "./AgentRunner.js";
import { estimateTokens } from "../llm/TokenCounter.js";
import { SummaryEngine } from "../memory/SummaryEngine.js";

/**
 * Builds optimized conversation context for LLM calls.
 * Ensures the context stays within token limits by:
 *   - Always preserving system messages and recent messages
 *   - Summarizing older messages when the context grows too large
 *   - Truncating very long tool results
 */
export class ContextBuilder {
  /** Default maximum context window (in estimated tokens) */
  private static readonly DEFAULT_MAX_TOKENS = 100000;

  /** Maximum length for individual tool result content */
  private static readonly MAX_TOOL_RESULT_LENGTH = 5000;

  /** Minimum number of recent messages to always preserve in full */
  private static readonly MIN_RECENT_MESSAGES = 6;

  /**
   * Basic compression — delegates to AgentRunner's compressHistory.
   */
  static buildContext(messages: Message[]): Message[] {
    return compressHistory(messages);
  }

  /**
   * Advanced context building with token-aware optimization.
   * Preserves system messages and recent messages in full,
   * and summarizes older messages to stay within the token budget.
   */
  static buildOptimizedContext(messages: Message[], maxTokens?: number): Message[] {
    const limit = maxTokens || ContextBuilder.DEFAULT_MAX_TOKENS;

    if (messages.length === 0) return [];

    // Separate system messages (always keep) from conversation messages
    const systemMessages = messages.filter(m => m.role === "system");
    const conversationMessages = messages.filter(m => m.role !== "system");

    // Truncate very long tool results to prevent context explosion
    const truncated = conversationMessages.map(msg => {
      if (msg.role === "assistant" && msg.content.length > ContextBuilder.MAX_TOOL_RESULT_LENGTH) {
        return {
          ...msg,
          content: msg.content.substring(0, ContextBuilder.MAX_TOOL_RESULT_LENGTH) +
            "\n\n[... output truncated for context length ...]"
        };
      }
      return msg;
    });

    // Check if everything fits within the token budget
    const allMessages = [...systemMessages, ...truncated];
    const totalTokens = allMessages.reduce((sum, m) => sum + estimateTokens(m.content), 0);

    if (totalTokens <= limit) {
      return allMessages;
    }

    // Need to compress: keep system + recent messages, summarize the rest
    const recentCount = Math.min(
      ContextBuilder.MIN_RECENT_MESSAGES,
      truncated.length
    );
    const recentMessages = truncated.slice(-recentCount);
    const olderMessages = truncated.slice(0, -recentCount);

    // Summarize older messages into a single context message
    if (olderMessages.length > 0) {
      const olderText = olderMessages.map(m => `[${m.role}]: ${m.content}`).join("\n");
      const summary = SummaryEngine.summarize(olderText);

      const summaryMessage: Message = {
        role: "system",
        content: `[Previous conversation summary]\n${summary}`
      };

      return [...systemMessages, summaryMessage, ...recentMessages];
    }

    return [...systemMessages, ...recentMessages];
  }
}
