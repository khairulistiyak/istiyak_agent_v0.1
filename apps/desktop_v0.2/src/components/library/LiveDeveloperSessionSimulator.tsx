import React, { useState, useEffect, useRef } from "react";
import { 
  RotateCcw, 
  Cpu, 
  Send, 
  User, 
  Info
} from "lucide-react";
import { GlassButton } from "../ui/GlassButton.js";

// Import all required components for inline chat display
import { ProjectDiagnosticRadarMap } from "./ProjectDiagnosticRadarMap.js";
import { APIHealthMonitor } from "./APIHealthMonitor.js";
import { AgentTaskPlanner, TaskItem } from "./agent-preview/AgentTaskPlanner.js";
import { InteractiveToolCall } from "./agent-preview/InteractiveToolCall.js";
import { DiffCodeReview, DiffLine } from "./agent-preview/DiffCodeReview.js";
import { SessionSummaryMetrics } from "./agent-preview/SessionSummaryMetrics.js";
import { AgentIdentityDashboard } from "./AgentIdentityDashboard.js";
import { PromptTemplatePills } from "./PromptTemplatePills.js";

interface MessageItem {
  id: string;
  type: "system-welcome" | "user" | "system-init" | "agent-plan" | "tool-diff" | "system-success" | "session-metrics" | "agent-response";
  content?: string;
  tasks?: TaskItem[];
  toolLogs?: string[];
  diffLines?: DiffLine[];
}

