export interface AgentStep {
  step: number;
  status: "thought" | "action" | "success" | "error";
  content: string;
  actionName?: string;
  params?: { [key: string]: string };
}

export interface PermissionRequest {
  id: string;
  type: "run_command";
  command: string;
}

export interface WorkspaceTodo {
  filePath: string;
  relativePath: string;
  line: number;
  text: string;
}

export interface TelemetryMetric {
  timestamp: string;
  provider: string;
  model: string;
  latencyMs: number;
  tokensIn: number;
  tokensOut: number;
  totalTokens: number;
  tokensPerSec: number;
}

export interface TelemetryStats {
  callCount: number;
  avgLatencyMs: number;
  avgSpeed: number;
  totalTokensIn: number;
  totalTokensOut: number;
  history: TelemetryMetric[];
}
