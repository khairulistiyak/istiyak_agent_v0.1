/**
 * Configuration for the Gemini/Vertex AI provider.
 */
export interface GeminiConfig {
  apiKey: string;
  region?: string;
  projectId?: string;
  location?: string;

  /** Safety settings for content filtering */
  safetySettings?: GeminiSafetySettings;

  /** Generation config */
  generationConfig?: GeminiGenerationConfig;
}

export interface GeminiSafetySettings {
  /** Harm category thresholds: BLOCK_NONE, BLOCK_LOW_AND_ABOVE, BLOCK_MEDIUM_AND_ABOVE, BLOCK_ONLY_HIGH */
  harassmentThreshold?: string;
  hateSpeechThreshold?: string;
  sexuallyExplicitThreshold?: string;
  dangerousContentThreshold?: string;
}

export interface GeminiGenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
}

/**
 * Default Gemini configuration for coding agent usage.
 * Lower temperature for deterministic code generation,
 * safety filters set to minimum to allow code discussions.
 */
export const DEFAULT_GEMINI_CONFIG: Omit<GeminiConfig, "apiKey"> = {
  region: "us-central1",
  safetySettings: {
    harassmentThreshold: "BLOCK_ONLY_HIGH",
    hateSpeechThreshold: "BLOCK_ONLY_HIGH",
    sexuallyExplicitThreshold: "BLOCK_ONLY_HIGH",
    dangerousContentThreshold: "BLOCK_ONLY_HIGH",
  },
  generationConfig: {
    temperature: 0.3,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 65536,
  },
};

/**
 * Merges user config with defaults.
 */
export function createGeminiConfig(apiKey: string, overrides?: Partial<GeminiConfig>): GeminiConfig {
  return {
    ...DEFAULT_GEMINI_CONFIG,
    apiKey,
    ...overrides,
    safetySettings: {
      ...DEFAULT_GEMINI_CONFIG.safetySettings,
      ...overrides?.safetySettings,
    },
    generationConfig: {
      ...DEFAULT_GEMINI_CONFIG.generationConfig,
      ...overrides?.generationConfig,
    },
  };
}
