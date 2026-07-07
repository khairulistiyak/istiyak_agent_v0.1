import React, { useState } from "react";
import { ChevronDown, ChevronRight, AlertTriangle, CheckSquare, Square, FileCode } from "lucide-react";

interface ProposedChange {
  type: "modify" | "new" | "delete";
  fileName: string;
  path: string;
  description?: string;
}

interface PlanQuestion {
  id: string;
  text: string;
  placeholder?: string;
  options?: string[];
}

interface AgentImplementationPlanCardProps {
  planTitle: string;
  description: string;
  risks?: string[];
  proposedChanges: ProposedChange[];
  openQuestions?: (string | PlanQuestion)[];
  onApprove: (answers: Record<string, string>, selectedFiles: string[], customInstructions: string) => void;
  onReject: () => void;
}

export const AgentImplementationPlanCard: React.FC<AgentImplementationPlanCardProps> = ({
  planTitle,
  description,
  risks = [],
  proposedChanges,
  openQuestions = [],
  onApprove,
  onReject
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Set all files initially to true (checked/active in proposal changes list)
  const [fileSelections, setFileSelections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    proposedChanges.forEach((change) => {
      initial[change.path] = true;
    });
    return initial;
  });

  const [customInstructions, setCustomInstructions] = useState("");

  const toggleFileSelection = (path: string) => {
    setFileSelections((prev) => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleSelectOption = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const activeFilesCount = Object.values(fileSelections).filter(Boolean).length;

  return (
    <div className="relative overflow-hidden border border-white/[0.06] bg-[#090a0f]/90 backdrop-blur-xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.8)] rounded-2xl w-full max-w-sm text-left transition-all duration-300">
      {/* Top glowing accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1.2px] bg-gradient-to-r from-sky-500/0 via-sky-400/30 to-sky-500/0" />

      {/* Header */}
      <div 
        onClick={() => setCollapsed(!collapsed)}
        className="px-4 py-3 bg-white/[0.01] hover:bg-white/[0.03] flex items-center justify-between cursor-pointer select-none transition-colors border-b border-white/[0.03]"
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-40"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          <span className="text-[10px] font-bold text-gray-200 uppercase tracking-widest">Proposed Plan</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider bg-white/5 px-1.5 py-0.5 rounded">
            {activeFilesCount}/{proposedChanges.length} Files
          </span>
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 flex flex-col gap-4 max-h-[340px] overflow-y-auto scrollbar-thin select-text">
          {/* Plan Info */}
          <div>
            <h4 className="text-[11px] font-bold text-white mb-0.5 leading-normal">{planTitle}</h4>
            <p className="text-[9.5px] text-gray-500 leading-normal">{description}</p>
          </div>

          {/* Risks / Alert section */}
          {risks.length > 0 && (
            <div className="flex flex-col gap-1.5 p-3 bg-gradient-to-r from-amber-500/[0.03] to-amber-500/[0.01] border border-amber-500/10 rounded-xl">
              <div className="flex items-center gap-1.5 text-amber-405">
                <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                <span className="text-[8.5px] font-bold uppercase tracking-wider">Important Notes</span>
              </div>
              <ul className="list-disc pl-4 flex flex-col gap-1 text-[8.5px] text-gray-500 leading-normal">
                {risks.map((risk, idx) => (
                  <li key={idx}>{risk}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Proposed Changes list with checkboxes & descriptions */}
          <div className="flex flex-col gap-2">
            <span className="text-[8.5px] text-gray-500 font-bold uppercase tracking-wider">Proposed Changes (Toggle to skip)</span>
            <div className="flex flex-col gap-1.5">
              {proposedChanges.map((change, idx) => {
                const badgeStyle = 
                  change.type === "new" 
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
                    : change.type === "delete" 
                    ? "text-red-400 bg-red-500/10 border-red-500/20" 
                    : "text-sky-400 bg-sky-500/10 border-sky-500/20";
                const isSelected = fileSelections[change.path] !== false;
                
                return (
                  <div 
                    key={idx} 
                    onClick={() => toggleFileSelection(change.path)}
                    className={`flex flex-col gap-1 p-2.5 border rounded-xl cursor-pointer transition-all ${
                      isSelected 
                        ? "border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] text-gray-300" 
                        : "border-white/5 bg-transparent opacity-25 text-gray-600 line-through saturate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden flex-1 pr-2">
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-gray-650 flex-shrink-0" />
                        )}
                        <FileCode className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-sky-400/60" : "text-gray-750"}`} />
                        <span className="text-[9px] font-mono truncate font-semibold" title={change.path}>
                          {change.fileName}
                        </span>
                      </div>
                      <span className={`text-[7px] font-bold uppercase tracking-widest px-1.5 py-0.2 rounded border ${badgeStyle}`}>
                        {change.type}
                      </span>
                    </div>
                    {change.description && (
                      <p className="text-[8.5px] text-gray-500 font-sans leading-normal ml-5.5 mt-0.5">
                        {change.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Open Questions with Clickable Pills */}
          {openQuestions.length > 0 && (
            <div className="flex flex-col gap-2.5 border-t border-white/[0.03] pt-3">
              <span className="text-[8.5px] text-gray-550 font-bold uppercase tracking-wider">Required Feedback</span>
              <div className="flex flex-col gap-3">
                {openQuestions.map((q, idx) => {
                  const qId = typeof q === "string" ? `q-${idx}` : q.id;
                  const qText = typeof q === "string" ? q : q.text;
                  const qOptions = typeof q === "string" ? undefined : q.options;
                  const qPlaceholder = typeof q === "string" ? "Type response..." : (q.placeholder || "Type response...");
                  
                  return (
                    <div key={qId} className="flex flex-col gap-1.5">
                      <span className="text-[9.5px] text-gray-300 font-medium leading-normal">{idx + 1}. {qText}</span>
                      
                      {qOptions && qOptions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {qOptions.map((opt) => {
                            const isOptSelected = answers[qId] === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleSelectOption(qId, opt)}
                                className={`px-2.5 py-1 rounded-lg text-[8.5px] font-semibold border transition-all cursor-pointer ${
                                  isOptSelected 
                                    ? "bg-sky-500/10 border-sky-400/30 text-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.12)]" 
                                    : "bg-black/20 border-white/5 text-gray-500 hover:text-gray-300 hover:bg-black/35 hover:border-white/10"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <input 
                          type="text"
                          placeholder={qPlaceholder}
                          value={answers[qId] || ""}
                          onChange={(e) => setAnswers({ ...answers, [qId]: e.target.value })}
                          className="w-full bg-black/50 border border-white/5 focus:border-white/10 rounded-lg px-2.5 py-1 text-[9px] font-mono text-gray-350 outline-none placeholder:text-gray-650 transition-colors focus:bg-black/75"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Global Custom Instructions / Notes */}
          <div className="flex flex-col gap-1.5 border-t border-white/[0.03] pt-3">
            <span className="text-[8.5px] text-gray-550 font-bold uppercase tracking-wider">Additional Custom Instructions</span>
            <textarea 
              placeholder="e.g. Skip old_tests folder, use Tailwind v4, configure Indigo primary..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="w-full bg-black/50 border border-white/5 focus:border-white/10 rounded-lg px-2.5 py-1.5 text-[9px] font-mono text-gray-350 outline-none placeholder:text-gray-655 h-14 resize-none transition-all focus:bg-black/75 scrollbar-thin"
            />
          </div>
        </div>
      )}

      {/* Footer controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/[0.01] border-t border-white/[0.03]">
        <span className="text-[8.5px] text-gray-655 font-bold uppercase tracking-wider">Waiting for review</span>
        <div className="flex items-center gap-2">
          <button 
            onClick={onReject} 
            className="px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-wider text-gray-550 hover:text-red-400 hover:bg-red-500/[0.03] border border-transparent hover:border-red-500/10 rounded-lg cursor-pointer transition-all"
          >
            Request Edit
          </button>
          <button 
            onClick={() => {
              const activeFiles = Object.keys(fileSelections).filter(k => fileSelections[k] !== false);
              onApprove(answers, activeFiles, customInstructions);
            }} 
            className="px-3.5 py-1 text-[8.5px] font-bold uppercase tracking-wider text-black bg-white hover:bg-gray-100 rounded-lg font-sans transition-all cursor-pointer shadow-[0_0_12px_rgba(255,255,255,0.06)] active:scale-95"
          >
            Approve Plan
          </button>
        </div>
      </div>
    </div>
  );
};
