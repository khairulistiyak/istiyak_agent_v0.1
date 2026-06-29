export const PROVIDERS = ["gemini", "openai", "claude", "vertex", "deepseek", "ollama", "custom"] as const;
export type ProviderType = typeof PROVIDERS[number];

export interface ProviderInfo {
  id: ProviderType;
  displayName: string;
  requiresApiKey: boolean;
  isLocal: boolean;
  defaultModel: string;
  apiBaseUrl?: string;
}

/**
 * Provider registry with metadata for each supported LLM provider.
 */
export const PROVIDER_INFO: Record<ProviderType, ProviderInfo> = {
  gemini: {
    id: "gemini",
    displayName: "Google Gemini",
    requiresApiKey: true,
    isLocal: false,
    defaultModel: "gemini-2.5-flash",
    apiBaseUrl: "https://generativelanguage.googleapis.com",
  },
  openai: {
    id: "openai",
    displayName: "OpenAI",
    requiresApiKey: true,
    isLocal: false,
    defaultModel: "gpt-4o",
    apiBaseUrl: "https://api.openai.com/v1",
  },
  claude: {
    id: "claude",
    displayName: "Anthropic Claude",
    requiresApiKey: true,
    isLocal: false,
    defaultModel: "claude-3-5-sonnet-latest",
    apiBaseUrl: "https://api.anthropic.com/v1",
  },
  vertex: {
    id: "vertex",
    displayName: "Google Vertex AI",
    requiresApiKey: false, // Uses service account
    isLocal: false,
    defaultModel: "gemini-2.5-flash",
  },
  deepseek: {
    id: "deepseek",
    displayName: "DeepSeek",
    requiresApiKey: true,
    isLocal: false,
    defaultModel: "deepseek-chat",
    apiBaseUrl: "https://api.deepseek.com/v1",
  },
  ollama: {
    id: "ollama",
    displayName: "Ollama (Local)",
    requiresApiKey: false,
    isLocal: true,
    defaultModel: "llama3.1",
    apiBaseUrl: "http://localhost:11434",
  },
  custom: {
    id: "custom",
    displayName: "Custom Endpoint",
    requiresApiKey: false,
    isLocal: false,
    defaultModel: "default",
  },
};

/**
 * Returns provider info by ID.
 */
export function getProviderInfo(providerId: string): ProviderInfo | undefined {
  return PROVIDER_INFO[providerId as ProviderType];
}

/**
 * Returns all cloud (non-local) providers.
 */
export function getCloudProviders(): ProviderInfo[] {
  return Object.values(PROVIDER_INFO).filter(p => !p.isLocal);
}

/**
 * Returns all local providers.
 */
export function getLocalProviders(): ProviderInfo[] {
  return Object.values(PROVIDER_INFO).filter(p => p.isLocal);
}
