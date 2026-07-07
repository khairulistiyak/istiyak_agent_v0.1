import React from "react";
import { Check, X } from "lucide-react";

interface AcceptRejectPillsProps {
  onAccept: () => void;
  onReject: () => void;
  acceptLabel?: string;
  rejectLabel?: string;
  disabled?: boolean;
}

export const AcceptRejectPills: React.FC<AcceptRejectPillsProps> = ({
  onAccept,
  onReject,
  acceptLabel = "Accept",
  rejectLabel = "Reject",
  disabled = false
}) => {
  return (
    <div className="inline-flex items-center gap-1 bg-white/[0.02] border border-white/[0.04] p-0.5 rounded-full backdrop-blur-md">
      <button
        onClick={onReject}
        disabled={disabled}
        className="flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-500 hover:text-red-400 disabled:opacity-30 disabled:pointer-events-none rounded-full transition-all cursor-pointer active:scale-95"
      >
        <X className="w-2.5 h-2.5 text-red-500/70" />
        {rejectLabel}
      </button>
      <button
        onClick={onAccept}
        disabled={disabled}
        className="flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-300 hover:text-emerald-400 bg-white/5 hover:bg-emerald-500/10 disabled:opacity-30 disabled:pointer-events-none border border-white/10 hover:border-emerald-500/20 rounded-full transition-all cursor-pointer active:scale-95 shadow-sm"
      >
        <Check className="w-2.5 h-2.5 text-emerald-400/80" />
        {acceptLabel}
      </button>
    </div>
  );
};
