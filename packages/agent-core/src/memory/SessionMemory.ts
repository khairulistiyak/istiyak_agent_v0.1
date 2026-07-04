import { Message } from "@istiyak/shared-types";
import { estimateTokens } from "../llm/TokenCounter.js";
import { SummaryEngine } from "./SummaryEngine.js";

/**
 * Manages conversation session memory with auto-compression,
 * configurable limits, recent message retrieval, and serialization.
 */
export class SessionMemory {
  private messages: Message[] = [];
  private maxMessages: number;
  private maxTokens: number;

  constructor(options?: { maxMessages?: number; maxTokens?: number }) {
    this.maxMessages = options?.maxMessages || 100;
    this.maxTokens = options?.maxTokens || 50000;
  }

  /**
   * Adds a message to the session. Triggers auto-compression
   * if limits are exceeded.
   */
  addMessage(msg: Message): void {
    this.messages.push(msg);
    this.autoCompress();
  }

  /**
   * Returns all messages in the session.
   */
  getMessages(): Message[] {
    return [...this.messages];
  }

  /**
   * Returns the last N messages.
   */
  getRecentMessages(n: number): Message[] {
    return this.messages.slice(-n);
  }

  /**
   * Returns the total estimated token count for all messages.
   */
  getTokenCount(): number {
    return this.messages.reduce((sum, m) => sum + estimateTokens(m.content), 0);
  }

  /**
   * Returns the number of messages in the session.
   */
  getMessageCount(): number {
    return this.messages.length;
  }

  /**
   * Returns session metadata for debugging.
   */
  getStats() {
    return {
      messageCount: this.messages.length,
      tokenCount: this.getTokenCount(),
      maxMessages: this.maxMessages,
      maxTokens: this.maxTokens,
      roles: {
        system: this.messages.filter(m => m.role === "system").length,
        user: this.messages.filter(m => m.role === "user").length,
        assistant: this.messages.filter(m => m.role === "assistant").length,
      },
    };
  }

  /**
   * Clears all messages from the session.
   */
  clear(): void {
    this.messages = [];
  }

  /**
   * Serializes the session to a JSON string for persistence.
   */
  serialize(): string {
    return JSON.stringify({
      messages: this.messages,
      maxMessages: this.maxMessages,
      maxTokens: this.maxTokens,
      timestamp: Date.now(),
    });
  }

  /**
   * Restores a session from a serialized JSON string.
   */
  static deserialize(data: string): SessionMemory {
    try {
      const parsed = JSON.parse(data);
      const session = new SessionMemory({
        maxMessages: parsed.maxMessages,
        maxTokens: parsed.maxTokens,
      });
      if (Array.isArray(parsed.messages)) {
        for (const msg of parsed.messages) {
          session.messages.push(msg);
        }
      }
      return session;
    } catch {
      return new SessionMemory();
    }
  }

  /**
   * Auto-compresses old messages when limits are exceeded.
   * Keeps system messages and recent messages intact,
   * summarizes everything in between.
   */
  private autoCompress(): void {
    const tokenCount = this.getTokenCount();

    // Only compress if we exceed limits
    if (this.messages.length <= this.maxMessages && tokenCount <= this.maxTokens) {
      return;
    }

    console.log(`[SessionMemory] Auto-compressing: ${this.messages.length} messages, ${tokenCount} tokens`);

    // Separate system messages (excluding previous session compression summaries)
    const systemMessages = this.messages.filter(m => m.role === "system" && !m.content.startsWith("[Session History"));
    const conversationMessages = this.messages.filter(m => m.role !== "system");

    // Keep last 8 conversation messages in full
    const keepCount = Math.min(8, conversationMessages.length);
    const recentMessages = conversationMessages.slice(-keepCount);
    const olderMessages = conversationMessages.slice(0, -keepCount);

    if (olderMessages.length === 0) return;

    // Summarize older messages
    const olderText = olderMessages
      .map(m => `[${m.role}]: ${m.content.substring(0, 200)}`)
      .join("\n");
    const summary = SummaryEngine.summarize(olderText, 500);

    // Rebuild messages
    this.messages = [
      ...systemMessages,
      {
        role: "system" as const,
        content: `[Session History — ${olderMessages.length} messages compressed]\n${summary}`,
      },
      ...recentMessages,
    ];

    console.log(`[SessionMemory] Compressed to ${this.messages.length} messages, ~${this.getTokenCount()} tokens`);
  }
}
