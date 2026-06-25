import { PROVIDERS, ProviderType } from "./Providers.js";

export interface ModelMetadata {
  id: string;
  name: string;
  provider: ProviderType;
  contextWindow: number;
  maxOutputTokens: number;
  pricing: {
    inputCostPer1M: number;
    outputCostPer1M: number;
  };
}

export const MODELS: Record<string, ModelMetadata> = {
  "gemini-2.5-flash": {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: PROVIDERS.GEMINI,
    contextWindow: 1_000_000,
    maxOutputTokens: 8192,
    pricing: { inputCostPer1M: 0.075, outputCostPer1M: 0.30 }
  },
  "gemini-1.5-pro": {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: PROVIDERS.GEMINI,
    contextWindow: 2_000_000,
    maxOutputTokens: 8192,
    pricing: { inputCostPer1M: 1.25, outputCostPer1M: 5.00 }
  },
  "gpt-4o": {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: PROVIDERS.OPENAI,
    contextWindow: 128_000,
    maxOutputTokens: 4096,
    pricing: { inputCostPer1M: 5.00, outputCostPer1M: 15.00 }
  },
  "claude-3.5-sonnet": {
    id: "claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: PROVIDERS.CLAUDE,
    contextWindow: 200_000,
    maxOutputTokens: 8192,
    pricing: { inputCostPer1M: 3.00, outputCostPer1M: 15.00 }
  }
};
