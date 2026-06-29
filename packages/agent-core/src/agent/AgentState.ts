import { Message } from "@istiyak/shared-types";

export type AgentStatus = "idle" | "planning" | "running" | "reflecting" | "completed" | "error" | "aborted";

export class AgentState {
  stepsCount = 0;
  maxSteps = 40;
  messages: Message[] = [];
  status: AgentStatus = "idle";
  cost = 0;

  // Detailed tracking
  currentStep = 0;
  totalSteps = 0;
  activeToolName: string | null = null;
  errors: Array<{ step: number; error: string; timestamp: number }> = [];
  planSteps: string[] = [];
  taskDescription = "";
  taskClassification: "quick" | "complex" | "unknown" = "unknown";
  startTime = 0;
  endTime = 0;

  // Token tracking
  totalInputTokens = 0;
  totalOutputTokens = 0;

  addMessage(msg: Message) {
    this.messages.push(msg);
  }

  setStatus(status: AgentStatus) {
    this.status = status;
    if (status === "running" && this.startTime === 0) {
      this.startTime = Date.now();
    }
    if (status === "completed" || status === "error" || status === "aborted") {
      this.endTime = Date.now();
    }
  }

  setActiveTool(toolName: string | null) {
    this.activeToolName = toolName;
  }

  incrementStep() {
    this.currentStep++;
    this.stepsCount++;
  }

  addError(error: string) {
    this.errors.push({
      step: this.currentStep,
      error,
      timestamp: Date.now()
    });
  }

  setPlan(steps: string[]) {
    this.planSteps = steps;
    this.totalSteps = steps.length;
  }

  addTokenUsage(inputTokens: number, outputTokens: number) {
    this.totalInputTokens += inputTokens;
    this.totalOutputTokens += outputTokens;
  }

  getElapsedMs(): number {
    if (this.startTime === 0) return 0;
    const end = this.endTime > 0 ? this.endTime : Date.now();
    return end - this.startTime;
  }

  hasReachedMaxSteps(): boolean {
    return this.stepsCount >= this.maxSteps;
  }

  /**
   * Serializes the agent state for UI consumption.
   */
  toJSON() {
    return {
      status: this.status,
      currentStep: this.currentStep,
      totalSteps: this.totalSteps,
      stepsCount: this.stepsCount,
      maxSteps: this.maxSteps,
      activeToolName: this.activeToolName,
      taskDescription: this.taskDescription,
      taskClassification: this.taskClassification,
      planSteps: this.planSteps,
      errors: this.errors,
      cost: this.cost,
      totalInputTokens: this.totalInputTokens,
      totalOutputTokens: this.totalOutputTokens,
      elapsedMs: this.getElapsedMs(),
      messageCount: this.messages.length
    };
  }
}
