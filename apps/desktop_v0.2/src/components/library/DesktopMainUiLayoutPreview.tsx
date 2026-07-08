import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { 
  Plus, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Trash2, 
  Settings, 
  ArrowUp, 
  ChevronDown, 
  Sparkles, 
  X, 
  Key, 
  Globe, 
  Terminal,
  Cpu,
  GitBranch,
  FileCode,
  FileJson,
  Activity,
  CheckCircle,
  Play
} from "lucide-react";
import { GlassButton } from "../ui/GlassButton.js";

interface MockMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  isPlan?: boolean;
  planStatus?: "pending" | "executing" | "completed";
}

interface MockSession {
  id: string;
  title: string;
  activeModel: string;
  activeMode: "Agent Mode" | "Plan Mode";
  targetIDE: string;
  workspacePath: string;
  messages: MockMessage[];
}

export const DesktopMainUiLayoutPreview: React.FC = () => {
  // App Shell states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Simulated System Stats
  const [cpuUsage, setCpuUsage] = useState(14);
  const [memoryUsage, setMemoryUsage] = useState(42);
  const [activeTab, setActiveTab] = useState("diff"); // 'diff' | 'app' | 'package'
  
  // Session states
  const [sessions, setSessions] = useState<MockSession[]>([
    {
      id: "sess-1",
      title: "Agro Marketplace Landing page",
      activeModel: "Gemini 3.5 Pro",
      activeMode: "Agent Mode",
      targetIDE: "Antigravity IDE",
      workspacePath: "/Volumes/SSD/2026/imran_agro_website",
      messages: [
        {
          id: "m1",
          role: "user",
          content: "Can you help me design the hero section of the Agro Marketplace website?",
          timestamp: "10:30 AM"
        },
        {
          id: "m2",
          role: "assistant",
          content: "Certainly! I recommend building a glassmorphic dashboard header with a responsive viewport. We can use green/emerald accents to represent farm freshness, dark cards with `backdrop-blur-md` for SaaS aesthetics, and quick filters to search crops.",
          timestamp: "10:31 AM"
        }
      ]
    },
    {
      id: "sess-2",
      title: "Setup Farmers RBAC System",
      activeModel: "Gemini 3.5 Flash",
      activeMode: "Plan Mode",
      targetIDE: "VS Code",
      workspacePath: "/Volumes/SSD/2026/imran_agro_website",
      messages: [
        {
          id: "m3",
          role: "user",
          content: "Write the RBAC role checking API route.",
          timestamp: "Yesterday"
        },
        {
          id: "m4",
          role: "assistant",
          isPlan: true,
          planStatus: "pending",
          content: `### Implementation Plan: Farmers RBAC System

We need to add authentication middleware to check JWT roles for Farmers vs. Buyers.

#### Proposed Changes:
1. [NEW] \`src/components/AgroLandingCard.tsx\`
2. [MODIFY] \`src/app/page.tsx\`

Please approve the plan below to begin execution.`,
          timestamp: "Yesterday"
        }
      ]
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState("sess-1");

  // Input states
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [ideDropdownOpen, setIdeDropdownOpen] = useState(false);
  const ideDropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      if (width < 768) {
        setIsSidebarOpen(false);
      }
    }
  }, []);
  
  // Plan execution states
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [executingPlanId, setExecutingPlanId] = useState<string | null>(null);

  // Settings states
  const [settingsTab, setSettingsTab] = useState<"engine" | "providers">("engine");
  const [engineConfig, setEngineConfig] = useState({
    provider: "Google Gemini",
    selectedModel: "Gemini 3.5 Pro",
    apiKey: "AIzaSyD-mock-key-12345",
    gcpProjectId: "imran-agro-platform-dev",
    vertexRegion: "us-central1"
  });

  // Simulate system usage fluctuate
  useEffect(() => {
    const timer = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 15) + 10);
      setMemoryUsage(prev => {
        const change = Math.floor(Math.random() * 3) - 1;
        const next = prev + change;
        return next > 45 ? 45 : next < 40 ? 40 : next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages, isTyping, executionLogs]);

  // Click outside IDE dropdown handler
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (ideDropdownRef.current && !ideDropdownRef.current.contains(e.target as Node)) {
        setIdeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Handler: Add Session
  const handleAddSession = () => {
    const newId = `sess-${Date.now()}`;
    const newSession: MockSession = {
      id: newId,
      title: `New Session Thread ${sessions.length + 1}`,
      activeModel: engineConfig.selectedModel,
      activeMode: "Agent Mode",
      targetIDE: "Antigravity IDE",
      workspacePath: "/Volumes/SSD/2026/imran_agro_website",
      messages: [
        {
          id: `m-init-${Date.now()}`,
          role: "assistant",
          content: `Welcome to your new companion workspace session! Active model is ${engineConfig.selectedModel}. Type your instructions or click a slash command helper to begin.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newId);
  };

  // Handler: Delete Session
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = sessions.filter(s => s.id !== id);
    setSessions(remaining);
    if (activeSessionId === id && remaining.length > 0) {
      setActiveSessionId(remaining[0].id);
    }
  };

  // Handler: Send Message
  const handleSend = (textToSend = inputText) => {
    if (!textToSend.trim() || isTyping) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: MockMessage = {
      id: `m-user-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      timestamp
    };

    // Update session messages
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, messages: [...s.messages, userMsg] };
      }
      return s;
    }));
    setInputText("");
    setIsTyping(true);

    // Mock AI reply sequence (1200ms)
    setTimeout(() => {
      const replyTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      let assistantMsg: MockMessage;

      if (activeSession.activeMode === "Plan Mode") {
        assistantMsg = {
          id: `m-agent-${Date.now()}`,
          role: "assistant",
          isPlan: true,
          planStatus: "pending",
          content: `### Implementation Plan: Component Refactor

I have scanned your active files. Let's make the layout modern and fluid.

#### Proposed Changes:
1. [NEW] \`src/components/library/ModernCard.tsx\`
2. [MODIFY] \`src/components/library/DesktopMainUiLayoutPreview.tsx\`

Please approve the plan below to begin execution.`,
          timestamp: replyTimestamp
        };
      } else {
        assistantMsg = {
          id: `m-agent-${Date.now()}`,
          role: "assistant",
          content: `I have analyzed the request: "${userMsg.content}".
Based on the current project settings inside target ${activeSession.targetIDE}, I can write a custom React component with Tailwind support. Let me know if you would like me to trigger write_to_file.`,
          timestamp: replyTimestamp
        };
      }

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...s.messages, assistantMsg] };
        }
        return s;
      }));
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handler: Update Active Mode
  const handleSetMode = (mode: "Agent Mode" | "Plan Mode") => {
    setSessions(prev => prev.map(s => 
      s.id === activeSessionId ? { ...s, activeMode: mode } : s
    ));
  };

  // Handler: Update Target IDE
  const handleSelectIDE = (ide: string) => {
    setSessions(prev => prev.map(s => 
      s.id === activeSessionId ? { ...s, targetIDE: ide } : s
    ));
    setIdeDropdownOpen(false);
  };

  // Handler: Clear Messages
  const handleClearChat = () => {
    setSessions(prev => prev.map(s => 
      s.id === activeSessionId ? { ...s, messages: [] } : s
    ));
    setExecutionLogs([]);
    setExecutingPlanId(null);
  };

  // Inject Slash Command
  const handleSlashClick = (command: string) => {
    setInputText(command + " ");
  };

  // Simulating Plan Execution
  const handleApprovePlan = (messageId: string) => {
    setExecutingPlanId(messageId);
    setExecutionLogs(["[SYSTEM] Initializing Agent Environment...", "[SYSTEM] Fetching plan configurations..."]);
    
    // Simulate step by step execution
    setTimeout(() => {
      setExecutionLogs(prev => [...prev, "[FILE] Creating src/components/library/ModernCard.tsx (Success)"]);
    }, 800);

    setTimeout(() => {
      setExecutionLogs(prev => [...prev, "[FILE] Modifying src/components/library/DesktopMainUiLayoutPreview.tsx (Success)"]);
    }, 1600);

    setTimeout(() => {
      setExecutionLogs(prev => [...prev, "[COMPILER] Running linter and checking imports...", "[TEST] npm run test:unit (2 passed, 0 failed)"]);
    }, 2400);

    setTimeout(() => {
      setExecutionLogs(prev => [...prev, "[SYSTEM] Task execution succeeded. Syncing workspace rules."]);
      // Update message plan status to completed
      setSessions(prev => prev.map(s => {
        return {
          ...s,
          messages: s.messages.map(m => {
            if (m.id === messageId) {
              return { ...m, planStatus: "completed" };
            }
            return m;
          })
        };
      }));
      setExecutingPlanId(null);
    }, 3200);
  };

  return (
    <div ref={containerRef} className="flex flex-col border border-white/[0.08] bg-[#0c0d12]/95 backdrop-blur-xl rounded-2xl w-full h-[660px] overflow-hidden text-left relative font-mono text-xs select-none shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
      
      {/* 0. WINDOW TITLEBAR (macOS Style) */}
      <div className="h-10 border-b border-white/[0.06] bg-[#07080c] flex items-center justify-between px-4 select-none shrink-0">
        <div className="flex items-center gap-1.5 w-1/3">
          <div className="w-3 h-3 rounded-full bg-rose-500/80 border border-rose-600/30" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80 border border-amber-600/30" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/30" />
        </div>
        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5 justify-center w-1/3">
          <Terminal className="w-3 h-3 text-emerald-450" />
          <span>Antigravity Developer Shell</span>
        </div>
        <div className="flex items-center justify-end gap-3 w-1/3 text-[9px] text-gray-500">
          <span className="flex items-center gap-1 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md font-bold text-gray-400">
            <GitBranch className="w-2.5 h-2.5" /> git: main
          </span>
          <span className="flex items-center gap-1 text-[8.5px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 px-1.5 py-0.5 rounded">
            Connected
          </span>
        </div>
      </div>

      {/* Main Container Split */}
      <div className="flex flex-1 overflow-hidden w-full relative">
        
        {/* 1. MOCK COLLAPSIBLE SIDEBAR */}
        <div 
          className={`h-full border-r border-white/[0.05] bg-[#050609]/95 flex flex-col justify-between transition-all duration-300 shrink-0 ${
            isSidebarOpen ? "w-60" : "w-0 overflow-hidden border-r-0"
          }`}
        >
          {/* Top Header & Toggle */}
          <div className="flex flex-col p-4 gap-3.5 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="text-[9.5px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                  COMPANION v0.2
                </span>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-gray-200 cursor-pointer transition-colors"
                title="Collapse Sidebar"
              >
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            </div>

            <GlassButton
              onClick={handleAddSession}
              variant="primary"
              size="sm"
              className="w-full justify-center !bg-white/5 hover:!bg-white/10 !border-white/10 !py-2 !rounded-xl"
            >
              <Plus className="w-3.5 h-3.5 text-gray-300" />
              <span className="text-xs font-semibold text-gray-300">New Thread</span>
            </GlassButton>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto px-2.5 py-1 scrollbar-thin flex flex-col gap-1.5">
            <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest pl-2.5 mb-1 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-gray-650" />
              Active Workspace Threads
            </div>
            {sessions.map(s => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  onClick={() => setActiveSessionId(s.id)}
                  className={`w-full p-3 border rounded-xl flex flex-col gap-1 transition-all cursor-pointer ${
                    isActive 
                      ? "border-emerald-500/20 bg-emerald-500/[0.04] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" 
                      : "border-transparent bg-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold truncate max-w-[130px]">{s.title}</span>
                    <button
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      className="p-0.5 hover:bg-white/10 rounded text-gray-600 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex justify-between text-[7px] text-gray-600 font-mono uppercase font-bold tracking-wider">
                    <span>{s.activeModel.split(" ")[1]} {s.activeModel.split(" ")[2]}</span>
                    <span className={s.activeMode === "Plan Mode" ? "text-amber-500/70" : "text-emerald-500/70"}>
                      {s.activeMode}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar System Monitor Widgets */}
          <div className="px-4 py-3 border-t border-white/[0.03] bg-black/10 flex flex-col gap-2.5 select-none">
            <div className="text-[7.5px] font-bold text-gray-650 uppercase tracking-widest">
              Resource Monitor
            </div>
            <div className="flex flex-col gap-1.5 text-[9px] text-gray-400">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-gray-600" /> CPU Load</span>
                <span className="font-bold text-gray-300">{cpuUsage}%</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${cpuUsage}%` }}
                />
              </div>

              <div className="flex justify-between items-center mt-0.5">
                <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-gray-600" /> Memory Load</span>
                <span className="font-bold text-gray-300">{memoryUsage}%</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${memoryUsage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Profile / Settings Footer */}
          <div className="p-3 border-t border-white/[0.04] flex items-center justify-between bg-black/30">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-[10px] text-emerald-400 select-none">
                DI
              </div>
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-[10px] font-bold text-gray-250 truncate">
                  Dev Istiyak
                </span>
                <span className="text-[7.5px] text-gray-500 leading-none mt-0.5">
                  Pro Developer
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 hover:bg-white/5 border border-transparent hover:border-white/5 rounded-lg text-gray-400 hover:text-white cursor-pointer transition-all"
              title="Settings Panel"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* 2. CHAT WORKSPACE AREA */}
        <div className="flex-1 flex flex-col h-full bg-[#050608]/98 relative overflow-hidden">
          
          {/* Workspace Bar / Header */}
          <div className="h-14 border-b border-white/[0.04] px-4 flex items-center justify-between bg-black/40 backdrop-blur-md z-10 select-none shrink-0">
            <div className="flex items-center gap-3">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-1.5 hover:bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer"
                  title="Show Sidebar"
                >
                  <PanelLeftOpen className="w-4 h-4" />
                </button>
              )}
              <div className="flex flex-col text-left">
                <h2 className="text-[11px] font-bold text-gray-200 truncate max-w-[240px] sm:max-w-[400px]">
                  {activeSession.title}
                </h2>
                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                  Active Engine: {activeSession.activeModel} • Mode: {activeSession.activeMode}
                </p>
              </div>
            </div>

            {activeSession.messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="px-2.5 py-1 text-[8.5px] font-bold border border-white/5 bg-white/5 hover:bg-rose-500/10 hover:text-rose-450 hover:border-rose-500/10 text-gray-400 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
              >
                <Trash2 className="w-3 h-3" /> Clear Chat
              </button>
            )}
          </div>

          {/* Mock File Editor Tabs (VS Code style to look extremely authentic) */}
          <div className="h-9 border-b border-white/[0.04] bg-[#07080b] flex items-center px-2 select-none gap-0.5 shrink-0">
            <button 
              onClick={() => setActiveTab("diff")}
              className={`h-full px-3 flex items-center gap-1.5 border-r border-white/[0.04] text-[9.5px] font-bold transition-all ${
                activeTab === "diff" 
                  ? "bg-[#050608]/98 text-white border-t border-t-emerald-500" 
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              <FileCode className="w-3 h-3 text-emerald-400" />
              <span>DiffCodeReview.tsx</span>
            </button>
            <button 
              onClick={() => setActiveTab("app")}
              className={`h-full px-3 flex items-center gap-1.5 border-r border-white/[0.04] text-[9.5px] font-bold transition-all ${
                activeTab === "app" 
                  ? "bg-[#050608]/98 text-white border-t border-t-emerald-500" 
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              <FileCode className="w-3 h-3 text-emerald-500" />
              <span>page.tsx</span>
            </button>
            <button 
              onClick={() => setActiveTab("package")}
              className={`h-full px-3 flex items-center gap-1.5 border-r border-white/[0.04] text-[9.5px] font-bold transition-all ${
                activeTab === "package" 
                  ? "bg-[#050608]/98 text-white border-t border-t-emerald-500" 
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              <FileJson className="w-3 h-3 text-amber-500" />
              <span>package.json</span>
            </button>
          </div>

          {/* Chat Feed Messages Area */}
          <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5 scrollbar-thin select-text bg-[#030406]">
            {activeSession.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none opacity-50">
                <Sparkles className="w-9 h-9 text-gray-600 mb-3 animate-pulse" />
                <span className="text-xs text-gray-400 font-bold">Companion AI Workspace</span>
                <span className="text-[10px] text-gray-650 max-w-xs mt-1 leading-normal">
                  Send a message below or use a slash command to run, build, or format your workspace assets.
                </span>
              </div>
            ) : (
              activeSession.messages.map(msg => {
                const isUser = msg.role === "user";
                return (
                  <div key={msg.id} className={`flex w-full gap-3.5 items-start ${isUser ? "justify-end" : "justify-start"} animate-[fadeIn_0.2s_ease-out]`}>
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mt-0.5 shrink-0 select-none">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    )}
                    
                    <div className={`flex flex-col max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
                      <div className="flex items-center gap-2.5 text-[8px] font-bold text-gray-650 uppercase tracking-widest select-none mb-1">
                        <span>{isUser ? "User" : "Agent"}</span>
                        <span>•</span>
                        <span className="font-normal lowercase text-[7.5px]">{msg.timestamp}</span>
                      </div>
                      
                      {msg.isPlan ? (
                        /* Beautiful and Interactive Plan Card */
                        <div className="border border-white/10 rounded-2xl bg-[#0c0d12]/90 p-4 w-[420px] max-w-full text-left font-sans flex flex-col gap-3.5 relative shadow-xl">
                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" /> Implementation Plan
                            </span>
                            <span className={`text-[8.5px] px-2 py-0.5 rounded font-bold uppercase ${
                              msg.planStatus === "completed" 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                                : msg.planStatus === "executing"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/15 animate-pulse"
                                : "bg-white/5 text-gray-400 border border-white/5"
                            }`}>
                              {msg.planStatus}
                            </span>
                          </div>
                          
                          <div className="text-[10px] text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </div>

                          {msg.planStatus === "pending" && (
                            <GlassButton
                              onClick={() => handleApprovePlan(msg.id)}
                              disabled={executingPlanId !== null}
                              variant="primary"
                              size="sm"
                              className="w-full justify-center !bg-emerald-500/10 hover:!bg-emerald-500/15 !border-emerald-500/20 hover:!border-emerald-500/30 !py-2 !rounded-xl text-emerald-400 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Play className="w-3 h-3 fill-current" /> Approve & Execute Plan
                            </GlassButton>
                          )}

                          {msg.planStatus === "executing" && (
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5 animate-pulse">
                              <div className="bg-amber-500 h-full rounded-full animate-[progressSim_3.2s_ease-in-out_forwards]" />
                            </div>
                          )}

                          {msg.planStatus === "completed" && (
                            <div className="text-[9.5px] font-mono text-emerald-450 border border-emerald-500/10 bg-emerald-500/[0.02] p-2.5 rounded-xl flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                              <span>Plan executed and committed successfully!</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Standard Message Content */
                        <div
                          className={`text-[10.5px] leading-relaxed whitespace-pre-wrap px-3.5 py-2.5 rounded-2xl ${
                            isUser 
                              ? "bg-white/5 border border-white/10 text-white font-mono rounded-tr-none text-left" 
                              : "bg-transparent text-gray-300 font-mono text-left"
                          }`}
                        >
                          {msg.content}
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 mt-0.5 shrink-0 select-none">
                        <Terminal className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Execution Shell Outputs */}
            {executionLogs.length > 0 && (
              <div className="border border-white/5 rounded-xl bg-black/40 p-4 font-mono text-[9px] text-gray-400 flex flex-col gap-1.5 select-text animate-[fadeIn_0.2s_ease-out]">
                <div className="flex justify-between items-center border-b border-white/5 pb-1.5 mb-1.5 text-gray-500 uppercase tracking-widest text-[8px] font-bold">
                  <span>Terminal Logger</span>
                  <span>Active stdout</span>
                </div>
                {executionLogs.map((log, idx) => (
                  <div key={idx} className={`leading-normal ${
                    log.includes("Success") || log.includes("succeeded") 
                      ? "text-emerald-400" 
                      : log.includes("[FILE]") 
                      ? "text-gray-350"
                      : "text-gray-500"
                  }`}>
                    {log}
                  </div>
                ))}
              </div>
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex w-full gap-3.5 items-start justify-start animate-pulse">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mt-0.5 shrink-0 select-none">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[7.5px] font-bold text-gray-650 uppercase tracking-widest">Agent is working...</span>
                  <span className="text-[10px] text-gray-500 mt-1 font-mono italic">Scoping project files & thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Console (Bottom Floating) */}
          <div className="p-4 bg-gradient-to-t from-[#050608] via-[#050608]/95 to-transparent z-10 select-none shrink-0 border-t border-white/[0.03]">
            <div className="w-full flex flex-col gap-2.5 p-3.5 border border-white/[0.05] bg-[#0c0d12] rounded-2xl max-w-3xl mx-auto shadow-2xl relative">
              
              {/* Mode & Target Workspace Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  {/* Plan/Agent Switcher */}
                  <div className="flex items-center bg-black/35 rounded-lg p-0.5 border border-white/5">
                    <GlassButton
                      onClick={() => handleSetMode("Agent Mode")}
                      active={activeSession.activeMode === "Agent Mode"}
                      variant="ghost"
                      size="xs"
                      className="!border-transparent !bg-transparent !py-0.5 !px-2 text-[9px]"
                    >
                      Agent Mode
                    </GlassButton>
                    <GlassButton
                      onClick={() => handleSetMode("Plan Mode")}
                      active={activeSession.activeMode === "Plan Mode"}
                      variant="ghost"
                      size="xs"
                      className="!border-transparent !bg-transparent !py-0.5 !px-2 text-[9px]"
                    >
                      Plan Mode
                    </GlassButton>
                  </div>

                  {/* Target IDE Dropdown */}
                  <div className="relative" ref={ideDropdownRef}>
                    <GlassButton
                      onClick={() => setIdeDropdownOpen(!ideDropdownOpen)}
                      variant="ghost"
                      size="xs"
                      className="!border-white/5 !bg-black/35 hover:!bg-black/45 rounded-lg font-bold text-[9px] flex items-center gap-1"
                    >
                      <span className="text-gray-500">Target:</span>{" "}
                      <span className="text-white">{activeSession.targetIDE}</span>
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </GlassButton>
                    
                    {ideDropdownOpen && (
                      <div className="absolute top-[calc(100%+6px)] left-0 min-w-[150px] z-50 rounded-xl border border-white/10 bg-[#0d0e12] p-1 shadow-2xl">
                        {["Antigravity IDE", "VS Code", "Cursor", "WebStorm"].map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleSelectIDE(opt)}
                            className="w-full text-left px-2.5 py-1.5 text-[9px] font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Model Indicator */}
                <span className="text-[8px] bg-white/5 border border-white/5 px-2 py-0.5 rounded text-gray-500 font-bold uppercase tracking-wider">
                  {activeSession.activeModel}
                </span>
              </div>

              {/* Input Text Box */}
              <div className="flex gap-2 items-center mt-0.5">
                <textarea
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isTyping ? "Agent is processing..." : "Ask your agent to build, edit, or run tests..."}
                  disabled={isTyping}
                  rows={1}
                  className="flex-1 bg-transparent border-0 outline-none text-[10.5px] text-gray-200 resize-none font-mono placeholder-gray-600 disabled:opacity-50 min-h-[22px] max-h-[100px]"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputText.trim() || isTyping}
                  className="p-1.5 bg-white text-black hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-white rounded-xl transition-all cursor-pointer shadow-lg"
                  title="Send Message"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick-Inject Slash Commands Pill Buttons */}
              <div className="flex items-center gap-1.5 border-t border-white/5 pt-2 flex-wrap">
                <span className="text-[7.5px] font-bold text-gray-650 uppercase tracking-widest mr-1">
                  Commands:
                </span>
                <button 
                  onClick={() => handleSlashClick("/goal")}
                  className="text-[8.5px] px-2 py-0.5 rounded-md border border-white/5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                  title="Schedule a long running task"
                >
                  /goal
                </button>
                <button 
                  onClick={() => handleSlashClick("/schedule")}
                  className="text-[8.5px] px-2 py-0.5 rounded-md border border-white/5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                  title="Schedule automated pipeline run"
                >
                  /schedule
                </button>
                <button 
                  onClick={() => handleSlashClick("/grill-me")}
                  className="text-[8.5px] px-2 py-0.5 rounded-md border border-white/5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                  title="Interactive design interview review"
                >
                  /grill-me
                </button>
                <button 
                  onClick={() => handleSlashClick("/learn")}
                  className="text-[8.5px] px-2 py-0.5 rounded-md border border-white/5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                  title="Teach agent custom project rules"
                >
                  /learn
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* 3. SIMULATED SLIDE-OVER SETTINGS DRAWER */}
      {isSettingsOpen && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-[fadeIn_0.2s_ease-out]">
          <div className="w-80 h-full bg-[#0d0e12] border-l border-white/10 p-5 flex flex-col gap-4 shadow-2xl relative animate-[slideInRight_0.2s_ease-out]">
            
            {/* Drawer Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5 select-none">
              <div className="flex items-center gap-1.5 text-gray-300 font-bold">
                <Settings className="w-4 h-4 text-white" /> Settings Dashboard
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="flex border-b border-white/5 pb-1 select-none">
              <button
                onClick={() => setSettingsTab("engine")}
                className={`flex-1 py-1.5 text-center text-[9px] font-bold uppercase transition-all cursor-pointer ${
                  settingsTab === "engine" ? "text-white border-b-2 border-white" : "text-gray-500 hover:text-gray-400"
                }`}
              >
                Model Engine
              </button>
              <button
                onClick={() => setSettingsTab("providers")}
                className={`flex-1 py-1.5 text-center text-[9px] font-bold uppercase transition-all cursor-pointer ${
                  settingsTab === "providers" ? "text-white border-b-2 border-white" : "text-gray-500 hover:text-gray-400"
                }`}
              >
                Custom Providers
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 text-left font-sans">
              {settingsTab === "engine" ? (
                // Engine settings form
                <div className="flex flex-col gap-3 font-mono">
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">AI Provider</label>
                    <select
                      value={engineConfig.provider}
                      onChange={(e) => {
                        const prov = e.target.value;
                        let defaultModel = "Gemini 3.5 Pro";
                        if (prov === "OpenAI") defaultModel = "GPT-4o";
                        else if (prov === "Claude") defaultModel = "Claude 3.5 Sonnet";
                        else if (prov === "Ollama") defaultModel = "Llama 3";
                        setEngineConfig(prev => ({ ...prev, provider: prov, selectedModel: defaultModel }));
                        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, activeModel: defaultModel } : s));
                      }}
                      className="bg-[#050608] border border-white/5 p-2 rounded-xl text-xs text-gray-200 outline-none focus:border-white/25"
                    >
                      <option>Google Gemini</option>
                      <option>OpenAI</option>
                      <option>Claude</option>
                      <option>Ollama</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Active Model ID</label>
                    <select
                      value={engineConfig.selectedModel}
                      onChange={(e) => {
                        const m = e.target.value;
                        setEngineConfig(prev => ({ ...prev, selectedModel: m }));
                        setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, activeModel: m } : s));
                      }}
                      className="bg-[#050608] border border-white/5 p-2 rounded-xl text-xs text-gray-200 outline-none focus:border-white/25"
                    >
                      {engineConfig.provider === "Google Gemini" && (
                        <>
                          <option>Gemini 3.5 Pro</option>
                          <option>Gemini 3.5 Flash</option>
                          <option>Gemini 2.5 Pro</option>
                        </>
                      )}
                      {engineConfig.provider === "OpenAI" && (
                        <>
                          <option>GPT-4o</option>
                          <option>GPT-4 Turbo</option>
                        </>
                      )}
                      {engineConfig.provider === "Claude" && (
                        <>
                          <option>Claude 3.5 Sonnet</option>
                          <option>Claude 3.0 Opus</option>
                        </>
                      )}
                      {engineConfig.provider === "Ollama" && (
                        <>
                          <option>Llama 3</option>
                          <option>Mistral</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">API Auth Key</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={engineConfig.apiKey}
                        onChange={(e) => setEngineConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                        className="w-full bg-[#050608] border border-white/5 p-2 rounded-xl text-xs text-gray-200 outline-none focus:border-white/25 pr-8"
                      />
                      <Key className="w-3.5 h-3.5 text-gray-650 absolute right-2.5 top-3" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">GCP Project ID</label>
                    <input
                      type="text"
                      value={engineConfig.gcpProjectId}
                      onChange={(e) => setEngineConfig(prev => ({ ...prev, gcpProjectId: e.target.value }))}
                      className="bg-[#050608] border border-white/5 p-2 rounded-xl text-xs text-gray-200 outline-none focus:border-white/25"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Vertex Region</label>
                    <select
                      value={engineConfig.vertexRegion}
                      onChange={(e) => setEngineConfig(prev => ({ ...prev, vertexRegion: e.target.value }))}
                      className="bg-[#050608] border border-white/5 p-2 rounded-xl text-xs text-gray-200 outline-none focus:border-white/25"
                    >
                      <option>us-central1</option>
                      <option>us-east4</option>
                      <option>europe-west4</option>
                      <option>asia-southeast1</option>
                    </select>
                  </div>
                </div>
              ) : (
                // Custom Provider settings form
                <div className="flex flex-col gap-3 font-mono">
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Provider Base URL</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="https://api.openrouter.ai/v1"
                        className="w-full bg-[#050608] border border-white/5 p-2 rounded-xl text-xs text-gray-200 outline-none focus:border-white/25 pr-8"
                      />
                      <Globe className="w-3.5 h-3.5 text-gray-650 absolute right-2.5 top-3" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Header Configuration</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Authorization"
                        className="w-1/2 bg-[#050608] border border-white/5 p-1.5 rounded-lg text-[9px] text-gray-200 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Bearer token..."
                        className="w-1/2 bg-[#050608] border border-white/5 p-1.5 rounded-lg text-[9px] text-gray-200 outline-none"
                      />
                    </div>
                    <button className="w-full py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[8.5px] font-bold uppercase tracking-wider text-gray-300 mt-1 cursor-pointer">
                      Add Header
                    </button>
                  </div>

                  <div className="border border-white/5 rounded-xl p-2.5 bg-black/40 mt-1.5">
                    <div className="text-[8.5px] font-bold text-gray-500 uppercase pb-1 border-b border-white/5 mb-1.5">
                      Configured Models
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-gray-300 border-b border-white/5 py-1">
                      <span>glm-4-plan</span>
                      <span className="text-[7.5px] bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded uppercase">active</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-gray-400 py-1">
                      <span>llama-3-reason</span>
                      <span className="text-[7.5px] bg-white/5 text-gray-500 px-1 py-0.5 rounded uppercase">inactive</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="border-t border-white/5 pt-3 select-none">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-full py-2 bg-white text-black hover:bg-gray-200 rounded-xl font-bold uppercase tracking-wider text-center text-[10px] cursor-pointer shadow-lg"
              >
                Apply Configurations
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
