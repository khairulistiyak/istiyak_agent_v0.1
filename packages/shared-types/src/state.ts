import { Message, LocalConfig } from "./api.js";

export interface LogEntry {
  time: string;
  message: string;
  type: "info" | "error" | "success";
}

export interface ChatStoreState {
  messages: Message[];
  isStreaming: boolean;
  addMessage: (msg: Message) => void;
  setMessages: (msgs: Message[]) => void;
  clearChat: () => void;
}

export interface SettingsStoreState {
  config: LocalConfig;
  loadConfig: () => Promise<void>;
  saveConfig: (updates: Partial<LocalConfig>) => Promise<void>;
  workspacePath: string | null;
  setWorkspacePath: (path: string | null) => void;
}
