import { EventBus } from "./EventBus.js";

export const AGENT_EVENTS = {
  STARTED: "agent:started",
  STEP: "agent:step",
  FINISHED: "agent:finished",
  ERROR: "agent:error"
};

export function emitAgentStart(agentId: string) {
  EventBus.emit(AGENT_EVENTS.STARTED, { agentId, timestamp: Date.now() });
}
