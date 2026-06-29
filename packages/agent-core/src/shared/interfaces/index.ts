import { Message } from "@istiyak/shared-types";

/** Result of a tool execution */
export interface ExecutionResult {
  success: boolean;
  output: string;
  durationMs: number;
  error?: string;
}

/** Configuration for an LLM provider */
export interface IProviderConfig {
  provider: string;
  model: string;
  apiKey?: string;
  authMethod?: "apiKey" | "serviceAccount";
  serviceAccountPath?: string;
  projectId?: string;
  location?: string;
}

/** Interface that every LLM provider must implement */
export interface ILLMProvider {
  streamChat(messages: Message[], model: string, onChunk?: (text: string) => void): Promise<string>;
}

/** A single tool parameter schema definition */
export interface IToolParamSchema {
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
  enum?: string[];
  required?: string[];
  properties?: Record<string, IToolParamSchema>;
  items?: IToolParamSchema;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
}

/** Interface that every tool must conform to */
export interface ITool {
  name: string;
  description: string;
  parameterSchema: {
    type: "object";
    required?: string[];
    properties: Record<string, IToolParamSchema>;
  };
  execute(params: any, context: IToolContext): Promise<string>;
}

/** Context object passed to every tool during execution */
export interface IToolContext {
  workspacePath: string;
  cloudSandboxEnabled?: boolean;
  token?: string;
}

/** A memory entry stored in workspace memory */
export interface IMemoryEntry {
  key: string;
  value: any;
  createdAt: number;
  updatedAt: number;
}

/** Agent run configuration */
export interface IAgentConfig {
  maxSteps: number;
  reflectionEnabled: boolean;
  reflectionInterval: number;
  planningEnabled: boolean;
  maxHistoryTokens: number;
  approvalRequired: boolean;
}
