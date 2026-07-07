import React from "react";
import { BarChart3 } from "lucide-react";

interface TokenCostBreakdownProps {
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  costUSD: number;
}

export const TokenCostBreakdown: React.FC<TokenCostBreakdownProps> = ({
  inputTokens,
  outputTokens,
  cachedTokens,
  costUSD
}) => {
  const total = inputTokens + outputTokens + cachedTokens;
  const getPercent = (val: number) => (total > 0 ? (val / total) * 100 : 0);

  return (
    <div className="flex flex-col gap-2 p-3 border border-white/[0.04] bg-white/[0.01] rounded-xl w-full max-w-sm text-left">
      <div className="flex items-center justify-between border-b border-white/[0.04] pb-1.5">
        <div className="flex items-center gap-1">
          <BarChart3 className="w-3.5 h-3.5 text-gray-550" />
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Token Distribution</span>
        </div>
        <span className="text-[10px] font-mono font-bold text-sky-400">${costUSD.toFixed(4)}</span>
      </div>
      
      {/* Stacked bar visualization */}
      <div className="h-2 w-full flex rounded-full overflow-hidden bg-white/[0.02] border border-white/[0.04] my-1">
        <div className="bg-sky-500/50 h-full transition-all" style={{ width: `${getPercent(inputTokens)}%` }} title="Input" />
        <div className="bg-emerald-500/50 h-full transition-all" style={{ width: `${getPercent(outputTokens)}%` }} title="Output" />
        <div className="bg-purple-500/35 h-full transition-all" style={{ width: `${getPercent(cachedTokens)}%` }} title="Cached" />
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-[8.5px] mt-1">
        <div className="flex flex-col">
          <span className="text-sky-400 font-bold">Input</span>
          <span className="font-mono text-gray-400">{inputTokens.toLocaleString()}</span>
        </div>
        <div className="flex flex-col border-l border-white/5 pl-2">
          <span className="text-emerald-400 font-bold">Output</span>
          <span className="font-mono text-gray-400">{outputTokens.toLocaleString()}</span>
        </div>
        <div className="flex flex-col border-l border-white/5 pl-2">
          <span className="text-purple-400 font-bold">Cached</span>
          <span className="font-mono text-gray-400">{cachedTokens.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
