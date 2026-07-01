import React from "react";
import { AgentStep } from "../../types/chat.js";

interface AgentWorkflowPanelProps {
  steps: AgentStep[];
}

export const AgentWorkflowPanel = React.memo(({ steps }: AgentWorkflowPanelProps) => {
  const completedCount = steps.filter((s) => s.status === "success").length;
  const percent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;
  const visibleSteps = steps.slice(-5);

  return (
    <div className="my-3 w-full max-w-[720px] select-none rounded-xl border border-white/10 bg-white/[0.025] px-3.5 py-3 font-mono">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" />
          Agent activity
        </div>
        <span className="text-[10px] text-slate-500">{percent}%</span>
      </div>
      <div className="space-y-2">
        {visibleSteps.map((s, idx) => {
          let dotColor = "bg-slate-600";
          let textColor = "text-slate-400";
          let rightText = "";

          if (s.status === "success") {
            dotColor = "bg-emerald-400";
            textColor = "text-slate-400";
            rightText = "done";
          } else if (s.status === "action" || s.status === "thought" || s.status === "reflecting") {
            dotColor = "bg-cyan-300 animate-pulse";
            textColor = "text-slate-200";
            rightText = s.status === "reflecting" ? "reflecting" : "active";
          } else if (s.status === "error") {
            dotColor = "bg-rose-400";
            textColor = "text-rose-300";
            rightText = "error";
          } else if (s.status === "aborted") {
            dotColor = "bg-amber-400";
            textColor = "text-amber-300";
            rightText = "aborted";
          }

          const displayContent = s.actionName
            ? `${s.actionName.replace(/_/g, " ")}${s.content ? ` · ${s.content}` : ""}`
            : s.content || "Thinking...";

          return (
            <div key={idx} className="grid grid-cols-[10px_1fr_auto] items-center gap-2 text-[11px] leading-5">
              <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
              <span className={`truncate ${textColor}`}>{displayContent}</span>
              <span className="text-[10px] text-slate-500">{rightText}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

AgentWorkflowPanel.displayName = "AgentWorkflowPanel";
