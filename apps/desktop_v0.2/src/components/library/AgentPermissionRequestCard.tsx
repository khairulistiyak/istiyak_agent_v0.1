import React from "react";
import { ShieldAlert } from "lucide-react";

interface AgentPermissionRequestCardProps {
  action: string;
  target: string;
  reason: string;
  onGrant: () => void;
  onDeny: () => void;
}

export const AgentPermissionRequestCard: React.FC<AgentPermissionRequestCardProps> = ({
  action,
  target,
  reason,
  onGrant,
  onDeny
}) => {
  return (
    <div className="flex flex-col gap-3 p-4 border border-red-500/10 bg-red-500/[0.01] rounded-xl w-full max-w-sm text-left">
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-red-400" />
        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Permission Gate Required</span>
      </div>
      <p className="text-[9.5px] font-mono text-gray-300 leading-normal">
        The agent is requesting permission to perform <span className="text-white font-bold">{action}</span> on:
        <span className="block mt-1 bg-black/30 border border-white/5 p-1.5 rounded text-[8.5px] break-all">{target}</span>
      </p>
      <div className="text-[9px] text-gray-550 italic">
        Reason: "{reason}"
      </div>
      <div className="flex justify-end gap-2 border-t border-white/[0.03] pt-2">
        <button onClick={onDeny} className="px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-wider text-gray-500 hover:text-gray-300 rounded cursor-pointer">
          Deny Request
        </button>
        <button onClick={onGrant} className="px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-wider text-black bg-white hover:bg-gray-200 rounded cursor-pointer font-sans transition-all">
          Grant Access
        </button>
      </div>
    </div>
  );
};
