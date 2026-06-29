import { EventBus } from "../events/EventBus.js";
import { AGENT_EVENTS } from "../events/AgentEvents.js";
import { TOOL_EVENTS } from "../events/ToolEvents.js";
import { TaskClassifier } from "./TaskClassifier.js";
import { Planner } from "./Planner.js";
import { Reflection } from "./Reflection.js";

/**
 * Manages the full agent execution lifecycle:
 * Task Start → Classification → Planning (if complex) → Execution → Reflection → Completion
 *
 * Emits events at each stage so other systems (UI, telemetry) can react.
 */
export class AgentWorkflow {
  private agentId: string;
  private currentTaskClassification: "quick" | "complex" = "quick";
  private recentToolNames: string[] = [];

  constructor(agentId: string) {
    this.agentId = agentId;
  }

  /**
   * Starts a new task workflow. Classifies the task and emits the start event.
   */
  async startTask(task: string) {
    this.recentToolNames = [];
    this.currentTaskClassification = TaskClassifier.classify(task);

    console.log(`[Workflow] Task started (${this.currentTaskClassification}): "${task.substring(0, 80)}..."`);
    EventBus.emit(AGENT_EVENTS.STARTED, {
      agentId: this.agentId,
      task,
      classification: this.currentTaskClassification,
      timestamp: Date.now()
    });
  }

  /**
   * Returns the task classification result.
   */
  getClassification(): "quick" | "complex" {
    return this.currentTaskClassification;
  }

  /**
   * Generates a plan if the task is classified as complex.
   * Returns the plan steps, or an empty array for quick tasks.
   */
  async generatePlanIfNeeded(task: string, workspacePath: string): Promise<string[]> {
    if (this.currentTaskClassification !== "complex") {
      return [];
    }

    const steps = Planner.generatePlan(task);

    try {
      await Planner.writePlanToFile(workspacePath, task, steps);
      console.log(`[Workflow] Plan created with ${steps.length} steps.`);
    } catch (err: any) {
      console.warn(`[Workflow] Could not write plan file: ${err.message}`);
    }

    return steps;
  }

  /**
   * Called after each tool execution step.
   * Tracks recent tools for loop detection and emits step events.
   */
  async nextStep(step: number, actionName: string, result?: string) {
    this.recentToolNames.push(actionName);
    // Keep only last 10 tool names for loop detection
    if (this.recentToolNames.length > 10) {
      this.recentToolNames.shift();
    }

    EventBus.emit(AGENT_EVENTS.STEP, {
      agentId: this.agentId,
      step,
      actionName,
      timestamp: Date.now()
    });

    EventBus.emit(TOOL_EVENTS.EXECUTED, {
      agentId: this.agentId,
      toolName: actionName,
      step,
      timestamp: Date.now()
    });
  }

  /**
   * Checks whether the agent should pause for self-reflection.
   */
  shouldReflect(stepCount: number, lastToolResult: string): boolean {
    return Reflection.shouldReflect(stepCount, lastToolResult, this.recentToolNames);
  }

  /**
   * Builds a reflection prompt for the current context.
   */
  getReflectionPrompt(stepCount: number, lastError?: string): string {
    return Reflection.buildReflectionPrompt([], stepCount, lastError);
  }

  /**
   * Marks the task as successfully completed and emits the finish event.
   */
  async completeTask(summary: string) {
    console.log(`[Workflow] Task completed. Summary: ${summary.substring(0, 100)}...`);
    EventBus.emit(AGENT_EVENTS.FINISHED, {
      agentId: this.agentId,
      summary,
      classification: this.currentTaskClassification,
      toolsUsed: [...new Set(this.recentToolNames)],
      timestamp: Date.now()
    });
  }

  /**
   * Marks the task as failed and emits the error event.
   */
  async failTask(errorMsg: string) {
    console.error(`[Workflow] Task failed: ${errorMsg}`);
    EventBus.emit(AGENT_EVENTS.ERROR, {
      agentId: this.agentId,
      error: errorMsg,
      classification: this.currentTaskClassification,
      timestamp: Date.now()
    });
  }
}
