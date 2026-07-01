import React from "react";
import { PermissionRequest } from "../../types/chat.js";

interface PermissionCardProps {
  request: PermissionRequest;
  state: "pending" | "approved" | "rejected" | "timed_out";
  onApprove: () => void;
  onReject: () => void;
}

export const PermissionCard = React.memo(({
  request,
  state,
  onApprove,
  onReject
}: PermissionCardProps) => {
  return (
    <div className="border border-amber-500/35 bg-amber-500/5 rounded-xl p-3.5 space-y-3 text-xs select-none my-2.5 max-w-[90%]">
      <div className="font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
        <span>⚠️ Execution Permission Required</span>
      </div>
      <p className="text-cyber-textSecondary text-[11.5px] leading-relaxed">
        এজেন্ট আপনার লোকাল ওয়ার্কস্পেসে নিচের কমান্ডটি রান করার অনুমতি চাচ্ছে:
      </p>
      <code className="block bg-[#0b0c0e] p-2 rounded text-white font-mono border border-[#1c1e24] text-[10.5px] break-all whitespace-pre-wrap">
        {request.command}
      </code>

      {request.reason && (
        <p className="text-amber-300/80 text-[10.5px] leading-relaxed font-semibold">
          ⚠ কারণ: {request.reason}
        </p>
      )}
      
      {state === "pending" ? (
        <div className="flex space-x-2">
          <button
            onClick={onApprove}
            className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-cyber-dark font-bold rounded-lg transition-colors cursor-pointer text-[11px]"
          >
            Approve (রান করো)
          </button>
          <button
            onClick={onReject}
            className="flex-1 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-bold rounded-lg transition-colors cursor-pointer text-[11px]"
          >
            Block (রান করিও না)
          </button>
        </div>
      ) : (
        <div className={`text-center py-1 font-semibold rounded text-[11px] ${
          state === "approved" ? "bg-emerald-500/10 text-emerald-400" : state === "timed_out" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"
        }`}>
          {state === "approved" ? "✓ APPROVED & EXECUTED" : state === "timed_out" ? "⏱ REQUEST TIMED OUT" : "✗ BLOCKED BY USER"}
        </div>
      )}
    </div>
  );
});

PermissionCard.displayName = "PermissionCard";
