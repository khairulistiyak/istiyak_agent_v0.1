import React from "react";

interface AgentPerformanceStatsProps {
  tokensUsed: number;
  latencySec: number;
  speedTps: number;
}

export const AgentPerformanceStats: React.FC<AgentPerformanceStatsProps> = ({
  tokensUsed,
  latencySec,
  speedTps
}) => {
  return (
    <div className="grid grid-cols-3 gap-2 p-2.5 border border-white/[0.04] bg-white/[0.01] rounded-xl w-full max-w-sm">
      <div className="flex flex-col text-left">
        <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Usage</span>
        <span className="text-[10.5px] font-mono text-gray-350 mt-0.5">{tokensUsed.toLocaleString()} tkn</span>
      </div>
      <div className="flex flex-col text-left border-l border-white/5 pl-2">
        <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Latency</span>
        <span className="text-[10.5px] font-mono text-sky-400/90 mt-0.5">{latencySec.toFixed(2)}s</span>
      </div>
      <div className="flex flex-col text-left border-l border-white/5 pl-2">
        <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Speed</span>
        <span className="text-[10.5px] font-mono text-emerald-400/90 mt-0.5">{speedTps} t/s</span>
      </div>
    </div>
  );
};
