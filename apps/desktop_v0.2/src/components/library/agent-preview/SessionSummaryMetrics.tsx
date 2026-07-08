import React from "react";
import { Activity, CreditCard, Clock, CheckCircle } from "lucide-react";

interface SessionSummaryMetricsProps {
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  elapsedTimeMs: number;
  toolCallsCount: number;
  successRate: number;
}

export const SessionSummaryMetrics: React.FC<SessionSummaryMetricsProps> = ({
  inputTokens,
  outputTokens,
  costUsd,
  elapsedTimeMs,
  toolCallsCount,
  successRate
}) => {
  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="flex flex-col p-4 border border-white/[0.04] bg-black/40 rounded-2xl gap-3 text-left w-full">
      <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-400" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Session Resource Diagnostics</span>
            <span className="text-[8px] text-gray-500 font-mono">Real-time cost & usage analysis</span>
          </div>
        </div>
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-2 gap-2 mt-1">
        {/* Token Card */}
        <div className="p-3 border border-white/[0.03] bg-[#090a0f] rounded-xl flex flex-col gap-1.5 font-mono text-[9px]">
          <span className="text-gray-550 uppercase tracking-widest text-[8px] font-bold flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-gray-600" /> Token consumption
          </span>
          <div className="flex justify-between items-baseline mt-1 text-white">
            <span className="text-[14px] font-bold">{(inputTokens + outputTokens).toLocaleString()}</span>
            <span className="text-[8.5px] text-gray-500 font-normal">tokens</span>
          </div>
          <div className="flex flex-col gap-0.5 mt-1.5 text-gray-500 text-[8.5px]">
            <div className="flex justify-between">
              <span>Input (Read):</span>
              <span className="text-gray-400">{inputTokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Output (Write):</span>
              <span className="text-gray-400">{outputTokens.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Cost Card */}
        <div className="p-3 border border-white/[0.03] bg-[#090a0f] rounded-xl flex flex-col gap-1.5 font-mono text-[9px]">
          <span className="text-gray-550 uppercase tracking-widest text-[8px] font-bold flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-gray-600" /> Accumulated cost
          </span>
          <div className="flex justify-between items-baseline mt-1 text-white">
            <span className="text-[14px] font-bold">${costUsd.toFixed(4)}</span>
            <span className="text-[8.5px] text-gray-500 font-normal">USD</span>
          </div>
          {/* Small usage visual gauge */}
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-2 relative">
            <div 
              className="bg-white h-full" 
              style={{ width: `${Math.min(100, (costUsd / 0.5) * 100)}%` }} // $0.5 limit reference
            />
          </div>
          <span className="text-[8px] text-gray-600 mt-1 flex justify-between">
            <span>Budget limit:</span>
            <span>$0.50 max</span>
          </span>
        </div>

        {/* Elapsed Time Card */}
        <div className="p-3 border border-white/[0.03] bg-[#090a0f] rounded-xl flex flex-col gap-1 font-mono text-[9px]">
          <span className="text-gray-550 uppercase tracking-widest text-[8px] font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-600" /> Run duration
          </span>
          <span className="text-[13px] font-bold text-white mt-1">{formatTime(elapsedTimeMs)}</span>
          <span className="text-[8px] text-gray-550 mt-1 leading-normal">
            Realtime elapsed run timer logs.
          </span>
        </div>

        {/* Success Rate Card */}
        <div className="p-3 border border-white/[0.03] bg-[#090a0f] rounded-xl flex flex-col gap-1 font-mono text-[9px]">
          <span className="text-gray-550 uppercase tracking-widest text-[8px] font-bold flex items-center gap-1">
            <Activity className="w-3 h-3 text-gray-600" /> Tool Calls Rate
          </span>
          <span className="text-[13px] font-bold text-white mt-1">
            {toolCallsCount} runs <span className="text-[10px] text-gray-400 font-normal">({successRate}%)</span>
          </span>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-2">
            <div className="bg-white h-full" style={{ width: `${successRate}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};
