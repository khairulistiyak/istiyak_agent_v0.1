import React from "react";
import { Terminal } from "lucide-react";
import { TerminalLog } from "../../types/chat.js";

interface ExtensionCommand {
  name: string;
  command: string;
}

interface ExtensionItem {
  id: string;
  name: string;
  commands: ExtensionCommand[];
}

interface TerminalPanelProps {
  logs: TerminalLog[];
  terminalInput: string;
  isTerminalRunning: boolean;
  workspacePath: string | null;
  lastCompileError: string | null;
  installedExtensions: ExtensionItem[];
  onTerminalInputChange: (val: string) => void;
  onExecuteCommand: (e: React.FormEvent) => void;
  onClearLogs: () => void;
  onAutoFixError: () => void;
  onShortcutClick: (command: string) => void;
}

export const TerminalPanel = React.memo(({
  logs,
  terminalInput,
  isTerminalRunning,
  workspacePath,
  lastCompileError,
  installedExtensions,
  onTerminalInputChange,
  onExecuteCommand,
  onClearLogs,
  onAutoFixError,
  onShortcutClick
}: TerminalPanelProps) => {
  return (
    <div className="h-[200px] border-t border-cyber-cardBorder flex flex-col overflow-hidden bg-cyber-dark">
      <div className="p-2 border-b border-cyber-cardBorder/40 bg-cyber-dark flex items-center justify-between select-none">
        <span className="font-semibold text-[10px] tracking-wider uppercase text-cyber-textSecondary flex items-center space-x-1.5">
          <Terminal size={12} className="text-cyber-primary" />
          <span>Terminal Outputs</span>
        </span>
        <div className="flex items-center space-x-2">
          {lastCompileError && (
            <button
              onClick={onAutoFixError}
              className="text-[9px] bg-cyan-500/25 border border-cyan-500/45 text-cyan-400 hover:bg-cyan-500/35 hover:border-cyan-300 font-bold px-2 py-0.5 rounded transition-all animate-pulse cursor-pointer"
              title="Diagnose & auto-fix this terminal/compilation error"
            >
              AUTO-FIX ERROR
            </button>
          )}
          <button
            onClick={onClearLogs}
            className="text-[9px] text-cyber-textMuted hover:text-white px-1.5 py-0.5 rounded hover:bg-white/5 transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Extension command shortcuts */}
      {installedExtensions.some(ext => ext.commands.length > 0) && (
        <div className="px-3 py-1.5 bg-cyber-dark/40 border-b border-cyber-cardBorder/30 flex items-center space-x-2 overflow-x-auto select-none shrink-0 scrollbar-none">
          <span className="text-[9px] text-cyber-textSecondary font-bold uppercase tracking-wider shrink-0">Shortcuts:</span>
          {installedExtensions.flatMap(ext => ext.commands.map(cmd => ({ extName: ext.name, ...cmd }))).map((c, idx) => (
            <button
              key={idx}
              onClick={() => onShortcutClick(c.command)}
              className="px-2 py-0.5 bg-cyber-card/60 hover:bg-cyber-primary/20 border border-cyber-cardBorder hover:border-cyber-primary/40 rounded text-[9px] text-cyber-textSecondary hover:text-white transition-all duration-200 truncate cursor-pointer font-mono"
              title={`Command: ${c.command} (${c.extName})`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Terminal Logs List */}
      <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-1.5 select-text">
        {logs.map((log, idx) => {
          let colorClass = "text-white/80";
          if (log.type === "error") colorClass = "text-red-400";
          if (log.type === "success") colorClass = "text-emerald-400 font-semibold";
          if (log.type === "info") colorClass = "text-cyan-400";
          return (
            <div key={idx} className="leading-relaxed break-words whitespace-pre-wrap">
              <span className="text-cyber-textMuted select-none mr-2">[{log.time}]</span>
              <span className={colorClass}>{log.message}</span>
            </div>
          );
        })}
      </div>

      {/* Terminal Command Input Form */}
      <form onSubmit={onExecuteCommand} className="flex border-t border-cyber-cardBorder/50 bg-cyber-dark/40">
        <span className="pl-3 py-2 text-cyber-primary font-mono text-xs select-none">$</span>
        <input
          type="text"
          value={terminalInput}
          onChange={(e) => onTerminalInputChange(e.target.value)}
          placeholder="Execute shell commands in sandbox environment..."
          disabled={isTerminalRunning || !workspacePath}
          className="flex-1 bg-transparent border-0 px-2 py-2 text-xs text-white placeholder-cyber-textMuted focus:outline-none focus:ring-0 font-mono disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isTerminalRunning || !terminalInput.trim() || !workspacePath}
          className="px-3 bg-cyber-primary/10 border-l border-cyber-cardBorder/50 text-cyber-primary hover:bg-cyber-primary/20 text-xs font-semibold font-mono transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          RUN
        </button>
      </form>
    </div>
  );
});

TerminalPanel.displayName = "TerminalPanel";
export { TerminalPanel as TerminalLogView }; // Alias if needed
