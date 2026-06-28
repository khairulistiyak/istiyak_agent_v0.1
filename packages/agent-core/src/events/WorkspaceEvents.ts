import { EventBus } from "./EventBus.js";

export const WORKSPACE_EVENTS = {
  FILE_CHANGED: "workspace:file_changed",
  TODO_DISCOVERED: "workspace:todo_discovered"
};

export function emitFileChange(filePath: string) {
  EventBus.emit(WORKSPACE_EVENTS.FILE_CHANGED, { filePath, timestamp: Date.now() });
}
