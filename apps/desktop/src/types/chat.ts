export interface AgentStep {
  step: number;
  status: 'thought' | 'action' | 'success' | 'error' | 'reflecting' | 'aborted';
  content: string;
  actionName?: string;
  params?: { [key: string]: string };
}

export interface PermissionRequest {
  id: string;
  type: 'run_command' | string;
  command: string;
  reason?: string;
}

export interface CostMeta {
  cost: string;
  tokens: string;
  tokensIn: string;
  tokensOut: string;
}

export interface ParsedAgentMessage {
  steps: AgentStep[];
  permissionRequests: PermissionRequest[];
  cleanText: string;
  costMeta: CostMeta | null;
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

export interface TerminalLog {
  time: string;
  message: string;
  type: 'info' | 'error' | 'success';
}

export interface FileNode {
  name: string;
  path: string;
  isDir: boolean;
  children: FileNode[];
}