export const LiveDeveloperSessionSimulator: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "msg-welcome",
      type: "system-welcome",
      content: "Hello! I am your AI coding companion. Type a request or select a shortcut template below to start the live developer session simulation."
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentNarrative, setCurrentNarrative] = useState({
    title: "System Idle",
    subtitle: "সিমুলেশন প্রস্তুত",
    bangla: "ইনপুট বক্সে আপনার কোড এডিট প্রম্পট টাইপ করুন অথবা নিচের টেমপ্লেট বাটনে ক্লিক করুন।",
    english: "Enter your code edit prompt in the input box or click a shortcut template below to begin."
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages array updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Health Services mock data
  const healthServices = [
    { name: "Gemini 3.5 Flash Gateway", latencyMs: 140, status: "online" as const },
    { name: "Tauri Local IPC Bridge", latencyMs: 5, status: "online" as const },
    { name: "SQLite Cache Engine", latencyMs: 8, status: "online" as const }
  ];

  // Helper to start the streaming timeline sequence
  const startSimulation = (promptText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const newMessages: MessageItem[] = [
      ...messages,
      { id: `user-${Date.now()}`, type: "user", content: promptText }
    ];
    setMessages(newMessages);
    setUserInput("");

    // Step 1 Narrative
    setCurrentNarrative({
      title: "1. Initialization",
      subtitle: "১. লগইন ও ব্যাকএন্ড এপিআই হ্যান্ডশেক",
      bangla: "Tauri IPC কানেকশন হ্যান্ডশেক সম্পন্ন হয়েছে। এপিআই ল্যাটেন্সি এবং ডাটাবেস ক্যাশিং ভেরিফাই করার জন্য ডায়াগনস্টিকস ও হেলথ মনিটর ইনলাইন চ্যাটে লোড করা হচ্ছে।",
      english: "Tauri IPC bridge verified. Gateway API latencies and workspace compiler configs are being checked."
    });

    // Step 1: System Boot (800ms)
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: `sys-init-${Date.now()}`, type: "system-init" }
      ]);

      // Step 2 Narrative
      setCurrentNarrative({
        title: "2. Scoping",
        subtitle: "২. ডেভ প্রম্পট ও ফাইল কনটেক্সট ম্যাচিং",
        bangla: "আপনার কমান্ড বা গোল বিশ্লেষণ করা হচ্ছে এবং প্রজেক্টের 'src/App.tsx' ফাইলটি কনটেক্সট সেশনে পিন করা হচ্ছে।",
        english: "Matching files inside path scopes. Pinning file 'src/App.tsx' to the active workspace context."
      });
    }, 1200);

    // Step 2: Agent Planning (2800ms)
    setTimeout(() => {
      const mockTasks: TaskItem[] = [
        { id: "t1", label: "Inspect App.tsx layout overflow constraints", description: "Analyzing viewport flex-wrap classes", status: "running" },
        { id: "t2", label: "Inject safe margins and compile package checking", description: "Modify css styles at line 13", status: "pending" },
        { id: "t3", label: "Run build verification with vite bundler", description: "Ensure zero typescript compile errors", status: "pending" }
      ];

      setMessages(prev => [
        ...prev,
        { id: `agent-plan-${Date.now()}`, type: "agent-plan", tasks: mockTasks }
      ]);

      // Step 3 Narrative
      setCurrentNarrative({
        title: "3. Planning & Rules",
        subtitle: "৩. পরিকল্পনা জেনারেশন ও আচরণবিধি প্রয়োগ",
        bangla: "এজেন্ট আচরণবিধি রুলস (.agents ফাইল) লোড করেছে এবং সম্পন্ন করার জন্য একটি মাইলস্টোন চেকলিস্ট প্রস্তুত করেছে।",
        english: "Agent loads styling guidelines and dispatches step-by-step milestone checklists."
      });
    }, 2800);

    // Step 3: Tool Execution & Diff (4800ms)
    setTimeout(() => {
      const mockLogs = [
        "[08:01:30] Calling tool: write_file('src/App.tsx')",
        "[08:01:31] Line 13 modified: class replacement.",
        "[08:01:32] STAGING: Waiting for developer review approval..."
      ];
      const mockDiffLines: DiffLine[] = [
        { type: "normal", content: "export default function App() {" },
        { type: "deletion", content: "  return <div className=\"w-screen h-screen overflow-hidden\">" },
        { type: "addition", content: "  return <div className=\"w-screen h-screen overflow-hidden flex\">" },
        { type: "normal", content: "    <SidebarContainer />" }
      ];

      setMessages(prev => [
        ...prev,
        { id: `tool-diff-${Date.now()}`, type: "tool-diff", toolLogs: mockLogs, diffLines: mockDiffLines }
      ]);

      // Step 4 Narrative
      setCurrentNarrative({
        title: "4. Code Review Staging",
        subtitle: "৪. ফাইল এডিটিং ও লাইভ টার্মিনাল রান",
        bangla: "এজেন্ট কোড ফাইল এডিট করেছে এবং চ্যাট থ্রেডের ভেতরেই ডিফ রিভিউ প্রদর্শন করছে। সিমুলেশনটি সচল করতে অনুগ্রহ করে 'Approve & Merge' বাটনে ক্লিক করুন।",
        english: "Agent modified App.tsx. Autoplay paused. Please click 'Approve & Merge' directly on the diff card to resume."
      });
    }, 4800);
  };

  // Triggered when user clicks Approve & Merge
  const handleApprove = () => {
    // Step 5 Narrative
    setCurrentNarrative({
      title: "5. Merge Verification",
      subtitle: "৫. ডেভ রিভিউ অনুমোদন ও সফল সমাপ্তি মেট্রিক্স",
      bangla: "কোড রিভিউ পাস হয়েছে এবং মার্জ করা হয়েছে। প্রজেক্ট কম্পাইল চেক পাস হয়েছে এবং সেশনের মোট খরচ ও মেটরিক্স ড্যাশবোর্ডে যোগ করা হয়েছে।",
      english: "Diff approved and committed. Production package compiled cleanly. Session metrics are outputted."
    });

    // Appends build success & summary metrics & final agent message
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: `sys-success-${Date.now()}`, type: "system-success" },
        { id: `session-metrics-${Date.now()}`, type: "session-metrics" },
        {
          id: `agent-resp-${Date.now()}`,
          type: "agent-response",
          content: "I have successfully fixed the responsive layout overflow bug in src/App.tsx. The build has compiled cleanly. Let me know what you would like to work on next!"
        }
      ]);
      setIsProcessing(false);
    }, 800);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing) return;
    startSimulation(userInput.trim());
  };

  const handleReset = () => {
    setMessages([
      {
        id: "msg-welcome",
        type: "system-welcome",
        content: "Hello! I am your AI coding companion. Type a request or select a shortcut template below to start the live developer session simulation."
      }
    ]);
    setIsProcessing(false);
    setCurrentNarrative({
      title: "System Reset",
      subtitle: "সিমুলেশন রিসেট সম্পন্ন",
      bangla: "চ্যাট হিস্টোরি রিসেট করা হয়েছে। শুরু করার জন্য প্রম্পট পাঠান।",
      english: "Simulation reset. Send a new prompt to restart the sequence."
    });
  };

  // Checklist tasks with updated done state for Step 5
  const getTasksForRender = (msgTasks: TaskItem[] | undefined) => {
    if (!msgTasks) return [];
    // If the simulation is complete (processing has ended and success metrics are shown), mark checklist done
    const hasSuccess = messages.some(m => m.type === "system-success");
    if (hasSuccess) {
      return msgTasks.map(t => ({ ...t, status: "done" as const }));
    }
    return msgTasks;
  };

  return (
    <div className="flex flex-col border border-white/[0.05] bg-[#0c0d10] p-5 rounded-3xl w-full max-w-4xl text-left gap-5">
      
      {/* Top Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.04] pb-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-gray-400" />
            <span className="text-[11px] font-bold text-white uppercase tracking-widest">Interactive Chat Box Simulator</span>
          </div>
          <span className="text-[8px] text-gray-500 font-mono">Type custom prompts and review agent actions step-by-step inline</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="p-1.5 border border-white/5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer flex items-center gap-1 font-mono text-[9px]"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Chat
          </button>
        </div>
      </div>

      {/* Main Interactive Chat Box Window */}
      <div 
        ref={chatContainerRef}
        className="border border-white/[0.04] bg-[#050608] rounded-3xl p-5 h-[480px] overflow-y-auto scrollbar-thin flex flex-col gap-6 scroll-smooth select-text"
      >
        {messages.map((msg) => {
          switch (msg.type) {
            case "system-welcome":
              return (
                <div key={msg.id} className="flex gap-3 max-w-[85%] self-start animate-[fadeIn_0.3s_ease-out]">
                  <div className="w-6 h-6 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-gray-400">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3.5 bg-white/[0.01] border border-white/[0.03] text-gray-300 font-mono text-[10.5px] rounded-2xl rounded-tl-none text-left leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              );

            case "user":
              return (
                <div key={msg.id} className="flex gap-3 max-w-[75%] self-end flex-row-reverse animate-[fadeIn_0.3s_ease-out]">
                  <div className="w-6 h-6 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0 text-white font-bold">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3.5 bg-white/5 border border-white/5 text-white font-mono text-[11px] rounded-2xl rounded-tr-none text-left leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              );

            case "system-init":
              return (
                <div key={msg.id} className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out]">
                  <div className="flex items-center gap-2 self-center bg-white/5 border border-white/5 px-3 py-1 rounded-full font-mono text-[8px] text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 animate-pulse" />
                    SYSTEM HANDSHAKE VERIFIED: TAURI ACTIVE
                  </div>
                  <div className="flex gap-3 max-w-[85%] self-start">
                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-gray-400">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col gap-2.5 p-3 bg-white/[0.01] border border-white/[0.03] rounded-2xl text-left w-[360px]">
                      <span className="text-[8.5px] font-mono text-gray-500 uppercase tracking-wider font-bold">API Latencies Status</span>
                      <APIHealthMonitor services={healthServices} />
                    </div>
                  </div>
                  <div className="flex gap-3 max-w-[85%] self-start mt-1">
                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0 opacity-0" />
                    <div className="flex flex-col gap-1 w-full max-w-[420px]">
                      <span className="text-[8.5px] font-mono text-gray-500 uppercase tracking-widest pl-1 mb-1">Compiler Diagnostics Scan</span>
                      <ProjectDiagnosticRadarMap />
                    </div>
                  </div>
                </div>
              );

            case "agent-plan":
              return (
                <div key={msg.id} className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out]">
                  <div className="flex gap-3 max-w-[85%] self-start">
                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-gray-400">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-col gap-2.5 p-3.5 bg-[#0d0e12] border border-white/[0.04] rounded-2xl text-left w-full max-w-[420px]">
                      <div className="flex justify-between items-center border-b border-white/[0.04] pb-1 text-[8.5px] font-mono text-gray-500">
                        <span className="flex items-center gap-1"><Cpu className="w-3 h-3 animate-spin" /> Thinking process</span>
                        <span>1.4s elapsed</span>
                      </div>
                      <p className="text-[10px] font-mono text-gray-450 leading-relaxed">
                        I am scoping behavioral guidelines rules (.agents) to resolve style requirements and generate layout check milestones.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 max-w-[85%] self-start mt-1">
                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0 opacity-0" />
                    <div className="flex flex-col gap-3 w-full max-w-[420px]">
                      <AgentIdentityDashboard />
                      <AgentTaskPlanner tasks={getTasksForRender(msg.tasks)} />
                    </div>
                  </div>
                </div>
              );

            case "tool-diff":
              const hasSuccess = messages.some(m => m.type === "system-success");
              return (
                <div key={msg.id} className="flex flex-col gap-4 animate-[fadeIn_0.3s_ease-out]">
                  <div className="flex gap-3 max-w-[85%] self-start">
                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-gray-400">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                    <div className="w-full max-w-[440px]">
                      <InteractiveToolCall 
                        toolName="write_to_file"
                        argumentsText="TargetFile: 'src/App.tsx', Overwrite: true"
                        durationMs={1200}
                        status={hasSuccess ? "success" : "running"}
                        outputLogs={msg.toolLogs || []}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 max-w-[85%] self-start mt-1">
                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0 opacity-0" />
                    <div className="w-full max-w-[440px]">
                      <DiffCodeReview 
                        fileName="App.tsx"
                        filePath="src/App.tsx"
                        linesAdded={2}
                        linesRemoved={1}
                        diffLines={msg.diffLines || []}
                        hasReviewed={hasSuccess}
                        reviewState={hasSuccess ? "approved" : null}
                        onApprove={handleApprove}
                      />
                    </div>
                  </div>
                </div>
              );

            case "system-success":
              return (
                <div key={msg.id} className="flex items-center gap-2 self-center bg-white/5 border border-white/5 px-3 py-1 rounded-full font-mono text-[8px] text-gray-400 animate-[fadeIn_0.3s_ease-out]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-450 animate-pulse" />
                  VITE BUNDLE SUCCESS: COMPILED CLEANLY IN 1.48S
                </div>
              );

            case "session-metrics":
              return (
                <div key={msg.id} className="flex gap-3 max-w-[85%] self-start animate-[fadeIn_0.3s_ease-out]">
                  <div className="w-6 h-6 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-gray-400">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-full max-w-[420px]">
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

            case "agent-response":
              return (
                <div key={msg.id} className="flex gap-3 max-w-[85%] self-start animate-[fadeIn_0.3s_ease-out]">
                  <div className="w-6 h-6 rounded-full bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-gray-400">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-3.5 bg-white/[0.01] border border-white/[0.03] text-gray-300 font-mono text-[10.5px] rounded-2xl rounded-tl-none text-left leading-relaxed max-w-[420px]">
                    {msg.content}
                  </div>
                </div>
              );
            default:
              return null;
          }
        })}
      </div>

      {/* Bangla Narrative Summary Banner */}
      <div className="border border-white/[0.04] bg-black/35 p-4.5 rounded-2xl flex flex-col gap-2.5 text-left font-mono">
        <div className="flex justify-between items-center border-b border-white/[0.04] pb-1.5 text-[9px] font-bold text-white uppercase tracking-wider">
          <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-gray-600" /> {currentNarrative.title} - {currentNarrative.subtitle}</span>
        </div>
        <p className="text-[11px] text-gray-300 leading-relaxed font-mono select-text font-bold">
          {currentNarrative.bangla}
        </p>
        <p className="text-[9.5px] text-gray-550 leading-relaxed border-t border-white/[0.02] pt-2 select-text">
          <span className="text-gray-450 font-bold uppercase mr-1">English:</span> {currentNarrative.english}
        </p>
      </div>

      {/* Quick templates shortcut pills */}
      <div className="flex flex-col gap-1.5 p-1">
        <PromptTemplatePills 
          templates={[
            { id: "tpl-1", label: "App.tsx layout bug fix", action: "Fix responsive layout flex overflow bug in src/App.tsx and run compiler check." },
            { id: "tpl-2", label: "Database rusqlite check", action: "Configure sqlite database storage engine layers and verify schema compilation." },
            { id: "tpl-3", label: "Verification checks", action: "Inspect tauri production bundle configurations and run npm bundle checks." }
          ]}
          onSelect={(action) => {
            if (isProcessing) return;
            startSimulation(action);
          }}
        />
      </div>

      {/* Bottom Interactive Chat Input Bar */}
      <form onSubmit={handleSend} className="flex gap-2 items-center bg-white/[0.01] border border-white/[0.03] p-2.5 rounded-2xl">
        <input 
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={isProcessing ? "Agent is working, please wait..." : "Ask the agent to build, edit or run command..."}
          disabled={isProcessing}
          className="flex-1 bg-transparent border-0 outline-none text-[11px] text-gray-200 pl-3 font-mono placeholder-gray-600 disabled:opacity-50"
        />

        <GlassButton
          type="submit"
          disabled={isProcessing || !userInput.trim()}
          className="px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-40"
        >
          Send <Send className="w-3 h-3" />
        </GlassButton>
      </form>

    </div>
  );
};
