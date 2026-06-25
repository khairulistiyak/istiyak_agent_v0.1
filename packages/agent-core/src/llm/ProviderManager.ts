import { ProviderType } from "../config/Providers.js";

export interface LlmRequest {
  systemPrompt: string;
  userMessage: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LlmResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
}

export interface LlmProvider {
  id: ProviderType;
  generateText(request: LlmRequest): Promise<LlmResponse>;
  generateStream(request: LlmRequest, onChunk: (text: string) => void): Promise<LlmResponse>;
}

export class ProviderManager {
  private providers: Map<ProviderType, LlmProvider> = new Map();
  private activeProviderId: ProviderType = "gemini";

  public register(provider: LlmProvider): void {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id: ProviderType): LlmProvider {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new Error(`LLM Provider with ID '${id}' is not registered.`);
    }
    return provider;
  }

  public setActiveProvider(id: ProviderType): void {
    this.getProvider(id); // Validate exists
    this.activeProviderId = id;
  }

  public getActiveProvider(): LlmProvider {
    return this.getProvider(this.activeProviderId);
  }
}
export default ProviderManager;
