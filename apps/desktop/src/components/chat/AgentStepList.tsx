import { AgentStep } from "../../types/chat.js";

export function AgentStepList({ steps }: { steps: AgentStep[] }) {
  return (
    <div className="p-4 bg-white/5 border-t border-white/5 max-h-48 overflow-y-auto space-y-2">
      <p className="text-xs font-semibold text-white/50 mb-2 uppercase">Execution Traces</p>
      {steps.map((s, idx) => (
        <div key={idx} className="flex items-center gap-3 text-[11px] leading-relaxed">
          <span className={`w-1.5 h-1.5 rounded-full ${s.status === "success" ? "bg-emerald-500" : s.status === "error" ? "bg-red-500" : "bg-cyan-400 animate-pulse"}`} />
          <div className="flex-1 flex items-center gap-2">
            <span className="text-white/40 font-semibold">Step {s.step}: </span>
            {s.actionName ? (
              <span className="glass-capsule px-2 py-0.5 rounded-full inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-cyan-300 leading-none h-4.5">
                <span className="h-1 w-1 rounded-full bg-cyan-400" />
                <span>{s.actionName}</span>
              </span>
            ) : (
              <span className="text-slate-400 font-bold text-[9.5px]">Thought</span>
            )}
            <span className="text-white/60 font-mono truncate max-w-[400px]">{s.content}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
