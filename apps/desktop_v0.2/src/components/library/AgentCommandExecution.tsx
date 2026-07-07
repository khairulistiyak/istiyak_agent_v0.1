import React from "react";
import { Terminal } from "lucide-react";

interface AgentCommandExecutionProps {
  command: string;
  output: string[];
  status: "running" | "success" | "failed";
  onStop?: () => void;
}

export const AgentCommandExecution: React.FC<AgentCommandExecutionProps> = ({
  command,
  output,
  status,
  onStop
}) => {
  return (
    <div className="flex flex-col border border-white/[0.04] bg-[#0c0d10] rounded-lg overflow-hidden w-full max-w-sm">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.04] bg-white/[0.01]">
        <div className="flex items-center gap-2 overflow-hidden">
          <Terminal className="w-3.5 h-3.5 text-gray-550 flex-shrink-0" />
          <span className="text-[10px] font-mono text-gray-400 truncate max-w-[200px]">{command}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`w-1.5 h-1.5 rounded-full ${
            status === "running" ? "bg-sky-400 animate-pulse" : status === "success" ? "bg-emerald-400" : "bg-red-400"
          }`} />
          {status === "running" && onStop && (
            <button onClick={onStop} className="text-[8px] font-bold uppercase tracking-wider text-gray-400 hover:text-white px-1 bg-white/5 border border-white/10 rounded cursor-pointer">
              Stop
            </button>
          )}
        </div>
      </div>
      <div className="p-3 font-mono text-[9px] text-gray-450 h-28 overflow-y-auto flex flex-col gap-1 leading-normal select-text scrollbar-thin">
        {output.map((line, idx) => {
          const isErrorLine = line.toLowerCase().includes("error") || line.toLowerCase().includes("fail");
          return (
            <div key={idx} className={`whitespace-pre-wrap ${isErrorLine ? "text-red-400/80" : ""}`}>
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
};
