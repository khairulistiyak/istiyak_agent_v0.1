import { EventBus } from "./EventBus.js";

export const TOOL_EVENTS = {
  EXECUTE_START: "tool:start",
  EXECUTE_SUCCESS: "tool:success",
  EXECUTE_ERROR: "tool:error"
};

export function emitToolStart(toolName: string, params: any) {
  EventBus.emit(TOOL_EVENTS.EXECUTE_START, { toolName, params, timestamp: Date.now() });
}
