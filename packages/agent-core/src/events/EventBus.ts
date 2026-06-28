import { EventEmitter } from "events";

class AgentEventBus extends EventEmitter {}

export const EventBus = new AgentEventBus();
