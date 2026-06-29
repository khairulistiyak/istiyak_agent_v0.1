export interface ModelInfo {
  id: string;
  displayName: string;
  provider: string;
  maxInputTokens: number;
  maxOutputTokens: number;
}

/**
 * Master model catalog across all providers.
 */
export const MODELS: Record<string, ModelInfo[]> = {
  gemini: [
    { id: "gemini-2.5-flash", displayName: "Gemini 2.5 Flash", provider: "gemini", maxInputTokens: 1048576, maxOutputTokens: 65536 },
    { id: "gemini-2.5-pro", displayName: "Gemini 2.5 Pro", provider: "gemini", maxInputTokens: 1048576, maxOutputTokens: 65536 },
    { id: "gemini-1.5-flash", displayName: "Gemini 1.5 Flash", provider: "gemini", maxInputTokens: 1048576, maxOutputTokens: 8192 },
    { id: "gemini-1.5-pro", displayName: "Gemini 1.5 Pro", provider: "gemini", maxInputTokens: 2097152, maxOutputTokens: 8192 },
  ],
  openai: [
    { id: "gpt-4o", displayName: "GPT-4o", provider: "openai", maxInputTokens: 128000, maxOutputTokens: 16384 },
    { id: "gpt-4o-mini", displayName: "GPT-4o Mini", provider: "openai", maxInputTokens: 128000, maxOutputTokens: 16384 },
    { id: "o1-preview", displayName: "O1 Preview", provider: "openai", maxInputTokens: 128000, maxOutputTokens: 32768 },
    { id: "o1-mini", displayName: "O1 Mini", provider: "openai", maxInputTokens: 128000, maxOutputTokens: 65536 },
  ],
  claude: [
    { id: "claude-sonnet-4-20250514", displayName: "Claude Sonnet 4", provider: "claude", maxInputTokens: 200000, maxOutputTokens: 64000 },
    { id: "claude-3-5-sonnet-latest", displayName: "Claude 3.5 Sonnet", provider: "claude", maxInputTokens: 200000, maxOutputTokens: 8192 },
    { id: "claude-3-5-haiku-latest", displayName: "Claude 3.5 Haiku", provider: "claude", maxInputTokens: 200000, maxOutputTokens: 8192 },
  ],
  deepseek: [
    { id: "deepseek-chat", displayName: "DeepSeek Chat", provider: "deepseek", maxInputTokens: 128000, maxOutputTokens: 8192 },
    { id: "deepseek-coder", displayName: "DeepSeek Coder", provider: "deepseek", maxInputTokens: 128000, maxOutputTokens: 8192 },
  ],
  ollama: [
    { id: "llama3.1", displayName: "Llama 3.1", provider: "ollama", maxInputTokens: 128000, maxOutputTokens: 8192 },
    { id: "codellama", displayName: "Code Llama", provider: "ollama", maxInputTokens: 16384, maxOutputTokens: 4096 },
    { id: "mistral", displayName: "Mistral", provider: "ollama", maxInputTokens: 32768, maxOutputTokens: 8192 },
  ],
} as const;

/**
 * Gets all model IDs for a given provider.
 */
export function getModelsForProvider(provider: string): string[] {
  const models = MODELS[provider.toLowerCase()];
  return models ? models.map(m => m.id) : [];
}

/**
 * Looks up a model info by ID across all providers.
 */
export function getModelInfo(modelId: string): ModelInfo | undefined {
  for (const models of Object.values(MODELS)) {
    const found = models.find(m => m.id === modelId);
    if (found) return found;
  }
  return undefined;
}
