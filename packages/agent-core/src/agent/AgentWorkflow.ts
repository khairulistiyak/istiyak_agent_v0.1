import { EventBus } from "../events/EventBus.js";
import { AGENT_EVENTS } from "../events/AgentEvents.js";

export class AgentWorkflow {
  private agentId: string;

  constructor(agentId: string) {
    this.agentId = agentId;
  }

  async startTask(task: string) {
    console.log(`[Workflow] Task started: "${task}"`);
    EventBus.emit(AGENT_EVENTS.STARTED, { agentId: this.agentId, task, timestamp: Date.now() });
  }

  async completeTask(summary: string) {
    console.log(`[Workflow] Task completed. Summary: ${summary}`);
    EventBus.emit(AGENT_EVENTS.FINISHED, { agentId: this.agentId, summary, timestamp: Date.now() });
  }

  async failTask(errorMsg: string) {
    console.error(`[Workflow] Task failed: ${errorMsg}`);
    EventBus.emit(AGENT_EVENTS.ERROR, { agentId: this.agentId, error: errorMsg, timestamp: Date.now() });
  }

  async nextStep(step: number, actionName: string) {
    EventBus.emit(AGENT_EVENTS.STEP, { agentId: this.agentId, step, actionName, timestamp: Date.now() });
  }
}
