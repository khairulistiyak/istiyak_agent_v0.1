import { LlmProvider, LlmRequest, LlmResponse } from "../../ProviderManager.js";
import { ProviderType } from "../../../config/Providers.js";
import OpenAI from "openai";
import { TokenCounter } from "../../TokenCounter.js";

export class OpenAIProvider implements LlmProvider {
  public readonly id: ProviderType = "openai";
  private apiKey: string;
  private modelName: string;
  private baseURL?: string;

  constructor(config?: { apiKey?: string; modelName?: string; baseURL?: string }) {
    this.apiKey = config?.apiKey || process.env.OPENAI_API_KEY || "";
    this.modelName = config?.modelName || "gpt-4o";
    this.baseURL = config?.baseURL || process.env.OPENAI_BASE_URL;
  }

  private getClient(): OpenAI {
    if (!this.apiKey) {
      this.apiKey = process.env.OPENAI_API_KEY || "";
    }
    if (!this.apiKey) {
      throw new Error("OpenAI API key is not configured. Please set OPENAI_API_KEY.");
    }
    return new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseURL
    });
  }

  public async generateText(request: LlmRequest): Promise<LlmResponse> {
    const client = this.getClient();
    const response = await client.chat.completions.create({
      model: this.modelName,
      messages: [
        { role: "system", content: request.systemPrompt },
        { role: "user", content: request.userMessage }
      ],
      temperature: request.temperature ?? 0.2,
      max_tokens: request.maxTokens ?? 4096
    });

    const text = response.choices[0]?.message?.content || "";
    const inputTokens = response.usage?.prompt_tokens ?? TokenCounter.countTokens(request.systemPrompt + request.userMessage);
    const outputTokens = response.usage?.completion_tokens ?? TokenCounter.countTokens(text);

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
    const stream = await client.chat.completions.create({
      model: this.modelName,
      messages: [
        { role: "system", content: request.systemPrompt },
        { role: "user", content: request.userMessage }
      ],
      temperature: request.temperature ?? 0.2,
      max_tokens: request.maxTokens ?? 4096,
      stream: true
    });

    let accumulatedText = "";
    for await (const chunk of stream) {
      const chunkText = chunk.choices[0]?.delta?.content || "";
      if (chunkText) {
        accumulatedText += chunkText;
        onChunk(chunkText);
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

export default OpenAIProvider;
