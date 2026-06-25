export interface SettingsState {
  provider: "gemini" | "openai" | "claude" | "ollama" | "custom";
  authMethod: "apiKey" | "serviceAccount";
  apiKey: string;
  serviceAccountPath: string;
  projectId: string;
  location: string;
  selectedModel: string;
  customModel: string;
  workspacePath: string;
  googleSearchEnabled: boolean;
  dockerSandboxEnabled: boolean;
  cloudSandboxEnabled: boolean;
  sandboxImage: string;
  token: string | null;
  userEmail: string | null;
  activeTheme: string;
  installedPrompts: Array<{ title: string; prompt: string }>;
  installedExtensions: Array<{
    id: string;
    name: string;
    description: string;
    commands: Array<{ name: string; command: string }>;
    prompts: Array<{ title: string; prompt: string }>;
  }>;
}

export interface ChatState {
  conversations: Array<{
    id: string;
    title: string;
    messages: Array<{
      id: string;
      role: "system" | "user" | "assistant";
      content: string;
      timestamp: number;
    }>;
  }>;
  activeId: string | null;
}
