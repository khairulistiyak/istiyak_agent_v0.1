export * from "./api.js";
export * from "./state.js";
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
