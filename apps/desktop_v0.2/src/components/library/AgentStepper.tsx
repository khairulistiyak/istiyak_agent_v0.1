import React from "react";
import { Check } from "lucide-react";

interface Step {
  label: string;
  status: "pending" | "current" | "done";
}

interface AgentStepperProps {
  steps: Step[];
}

export const AgentStepper: React.FC<AgentStepperProps> = ({ steps }) => {
  return (
    <div className="flex flex-col gap-2 w-full max-w-sm">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] font-bold ${
              step.status === "done"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : step.status === "current"
                ? "bg-sky-500 border-sky-500 text-black animate-pulse"
                : "bg-transparent border-white/5 text-gray-600"
            }`}>
              {step.status === "done" ? <Check className="w-2 h-2 text-emerald-400" /> : idx + 1}
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-px h-4 ${step.status === "done" ? "bg-emerald-500/20" : "bg-white/5"}`} />
            )}
          </div>
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${
            step.status === "current" ? "text-sky-400" : step.status === "done" ? "text-gray-400" : "text-gray-600"
          }`}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
};
