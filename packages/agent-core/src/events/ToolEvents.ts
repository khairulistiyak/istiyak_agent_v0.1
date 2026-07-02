import { EventBus } from "./EventBus.js";

export const TOOL_EVENTS = {
  EXECUTE_START: "tool:start",
  EXECUTED: "tool:executed",
  EXECUTE_SUCCESS: "tool:success",
  EXECUTE_ERROR: "tool:error",
} as const;

export interface ToolEventPayload {
  toolName: string;
  params?: Record<string, unknown>;
  agentId?: string;
  step?: number;
  timestamp: number;
}

export interface ToolResultPayload extends ToolEventPayload {
  result?: string;
  durationMs?: number;
  error?: string;
}

/**
 * Emits a tool execution start event.
 */
export function emitToolStart(
  toolName: string,
  params: Record<string, unknown>,
  step?: number
): void {
  EventBus.emit(TOOL_EVENTS.EXECUTE_START, {
    toolName,
    params,
    step,
    timestamp: Date.now(),
  });
}

/**
 * Emits a tool execution success event.
 */
export function emitToolSuccess(
  toolName: string,
  result: string,
  durationMs: number,
  step?: number
): void {
  EventBus.emit(TOOL_EVENTS.EXECUTE_SUCCESS, {
    toolName,
    result: result.substring(0, 500), // Truncate for event payload
    durationMs,
    step,
    timestamp: Date.now(),
  });
}

/**
 * Emits a tool execution error event.
 */
export function emitToolError(toolName: string, error: string, step?: number): void {
  EventBus.emit(TOOL_EVENTS.EXECUTE_ERROR, {
    toolName,
    error,
    step,
    timestamp: Date.now(),
  });
}

/**
 * Registers a listener for all tool events.
 */
export function onToolEvent(
  callback: (event: string, payload: ToolEventPayload | ToolResultPayload) => void
): void {
  for (const eventName of Object.values(TOOL_EVENTS)) {
    EventBus.on(eventName, (payload: unknown) => callback(eventName, payload as ToolEventPayload));
  }
}
