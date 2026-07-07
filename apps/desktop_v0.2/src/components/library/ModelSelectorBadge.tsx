import React from "react";
import { Cpu } from "lucide-react";

interface ModelSelectorBadgeProps {
  modelName: string;
  provider: string;
  status: "active" | "inactive";
  onClick?: () => void;
}

export const ModelSelectorBadge: React.FC<ModelSelectorBadgeProps> = ({
  modelName,
  provider,
  status,
  onClick
}) => {
  const isActive = status === "active";
  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border cursor-pointer transition-all ${
        isActive 
          ? "border-sky-500/20 bg-sky-500/[0.02] text-gray-200" 
          : "border-white/5 bg-transparent text-gray-500 hover:text-gray-400 hover:bg-white/[0.01]"
      }`}
    >
      <Cpu className={`w-3 h-3 ${isActive ? "text-sky-400" : "text-gray-655"}`} />
      <span className="text-[9px] font-mono font-semibold">{modelName}</span>
      <span className="text-[7.5px] font-bold uppercase tracking-wider text-gray-600 bg-white/5 px-1 py-0.2 rounded">
        {provider}
      </span>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-sky-400 animate-pulse" : "bg-gray-700"}`} />
    </div>
  );
};
