import React from "react";
import { Timer } from "lucide-react";

interface AgentTimerStatusProps {
  durationSeconds: number;
  prompt: string;
  onCancel: () => void;
}

export const AgentTimerStatus: React.FC<AgentTimerStatusProps> = ({
  durationSeconds,
  prompt,
  onCancel
}) => {
  return (
    <div className="flex items-center justify-between gap-3 p-3 border border-white/[0.04] bg-white/[0.01] rounded-xl w-full max-w-sm text-left">
      <div className="flex items-center gap-2.5 overflow-hidden">
        <Timer className="w-4.5 h-4.5 text-gray-550 flex-shrink-0 animate-pulse" />
        <div className="flex flex-col overflow-hidden">
          <span className="text-[10px] text-gray-400 font-mono font-bold">Timer: {durationSeconds}s remaining</span>
          <span className="text-[8.5px] text-gray-550 truncate max-w-[200px]">Prompt: "{prompt}"</span>
        </div>
      </div>
      <button onClick={onCancel} className="text-[8.5px] font-bold uppercase tracking-wider text-red-400/80 hover:text-red-400 hover:bg-red-500/5 px-2 py-0.5 rounded cursor-pointer border border-red-500/10">
        Cancel
      </button>
    </div>
  );
};
