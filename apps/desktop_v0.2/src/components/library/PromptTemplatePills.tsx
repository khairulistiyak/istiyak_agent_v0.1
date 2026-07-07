import React from "react";
import { Terminal } from "lucide-react";

interface PromptTemplatePillsProps {
  templates: { id: string; label: string; action: string }[];
  onSelect: (action: string) => void;
}

export const PromptTemplatePills: React.FC<PromptTemplatePillsProps> = ({
  templates,
  onSelect
}) => {
  return (
    <div className="flex flex-col gap-2 w-full max-w-sm text-left">
      <span className="text-[8.5px] text-gray-500 font-bold uppercase tracking-wider">Quick Action Shortcuts</span>
      <div className="flex flex-wrap gap-1.5">
        {templates.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => onSelect(tpl.action)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/5 bg-[#0d0e12]/60 hover:bg-[#121318] hover:border-white/10 text-gray-400 hover:text-gray-250 text-[9px] font-medium transition-all cursor-pointer active:scale-95 shadow-sm"
          >
            <Terminal className="w-2.5 h-2.5 text-gray-550 flex-shrink-0" />
            {tpl.label}
          </button>
        ))}
      </div>
    </div>
  );
};
