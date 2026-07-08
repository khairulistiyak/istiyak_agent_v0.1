import React, { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  UserCheck, 
  Terminal, 
  CheckCircle2, 
  Cpu, 
  Sliders
} from "lucide-react";
import { GlassButton } from "../ui/GlassButton.js";

interface Phase {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  uiState: string;
  logs: string[];
}

const phases: Phase[] = [
  {
    id: 1,
    title: "Login & Handshake",
    subtitle: "সেশন কানেকশন ও হ্যান্ডশেক",
    description: "ইউজার ডেক্সটপ অ্যাপে লগইন করার পর ব্যাকএন্ড Tauri IPC-এর সাথে হ্যান্ডশেক সম্পন্ন হয়। সিস্টেম লোকাল SQLite ডেটাবেস বুট করে এবং কোডবেস ইন্ডেক্স সিঙ্ক করে এজেন্টকে 'Calm' স্টেটে নিয়ে আসে।",
    uiState: "login",
    logs: [
      "[08:00:01] Desktop Client v0.2.0 initialized.",
      "[08:00:02] Establishing Tauri IPC bridge handshake...",
      "[08:00:03] IPC Connection Status: OK (Verified channel).",
      "[08:00:04] Booting SQLite Cache Database tables...",
      "[08:00:05] Codebase Indexing completed: 84 components parsed.",
      "[08:00:06] SYSTEM STATE: ONLINE - Agent Antigravity Calm & Ready."
    ]
  },
  {
    id: 2,
    title: "Command Dispatch",
    subtitle: "ইউজার প্রম্পট ও ট্রিগার",
    description: "ইউজার ইনপুট কন্টেইনারে তার কাঙ্ক্ষিত গোল বা কাজের কমান্ড লিখে এজেন্টের কাছে সেন্ড করেন। যেমন: 'App.tsx-এ মার্জ কনফ্লিক্ট ঠিক করো এবং বিল্ড চেক রান দাও'।",
    uiState: "prompt",
    logs: [
      "[08:01:10] User input detected: 'Fix layout bug in App.tsx and recheck build'",
      "[08:01:11] Parsing query tokens & scoping context target...",
      "[08:01:12] Context matching: Pinned file 'src/App.tsx' to session workspace.",
      "[08:01:13] Request packets generated (48.2k tokens active).",
      "[08:01:14] Dispatching payload to Gemini 3.5 Flash Model Gateway..."
    ]
  },
  {
    id: 3,
    title: "Analysis & Planning",
    subtitle: "এজেন্ট অ্যানালাইসিস ও পরিকল্পনা",
    description: "এজেন্ট ব্যাকএন্ড থেকে আসা প্রম্পট বিশ্লেষণ করে। লোকাল .agents গাইডলাইন কনফিগারেশন রিড করে একটি ধাপে ধাপে এক্সিকিউশন প্ল্যান তৈরি করে এবং টাস্ক চেকলিস্ট জেনারেট করে।",
    uiState: "planning",
    logs: [
      "[08:01:20] Payload response received. Initiating planning thread.",
      "[08:01:21] Reading behavioral rules in '.agents' workspace metadata...",
      "[08:01:22] Enforcing directive: Maintain absolute monochrome minimal layout.",
      "[08:01:23] Generating checklist layout (4 milestones matched).",
      "[08:01:24] Milestone 1: Inspect App.tsx layout constraints.",
      "[08:01:25] Milestone 2: Inject safe padding, compile checkout."
    ]
  },
  {
    id: 4,
    title: "Active Execution & Diff",
    subtitle: "টার্মিনাল রান ও কোড পরিবর্তন",
    description: "এজেন্ট স্বয়ংক্রিয়ভাবে ripgrep দিয়ে সার্চ করে, ফাইল ওপেন করে দেখে (AgentReadingFile) এবং কোডের জায়গায় ডিফারেন্স (+/-) রাইট করে। একইসাথে লোকাল টার্মিনালে বিল্ড ভেরিফাই করে।",
    uiState: "execution",
    logs: [
      "[08:01:30] Calling tool: read_file('src/App.tsx')",
      "[08:01:31] File loaded: 43 lines parsed.",
      "[08:01:32] Cosine similarity check matches: layout overflow bug at line 13.",
      "[08:01:33] Generating proposed code diff (-1 line, +2 lines).",
      "[08:01:34] Calling tool: run_command('npm run build')",
      "[08:01:36] Compilation STAGE: Waiting for developer code-review approval..."
    ]
  },
  {
    id: 5,
    title: "Validation & Success",
    subtitle: "ইউজার ফিডব্যাক ও সফল সমাপ্তি",
    description: "ইউজার ইন্টারফেসে কোড রিভিউ প্যানেলে পরিবর্তনগুলো দেখে 'Approve' বাটনে ক্লিক করেন। এজেন্ট ফাইল সেভ করে, ফাইনাল কম্পাইলেশন টেস্ট পাস হয় এবং সেশন সফলভাবে সম্পন্ন হয়।",
    uiState: "success",
    logs: [
      "[08:02:01] User review feedback captured: APPROVED.",
      "[08:02:02] Committing diff to disk: src/App.tsx written cleanly.",
      "[08:02:04] Re-running verification test: 'npm run build'",
      "[08:02:06] Target build compiled successfully (1.56s).",
      "[08:02:07] All checklist tasks ticked. Agent session closed.",
      "[08:02:08] SYSTEM STATE: IDLE - Ready for next workspace goal."
    ]
  }
];

