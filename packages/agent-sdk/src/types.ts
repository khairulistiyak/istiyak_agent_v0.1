/**
 * Message format for agent conversations
 */
export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Session management types
 */
export interface Session {
  id: string;
  createdAt: Date;
  lastActivity: Date;
  messageCount: number;
}

/**
 * Permission request types
 */
export interface PermissionRequest {
  reqId: string;
  command: string;
  timestamp: Date;
}

/**
 * Agent execution stats
 */
export interface AgentStats {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  duration: number;
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: "ok" | "error";
  mode: string;
}

/**
 * Agent status response
 */
export interface AgentStatus {
  running: boolean;
  message: string;
}

/**
 * Git status response
 */
export interface GitStatus {
  initialized: boolean;
  branch: string;
  raw: string;
}

/**
 * Command execution result
 */
export interface CommandResult {
  output: string;
  exitCode?: number;
}

/**
 * Reindex operation result
 */
export interface ReindexResult {
  success: boolean;
  message: string;
}
