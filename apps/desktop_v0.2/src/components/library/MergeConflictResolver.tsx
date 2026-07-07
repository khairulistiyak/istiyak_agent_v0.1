import React from "react";
import { GitMerge } from "lucide-react";

interface MergeConflictResolverProps {
  filePath: string;
  conflictCount: number;
  currentCode: string;
  incomingCode: string;
  onResolve: (resolution: "mine" | "theirs" | "merge") => void;
}

export const MergeConflictResolver: React.FC<MergeConflictResolverProps> = ({
  filePath,
  conflictCount,
  currentCode,
  incomingCode,
  onResolve
}) => {
  return (
    <div className="flex flex-col border border-red-500/20 bg-[#0b090a] rounded-xl overflow-hidden w-full max-w-sm text-left">
      <div className="flex items-center justify-between px-3 py-2 bg-red-500/[0.02] border-b border-red-500/10">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <GitMerge className="w-3.5 h-3.5 text-red-400" />
          <span className="text-[10px] font-mono text-gray-300 truncate">{filePath.split("/").pop()}</span>
        </div>
        <span className="text-[7.5px] font-bold uppercase text-red-400 bg-red-500/10 border border-red-500/20 px-1 rounded animate-pulse">
          {conflictCount} Conflicts
        </span>
      </div>
      <div className="flex flex-col font-mono text-[8.5px] leading-normal border-b border-white/[0.03]">
        {/* Local Change block */}
        <div className="bg-red-500/[0.03] p-2 border-b border-red-500/5">
          <div className="text-[7px] font-bold text-red-400 uppercase mb-1">{"<<<<<<< Current Changes (Your Code)"}</div>
          <div className="text-gray-400 pl-2 whitespace-pre">{currentCode}</div>
        </div>
        {/* Separator */}
        <div className="bg-white/5 h-px" />
        {/* Incoming change block */}
        <div className="bg-emerald-500/[0.03] p-2">
          <div className="text-[7px] font-bold text-emerald-400 uppercase mb-1">{"======= Incoming Changes (Agent Draft)"}</div>
          <div className="text-gray-400 pl-2 whitespace-pre">{incomingCode}</div>
          <div className="text-[7px] font-bold text-emerald-400 uppercase mt-1">{">>>>>>> Incoming Changes"}</div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-1.5 p-2 bg-white/[0.005]">
        <button
          onClick={() => onResolve("mine")}
          className="px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-gray-400 hover:text-red-400 hover:bg-red-500/5 border border-white/5 rounded-lg transition-all cursor-pointer"
        >
          Use Mine
        </button>
        <button
          onClick={() => onResolve("theirs")}
          className="px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/5 border border-white/5 rounded-lg transition-all cursor-pointer"
        >
          Use Agent Draft
        </button>
        <button
          onClick={() => onResolve("merge")}
          className="px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-black bg-white hover:bg-gray-100 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
        >
          Manual Merge
        </button>
      </div>
    </div>
  );
};
