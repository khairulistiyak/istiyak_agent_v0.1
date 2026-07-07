import React from "react";
import { Wrench } from "lucide-react";

interface AgentToolBadgeProps {
  toolName: string;
  status: "calling" | "completed" | "denied";
}

export const AgentToolBadge: React.FC<AgentToolBadgeProps> = ({ toolName, status }) => {
  const statusStyles = {
    calling: "text-sky-400 bg-sky-500/10",
    completed: "text-emerald-400 bg-emerald-500/10",
    denied: "text-red-400 bg-red-500/10"
  };

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/[0.04] bg-white/[0.01]">
      <Wrench className="w-3 h-3 text-gray-550" />
      <span className="text-[9px] font-mono text-gray-400">{toolName}</span>
      <span className={`text-[7px] font-bold uppercase tracking-widest px-1 py-0.2 rounded ${statusStyles[status]}`}>
        {status}
      </span>
    </div>
  );
};
