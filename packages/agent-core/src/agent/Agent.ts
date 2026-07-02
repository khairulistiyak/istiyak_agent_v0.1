import { runAgent, RunnerOptions } from "./AgentRunner.js";
import { AgentState } from "./AgentState.js";
import { MemoryManager } from "./MemoryManager.js";
import { TaskClassifier } from "./TaskClassifier.js";
import { calculateCost } from "../llm/CostTracker.js";
import { LIMITS } from "../config/Limits.js";

/**
 * High-level Agent class that wraps AgentRunner with state management,
 * memory integration, and lifecycle control (run, abort).
 */
export class Agent {
  private state: AgentState;
  private abortController = new AbortController();
  private onStateChange?: (state: ReturnType<AgentState["toJSON"]>) => void;

  constructor(onStateChange?: (state: ReturnType<AgentState["toJSON"]>) => void) {
    this.state = new AgentState();
    this.state.maxSteps = LIMITS.MAX_STEPS;
    this.onStateChange = onStateChange;
  }

  async execute(options: RunnerOptions) {
    try {
      this.state.setStatus("running");
      this.state.taskDescription = options.messages[options.messages.length - 1]?.content || "";
      this.state.taskClassification = TaskClassifier.classify(this.state.taskDescription);
      this.emitStateChange();

      const wrappedOptions: RunnerOptions = {
        ...options,
        abortSignal: this.abortController.signal,
      };

      const result = await runAgent(wrappedOptions);

      // Update state with results
      if (!result) {
        this.state.setStatus("error");
        this.emitStateChange();
        return;
      }
      this.state.addTokenUsage(result.inputTokens, result.outputTokens);
      this.state.cost = calculateCost(
        options.provider,
        result.inputTokens,
        result.outputTokens,
        options.model
      );
      this.state.setStatus("completed");
      this.emitStateChange();

      return result;
    } catch (error: unknown) {
      this.state.addError(error instanceof Error ? error.message : String(error));
      this.state.setStatus("error");
      this.emitStateChange();
      throw error;
    }
  }

  abort() {
    this.abortController.abort();
    this.state.setStatus("aborted");
    this.emitStateChange();
  }

  private emitStateChange() {
    if (this.onStateChange) {
      this.onStateChange(this.state.toJSON());
    }
  }
}
