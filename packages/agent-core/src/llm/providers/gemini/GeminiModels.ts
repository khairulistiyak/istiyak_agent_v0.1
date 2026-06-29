export interface GeminiModelInfo {
  id: string;
  displayName: string;
  maxInputTokens: number;
  maxOutputTokens: number;
  pricing: {
    inputPerMillion: number;
    outputPerMillion: number;
  };
}

/**
 * Gemini model catalog with token limits and pricing.
 * Pricing is per 1 million tokens (USD).
 */
export const GEMINI_MODELS_INFO: GeminiModelInfo[] = [
  {
    id: "gemini-2.5-flash",
    displayName: "Gemini 2.5 Flash",
    maxInputTokens: 1048576,
    maxOutputTokens: 65536,
    pricing: { inputPerMillion: 0.075, outputPerMillion: 0.30 },
  },
  {
    id: "gemini-2.5-pro",
    displayName: "Gemini 2.5 Pro",
    maxInputTokens: 1048576,
    maxOutputTokens: 65536,
    pricing: { inputPerMillion: 1.25, outputPerMillion: 10.00 },
  },
  {
    id: "gemini-1.5-flash",
    displayName: "Gemini 1.5 Flash",
    maxInputTokens: 1048576,
    maxOutputTokens: 8192,
    pricing: { inputPerMillion: 0.075, outputPerMillion: 0.30 },
  },
  {
    id: "gemini-1.5-pro",
    displayName: "Gemini 1.5 Pro",
    maxInputTokens: 2097152,
    maxOutputTokens: 8192,
    pricing: { inputPerMillion: 1.25, outputPerMillion: 5.00 },
  },
];

export const GEMINI_MODELS = GEMINI_MODELS_INFO.map(m => m.id) as unknown as readonly string[];
export type GeminiModelType = typeof GEMINI_MODELS[number];

/**
 * Looks up model info by ID. Returns the first match or undefined.
 */
export function getGeminiModelInfo(modelId: string): GeminiModelInfo | undefined {
  return GEMINI_MODELS_INFO.find(m => m.id === modelId);
}

/**
 * Returns the default model ID for Gemini (fastest, cheapest).
 */
export function getDefaultGeminiModel(): string {
  return "gemini-2.5-flash";
}
