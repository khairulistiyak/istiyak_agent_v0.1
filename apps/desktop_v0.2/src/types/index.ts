export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  activeModel: string;
  activeMode: "Plan Mode" | "Agent Mode";
  targetIDE: string;
  workspacePath?: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  modelId: string;
  status: boolean; // active or inactive
}

export interface CustomHeader {
  id: string;
  key: string;
  value: string;
}

export interface CustomProviderConfig {
  providerId: string;
  displayName: string;
  baseUrl: string;
  apiKey?: string;
  models: {
    id: string;
    modelId: string;
    name: string;
    reasoning: boolean;
  }[];
  headers: CustomHeader[];
}

export interface EngineConfig {
  provider: "Google Gemini" | "OpenAI" | "Anthropic Claude" | "Ollama" | "Custom Provider";
  selectedModel: string;
  customModelName: string;
  authentication: "API Key" | "Service Account JSON";
  apiKey: string;
  serviceAccountPath: string;
  gcpProjectId: string;
  vertexRegion: string;
}
