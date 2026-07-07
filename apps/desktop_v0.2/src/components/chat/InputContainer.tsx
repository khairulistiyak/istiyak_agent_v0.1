import React, { useState, KeyboardEvent, useRef, useEffect } from "react";
import { ArrowUp, Cpu, FolderOpen, ChevronDown } from "lucide-react";
import { useChatStore } from "../../store/useChatStore.js";
import { GlassButton } from "../ui/GlassButton.js";

export const InputContainer: React.FC = () => {
  const [text, setText] = useState("");
  const { 
    sessions, 
    activeSessionId, 
    sendMessage, 
    models, 
    updateEngineConfig
  } = useChatStore();

  const [isIdeOpen, setIsIdeOpen] = useState(false);
  const ideDropdownRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ideDropdownRef.current && !ideDropdownRef.current.contains(event.target as Node)) {
        setIsIdeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!activeSession) return null;

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectIDE = (label: string) => {
    useChatStore.setState((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === activeSessionId ? { ...s, targetIDE: label } : s
      )
    }));
    setIsIdeOpen(false);
  };

  const handleSelectDirectory = () => {
    const dir = prompt("Enter project workspace directory path:", activeSession.workspacePath || "/Volumes/SSD/0.1/istiyak_agent_v0.1");
    if (dir) {
      useChatStore.setState((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === activeSessionId ? { ...s, targetIDE: "Directory", workspacePath: dir } : s
        )
      }));
    }
    setIsIdeOpen(false);
  };

  const activeModels = models
    .filter(m => m.status)
    .map(m => m.name);
  
  // Include built-in model names for selected provider as fallback
  const allModels = Array.from(new Set([
    ...activeModels,
    "Gemini 2.5 Flash",
    "Gemini 2.5 Pro",
    "Claude 3.5 Sonnet",
    "GPT-4o"
  ]));

  const ideOptions = ["Antigravity IDE", "VS Code", "Cursor", "WebStorm"];

  return (
    <div className="w-full flex flex-col gap-2 p-3 border border-cyber-card-border bg-[#0d0e12] rounded-xl max-w-4xl mx-auto">
      {/* Mode & Model Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          {/* Mode Selector */}
          <div className="flex items-center bg-black/20 rounded-lg p-0.5 border border-white/5">
            <GlassButton
              onClick={() => {
                useChatStore.setState((state) => ({
                  sessions: state.sessions.map((s) =>
                    s.id === activeSessionId ? { ...s, activeMode: "Agent Mode" } : s
                  )
                }));
              }}
              active={activeSession.activeMode === "Agent Mode"}
              variant="ghost"
              size="xs"
              className="!border-transparent !bg-transparent"
            >
              Agent Mode
            </GlassButton>
            <GlassButton
              onClick={() => {
                useChatStore.setState((state) => ({
                  sessions: state.sessions.map((s) =>
                    s.id === activeSessionId ? { ...s, activeMode: "Plan Mode" } : s
                  )
                }));
              }}
              active={activeSession.activeMode === "Plan Mode"}
              variant="ghost"
              size="xs"
              className="!border-transparent !bg-transparent"
            >
              Plan Mode
            </GlassButton>
          </div>

          {/* Target IDE / Workspace Selector */}
          <div className="relative" ref={ideDropdownRef}>
            <GlassButton
              onClick={() => setIsIdeOpen(!isIdeOpen)}
              variant="ghost"
              size="xs"
              className="!border-white/5 !bg-black/20 hover:!bg-black/30 rounded-lg font-bold"
            >
              <span className="text-gray-500">Target:</span>{" "}
              <span className="text-white">
                {activeSession.targetIDE === "Directory" 
                  ? (activeSession.workspacePath?.split("/").pop() || "Directory")
                  : activeSession.targetIDE
                }
              </span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </GlassButton>
            
            {isIdeOpen && (
              <div className="absolute top-[calc(100%+6px)] left-0 min-w-[180px] z-50 rounded-xl border border-white/10 bg-[#121214] p-1.5 shadow-2xl backdrop-blur-xl">
                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider px-2.5 py-1 border-b border-white/5 mb-1 text-left">
                  Select Running IDE
                </div>
                {ideOptions.map((opt) => (
                  <GlassButton
                    key={opt}
                    onClick={() => handleSelectIDE(opt)}
                    variant="ghost"
                    size="xs"
                    className={`w-full !justify-between !px-2.5 !py-1 text-gray-400 hover:text-white ${
                      activeSession.targetIDE === opt ? "!text-white !font-semibold" : ""
                    }`}
                  >
                    <span>{opt}</span>
                    {activeSession.targetIDE === opt && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </GlassButton>
                ))}
                
                <div className="border-t border-white/5 mt-1 pt-1">
                  <GlassButton
                    onClick={handleSelectDirectory}
                    variant="ghost"
                    size="xs"
                    className={`w-full !justify-between !px-2.5 !py-1 text-gray-400 hover:text-white ${
                      activeSession.targetIDE === "Directory" ? "!text-white !font-semibold" : ""
                    }`}
                  >
                    <span className="truncate flex items-center gap-1">
                      <FolderOpen className="w-3 h-3 text-gray-500" />
                      {activeSession.targetIDE === "Directory" && activeSession.workspacePath
                        ? activeSession.workspacePath.split("/").pop()
                        : "Choose Workspace..."
                      }
                    </span>
                    {activeSession.targetIDE === "Directory" && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </GlassButton>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Model Selection Dropdown */}
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={activeSession.activeModel}
            onChange={(e) => {
              const val = e.target.value;
              useChatStore.setState((state) => ({
                sessions: state.sessions.map((s) =>
                  s.id === activeSessionId ? { ...s, activeModel: val } : s
                )
              }));
              updateEngineConfig({ selectedModel: val });
            }}
            className="bg-black/30 border border-white/10 hover:border-white/20 text-gray-300 text-[10px] font-semibold py-1 px-2.5 rounded-lg focus:outline-none focus:border-white/20 cursor-pointer"
          >
            {allModels.map((model) => (
              <option key={model} value={model} className="bg-[#121214] text-gray-300">
                {model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TextInput Row */}
      <div className="flex items-center gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question, request a script, or start an execution..."
          rows={1}
          className="flex-1 bg-transparent text-xs text-gray-200 placeholder-gray-500 outline-none resize-none min-h-[24px] max-h-32 scrollbar-none py-1.5"
        />

        <GlassButton
          onClick={handleSend}
          disabled={!text.trim()}
          variant="primary"
          className="rounded-xl w-8 h-8 !p-0 shadow-lg cursor-pointer disabled:opacity-30 disabled:scale-100"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </GlassButton>
      </div>
    </div>
  );
};
