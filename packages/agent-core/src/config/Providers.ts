export const PROVIDERS = ["gemini", "openai", "claude", "vertex", "deepseek", "ollama", "custom"] as const;
export type ProviderType = typeof PROVIDERS[number];
