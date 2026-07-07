import React, { useState } from "react";
import { ChevronRight, ChevronDown, Brain, Clock } from "lucide-react";

interface AgentThinkingBlockProps {
  thoughts: string;
  durationSec?: number;
  initialCollapsed?: boolean;
}

export const AgentThinkingBlock: React.FC<AgentThinkingBlockProps> = ({
  thoughts,
  durationSec = 2.4,
  initialCollapsed = true
}) => {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const ToggleIcon = collapsed ? ChevronRight : ChevronDown;

  return (
    <div className="flex flex-col border border-white/[0.04] bg-[#0c0d10] rounded-xl overflow-hidden w-full max-w-sm">
      <div 
        onClick={() => setCollapsed(!collapsed)}
        className="px-3.5 py-2 bg-white/[0.01] hover:bg-white/[0.03] flex items-center justify-between cursor-pointer select-none transition-colors border-b border-white/[0.03]"
      >
        <div className="flex items-center gap-2">
          <Brain className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-gray-300">Agent Thought Process</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <div className="flex items-center gap-1 font-mono text-[8.5px]">
            <Clock className="w-2.5 h-2.5 text-gray-650" />
            <span>{durationSec}s</span>
          </div>
          <ToggleIcon className="w-3.5 h-3.5 text-gray-550" />
        </div>
      </div>
      {!collapsed && (
        <div className="p-3.5 font-mono text-[9.5px] text-gray-400 border-t border-white/[0.03] select-text h-28 overflow-y-auto leading-relaxed border-l-2 border-sky-500/20 pl-4 bg-white/[0.005]">
          {thoughts}
        </div>
      )}
    </div>
  );
};
