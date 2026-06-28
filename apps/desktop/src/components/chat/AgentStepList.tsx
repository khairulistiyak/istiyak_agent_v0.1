import { AgentStep } from "../../types/chat.js";

export function AgentStepList({ steps }: { steps: AgentStep[] }) {
  return (
    <div className="p-4 bg-white/5 border-t border-white/5 max-h-48 overflow-y-auto space-y-2">
      <p className="text-xs font-semibold text-white/50 mb-2 uppercase">Execution Traces</p>
      {steps.map((s, idx) => (
        <div key={idx} className="flex items-start gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full mt-1.5 ${s.status === "success" ? "bg-green-500" : s.status === "error" ? "bg-red-500" : "bg-yellow-500 animate-pulse"}`} />
          <div className="flex-1">
            <span className="text-white/80 font-medium">Step {s.step}: </span>
            <span className="text-cyan-400 font-semibold">{s.actionName || "Thought"} </span>
            <span className="text-white/60">{s.content}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
