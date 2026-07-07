import React from "react";
import { BarChart3 } from "lucide-react";

interface ChartData {
  label: string;
  value: number; // 0 to 100
  metric: string;
}

interface PerformanceBarChartProps {
  data: ChartData[];
  title: string;
}

export const PerformanceBarChart: React.FC<PerformanceBarChartProps> = ({ data, title }) => {
  return (
    <div className="flex flex-col gap-2.5 p-3 border border-white/[0.04] bg-white/[0.01] rounded-xl w-full max-w-sm text-left">
      <div className="flex items-center justify-between border-b border-white/[0.04] pb-1.5">
        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
          <BarChart3 className="w-3.5 h-3.5 text-gray-550" /> {title}
        </span>
      </div>
      <div className="flex items-end justify-between h-20 pt-2 px-1">
        {data.map((bar, idx) => (
          <div key={idx} className="flex flex-col items-center flex-1 group">
            <div className="w-full max-w-[20px] bg-white/5 border border-white/10 group-hover:border-white/20 group-hover:bg-white/10 rounded transition-all relative flex items-end h-full">
              <div 
                className="w-full bg-sky-500/40 rounded-b transition-all duration-500" 
                style={{ height: `${bar.value}%` }} 
              />
            </div>
            <span className="text-[8px] font-mono text-gray-500 mt-1.5 truncate max-w-[40px]">{bar.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
