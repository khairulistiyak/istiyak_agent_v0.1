export interface HealthCheckResponse {
  status: string;
  mode?: string;
  service?: string;
}

export interface WatcherStartRequest {
  workspacePath: string;
}

export interface WatcherStatusResponse {
  success: boolean;
  message: string;
}

export interface RunCommandRequest {
  workspacePath: string;
  command: string;
}

export interface RunCommandResponse {
  output: string;
}

export interface AgentApproveRequest {
  requestId: string;
  approved: boolean;
}

export interface AgentApproveResponse {
  success: boolean;
  message: string;
}

export interface ReindexResponse {
  success: boolean;
  message: string;
}

export interface GitStatusResponse {
  initialized: boolean;
  branch: string;
  hasChanges: boolean;
  error?: string;
}

export interface OAuthCallbackRequest {
  token: string;
  email: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AgentStep {
  step: number;
  status: "thought" | "action" | "success" | "error";
  content: string;
  actionName?: string;
  params?: Record<string, string>;
}

export interface PermissionRequest {
  id: string;
  type: "run_command";
  command: string;
}
