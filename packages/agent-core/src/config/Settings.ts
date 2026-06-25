export interface AgentSettings {
  defaultProvider: string;
  defaultModel: string;
  maxExecutionSteps: number;
  enableGoogleSearch: boolean;
  enableSandbox: boolean;
  sandboxImageName: string;
}

export const DEFAULT_SETTINGS: AgentSettings = {
  defaultProvider: "gemini",
  defaultModel: "gemini-2.5-flash",
  maxExecutionSteps: 40,
  enableGoogleSearch: false,
  enableSandbox: false,
  sandboxImageName: "node:20-alpine"
};
