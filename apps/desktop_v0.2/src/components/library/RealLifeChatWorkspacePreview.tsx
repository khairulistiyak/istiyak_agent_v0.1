import React, { useState, useEffect, useRef } from "react";
import { 
  Folder, 
  GitBranch, 
  Settings, 
  Cpu, 
  Send, 
  User, 
  Pin, 
  X, 
  FileText,
  DollarSign,
  Info
} from "lucide-react";
import { GlassButton } from "../ui/GlassButton.js";

// Import some of the advanced widgets for our layout previews
// APIHealthMonitor and ProjectDiagnosticRadarMap removed from unused imports
import { AgentTaskPlanner, TaskItem } from "./agent-preview/AgentTaskPlanner.js";
import { InteractiveToolCall } from "./agent-preview/InteractiveToolCall.js";
import { DiffCodeReview, DiffLine } from "./agent-preview/DiffCodeReview.js";
import { SessionSummaryMetrics } from "./agent-preview/SessionSummaryMetrics.js";
import { PromptTemplatePills } from "./PromptTemplatePills.js";

interface SessionThread {
  id: string;
  title: string;
  subtitle: string;
  status: "active" | "completed" | "ready";
  initialMessage: string;
  pinnedFiles: string[];
}

const mockSessions: SessionThread[] = [
  {
    id: "session-1",
    title: "App.tsx Layout Bug Fix",
    subtitle: "Fix responsive layout overflow constraints",
    status: "active",
    initialMessage: "Welcome to the App.tsx layout workspace. I'm ready to trace flexbox styles and fix layout overflows.",
    pinnedFiles: ["src/App.tsx", "package.json"]
  },
  {
    id: "session-2",
    title: "Configure SQLite DB Bindings",
    subtitle: "Define rusqlite connection storage schema",
    status: "completed",
    initialMessage: "Welcome to the Database workspace. SQLite cache bindings are successfully implemented.",
    pinnedFiles: ["src/db/sqlite.rs", "Cargo.toml"]
  },
  {
    id: "session-3",
    title: "Verify Tauri IPC Handshake",
    subtitle: "Verify desktop client local bridge latency",
    status: "ready",
    initialMessage: "Diagnostics workspace ready. I can run Tauri command tests and check API gateway latency.",
    pinnedFiles: ["src-tauri/src/main.rs"]
  }
];

interface ChatMessage {
  id: string;
  type: "system" | "user" | "agent-thought" | "agent-planner" | "tool-diff" | "system-success" | "session-metrics" | "agent-text";
  content?: string;
  tasks?: TaskItem[];
  toolLogs?: string[];
  diffLines?: DiffLine[];
}

