export const PROVIDERS = {
  GEMINI: "gemini",
  VERTEX: "vertex",
  OPENAI: "openai",
  CLAUDE: "claude",
  OLLAMA: "ollama",
  CUSTOM: "custom"
} as const;

export type ProviderType = typeof PROVIDERS[keyof typeof PROVIDERS];

export interface ProviderConfig {
  id: ProviderType;
  name: string;
  defaultModel: string;
  requiresApiKey: boolean;
}

export const PROVIDER_CONFIGS: Record<ProviderType, ProviderConfig> = {
  [PROVIDERS.GEMINI]: {
    id: PROVIDERS.GEMINI,
    name: "Google Gemini",
    defaultModel: "gemini-2.5-flash",
    requiresApiKey: true
  },
  [PROVIDERS.VERTEX]: {
    id: PROVIDERS.VERTEX,
    name: "Vertex AI GCP",
    defaultModel: "gemini-1.5-pro",
    requiresApiKey: false
  },
  [PROVIDERS.OPENAI]: {
    id: PROVIDERS.OPENAI,
    name: "OpenAI GPT",
    defaultModel: "gpt-4o",
    requiresApiKey: true
  },
  [PROVIDERS.CLAUDE]: {
    id: PROVIDERS.CLAUDE,
    name: "Anthropic Claude",
    defaultModel: "claude-3.5-sonnet",
    requiresApiKey: true
  },
  [PROVIDERS.OLLAMA]: {
    id: PROVIDERS.OLLAMA,
    name: "Ollama Local",
    defaultModel: "llama3",
    requiresApiKey: false
  },
  [PROVIDERS.CUSTOM]: {
    id: PROVIDERS.CUSTOM,
    name: "Custom Proxy Endpoint",
    defaultModel: "custom-model",
    requiresApiKey: true
  }
};
