import { EventBus } from "./EventBus.js";

export const WORKSPACE_EVENTS = {
  FILE_CHANGED: "workspace:file_changed",
  FILE_CREATED: "workspace:file_created",
  FILE_DELETED: "workspace:file_deleted",
  TODO_DISCOVERED: "workspace:todo_discovered",
  INDEX_UPDATED: "workspace:index_updated",
} as const;

export interface FileChangePayload {
  filePath: string;
  changeType: "modified" | "created" | "deleted";
  timestamp: number;
  size?: number;
}

export interface TodoPayload {
  filePath: string;
  line: number;
  text: string;
  timestamp: number;
}

/**
 * Emits a file change event.
 */
export function emitFileChange(filePath: string, changeType: "modified" | "created" | "deleted" = "modified"): void {
  const eventName = changeType === "created" ? WORKSPACE_EVENTS.FILE_CREATED :
                    changeType === "deleted" ? WORKSPACE_EVENTS.FILE_DELETED :
                    WORKSPACE_EVENTS.FILE_CHANGED;

  EventBus.emit(eventName, {
    filePath,
    changeType,
    timestamp: Date.now(),
  } as FileChangePayload);
}

/**
 * Emits a TODO discovered event.
 */
export function emitTodoDiscovered(filePath: string, line: number, text: string): void {
  EventBus.emit(WORKSPACE_EVENTS.TODO_DISCOVERED, {
    filePath,
    line,
    text,
    timestamp: Date.now(),
  } as TodoPayload);
}

/**
 * Emits a workspace index update event.
 */
export function emitIndexUpdated(fileCount: number): void {
  EventBus.emit(WORKSPACE_EVENTS.INDEX_UPDATED, {
    fileCount,
    timestamp: Date.now(),
  });
}

/**
 * Registers a listener for all workspace events.
 */
export function onWorkspaceEvent(callback: (event: string, payload: any) => void): void {
  for (const eventName of Object.values(WORKSPACE_EVENTS)) {
    EventBus.on(eventName, (payload: any) => callback(eventName, payload));
  }
}
