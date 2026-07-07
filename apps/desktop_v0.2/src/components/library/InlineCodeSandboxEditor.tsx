import React, { useState } from "react";
import { Check, Edit3, RotateCcw } from "lucide-react";

interface InlineCodeSandboxEditorProps {
  fileName: string;
  initialCode: string;
  onSave: (code: string) => void;
  onReset?: () => void;
}

export const InlineCodeSandboxEditor: React.FC<InlineCodeSandboxEditorProps> = ({
  fileName,
  initialCode,
  onSave,
  onReset
}) => {
  const [code, setCode] = useState(initialCode);

  return (
    <div className="flex flex-col border border-white/[0.05] bg-[#0c0d10] rounded-xl overflow-hidden w-full max-w-sm text-left">
      <div className="flex items-center justify-between px-3 py-2 bg-white/[0.01] border-b border-white/[0.04]">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <Edit3 className="w-3.5 h-3.5 text-gray-550 flex-shrink-0" />
          <span className="text-[10px] font-mono text-gray-350 truncate">{fileName}</span>
        </div>
        <span className="text-[8px] text-gray-600 font-bold uppercase">Sandbox Refiner</span>
      </div>
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full bg-[#08090b] text-gray-300 font-mono text-[9px] p-3.5 h-36 outline-none resize-none border-none leading-relaxed select-text scrollbar-thin focus:bg-[#07080a]"
          spellCheck={false}
        />
      </div>
      <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-white/[0.03] bg-white/[0.005]">
        {onReset && (
          <button
            onClick={() => {
              setCode(initialCode);
              onReset();
            }}
            className="flex items-center gap-1 px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-wider text-gray-555 hover:text-gray-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-2.5 h-2.5" /> Reset
          </button>
        )}
        <button
          onClick={() => onSave(code)}
          className="flex items-center gap-1 px-3 py-1 text-[8.5px] font-bold uppercase tracking-wider text-black bg-white hover:bg-gray-200 rounded transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <Check className="w-2.5 h-2.5" /> Save Changes
        </button>
      </div>
    </div>
  );
};
