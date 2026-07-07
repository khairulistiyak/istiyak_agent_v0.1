import React from "react";
import { Users } from "lucide-react";

interface SubagentDelegationCardProps {
  subagentId: string;
  taskName: string;
  status: "idle" | "running" | "completed" | "failed";
  progressReport?: string;
}

export const SubagentDelegationCard: React.FC<SubagentDelegationCardProps> = ({
  subagentId,
  taskName,
  status,
  progressReport
}) => {
  const statusColors = {
    idle: "text-gray-500 bg-white/5",
    running: "text-sky-400 bg-sky-500/10 animate-pulse",
    completed: "text-emerald-400 bg-emerald-500/10",
    failed: "text-red-400 bg-red-500/10"
  };

  return (
    <div className="flex flex-col gap-2 p-3 border border-white/[0.04] bg-white/[0.01] rounded-xl w-full max-w-sm text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-gray-550" />
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Subagent Delegation</span>
        </div>
        <span className="text-[8.5px] font-mono text-gray-650">ID: #{subagentId}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-gray-300 truncate">{taskName}</span>
        {progressReport && <p className="text-[8.5px] text-gray-500 leading-normal">{progressReport}</p>}
      </div>
      <div className="flex items-center justify-between border-t border-white/[0.03] pt-2 mt-1">
        <span className="text-[8px] text-gray-655 font-bold uppercase">Pipeline State</span>
        <span className={`text-[7.5px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${statusColors[status]}`}>
          {status}
        </span>
      </div>
    </div>
  );
};
