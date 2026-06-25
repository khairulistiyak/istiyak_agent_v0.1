import { SummaryEngine } from "./SummaryEngine.js";
import { ChatMessage } from "@istiyak/shared-types";
import { TokenCounter } from "../llm/TokenCounter.js";

export class ContextCompressor {
  private summaryEngine: SummaryEngine;

  constructor(summaryEngine: SummaryEngine) {
    this.summaryEngine = summaryEngine;
  }

  public async compress(messages: ChatMessage[], maxTokens: number = 8000): Promise<ChatMessage[]> {
    const totalText = messages.map(m => m.content).join("\n");
    const estimatedTokens = TokenCounter.countTokens(totalText);

    if (estimatedTokens <= maxTokens || messages.length <= 3) {
      return messages;
    }

    // Keep the system prompt (first index if role === system) and the last user messages
    const systemMsg = messages.find(m => m.role === "system");
    const recentMsgs = messages.slice(-2);
    
    const middleMsgs = messages.filter(m => m !== systemMsg && !recentMsgs.includes(m));
    const middleText = middleMsgs.map(m => `[${m.role}] ${m.content}`).join("\n");

    const summaryText = await this.summaryEngine.summarize(middleText);

    const result: ChatMessage[] = [];
    if (systemMsg) result.push(systemMsg);
    result.push({
      role: "system",
      content: `Summary of previous conversation:\n${summaryText}`
    });
    result.push(...recentMsgs);

    return result;
  }
}

export default ContextCompressor;
