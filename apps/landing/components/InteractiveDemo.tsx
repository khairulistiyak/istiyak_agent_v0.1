"use client";

import { useState, useEffect } from "react";
import { 
  Code, 
  Terminal, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  CornerDownLeft, 
  FileCode, 
  RefreshCw, 
  Bot, 
  Lock 
} from "lucide-react";

interface Step {
  id: number;
  agentStatus: string;
  agentLog: string[];
  editorHighlightLine: number | null;
  highlightType: "delete" | "insert" | null;
  codeLines: string[];
}

export default function InteractiveDemo() {
  const [stepIndex, setStepIndex] = useState(0);
  const [typedPrompt, setTypedPrompt] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const fullPrompt = "Require at least one special character in password validation regex";

  const codeTemplate = (regex: string) => [
    `import crypto from "crypto";`,
    `import { User } from "@istiyak/database";`,
    ``,
    `export async function validateUserPassword(password: string): Promise<boolean> {`,
    `  // Check minimum length`,
    `  if (password.length < 8) {`,
    `    return false;`,
    `  }`,
    ``,
    `  // Password complexity check`,
    `  const passwordRegex = ${regex};`,
    `  return passwordRegex.test(password);`,
    `}`
  ];

  const steps: Step[] = [
    {
      id: 0,
      agentStatus: "Idle",
      agentLog: ["Ready to assist. Enter a coding task to begin."],
      editorHighlightLine: null,
      highlightType: null,
      codeLines: codeTemplate(`/^[a-zA-Z0-9]{8,}$/`)
    },
    {
      id: 1,
      agentStatus: "Planning",
      agentLog: [
        "🔍 Task received: Require a special character...",
        "📂 Scanning codebase directories...",
        "📍 Found target: apps/saas-backend/src/services/authService.ts"
      ],
      editorHighlightLine: 11,
      highlightType: "delete",
      codeLines: codeTemplate(`/^[a-zA-Z0-9]{8,}$/`)
    },
    {
      id: 2,
      agentStatus: "Testing (Sandbox)",
      agentLog: [
        "🐳 Spawning isolated Docker sandbox...",
        "🧪 Running tests: vitest run authService.test.ts",
        "❌ Test Failure: Password missing special character should fail (expected: false, got: true)"
      ],
      editorHighlightLine: 11,
      highlightType: "delete",
      codeLines: codeTemplate(`/^[a-zA-Z0-9]{8,}$/`)
    },
    {
      id: 3,
      agentStatus: "Modifying Code",
      agentLog: [
        "📝 Correcting regular expression logic...",
        "⚡ Replacing line 11 content in authService.ts"
      ],
      editorHighlightLine: 11,
      highlightType: "insert",
      codeLines: codeTemplate(`/^(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/`)
    },
    {
      id: 4,
      agentStatus: "Testing (Sandbox)",
      agentLog: [
        "🧪 Re-running verification tests in sandbox...",
        "✓ vitest run authService.test.ts",
        "✓ Pass: Password missing special character fails",
        "✓ Pass: Standard password validation passes"
      ],
      editorHighlightLine: 11,
      highlightType: "insert",
      codeLines: codeTemplate(`/^(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/`)
    },
    {
      id: 5,
      agentStatus: "Task Completed",
      agentLog: [
        "✓ All tests passed successfully (2/2 specs).",
        "💾 Saved changes locally.",
        "🎉 Agent successfully completed code correction & committed changes."
      ],
      editorHighlightLine: null,
      highlightType: null,
      codeLines: codeTemplate(`/^(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/`)
    }
  ];

  // Prompt typing animation effect
  useEffect(() => {
    if (stepIndex === 0) {
      setTypedPrompt("");
      setIsTyping(true);
      let i = 0;
      const interval = setInterval(() => {
        setTypedPrompt((prev) => prev + fullPrompt.charAt(i));
        i++;
        if (i >= fullPrompt.length) {
          clearInterval(interval);
          setIsTyping(false);
          // Auto advance to next step after typing finishes
          setTimeout(() => {
            setStepIndex(1);
          }, 1500);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [stepIndex]);

  // Cycle through remaining steps automatically
  useEffect(() => {
    if (stepIndex > 0 && stepIndex < steps.length - 1) {
      const timer = setTimeout(() => {
        setStepIndex((prev) => prev + 1);
      }, stepIndex === 2 ? 4000 : 3000); // give testing screen slightly more time
      return () => clearTimeout(timer);
    } else if (stepIndex === steps.length - 1) {
      // Loop back to start after a delay at the end
      const timer = setTimeout(() => {
        setStepIndex(0);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [stepIndex]);

  const currentStep = steps[stepIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch max-w-5xl mx-auto">
      {/* 💻 Mock Editor (VS Code style) */}
      <div className="lg:col-span-3 flex flex-col rounded-xl border border-white/5 bg-[#0a0b10] shadow-[0_15px_30px_rgba(0,0,0,0.6)] overflow-hidden min-h-[360px]">
        {/* Tab / Title bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#0e0f16] border-b border-white/5 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            <div className="flex items-center gap-1.5 ml-4 px-3 py-1 bg-[#0a0b10] border-t border-x border-white/5 rounded-t-lg text-[10px] font-mono text-gray-300">
              <FileCode size={11} className="text-[#06b6d4]" />
              authService.ts
            </div>
          </div>
          <span className="text-[10px] text-gray-500 font-mono">TypeScript</span>
        </div>

        {/* Code Content */}
        <div className="p-4 font-mono text-xs overflow-y-auto flex-1 leading-relaxed text-gray-400 select-text">
          {currentStep.codeLines.map((line, idx) => {
            const lineNum = idx + 1;
            const isHighlighted = currentStep.editorHighlightLine === lineNum;
            const highlightClass = isHighlighted
              ? currentStep.highlightType === "delete"
                ? "bg-red-500/10 border-l-2 border-red-500 text-red-200"
                : "bg-emerald-500/10 border-l-2 border-emerald-500 text-emerald-200"
              : "";

            return (
              <div 
                key={idx} 
                className={`flex gap-4 px-2 py-0.5 rounded transition-all duration-300 ${highlightClass}`}
              >
                <span className="w-6 text-right select-none text-gray-600 font-mono text-[10px] leading-relaxed pt-[2px]">
                  {lineNum}
                </span>
                <span className="whitespace-pre">
                  {/* Basic Syntax Highlighting rules */}
                  {line.split(" ").map((word, wIdx) => {
                    if (word === "import" || word === "export" || word === "async" || word === "function" || word === "return" || word === "const" || word === "let") {
                      return <span key={wIdx} className="text-purple-400">{word} </span>;
                    }
                    if (word.startsWith("validate") || word.includes("test")) {
                      return <span key={wIdx} className="text-[#06b6d4]">{word} </span>;
                    }
                    if (word.startsWith("/") && (word.endsWith("/") || word.endsWith("/;"))) {
                      return <span key={wIdx} className="text-amber-500">{word} </span>;
                    }
                    if (word.startsWith("//")) {
                      return <span key={wIdx} className="text-gray-500">{word} </span>;
                    }
                    return <span key={wIdx}>{word} </span>;
                  })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🧠 Mock Floating Agent Panel (Glassmorphic Tauri client representation) */}
      <div className="lg:col-span-2 flex flex-col rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Agent Header */}
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/20 flex items-center justify-center">
              <Bot size={13} className="text-[#06b6d4]" />
            </div>
            <span className="text-[10px] font-bold tracking-wider text-white font-mono uppercase">
              Istiyak Companion
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${
              currentStep.agentStatus === "Idle" 
                ? "bg-gray-500" 
                : currentStep.agentStatus === "Task Completed" 
                  ? "bg-emerald-400" 
                  : "bg-[#06b6d4] animate-pulse"
            }`} />
            <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider select-none">
              {currentStep.agentStatus}
            </span>
          </div>
        </div>

        {/* Logs Output (Terminal style view) */}
        <div className="p-4 flex-1 font-mono text-[10px] leading-relaxed text-gray-300 space-y-2 overflow-y-auto select-text min-h-[220px]">
          {/* Historical Logs rendering */}
          {currentStep.agentLog.map((logLine, idx) => {
            let textColor = "text-gray-400";
            if (logLine.startsWith("✓")) textColor = "text-emerald-400";
            else if (logLine.startsWith("❌")) textColor = "text-red-400";
            else if (logLine.startsWith("🔍") || logLine.startsWith("⚡")) textColor = "text-[#06b6d4]";
            else if (logLine.startsWith("🐳") || logLine.startsWith("🧪")) textColor = "text-purple-400";
            else if (logLine.startsWith("🎉")) textColor = "text-amber-400 font-bold";

            return (
              <div key={idx} className={`${textColor} transition-all duration-300`}>
                {logLine}
              </div>
            );
          })}

          {/* Running Spinner indicator */}
          {currentStep.agentStatus !== "Idle" && currentStep.agentStatus !== "Task Completed" && (
            <div className="flex items-center gap-2 text-gray-500 mt-2 select-none">
              <RefreshCw size={10} className="animate-spin" />
              <span>Agent is executing...</span>
            </div>
          )}
        </div>

        {/* User Input Mocking */}
        <div className="p-3 border-t border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/5 rounded-full">
            <input 
              type="text"
              readOnly
              value={stepIndex === 0 ? typedPrompt : fullPrompt}
              placeholder="Ask agent to write, refactor or run code..."
              className="bg-transparent border-none text-[10px] text-white flex-1 focus:outline-none placeholder-gray-600"
            />
            <button className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
              stepIndex === 0 && !isTyping 
                ? "bg-[#06b6d4] text-black" 
                : "bg-white/5 text-gray-500"
            }`}>
              <CornerDownLeft size={10} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
