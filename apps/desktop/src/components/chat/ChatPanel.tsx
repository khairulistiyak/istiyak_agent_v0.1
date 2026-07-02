import React from "react";
import { UIMessage } from "ai";
import { MessageList } from "./MessageList.js";
import { ChatInputBar } from "./ChatInput.js";

interface PromptItem {
  title: string;
  prompt: string;
}

export type AgentMode = "chat" | "plan" | "assist" | "agent";

interface ChatPanelProps {
  messages: UIMessage[];
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  onSend: () => void;
  onAbort: () => void;
  onSettingsOpen: () => void;
  installedPrompts: PromptItem[];
  permissionStates: { [reqId: string]: "pending" | "approved" | "rejected" | "timed_out" };
  resolvedPermissionIds: Set<string>;
  onPermissionResponse: (reqId: string, approved: boolean) => void;
  mode?: AgentMode;
  onModeChange?: (mode: AgentMode) => void;
  showModeHeader?: boolean;
  className?: string;
}

const MODE_POLICY: Record<AgentMode, { title: string; detail: string; badge: string }> = {
  chat: {
    title: "CHAT MODE",
    detail: "Plain answer only. File access and terminal tools are blocked.",
    badge: "Tools blocked",
  },
  plan: {
    title: "PLAN MODE",
    detail: "Architecture, diagnosis, and roadmap only. No code changes.",
    badge: "No edits",
  },
  assist: {
    title: "ASSIST MODE",
    detail: "Read/search allowed for diagnosis. Write and run actions stay blocked.",
    badge: "Read only",
  },
  agent: {
    title: "AGENT MODE",
    detail: "Autonomous edits and commands are allowed with approval gates.",
    badge: "Approve risky tools",
  },
};

const MODES: Array<{
  id: AgentMode;
  label: string;
  hint: string;
}> = [
  { id: "chat", label: "Chat", hint: "No tools" },
  { id: "plan", label: "Plan", hint: "No edits" },
  { id: "assist", label: "Assist", hint: "Read only" },
  { id: "agent", label: "Agent", hint: "Approve" },
];

export { MODE_POLICY, MODES };

const getModeClasses = (mode: AgentMode, active: boolean) => {
  const styles: Record<AgentMode, string> = {
    chat: active
      ? "border-cyan-400/70 bg-cyan-400/10 text-cyan-200"
      : "border-cyber-cardBorder bg-[#0b0e14] text-cyber-textSecondary hover:text-cyan-200",
    plan: active
      ? "border-violet-400/70 bg-violet-500/10 text-violet-200"
      : "border-cyber-cardBorder bg-[#0b0e14] text-cyber-textSecondary hover:text-violet-200",
    assist: active
      ? "border-amber-400/70 bg-amber-500/10 text-amber-200"
      : "border-cyber-cardBorder bg-[#0b0e14] text-cyber-textSecondary hover:text-amber-200",
    agent: active
      ? "border-emerald-400/70 bg-emerald-500/10 text-emerald-200"
      : "border-cyber-cardBorder bg-[#0b0e14] text-cyber-textSecondary hover:text-emerald-200",
  };
  return styles[mode];
};

export const ChatPanel = React.memo(
  ({
    messages,
    input,
    setInput,
    isLoading,
    onSend,
    onAbort,
    onSettingsOpen,
    installedPrompts,
    permissionStates,
    resolvedPermissionIds,
    onPermissionResponse,
    mode = "chat",
    onModeChange,
    showModeHeader = true,
    className = "w-[380px] flex flex-col overflow-hidden bg-cyber-dark",
  }: ChatPanelProps) => {
    const policy = MODE_POLICY[mode];

    return (
      <div className={className}>
        {showModeHeader && (
          <div className="px-4 pt-3 pb-2 border-b border-cyber-cardBorder/60 bg-gradient-to-b from-[#10131b] to-cyber-dark">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-cyber-textMuted font-bold">
                  Mode selector
                </p>
                <h2 className="text-sm font-bold text-white">Chat-first Agent</h2>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-400/10 border border-cyan-400/30 text-cyan-200">
                {policy.title}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {MODES.map((item) => {
                const active = item.id === mode;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onModeChange?.(item.id)}
                    className={`rounded-xl border px-2 py-2 text-left transition-all duration-200 ${getModeClasses(item.id, active)}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${active ? "bg-current" : "bg-cyber-textMuted"}`}
                      />
                      <span className="text-[11px] font-bold leading-none">{item.label}</span>
                    </div>
                    <p className="mt-1 text-[8px] opacity-70 truncate">{item.hint}</p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-cyber-cardBorder bg-[#080a10] px-3 py-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white truncate">
                  Backend Permission Policy
                </p>
                <p className="text-[10px] text-cyber-textSecondary truncate">{policy.detail}</p>
              </div>
              <span className="shrink-0 rounded-full bg-rose-500/10 border border-rose-400/30 px-2 py-1 text-[9px] font-bold text-rose-200">
                {policy.badge}
              </span>
            </div>
          </div>
        )}

        <MessageList
          messages={messages}
          isLoading={isLoading}
          permissionStates={permissionStates}
          resolvedPermissionIds={resolvedPermissionIds}
          onPermissionResponse={onPermissionResponse}
        />
        <ChatInputBar
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          onSend={onSend}
          onAbort={onAbort}
          onSettingsOpen={onSettingsOpen}
          installedPrompts={installedPrompts}
          mode={mode}
        />
      </div>
    );
  }
);

ChatPanel.displayName = "ChatPanel";
