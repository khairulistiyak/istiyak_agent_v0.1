
export function TerminalPanel({ logs }: { logs: string[] }) {
  return (
    <div className="h-48 bg-[#0a0a0f] border-t border-white/5 flex flex-col font-mono text-[10px]">
      <div className="px-4 py-2 bg-black/40 border-b border-white/5 text-white/40 font-semibold select-none flex justify-between">
        <span>Console Terminal Logs</span>
        <span className="text-green-500 animate-pulse">● System Connected</span>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-1 text-white/70 select-text">
        {logs.map((log, idx) => (
          <div key={idx} className="whitespace-pre-wrap leading-tight">
            {log}
          </div>
        ))}
        {logs.length === 0 && <div className="text-white/20">No console logs output.</div>}
      </div>
    </div>
  );
}