export const RealLifeChatWorkspacePreview: React.FC = () => {
  const [selectedSessionId, setSelectedSessionId] = useState("session-1");
  const [pinnedFiles, setPinnedFiles] = useState<string[]>(mockSessions[0].pinnedFiles);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [tokenCost, setTokenCost] = useState(0.20); // starts with mock cost
  const [activeCodeLine, setActiveCodeLine] = useState("  return <div className=\"w-screen h-screen overflow-hidden\">");

  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeSession = mockSessions.find(s => s.id === selectedSessionId) || mockSessions[0];

  // Load welcome messages when session changes
  useEffect(() => {
    setMessages([
      {
        id: "msg-welcome",
        type: "agent-text",
        content: activeSession.initialMessage
      }
    ]);
    setPinnedFiles(activeSession.pinnedFiles);
    setIsWorking(false);
  }, [selectedSessionId]);

  // Scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleUnpin = (fileName: string) => {
    setPinnedFiles(prev => prev.filter(f => f !== fileName));
  };

  const triggerSimulation = (promptText: string) => {
    if (isWorking) return;
    setIsWorking(true);

    const updated = [
      ...messages,
      { id: `user-${Date.now()}`, type: "user" as const, content: promptText }
    ];
    setMessages(updated);

    // Run step timers to simulate agent work
    setTimeout(() => {
      // Step 1: Planning
      const mockTasks: TaskItem[] = [
        { id: "tk1", label: `Scan layout rules for ${activeSession.title}`, description: "Analyzing viewport constraints", status: "running" },
        { id: "tk2", label: "Perform modification and verify Vite compilation", description: "Write updates to file", status: "pending" }
      ];
      setMessages(prev => [
        ...prev,
        { id: `thought-${Date.now()}`, type: "agent-thought", content: "I am loading configuration presets and reading files." },
        { id: `plan-${Date.now()}`, type: "agent-planner", tasks: mockTasks }
      ]);
    }, 1500);

    setTimeout(() => {
      // Step 2: Tool run & Code Diff
      const mockLogs = [
        `[08:05:10] Scanning pinned context: ${pinnedFiles.join(", ")}`,
        `[08:05:12] Proposing changes inside src/App.tsx...`
      ];
      const mockDiffLines: DiffLine[] = [
        { type: "normal", content: "export default function App() {" },
        { type: "deletion", content: "  return <div className=\"w-screen h-screen overflow-hidden\">" },
        { type: "addition", content: "  return <div className=\"w-screen h-screen overflow-hidden flex\">" },
        { type: "normal", content: "    <SidebarContainer />" }
      ];

      setMessages(prev => [
        ...prev,
        { id: `diff-${Date.now()}`, type: "tool-diff", toolLogs: mockLogs, diffLines: mockDiffLines }
      ]);
    }, 3200);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isWorking) return;
    triggerSimulation(userInput.trim());
    setUserInput("");
  };

  // Triggered when developer clicks approve & merge inside diff review card
  const handleApprove = () => {
    setTokenCost(prev => prev + 0.12); // cost goes up on compile
    setActiveCodeLine("  return <div className=\"w-screen h-screen overflow-hidden flex\">"); // update editor view

    setMessages(prev => [
      ...prev,
      { id: `success-${Date.now()}`, type: "system-success" },
      { id: `metrics-${Date.now()}`, type: "session-metrics" },
      {
        id: `agent-resp-${Date.now()}`,
        type: "agent-text",
        content: `I have successfully compiled, verified, and merged the proposed modifications for ${activeSession.title}!`
      }
    ]);
    setIsWorking(false);
  };

  // healthServices array removed as unused in this preview layout

  return (
    <div className="flex flex-col border border-white/[0.05] bg-[#0c0d10] p-4 rounded-3xl w-full max-w-6xl text-left gap-4 font-mono select-none">
      
      {/* Mac-style Desktop Application Titlebar Frame */}
      <div className="flex justify-between items-center bg-[#07080a] border border-white/[0.03] px-4 py-2 rounded-2xl">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
        </div>
        
        <div className="text-[9px] text-gray-500 font-bold tracking-wider">
          istiyak-desktop-agent-v0.2 — Workspace: /Volumes/SSD/0.1/istiyak_agent_v0.1
        </div>

        <div className="w-8 shrink-0" /> {/* spacing element */}
      </div>

      {/* Main Three-Panel Application Grid Layout */}
      <div className="grid grid-cols-12 gap-3 items-stretch min-h-[580px]">
        
        {/* PANEL 1: SIDEBAR (Columns 1-3) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col justify-between border border-white/[0.04] bg-[#050608] p-4 rounded-2xl gap-4">
          <div className="flex flex-col gap-4">
            
            {/* Workspace details header */}
            <div className="flex flex-col gap-1 border-b border-white/[0.03] pb-3">
              <span className="text-[10px] font-bold text-white flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-gray-500" /> desktop_v0.2
              </span>
              <span className="text-[8px] text-gray-550 flex items-center gap-1">
                <GitBranch className="w-3 h-3 text-gray-700" /> git:branch: main
              </span>
            </div>

            {/* Active Session Threads List */}
            <div className="flex flex-col gap-2">
              <span className="text-[8.5px] font-bold text-gray-500 uppercase tracking-widest pl-1">Session Threads</span>
              
              <div className="flex flex-col gap-1.5">
                {mockSessions.map((session) => {
                  const isSelected = session.id === selectedSessionId;
                  return (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSessionId(session.id)}
                      className={`w-full p-2.5 border rounded-xl text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                        isSelected 
                          ? "border-white/15 bg-white/5 text-white" 
                          : "border-white/[0.02] bg-transparent text-gray-500 hover:text-gray-400"
                      }`}
                    >
                      <span className="text-[9.5px] font-bold truncate">{session.title}</span>
                      <span className="text-[7.5px] truncate text-gray-555 leading-none">{session.subtitle}</span>
                      <div className="flex justify-between items-center mt-2 border-t border-white/[0.02] pt-1.5 text-[7px] font-bold">
                        <span className={`px-1.5 py-0.5 rounded-full ${
                          session.status === "active" 
                            ? "bg-amber-500/10 text-amber-400" 
                            : session.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-white/5 text-gray-500"
                        }`}>
                          {session.status.toUpperCase()}
                        </span>
                        <span className="text-[7px] text-gray-600 font-mono">ID: {session.id}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Sidebar Footer: Agent Status & Latency */}
          <div className="flex flex-col gap-2.5 border-t border-white/[0.03] pt-3 text-[8.5px]">
            <div className="flex justify-between items-center">
              <span className="text-gray-550">Agent Core State</span>
              <span className="text-white font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Listening
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-550">IPC Gateway Latency</span>
              <span className="text-gray-400">5ms (Online)</span>
            </div>

            <button className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-all text-[8px] uppercase tracking-wider font-bold mt-1.5">
              <Settings className="w-3.5 h-3.5" /> Workspace Configs
            </button>
          </div>
        </div>

        {/* PANEL 2: CHAT WORKSPACE (Columns 4-9) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col border border-white/[0.04] bg-[#050608] p-4 rounded-2xl gap-3">
          
          {/* Active Session Info Header */}
          <div className="flex justify-between items-center border-b border-white/[0.03] pb-2 px-1">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider truncate max-w-[280px]">
                {activeSession.title}
              </span>
              <span className="text-[7.5px] text-gray-550 font-mono">
                Active thread executing tools inside workspace
              </span>
            </div>

            <span className="text-[8px] bg-white/5 border border-white/5 px-2 py-0.5 rounded-full text-gray-400 font-bold uppercase shrink-0">
              Session 01
            </span>
          </div>

          {/* Scrollable Chat Feed area */}
          <div 
            className="flex-1 overflow-y-auto scrollbar-thin flex flex-col gap-5 pr-1 max-h-[360px] min-h-[300px] select-text"
          >
            {messages.map((msg) => {
              switch (msg.type) {
                case "user":
                  return (
                    <div key={msg.id} className="flex gap-2 max-w-[80%] self-end flex-row-reverse animate-[fadeIn_0.2s_ease-out]">
                      <div className="w-5.5 h-5.5 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0 text-white font-bold text-[8.5px]">
                        <User className="w-3 h-3" />
                      </div>
                      <div className="p-3 bg-white/5 border border-white/5 text-white font-mono text-[10.5px] rounded-2xl rounded-tr-none text-left leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  );

                case "agent-thought":
                  return (
                    <div key={msg.id} className="flex gap-2 max-w-[85%] self-start animate-[fadeIn_0.2s_ease-out]">
                      <div className="w-5.5 h-5.5 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-gray-400">
                        <Cpu className="w-3 h-3" />
                      </div>
                      <div className="flex flex-col gap-2 p-3 bg-[#0d0e12] border border-white/[0.04] rounded-2xl text-left w-full max-w-[340px]">
                        <div className="flex justify-between items-center border-b border-white/[0.04] pb-1 text-[8px] font-mono text-gray-500">
                          <span className="flex items-center gap-0.5"><Cpu className="w-2.5 h-2.5 animate-spin" /> Agent Thinking</span>
                          <span>Active scan</span>
                        </div>
                        <p className="text-[9.5px] font-mono text-gray-450 leading-relaxed">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  );

                case "agent-planner":
                  return (
                    <div key={msg.id} className="flex gap-2 max-w-[85%] self-start animate-[fadeIn_0.2s_ease-out]">
                      <div className="w-5.5 h-5.5 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0 opacity-0" />
                      <div className="w-full max-w-[340px]">
                        <AgentTaskPlanner tasks={msg.tasks || []} />
                      </div>
                    </div>
                  );

                case "tool-diff":
                  const isDone = messages.some(m => m.type === "system-success");
                  return (
                    <div key={msg.id} className="flex flex-col gap-3 animate-[fadeIn_0.2s_ease-out]">
                      <div className="flex gap-2 max-w-[85%] self-start">
                        <div className="w-5.5 h-5.5 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-gray-400">
                          <Cpu className="w-3 h-3" />
                        </div>
                        <div className="w-full max-w-[360px]">
                          <InteractiveToolCall 
                            toolName="write_to_file"
                            argumentsText="TargetFile: 'src/App.tsx'"
                            durationMs={1200}
                            status={isDone ? "success" : "running"}
                            outputLogs={msg.toolLogs || []}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 max-w-[85%] self-start">
                        <div className="w-5.5 h-5.5 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0 opacity-0" />
                        <div className="w-full max-w-[360px]">
                          <DiffCodeReview 
                            fileName="App.tsx"
                            filePath="src/App.tsx"
                            linesAdded={2}
                            linesRemoved={1}
                            diffLines={msg.diffLines || []}
                            hasReviewed={isDone}
                            reviewState={isDone ? "approved" : null}
                            onApprove={handleApprove}
                          />
                        </div>
                      </div>
                    </div>
                  );

                case "system-success":
                  return (
                    <div key={msg.id} className="flex items-center gap-1.5 self-center bg-white/5 border border-white/5 px-2.5 py-1 rounded-full font-mono text-[8px] text-gray-450 animate-[fadeIn_0.2s_ease-out]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 animate-pulse" />
                      COMPILER VERIFIED: PACKAGE COMPILED CLEANLY
                    </div>
                  );

                case "session-metrics":
                  return (
                    <div key={msg.id} className="flex gap-2 max-w-[85%] self-start animate-[fadeIn_0.2s_ease-out]">
                      <div className="w-5.5 h-5.5 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-gray-400">
                        <Cpu className="w-3 h-3" />
                      </div>
                      <div className="w-full max-w-[340px]">
                        <SessionSummaryMetrics 
                          inputTokens={52700}
                          outputTokens={14000}
                          costUsd={0.2015}
                          elapsedTimeMs={224000}
                          toolCallsCount={10}
                          successRate={92}
                        />
                      </div>
                    </div>
                  );

                case "agent-text":
                default:
                  return (
                    <div key={msg.id} className="flex gap-2 max-w-[85%] self-start animate-[fadeIn_0.2s_ease-out]">
                      <div className="w-5.5 h-5.5 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-gray-400">
                        <Cpu className="w-3 h-3" />
                      </div>
                      <div className="p-3 bg-white/[0.01] border border-white/[0.03] text-gray-300 font-mono text-[10px] rounded-2xl rounded-tl-none text-left leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  );
              }
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Quick template pills inside the workspace */}
          {selectedSessionId === "session-1" && messages.length === 1 && (
            <div className="px-1.5 py-1">
              <PromptTemplatePills 
                templates={[
                  { id: "tp-app-1", label: "App.tsx layout fix", action: "Fix responsive layout flex overflow bug in src/App.tsx and run compiler check." },
                  { id: "tp-app-2", label: "Configure SQLite schema", action: "Build sqlite cache connection connection schema database." }
                ]}
                onSelect={(act) => triggerSimulation(act)}
              />
            </div>
          )}

          {/* Bottom Chat Message Input box */}
          <form onSubmit={handleSend} className="flex gap-1.5 items-center bg-[#07080a] border border-white/[0.03] p-1.5 rounded-xl">
            <input 
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder={isWorking ? "Agent is coding..." : "Ask the agent to code or run checks..."}
              disabled={isWorking}
              className="flex-1 bg-transparent border-0 outline-none text-[10.5px] text-gray-250 pl-2 placeholder-gray-650 disabled:opacity-50"
            />
            <GlassButton
              type="submit"
              disabled={isWorking || !userInput.trim()}
              className="px-3 py-1 text-[8.5px] font-bold uppercase tracking-wider flex items-center gap-1 disabled:opacity-40"
            >
              Send <Send className="w-2.5 h-2.5" />
            </GlassButton>
          </form>

        </div>

        {/* PANEL 3: CODE CONTEXT & EDITOR (Columns 10-12) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col border border-white/[0.04] bg-[#050608] p-4 rounded-2xl gap-4">
          
          {/* Section A: Pinned Context Files */}
          <div className="flex flex-col gap-2">
            <span className="text-[8.5px] font-bold text-gray-500 uppercase tracking-widest pl-1">Pinned Context</span>
            
            <div className="flex flex-wrap gap-1">
              {pinnedFiles.length === 0 ? (
                <span className="text-[8px] text-gray-600 font-mono italic pl-1">No files pinned in session.</span>
              ) : (
                pinnedFiles.map((file) => (
                  <div 
                    key={file}
                    className="flex items-center gap-1 px-2 py-1 border border-white/5 bg-[#0b0c10]/80 rounded-lg text-[8.5px] text-gray-450 hover:text-white transition-all font-mono"
                  >
                    <Pin className="w-2.5 h-2.5 text-gray-650 shrink-0" />
                    <span className="truncate max-w-[80px]">{file.split("/").pop()}</span>
                    <button 
                      onClick={() => handleUnpin(file)}
                      className="p-0.5 hover:bg-white/10 rounded text-gray-600 hover:text-white"
                      title="Unpin Context"
                    >
                      <X className="w-2 h-2" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section B: Active Code Editor Preview (Simulating code highlights) */}
          <div className="flex-1 flex flex-col gap-2 min-h-[160px]">
            <span className="text-[8.5px] font-bold text-gray-500 uppercase tracking-widest pl-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-gray-650" /> Active Editor
            </span>
            
            <div className="flex-1 bg-[#07080a] border border-white/[0.04] p-3 rounded-xl font-mono text-[8px] leading-relaxed text-gray-500 flex flex-col gap-1 overflow-hidden select-text">
              <div className="text-gray-650">// file: src/App.tsx</div>
              <div>import React from "react";</div>
              <div>import Sidebar from "./Sidebar";</div>
              <div className="text-gray-600">...</div>
              <div className="bg-white/[0.02] border-y border-white/[0.04] py-0.5 text-gray-300 font-bold">
                {activeCodeLine}
              </div>
              <div>      &lt;ChatContainer /&gt;</div>
              <div>    &lt;/div&gt;</div>
              <div>  );</div>
              <div>{"}"}</div>
            </div>
          </div>

          {/* Section C: Token Cost Limit & Budget Gauge */}
          <div className="flex flex-col gap-2.5 border-t border-white/[0.03] pt-3">
            <div className="flex justify-between items-center text-[8.5px]">
              <span className="text-gray-550 font-bold uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-gray-600" /> Cost Limit
              </span>
              <span className="text-gray-400 font-mono">${tokenCost.toFixed(4)} / $5.00</span>
            </div>

            {/* budget progress bar */}
            <div className="h-1.5 w-full bg-white/5 border border-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-500 ease-out" 
                style={{ width: `${(tokenCost / 5) * 100}%` }}
              />
            </div>

            <div className="flex justify-between text-[7px] text-gray-600 font-mono leading-none">
              <span>ESTIMATED: 52k tokens</span>
              <span>BUDGET SAFE</span>
            </div>
          </div>

        </div>

      </div>

      {/* Narrative Bengali Banner */}
      <div className="border border-white/[0.04] bg-black/35 p-4 rounded-2xl flex flex-col gap-1 text-left font-mono">
        <div className="flex items-center gap-1 text-[8.5px] font-bold text-white uppercase tracking-wider pb-1 border-b border-white/[0.03] mb-1">
          <Info className="w-3.5 h-3.5 text-gray-650" /> ডেক্সটপ অ্যাপ ওয়ার্কস্পেস (Tauri Application UI) বিবরণী
        </div>
        <p className="text-[10px] text-gray-400 leading-relaxed">
          এই সেকশনটি আমাদের ফাইনাল Tauri ডেক্সটপ অ্যাপের মূল ইন্টারফেসকে নির্দেশ করে। বাম পাশের সাইডবারে প্রজেক্টের বিভিন্ন অ্যাক্টিভ সেশন থ্রেড সিলেক্ট করা যায়, মাঝখানে চ্যাট ইন্টারফেসের ভেতরে এজেন্টের লাইভ টার্মিনাল রান এবং কোড রিভিউ ডিফ অ্যাপ্রুভ করা যায় এবং ডান পাশে ফাইল এডিটর প্রিভিউ ও রিয়েল-টাইম কস্ট লিমিট গেজ আপডেট হয়।
        </p>
      </div>

    </div>
  );
};
