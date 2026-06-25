import { LlmProvider, LlmRequest, LlmResponse } from "../../ProviderManager.js";
import { ProviderType } from "../../../config/Providers.js";
import { TokenCounter } from "../../TokenCounter.js";

export class OllamaProvider implements LlmProvider {
  public readonly id: ProviderType = "ollama";
  private modelName: string;
  private baseURL: string;

  constructor(config?: { modelName?: string; baseURL?: string }) {
    this.modelName = config?.modelName || "llama3";
    this.baseURL = config?.baseURL || process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  }

  public async generateText(request: LlmRequest): Promise<LlmResponse> {
    const endpoint = `${this.baseURL}/api/chat`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.modelName,
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.userMessage }
        ],
        stream: false,
        options: {
          temperature: request.temperature ?? 0.2
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama API error: ${response.status} ${errText}`);
    }

    const data: any = await response.json();
    const text = data.message?.content || "";

    const inputTokens = TokenCounter.countTokens(request.systemPrompt + request.userMessage);
    const outputTokens = TokenCounter.countTokens(text);

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
    const endpoint = `${this.baseURL}/api/chat`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.modelName,
        messages: [
          { role: "system", content: request.systemPrompt },
          { role: "user", content: request.userMessage }
        ],
        stream: true,
        options: {
          temperature: request.temperature ?? 0.2
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama API stream error: ${response.status} ${errText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Ollama response body is not readable for streaming.");
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
        if (!cleanLine) continue;

        try {
          const parsed = JSON.parse(cleanLine);
          const chunkText = parsed.message?.content || "";
          if (chunkText) {
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

export default OllamaProvider;
