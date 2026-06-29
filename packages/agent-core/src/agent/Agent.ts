import { runAgent, RunnerOptions } from "./AgentRunner.js";
import { AgentState } from "./AgentState.js";
import { MemoryManager } from "./MemoryManager.js";
import { TaskClassifier } from "./TaskClassifier.js";

/**
 * High-level Agent class that wraps AgentRunner with state management,
 * memory integration, and lifecycle control (run, abort).
 */
export class Agent {
  private options: RunnerOptions;
  private state: AgentState;
  private memoryManager: MemoryManager;
  private abortController: AbortController;
  private onStateChange?: (state: ReturnType<AgentState["toJSON"]>) => void;

  constructor(options: RunnerOptions & {
    onStateChange?: (state: ReturnType<AgentState["toJSON"]>) => void;
  }) {
    this.options = options;
    this.state = new AgentState();
    this.memoryManager = new MemoryManager(options.workspacePath || process.cwd());
    this.abortController = new AbortController();
    this.onStateChange = options.onStateChange;
  }

  /**
   * Returns the current agent state snapshot.
   */
  getState(): ReturnType<AgentState["toJSON"]> {
    return this.state.toJSON();
  }

  /**
   * Runs the agent with full lifecycle management.
   * 1. Classifies the task
   * 2. Sets up state tracking
   * 3. Executes via AgentRunner
   * 4. Reports final state
   */
  async run() {
    // Classify the task
    const lastUserMessage = this.options.messages
      .filter(m => m.role === "user")
      .pop();
    const taskDescription = lastUserMessage?.content || "";
    this.state.taskDescription = taskDescription;
    this.state.taskClassification = TaskClassifier.classify(taskDescription);
    this.state.setStatus("running");
    this.emitStateChange();

    try {
      // Wrap onChunk to track streaming
      const originalOnChunk = this.options.onChunk;
      const wrappedOptions: RunnerOptions = {
        ...this.options,
        onChunk: (chunk: string) => {
          originalOnChunk?.(chunk);
          this.emitStateChange();
        }
      };

      const result = await runAgent({
        ...wrappedOptions,
        abortSignal: this.abortController.signal
      });

      // Update state with results
      this.state.addTokenUsage(result.inputTokens, result.outputTokens);
      this.state.cost = (result as any).cost || 0;
      this.state.setStatus("completed");
      this.emitStateChange();

      return result;
    } catch (error: any) {
      this.state.addError(error.message || String(error));
      this.state.setStatus("error");
      this.emitStateChange();
      throw error;
    }
  }

  /**
   * Aborts the currently running agent execution.
   */
  abort() {
    this.abortController.abort();
    this.state.setStatus("aborted");
    this.emitStateChange();
  }

  /**
   * Emits the current state to the onStateChange callback.
   */
  private emitStateChange() {
    if (this.onStateChange) {
      this.onStateChange(this.state.toJSON());
    }
  }
}
