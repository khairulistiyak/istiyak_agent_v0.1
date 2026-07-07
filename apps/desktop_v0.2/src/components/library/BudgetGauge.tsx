import React from "react";
import { DollarSign } from "lucide-react";

interface BudgetGaugeProps {
  spent: number;
  limit: number;
}

export const BudgetGauge: React.FC<BudgetGaugeProps> = ({ spent, limit }) => {
  const percent = Math.min((spent / limit) * 100, 100);
  const isCloseToLimit = percent >= 80;
  
  return (
    <div className="flex flex-col gap-1.5 p-3 border border-white/[0.04] bg-white/[0.01] rounded-xl w-full max-w-sm text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5 text-gray-550" />
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Estimated Cost</span>
        </div>
        <span className="text-[9.5px] font-mono text-gray-300">
          ${spent.toFixed(3)} / <span className="text-gray-500">${limit.toFixed(2)}</span>
        </span>
      </div>
      <div className="w-full bg-white/[0.02] border border-white/[0.04] h-1 rounded-full overflow-hidden">
        <div className={`h-full transition-all duration-300 ${
          isCloseToLimit ? "bg-amber-400" : "bg-sky-500/70"
        }`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};
