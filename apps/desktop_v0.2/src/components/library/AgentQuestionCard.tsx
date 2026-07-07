import React from "react";
import { HelpCircle } from "lucide-react";

interface AgentQuestionCardProps {
  question: string;
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
  onSubmit: () => void;
}

export const AgentQuestionCard: React.FC<AgentQuestionCardProps> = ({
  question,
  options,
  selectedOption,
  onSelect,
  onSubmit
}) => {
  return (
    <div className="flex flex-col gap-3.5 p-4 border border-white/[0.04] bg-white/[0.01] rounded-xl w-full max-w-sm text-left">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-sky-400" />
        <span className="text-[9.5px] font-bold text-gray-350 uppercase tracking-wider">Clarification Required</span>
      </div>
      <p className="text-[10.5px] font-semibold text-gray-300 leading-normal">{question}</p>
      <div className="flex flex-col gap-2">
        {options.map((opt, idx) => {
          const isSelected = opt === selectedOption;
          return (
            <div 
              key={idx}
              onClick={() => onSelect(opt)}
              className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-colors ${
                isSelected 
                  ? "border-sky-500/20 bg-sky-500/[0.02] text-gray-200" 
                  : "border-white/5 bg-black/10 text-gray-550 hover:text-gray-400"
              }`}
            >
              <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                isSelected ? "border-sky-400 bg-sky-400" : "border-gray-600"
              }`}>
                {isSelected && <div className="w-1 h-1 rounded-full bg-black" />}
              </div>
              <span className="text-[9.5px] font-medium">{opt}</span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end pt-2 border-t border-white/[0.03]">
        <button onClick={onSubmit} className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-black bg-white hover:bg-gray-200 rounded font-sans transition-all cursor-pointer">
          Confirm choice
        </button>
      </div>
    </div>
  );
};
