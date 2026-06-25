import { LlmProvider, LlmRequest, LlmResponse } from "../../ProviderManager.js";
import { ProviderType } from "../../../config/Providers.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { TokenCounter } from "../../TokenCounter.js";

export class GeminiProvider implements LlmProvider {
  public readonly id: ProviderType = "gemini";
  private apiKey: string;
  private modelName: string;

  constructor(config?: { apiKey?: string; modelName?: string }) {
    this.apiKey = config?.apiKey || process.env.GEMINI_API_KEY || "";
    this.modelName = config?.modelName || "gemini-2.5-flash";
  }

  private getClient(): GoogleGenerativeAI {
    if (!this.apiKey) {
      this.apiKey = process.env.GEMINI_API_KEY || "";
    }
    if (!this.apiKey) {
      throw new Error("Gemini API key is not configured. Please set GEMINI_API_KEY or provide it in configuration.");
    }
    return new GoogleGenerativeAI(this.apiKey);
  }

  public async generateText(request: LlmRequest): Promise<LlmResponse> {
    const client = this.getClient();
    const model = client.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        temperature: request.temperature ?? 0.2,
        maxOutputTokens: request.maxTokens ?? 4096,
      }
    });

    const contents = [
      { role: "user", parts: [{ text: `System Prompt:\n${request.systemPrompt}\n\nUser Message:\n${request.userMessage}` }] }
    ];

    const result = await model.generateContent({ contents });
    const response = await result.response;
    const text = response.text() || "";

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
    const client = this.getClient();
    const model = client.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        temperature: request.temperature ?? 0.2,
        maxOutputTokens: request.maxTokens ?? 4096,
      }
    });

    const contents = [
      { role: "user", parts: [{ text: `System Prompt:\n${request.systemPrompt}\n\nUser Message:\n${request.userMessage}` }] }
    ];

    const result = await model.generateContentStream({ contents });
    let accumulatedText = "";

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      accumulatedText += chunkText;
      onChunk(chunkText);
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

export default GeminiProvider;
