export type TaskPriority = "low" | "medium" | "high";

/** Runtime agent configuration passed via ToolContext._agentConfig */
export interface AgentConfig {
  provider?: string;
  model?: string;
  authMethod?: string;
  apiKey?: string;
  serviceAccountPath?: string;
  projectId?: string;
  location?: string;
  onChunk?: (chunk: string) => void;
  [key: string]: unknown;
}
