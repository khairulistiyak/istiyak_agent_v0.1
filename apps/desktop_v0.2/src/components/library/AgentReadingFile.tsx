import React from "react";
import { FileCode, Check } from "lucide-react";

interface AgentReadingFileProps {
  filePath: string;
  linesRead?: string;
  status: "idle" | "reading" | "completed";
}

export const AgentReadingFile: React.FC<AgentReadingFileProps> = ({
  filePath,
  linesRead = "L1-L150",
  status
}) => {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-1.5 border border-white/[0.04] bg-white/[0.01] rounded-lg w-full max-w-sm">
      <div className="flex items-center gap-2 overflow-hidden">
        <FileCode className="w-3.5 h-3.5 text-gray-550 flex-shrink-0" />
        <span className="text-[10px] font-mono text-gray-400 truncate">{filePath.split("/").pop()}</span>
        <span className="text-[8px] font-mono text-gray-600 bg-white/[0.01] px-1 py-0.2 rounded border border-white/[0.04]">{linesRead}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={`text-[9px] font-semibold uppercase tracking-wider ${
          status === "reading" ? "text-sky-400" : status === "completed" ? "text-emerald-400" : "text-gray-505"
        }`}>
          {status === "reading" ? "Reading..." : status === "completed" ? "Read" : "Queued"}
        </span>
        {status === "reading" && (
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
        )}
        {status === "completed" && (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        )}
      </div>
    </div>
  );
};
