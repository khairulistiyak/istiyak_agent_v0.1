import React from "react";
import { Code, Check, X, ShieldAlert } from "lucide-react";
import { GlassButton } from "../../ui/GlassButton.js";

export interface DiffLine {
  type: "normal" | "addition" | "deletion";
  content: string;
}

interface DiffCodeReviewProps {
  fileName: string;
  filePath: string;
  linesAdded: number;
  linesRemoved: number;
  diffLines: DiffLine[];
  onApprove?: () => void;
  onReject?: () => void;
  hasReviewed?: boolean;
  reviewState?: "approved" | "rejected" | null;
}

export const DiffCodeReview: React.FC<DiffCodeReviewProps> = ({
  fileName,
  filePath,
  linesAdded,
  linesRemoved,
  diffLines,
  onApprove,
  onReject,
  hasReviewed = false,
  reviewState = null
}) => {
  return (
    <div className="flex flex-col p-4 border border-white/[0.04] bg-[#0c0d10] rounded-2xl gap-3 text-left w-full relative overflow-hidden">
      {/* Visual top border or tag */}
      <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-gray-405" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Proposed Code Modification ({fileName})</span>
            <span className="text-[8px] text-gray-500 font-mono">{filePath}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[9px]">
          <span className="text-emerald-400 font-bold">+{linesAdded}</span>
          <span className="text-gray-600 font-bold">/</span>
          <span className="text-gray-450 font-bold">-{linesRemoved} lines</span>
        </div>
      </div>

      {/* Diff Block */}
      <div className="relative border border-white/[0.04] bg-[#050608] rounded-xl p-3 font-mono text-[9.5px] leading-normal select-text max-h-[160px] overflow-y-auto scrollbar-thin">
        <pre className="pt-0.5">
          {diffLines.map((line, idx) => {
            const isAdd = line.type === "addition";
            const isDel = line.type === "deletion";
            let bgClass = "text-gray-350";
            let prefix = " ";
            if (isAdd) {
              bgClass = "bg-white/[0.02] text-white font-bold";
              prefix = "+";
            } else if (isDel) {
              bgClass = "opacity-35 text-gray-500 line-through";
              prefix = "-";
            }

            return (
              <div key={idx} className={`flex ${bgClass} hover:bg-white/[0.01]`}>
                <span className="w-6 text-gray-700 text-right select-none pr-2 border-r border-white/5">{idx + 1}</span>
                <span className="w-4 text-center select-none text-gray-650">{prefix}</span>
                <span className="pl-1.5 break-all whitespace-pre-wrap">{line.content}</span>
              </div>
            );
          })}
        </pre>
      </div>

      {/* Approve/Reject actions overlay */}
      <div className="flex justify-between items-center bg-white/[0.01] border border-white/[0.03] p-3 rounded-xl">
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-gray-500">
          <ShieldAlert className="w-3.5 h-3.5 text-gray-600" />
          <span>Review proposed changes before merging</span>
        </div>

        <div className="flex gap-2">
          {hasReviewed ? (
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
              {reviewState === "approved" ? (
                <span className="text-white bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Approved
                </span>
              ) : (
                <span className="text-gray-500 bg-transparent px-2.5 py-1 rounded-lg border border-white/5 flex items-center gap-1">
                  <X className="w-3.5 h-3.5" /> Request Sent
                </span>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={onReject}
                className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-gray-400 hover:text-white border border-white/5 bg-white/5 hover:bg-white/10 rounded-lg transition-all active:scale-95 cursor-pointer"
              >
                Reject Changes
              </button>
              <GlassButton
                onClick={onApprove}
                className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Approve & Merge
              </GlassButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
