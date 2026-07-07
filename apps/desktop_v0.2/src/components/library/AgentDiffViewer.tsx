import React from "react";

interface DiffLine {
  type: "addition" | "deletion" | "normal";
  content: string;
}

interface AgentDiffViewerProps {
  filePath: string;
  lines: DiffLine[];
}

export const AgentDiffViewer: React.FC<AgentDiffViewerProps> = ({ filePath, lines }) => {
  const additions = lines.filter(l => l.type === "addition").length;
  const deletions = lines.filter(l => l.type === "deletion").length;

  return (
    <div className="flex flex-col border border-white/[0.04] bg-[#0c0d10] rounded-lg overflow-hidden w-full max-w-sm">
      <div className="px-3 py-1.5 border-b border-white/[0.04] bg-white/[0.01] flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="text-[10px] font-mono text-gray-400 truncate pr-2">{filePath.split("/").pop()}</span>
          {(additions > 0 || deletions > 0) && (
            <div className="flex items-center gap-1 font-mono text-[8px] flex-shrink-0">
              {additions > 0 && <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1 rounded">+{additions}</span>}
              {deletions > 0 && <span className="text-red-400 font-bold bg-red-500/10 border border-red-500/20 px-1 rounded">-{deletions}</span>}
            </div>
          )}
        </div>
        <span className="text-[8px] text-gray-600 font-bold uppercase tracking-wider flex-shrink-0">File Diff</span>
      </div>
      <div className="p-2 font-mono text-[9px] flex flex-col leading-normal h-36 overflow-y-auto select-text scrollbar-thin">
        {lines.map((line, idx) => {
          const bgColor = line.type === "addition" ? "bg-emerald-500/[0.04]" : line.type === "deletion" ? "bg-red-500/[0.04]" : "";
          const prefix = line.type === "addition" ? "+" : line.type === "deletion" ? "-" : " ";
          const prefixColor = line.type === "addition" ? "text-emerald-400" : line.type === "deletion" ? "text-red-400" : "text-gray-600";
          const textColor = line.type === "addition" ? "text-emerald-200/90" : line.type === "deletion" ? "text-red-355 line-through" : "text-gray-400";
          return (
            <div key={idx} className={`flex items-start ${bgColor} py-0.5 px-1 rounded`}>
              <span className={`w-3 select-none font-bold ${prefixColor}`}>{prefix}</span>
              <span className={`flex-1 whitespace-pre-wrap ${textColor}`}>{line.content}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
