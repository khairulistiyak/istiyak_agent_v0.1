import { ProviderType } from "./Providers.js";

/**
 * Default agent settings. Used when no user overrides are provided.
 */
export const DEFAULT_SETTINGS = {
  provider: "gemini" as ProviderType,
  model: "gemini-2.5-flash",
  authMethod: "apiKey" as "apiKey" | "serviceAccount",
  location: "us-central1",
  googleSearchEnabled: false,
  cloudSandboxEnabled: false,

  /** Agent behavior settings */
  maxSteps: 40,
  reflectionEnabled: true,
  reflectionInterval: 5,
  planningEnabled: true,

  /** Memory settings */
  maxHistoryTokens: 6000,
  maxSessionMessages: 100,
  autoCompressEnabled: true,

  /** Security settings */
  approvalRequired: true,
  secretMaskingEnabled: true,

  /** Telemetry settings */
  usageTrackingEnabled: true,
  crashReportingEnabled: true,
  tracingEnabled: false,

  /** UI settings */
  streamingEnabled: true,
  showToolDetails: true,
  showTokenUsage: true,
} as const;

export type SettingsKey = keyof typeof DEFAULT_SETTINGS;

/**
 * Merges user settings with defaults.
 */
export function mergeSettings(userSettings: Partial<typeof DEFAULT_SETTINGS>): typeof DEFAULT_SETTINGS {
  return {
    ...DEFAULT_SETTINGS,
    ...userSettings,
  };
}
