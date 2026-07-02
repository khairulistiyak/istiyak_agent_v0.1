import React, { useState, useEffect } from "react";
import { Paperclip, Terminal, Settings, Send, X } from "lucide-react";

interface PromptItem {
  title: string;
  prompt: string;
}

type AgentMode = "chat" | "plan" | "assist" | "agent";

interface ChatInputBarProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  onSend: () => void;
  onAbort: () => void;
  onSettingsOpen: () => void;
  installedPrompts: PromptItem[];
  mode?: AgentMode;
}

const MODE_PLACEHOLDER: Record<AgentMode, string> = {
  chat: "Ask anything. No tools will run...",
  plan: "Ask for a plan or architecture review...",
  assist: "Ask me to inspect and explain code...",
  agent: "Ask me to implement, fix, or run tasks...",
};

export const ChatInputBar = React.memo(
  ({
    input,
    setInput,
    isLoading,
    onSend,
    onAbort,
    onSettingsOpen,
    installedPrompts,
    mode = "chat",
  }: ChatInputBarProps) => {
    const [promptsDropdownOpen, setPromptsDropdownOpen] = useState(false);

    // Click outside to close prompts dropdown
    useEffect(() => {
      if (!promptsDropdownOpen) return;

      const handleOutsideClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest(".prompts-dropdown-container")) {
          return;
        }
        setPromptsDropdownOpen(false);
      };

      document.addEventListener("click", handleOutsideClick);
      return () => document.removeEventListener("click", handleOutsideClick);
    }, [promptsDropdownOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    };

    return (
      <div className="bg-[#0a0d14] px-6 pb-6 pt-3">
        {/* Pill-shaped input container matching 14-chat-welcome-screen.svg */}
        <div className="relative flex flex-col rounded-[19px] border border-[#1f2937] bg-[#0d0f16] focus-within:border-cyan-400/50 focus-within:ring-1 focus-within:ring-cyan-400/20 transition-all duration-300 overflow-hidden">
          <div className="flex items-start px-5 pt-4">
            <span className="mt-1.5 mr-3 h-3 w-3 shrink-0 rounded-full bg-cyan-400/70" />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={MODE_PLACEHOLDER[mode]}
              rows={1}
              disabled={isLoading}
              className="w-full min-h-[22px] max-h-32 resize-none border-0 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0 disabled:opacity-50"
            />
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between border-t border-[#1f2937]/50 px-4 py-2.5">
            <div className="flex items-center space-x-1">
              <button
                type="button"
                className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-300 hover:bg-cyan-400/10 transition-colors cursor-pointer"
                title="Attach file"
              >
                <Paperclip size={14} />
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors cursor-pointer"
                title="Run command"
              >
                <Terminal size={14} />
              </button>
              <button
                type="button"
                onClick={onSettingsOpen}
                className="p-1.5 rounded-lg text-slate-500 hover:text-violet-300 hover:bg-violet-400/10 transition-colors cursor-pointer"
                title="Companion Settings"
              >
                <Settings size={14} />
              </button>

              {/* Dynamic Prompt Selector library */}
              {installedPrompts.length > 0 && (
                <div className="prompts-dropdown-container relative">
                  <button
                    type="button"
                    onClick={() => setPromptsDropdownOpen(!promptsDropdownOpen)}
                    className="px-2 py-0.5 bg-cyan-400/15 hover:bg-cyan-400/25 border border-cyan-400/30 text-cyan-300 rounded text-[9px] font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Prompts</span>
                    <span className="text-[8px] bg-cyan-400/20 text-cyan-300 px-1 rounded-full">
                      {installedPrompts.length}
                    </span>
                  </button>
                  {promptsDropdownOpen && (
                    <div className="absolute bottom-full left-0 mb-1.5 w-48 bg-[#0d0f16] border border-slate-800 rounded-xl shadow-2xl z-50 p-2 space-y-1 max-h-48 overflow-y-auto">
                      <div className="text-[9px] text-slate-500 px-2 py-1 font-semibold uppercase tracking-wider border-b border-slate-800/40">
                        Select Prompt
                      </div>
                      {installedPrompts.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setInput((prev) => (prev ? `${prev}\n${p.prompt}` : p.prompt));
                            setPromptsDropdownOpen(false);
                          }}
                          className="w-full text-left px-2 py-1.5 hover:bg-cyan-400/15 rounded text-[10px] text-white truncate transition-colors cursor-pointer"
                          title={p.prompt}
                        >
                          {p.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* ⌘K shortcut badge */}
              {!isLoading && !input.trim() && (
                <span className="inline-flex items-center rounded border border-slate-700 bg-slate-800/50 px-1.5 py-0.5 text-[8px] font-bold text-slate-500">
                  ⌘K
                </span>
              )}

              {isLoading ? (
                <button
                  onClick={onAbort}
                  className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 transition-all duration-200 cursor-pointer flex items-center justify-center"
                  title="Stop Agent"
                >
                  <X size={14} />
                </button>
              ) : (
                <button
                  onClick={onSend}
                  disabled={!input.trim()}
                  className={`p-1.5 rounded-lg transition-all duration-300 cursor-pointer ${
                    input.trim()
                      ? "bg-cyan-400 text-[#0d0f16] hover:shadow-[0_0_12px_rgba(6,182,212,0.5)] transform hover:scale-105"
                      : "bg-slate-800 text-slate-600 cursor-not-allowed"
                  }`}
                >
                  <Send size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ChatInputBar.displayName = "ChatInputBar";
export { ChatInputBar as ChatInput }; // Keep alias for backward compatibility
