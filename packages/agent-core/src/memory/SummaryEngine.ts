import { ProviderManager } from "../llm/ProviderManager.js";
import { getSummaryPrompt } from "../llm/prompts/SummaryPrompt.js";

export class SummaryEngine {
  private providerManager?: ProviderManager;

  constructor(providerManager?: ProviderManager) {
    this.providerManager = providerManager;
  }

  public async summarize(content: string): Promise<string> {
    if (!content) return "";

    if (this.providerManager) {
      try {
        const provider = this.providerManager.getActiveProvider();
        const systemPrompt = "You are a summarizing utility. Be concise.";
        const userMessage = getSummaryPrompt(content);
        const response = await provider.generateText({ systemPrompt, userMessage });
        return response.content.trim();
      } catch (err) {
        console.warn("Failed to summarize using active provider, falling back to local method:", err);
      }
    }

    // Direct fallback
    return content.slice(0, 1000) + "... [Truncated]";
  }
}

export default SummaryEngine;
