export interface FileStatus {
  filePath: string;
  linesRead?: string;
  status: "idle" | "reading" | "completed";
}

export interface DiffStatus {
  filePath: string;
  diffSummary: string;
  progress: number;
  additions?: number;
  deletions?: number;
}

export interface ToolStatus {
  toolName: string;
  status: "calling" | "completed" | "denied";
}

export interface ProposedChange {
  type: "modify" | "new" | "delete";
  fileName: string;
  path: string;
  description?: string;
}

export interface PlanQuestion {
  id: string;
  text: string;
  placeholder?: string;
  options?: string[];
}

export interface ProposedPlan {
  planTitle: string;
  description: string;
  risks?: string[];
  proposedChanges: ProposedChange[];
  openQuestions?: PlanQuestion[];
}

export interface StagedTask {
  id: string;
  label: string;
  status: "done" | "running" | "pending" | "failed";
}

export interface StepperStep {
  label: string;
  status: "done" | "current" | "pending";
}

export interface AgentEditorTab {
  id: string;
  name: string;
  isModified?: boolean;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  fileMonitor?: {
    files?: FileStatus[];
    diffs?: DiffStatus[];
    tools?: ToolStatus[];
  };
  proposedPlan?: ProposedPlan;
  planReviewState?: "approved" | "rejected" | null;

  // New Rich UI fields
  thinkingBlock?: {
    thoughts: string;
    durationSec?: number;
  };
  permissionRequest?: {
    action: string;
    target: string;
    reason: string;
    answered?: "granted" | "denied";
  };
  questionCard?: {
    question: string;
    options: string[];
    answered?: string;
  };
  stagedTasks?: StagedTask[];
  stepperSteps?: StepperStep[];
  subagentDelegation?: {
    agentName: string;
    task: string;
    status: "running" | "completed" | "failed";
    model?: string;
  };
  notification?: {
    type: "success" | "warning" | "error" | "info";
    message: string;
  };
  editorTabs?: AgentEditorTab[];
  diffLines?: Array<{ type: "addition" | "deletion" | "normal"; content: string }>;
  
  // Additional library component fields
  searchStatus?: {
    query: string;
    status: "searching" | "completed" | "failed";
  };
  commandExecution?: {
    command: string;
    status: "running" | "success" | "failed";
    output?: string[];
  };
  codeBlock?: {
    code: string;
    language: string;
    fileName?: string;
    fileSize?: string;
  };
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
    cachedTokens?: number;
    costUSD?: number;
  };
  apiHealth?: {
    services: Array<{
      name: string;
      latencyMs: number;
      status: "online" | "offline" | "degraded";
    }>;
  };
  performanceStats?: {
    tokensUsed: number;
    latencySec: number;
    speedTps: number;
  };
  budgetGauge?: {
    spent: number;
    limit: number;
  };
  timerStatus?: {
    durationSeconds: number;
    prompt: string;
  };
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

export interface ApprovalRequest {
  id: string;
  type: "file_edit" | "command_run" | "plan_proposal";
  target: string;
  description: string;
  planId?: string;
}
