import React, { useState } from "react";
import { MessageSquare, ChevronDown, ChevronUp, Cpu } from "lucide-react";

interface ThinkingStep {
  label: string;
  durationMs: number;
  status: "done" | "active" | "pending";
}

interface AgentChatBubbleProps {
  thinkingTimeMs: number;
  thinkingSteps: ThinkingStep[];
  thoughtContentText: string;
  chatMessageText: string;
}

export const AgentChatBubble: React.FC<AgentChatBubbleProps> = ({
  thinkingTimeMs,
  thinkingSteps,
  thoughtContentText,
  chatMessageText
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex flex-col p-4 border border-white/[0.04] bg-black/40 rounded-2xl gap-3.5 text-left w-full">
      {/* Header Info */}
      <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-400" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Agent Response Message</span>
            <span className="text-[8px] text-gray-500 font-mono">Completed dialogue instance</span>
          </div>
        </div>

        <span className="text-[9px] font-mono text-gray-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full">
          Thought duration: {(thinkingTimeMs / 1000).toFixed(1)}s
        </span>
      </div>

      {/* Collapsible Reasoning Block (Gemini/DeepSeek Style) */}
      <div className="flex flex-col border border-white/[0.04] bg-[#090a0f] rounded-xl overflow-hidden">
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex justify-between items-center p-3 cursor-pointer select-none hover:bg-white/[0.01]"
        >
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-gray-550 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-gray-400">
              {isExpanded ? "Collapse logic reasoning path" : "Expand logical thought reasoning"}
            </span>
          </div>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
        </div>

        {isExpanded && (
          <div className="border-t border-white/[0.03] p-3 flex flex-col gap-3 font-mono text-[9px] text-gray-400">
            {/* Step list progression */}
            <div className="flex flex-col gap-1.5 pl-1.5 border-l border-white/10 ml-1">
              {thinkingSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    step.status === "done" 
                      ? "bg-white" 
                      : step.status === "active" 
                        ? "bg-white animate-ping" 
                        : "bg-gray-800"
                  }`} />
                  <span className={step.status === "active" ? "text-white font-bold" : "text-gray-555"}>
                    {step.label}
                  </span>
                  <span className="text-[8px] text-gray-650 ml-auto">{step.durationMs}ms</span>
                </div>
              ))}
            </div>

            {/* Simulated raw thoughts log */}
            <div className="bg-black/35 border border-white/[0.03] p-2.5 rounded-lg text-[9.5px] text-gray-500 leading-normal select-text max-h-[100px] overflow-y-auto scrollbar-thin">
              {thoughtContentText}
            </div>
          </div>
        )}
      </div>

      {/* Main chat markdown response message bubble */}
      <div className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl text-left select-text leading-relaxed">
        <p className="text-[11.5px] font-mono text-gray-200 whitespace-pre-wrap">
          {chatMessageText}
        </p>
      </div>
    </div>
  );
};
