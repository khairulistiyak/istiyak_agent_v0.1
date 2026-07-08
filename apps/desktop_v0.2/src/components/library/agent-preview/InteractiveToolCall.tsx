import React from "react";
import { Terminal, Loader2 } from "lucide-react";

interface InteractiveToolCallProps {
  toolName: string;
  argumentsText: string;
  durationMs: number;
  status: "idle" | "running" | "success" | "error" | "pending";
  outputLogs: string[];
}

export const InteractiveToolCall: React.FC<InteractiveToolCallProps> = ({
  toolName,
  argumentsText,
  durationMs,
  status,
  outputLogs
}) => {
  const getBadgeStyle = () => {
    switch (status) {
      case "running":
        return "border-white/20 bg-white/10 text-white animate-pulse";
      case "success":
        return "border-emerald-500/20 bg-emerald-500/[0.02] text-emerald-400";
      case "error":
        return "border-red-500/30 bg-red-500/[0.02] text-red-400";
      case "pending":
      default:
        return "border-white/5 bg-transparent text-gray-500";
    }
  };

  return (
    <div className="flex flex-col p-4 border border-white/[0.04] bg-[#0b0c10] rounded-2xl gap-3 text-left w-full">
      <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-gray-400" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Local Tool Call Execution</span>
            <span className="text-[8px] text-gray-500 font-mono">Running sandboxed background task</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[9px]">
          <span className={`px-2 py-0.5 border rounded-full font-bold ${getBadgeStyle()}`}>
            {status === "running" && <Loader2 className="w-2.5 h-2.5 animate-spin inline mr-1" />}
            {status.toUpperCase()}
          </span>
          <span className="text-gray-650 px-2 py-0.5 border border-white/5 bg-white/[0.01] rounded-full">
            {durationMs}ms
          </span>
        </div>
      </div>

      {/* Tool Call details */}
      <div className="p-3 bg-black/40 border border-white/[0.03] rounded-xl flex flex-col gap-1 font-mono text-[9.5px]">
        <div className="flex gap-2">
          <span className="text-gray-550 w-[80px] shrink-0">Command:</span>
          <span className="text-white font-bold">{toolName}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-gray-550 w-[80px] shrink-0">Arguments:</span>
          <span className="text-gray-300 break-all select-all">{argumentsText}</span>
        </div>
      </div>

      {/* Terminal Output stream */}
      <div className="flex flex-col bg-[#050608] border border-white/[0.04] rounded-xl p-3 font-mono text-[9.5px] leading-relaxed text-gray-400 select-text max-h-[140px] overflow-y-auto scrollbar-thin">
        {outputLogs.length === 0 ? (
          <span className="text-gray-700 italic">No output logs received</span>
        ) : (
          outputLogs.map((log, idx) => (
            <div key={idx} className="hover:bg-white/[0.01] flex gap-2">
              <span className="text-gray-700 w-4 select-none shrink-0 text-right">{idx + 1}</span>
              <span className="text-gray-300 break-all whitespace-pre-wrap">{log}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
