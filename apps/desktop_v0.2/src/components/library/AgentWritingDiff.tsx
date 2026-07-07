import React from "react";
import { Edit3 } from "lucide-react";

interface AgentWritingDiffProps {
  filePath: string;
  diffSummary: string;
  progress: number;
  additions?: number;
  deletions?: number;
}

export const AgentWritingDiff: React.FC<AgentWritingDiffProps> = ({
  filePath,
  diffSummary,
  progress,
  additions,
  deletions
}) => {
  return (
    <div className="flex flex-col gap-1.5 p-3 border border-white/[0.04] bg-white/[0.01] rounded-lg w-full max-w-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <Edit3 className="w-3.5 h-3.5 text-gray-550 flex-shrink-0" />
          <span className="text-[10px] font-mono text-gray-400 truncate">{filePath.split("/").pop()}</span>
          {(additions !== undefined || deletions !== undefined) && (
            <div className="flex items-center gap-1 font-mono text-[8px] flex-shrink-0">
              {additions !== undefined && <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1 rounded">+{additions}</span>}
              {deletions !== undefined && <span className="text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-1 rounded">-{deletions}</span>}
            </div>
          )}
        </div>
        <span className="text-[9px] text-sky-400 font-mono">{progress}%</span>
      </div>
      <div className="w-full bg-white/[0.02] border border-white/[0.04] h-1 rounded-full overflow-hidden">
        <div className="bg-sky-500/70 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <span className="text-[8px] text-gray-500 truncate font-mono">{diffSummary}</span>
    </div>
  );
};
