import { LlmProvider, LlmRequest, LlmResponse } from "../../ProviderManager.js";
import { ProviderType } from "../../../config/Providers.js";
import { TokenCounter } from "../../TokenCounter.js";

export class ClaudeProvider implements LlmProvider {
  public readonly id: ProviderType = "claude";
  private apiKey: string;
  private modelName: string;

  constructor(config?: { apiKey?: string; modelName?: string }) {
    this.apiKey = config?.apiKey || process.env.ANTHROPIC_API_KEY || "";
    this.modelName = config?.modelName || "claude-3.5-sonnet";
  }

  private getHeaders(): Record<string, string> {
    const key = this.apiKey || process.env.ANTHROPIC_API_KEY || "";
    if (!key) {
      throw new Error("Anthropic API key is not configured. Please set ANTHROPIC_API_KEY.");
    }
    return {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    };
  }

  public async generateText(request: LlmRequest): Promise<LlmResponse> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: this.modelName,
        system: request.systemPrompt,
        messages: [{ role: "user", content: request.userMessage }],
        max_tokens: request.maxTokens ?? 4096,
        temperature: request.temperature ?? 0.2
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Claude API error: ${response.status} ${errText}`);
    }

    const data: any = await response.json();
    const text = data.content?.[0]?.text || "";

    const inputTokens = data.usage?.input_tokens ?? TokenCounter.countTokens(request.systemPrompt + request.userMessage);
    const outputTokens = data.usage?.output_tokens ?? TokenCounter.countTokens(text);

    return {
      content: text,
      inputTokens,
      outputTokens
    };
  }

  public async generateStream(
    request: LlmRequest,
    onChunk: (text: string) => void
  ): Promise<LlmResponse> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: this.modelName,
        system: request.systemPrompt,
        messages: [{ role: "user", content: request.userMessage }],
        max_tokens: request.maxTokens ?? 4096,
        temperature: request.temperature ?? 0.2,
        stream: true
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Claude API stream error: ${response.status} ${errText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Claude response body is not readable for streaming.");
    }

    const decoder = new TextDecoder("utf-8");
    let accumulatedText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine.startsWith("data:")) continue;

        const dataStr = cleanLine.substring(5).trim();
        if (dataStr === "[DONE]") continue;

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.type === "content_block_delta" && parsed.delta?.text) {
            const chunkText = parsed.delta.text;
            accumulatedText += chunkText;
            onChunk(chunkText);
          }
        } catch (e) {
          // Ignore JSON parse errors for incomplete lines
        }
      }
    }

    const inputTokens = TokenCounter.countTokens(request.systemPrompt + request.userMessage);
    const outputTokens = TokenCounter.countTokens(accumulatedText);

    return {
      content: accumulatedText,
      inputTokens,
      outputTokens
    };
  }
}

export default ClaudeProvider;