export const AgentLifecycleSimulator: React.FC = () => {
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplaySpeed, setAutoplaySpeed] = useState(5000); // 5s interval

  const activePhase = phases[currentPhaseIdx];

  // Autoplay Logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentPhaseIdx((prev) => (prev + 1) % phases.length);
      }, autoplaySpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, autoplaySpeed]);

  const handleNext = () => {
    setCurrentPhaseIdx((prev) => (prev + 1) % phases.length);
  };

  const handlePrev = () => {
    setCurrentPhaseIdx((prev) => (prev - 1 + phases.length) % phases.length);
  };

  // UI mockup graphics generator based on current phase
  const renderInteractiveGraphic = () => {
    switch (activePhase.uiState) {
      case "login":
        return (
          <div className="flex flex-col items-center justify-center p-6 bg-black/40 border border-white/[0.04] rounded-2xl h-[220px] text-center gap-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.002)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.002)_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />
            
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/[0.02] animate-pulse">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex flex-col gap-1 z-10">
              <span className="text-[11px] font-mono text-white font-bold uppercase tracking-wider">Tauri IPC Handshake Active</span>
              <span className="text-[8.5px] text-gray-500 font-mono">SQLite caching tables populated</span>
            </div>
            
            {/* Visual handshake connection line animation */}
            <div className="flex items-center gap-3 mt-1.5 w-full justify-center px-6">
              <span className="text-[8px] font-mono text-gray-650">Client App</span>
              <div className="flex-1 bg-white/5 h-[1px] relative">
                <div className="absolute bg-white w-2 h-[1px] top-0 left-0 animate-[ping_2s_linear_infinite]" />
                <div className="absolute bg-white/30 w-1.5 h-[1px] top-0 left-[50%] animate-[pulse_1s_linear_infinite]" />
              </div>
              <span className="text-[8px] font-mono text-gray-650">Rust Kernel</span>
            </div>
          </div>
        );
      case "prompt":
        return (
          <div className="flex flex-col p-4 bg-black/40 border border-white/[0.04] rounded-2xl h-[220px] justify-between relative overflow-hidden text-left font-mono">
            <div className="flex justify-between items-center border-b border-white/[0.03] pb-1.5">
              <span className="text-[8px] text-gray-500 uppercase tracking-widest">User Request Box</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </div>

            {/* Typing text effect mockup */}
            <div className="flex-1 py-3 flex flex-col gap-1.5">
              <span className="text-[8.5px] text-gray-600">INPUT CONTEXT: App.tsx</span>
              <div className="p-2 border border-white/5 bg-[#050608] rounded-lg min-h-[70px] text-[10px] text-gray-300">
                Fix layout overflow bug in <span className="text-white font-bold">App.tsx</span>, verify padding and recheck build.
                <span className="w-1 h-3.5 bg-white inline-block animate-pulse ml-0.5" />
              </div>
            </div>

            <div className="flex justify-between items-center bg-white/[0.01] border border-white/[0.03] p-2 rounded-lg">
              <span className="text-[8px] text-gray-650">48,200 tokens package</span>
              <button disabled className="px-2 py-0.5 border border-white/10 bg-white/5 text-white/50 text-[8.5px] uppercase tracking-wider rounded">
                Dispatching...
              </button>
            </div>
          </div>
        );
      case "planning":
        return (
          <div className="flex flex-col p-4 bg-black/40 border border-white/[0.04] rounded-2xl h-[220px] justify-between relative overflow-hidden text-left font-mono">
            <div className="flex justify-between items-center border-b border-white/[0.03] pb-1.5">
              <span className="text-[8px] text-gray-500 uppercase tracking-widest flex items-center gap-1"><Cpu className="w-3 h-3 text-gray-500" /> Plan Architect</span>
              <span className="text-[8.5px] text-gray-400">Zen Mode active</span>
            </div>

            {/* Stepper Planning graphic */}
            <div className="flex-1 py-3 flex flex-col gap-2">
              <div className="flex items-center gap-2 px-2 py-1.5 border border-white/5 bg-white/[0.01] rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span className="text-[9.5px] text-gray-450 line-through">1. Read workspace configs</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 border border-white/10 bg-white/[0.02] rounded-lg animate-pulse">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span className="text-[9.5px] text-white font-bold">2. Analyze App.tsx layout error</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 border border-white/[0.02] bg-transparent opacity-30 rounded-lg">
                <span className="w-3.5 h-3.5 rounded-full border border-gray-600" />
                <span className="text-[9.5px] text-gray-500">3. Apply padding diff</span>
              </div>
            </div>
          </div>
        );
      case "execution":
        return (
          <div className="flex flex-col p-4 bg-black/40 border border-white/[0.04] rounded-2xl h-[220px] justify-between relative overflow-hidden text-left font-mono">
            <div className="flex justify-between items-center border-b border-white/[0.03] pb-1.5">
              <span className="text-[8px] text-gray-500 uppercase tracking-widest flex items-center gap-1"><Terminal className="w-3 h-3 text-gray-500" /> Staging diff compiler</span>
              <span className="text-[8.5px] text-gray-400 font-bold">Pending Approve</span>
            </div>

            {/* Diff review mockup */}
            <div className="flex-1 py-2 flex flex-col gap-1.5">
              <span className="text-[8.5px] text-gray-600">src/App.tsx diff:</span>
              <div className="border border-white/[0.04] bg-[#050608] p-2 rounded-lg text-[9px] flex flex-col gap-0.5 overflow-hidden">
                <div className="opacity-40 text-gray-500 line-through">- className="w-screen h-screen overflow-hidden"</div>
                <div className="text-white font-bold bg-white/[0.02]">+ className="w-screen h-screen overflow-hidden flex"</div>
                <div className="text-white font-bold bg-white/[0.02]">+   {/* Fixed layout flex overflow constraints */}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button disabled className="flex-1 py-1 border border-white/5 bg-transparent text-[8.5px] uppercase tracking-wider rounded text-gray-600">
                Reject
              </button>
              <button disabled className="flex-1 py-1 border border-white/10 bg-white/5 text-[8.5px] uppercase tracking-wider rounded text-white font-bold animate-bounce">
                Approve & Merge
              </button>
            </div>
          </div>
        );
      case "success":
        return (
          <div className="flex flex-col items-center justify-center p-6 bg-black/40 border border-white/[0.04] rounded-2xl h-[220px] text-center gap-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/[0.003] pointer-events-none" />
            
            <div className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center bg-white/[0.01]">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-mono text-white font-bold uppercase tracking-wider">Verification Successful</span>
              <span className="text-[8.5px] text-gray-550 font-mono">Build compiled in 1.56s (0 errors)</span>
            </div>

            <div className="mt-1 px-3 py-1 border border-white/5 bg-white/[0.01] rounded-full text-[8px] font-mono text-gray-400">
              Total session cost: $0.1830 USD
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col border border-white/[0.05] bg-[#0c0d10] p-5 rounded-3xl w-full max-w-4xl text-left gap-5">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.04] pb-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-gray-450" />
            <span className="text-[11px] font-bold text-white uppercase tracking-widest">Agent Session Lifecycle Simulator</span>
          </div>
          <span className="text-[8px] text-gray-500 font-mono">Animated storyboard of user-agent operational flow</span>
        </div>

        {/* Speed presets */}
        <div className="flex items-center gap-1.5 font-mono text-[9px]">
          <span className="text-gray-600">Autoplay interval:</span>
          {[3000, 5000, 8000].map(speed => (
            <button
              key={speed}
              onClick={() => setAutoplaySpeed(speed)}
              className={`px-1.5 py-0.5 border rounded ${
                autoplaySpeed === speed 
                  ? "border-white/10 bg-white/5 text-white" 
                  : "border-white/5 bg-transparent text-gray-600 hover:text-gray-400"
              }`}
            >
              {speed / 1000}s
            </button>
          ))}
        </div>
      </div>

      {/* Storyboard Progression Timeline (Stage Steps) */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-3 bg-white/[0.01] border border-white/[0.03] p-3 rounded-2xl font-mono text-center">
        {phases.map((phase, idx) => {
          const isActive = idx === currentPhaseIdx;
          const isDone = idx < currentPhaseIdx;
          
          let stateClass = "border-white/[0.02] text-gray-600";
          if (isActive) {
            stateClass = "border-white/15 bg-white/5 text-white font-bold";
          } else if (isDone) {
            stateClass = "border-white/5 text-gray-400 opacity-60";
          }

          return (
            <button
              key={phase.id}
              onClick={() => {
                setCurrentPhaseIdx(idx);
                setIsPlaying(false); // Stop autoplay on manual jump
              }}
              className={`p-2 border rounded-xl flex flex-col items-center gap-1 transition-all ${stateClass}`}
            >
              <span className="text-[9px] font-bold">0{phase.id}</span>
              <span className="text-[8px] hidden sm:inline truncate max-w-full leading-none">{phase.title}</span>
            </button>
          );
        })}
      </div>

      {/* Simulator Core Panel: Left Graphic & Right Information */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Left Graphics Panel (5 Columns) */}
        <div className="md:col-span-5 flex flex-col justify-center">
          {renderInteractiveGraphic()}
        </div>

        {/* Right Info and Console Panel (7 Columns) */}
        <div className="md:col-span-7 flex flex-col gap-4">
          
          {/* Phase Details Text */}
          <div className="flex flex-col gap-2 p-4 border border-white/[0.04] bg-black/20 rounded-2xl min-h-[140px] text-left justify-center">
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">{activePhase.title}</span>
            <h3 className="text-[12px] font-bold text-white leading-tight font-mono">{activePhase.subtitle}</h3>
            <p className="text-[10.5px] text-gray-400 leading-relaxed font-mono select-text">
              {activePhase.description}
            </p>
          </div>

          {/* Running Subprocess console logs */}
          <div className="flex flex-col p-3.5 border border-white/[0.04] bg-[#050608] rounded-2xl gap-2 h-[140px] text-left">
            <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest border-b border-white/[0.03] pb-1.5 flex items-center gap-1.5">
              <Terminal className="w-3 h-3 text-gray-600" /> Active Stage Console Logs
            </span>
            <div className="flex-1 flex flex-col font-mono text-[9px] text-gray-400 overflow-y-auto scrollbar-thin select-text gap-1 leading-normal">
              {activePhase.logs.map((log, idx) => (
                <div key={idx} className="flex gap-2 hover:bg-white/[0.01]">
                  <span className="text-gray-700 w-3 shrink-0 text-right select-none">{idx + 1}</span>
                  <span className="text-gray-300 break-all">{log}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Simulator Playback Actions Bar */}
      <div className="flex justify-between items-center bg-white/[0.01] border border-white/[0.03] p-3 rounded-2xl">
        
        {/* Play/Pause indicators */}
        <div className="flex items-center gap-1.5 text-[8.5px] font-mono text-gray-500">
          <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-white animate-ping' : 'bg-gray-700'}`} />
          <span>{isPlaying ? `Autoplaying storyboard (${autoplaySpeed / 1000}s)` : "Simulation paused"}</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 border border-white/5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer"
            title="Previous Stage"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <GlassButton
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3.5 py-1 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3 h-3" /> Pause Simulator
              </>
            ) : (
              <>
                <Play className="w-3 h-3" /> Play Simulator
              </>
            )}
          </GlassButton>

          <button
            onClick={handleNext}
            className="p-1.5 border border-white/5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer"
            title="Next Stage"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
