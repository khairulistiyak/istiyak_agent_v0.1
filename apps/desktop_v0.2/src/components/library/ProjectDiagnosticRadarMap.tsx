import React, { useState } from "react";
import { Wrench, Layers, GitMerge, Database, Cpu, Activity, X, Terminal, ShieldAlert } from "lucide-react";

interface DiagnosticNode {
  id: string;
  name: string;
  category: "ui" | "ipc" | "db" | "api";
  status: "healthy" | "error" | "scanning" | "idle";
  errorMessage?: string;
}

export const ProjectDiagnosticRadarMap: React.FC = () => {
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "healthy" | "error">("error");
  const [activeScanIdx, setActiveScanIdx] = useState<number>(-1);
  const [logMessages, setLogMessages] = useState<string[]>([
    "[10:02:15] Initiating workspace diagnostics scan...",
    "[10:02:17] UI Layer check: 0 errors detected.",
    "[10:02:18] CRITICAL ERROR: Tauri Bridge IPC channel refused connection. Check tsc & main.rs compile states."
  ]);

  const [nodes, setNodes] = useState<DiagnosticNode[]>([
    { id: "node-ui", name: "UI Frontend", category: "ui", status: "healthy" },
    { id: "node-ipc", name: "Tauri Bridge", category: "ipc", status: "error", errorMessage: "IPC connection refused at invoke('write_file')" },
    { id: "node-db", name: "SQLite Cache", category: "db", status: "idle" },
    { id: "node-api", name: "AI Model Gateway", category: "api", status: "idle" }
  ]);

  // Handle running a full diagnostic scan simulation
  const handleStartScan = () => {
    setScanStatus("scanning");
    setLogMessages(["[SCAN] Commencing visual codebase diagnostic check..."]);
    setActiveScanIdx(0);
    
    // Simulate node checks one by one
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < 4) {
        setNodes(prev => prev.map((n, idx) => 
          idx === currentIdx ? { ...n, status: "scanning" } : n
        ));
        setLogMessages(prev => [...prev, `[SCAN] Checking layer ${currentIdx + 1}/4...`]);
        setActiveScanIdx(currentIdx);
        currentIdx++;
      } else {
        clearInterval(interval);
        // Complete scan with healthy state (simulate fix/normal state)
        setScanStatus("healthy");
        setActiveScanIdx(-1);
        setNodes([
          { id: "node-ui", name: "UI Frontend", category: "ui", status: "healthy" },
          { id: "node-ipc", name: "Tauri Bridge", category: "ipc", status: "healthy" },
          { id: "node-db", name: "SQLite Cache", category: "db", status: "healthy" },
          { id: "node-api", name: "AI Model Gateway", category: "api", status: "healthy" }
        ]);
        setLogMessages([
          "[SCAN] Core diagnostic check completed successfully.",
          "✓ All 4 codebase architecture layers verified active.",
          "✓ index.css postCSS bindings resolved.",
          "🟢 SYSTEM STATE: HEALTHY"
        ]);
      }
    }, 1200);
  };

  const handleInjectError = () => {
    setScanStatus("error");
    setActiveScanIdx(-1);
    setNodes([
      { id: "node-ui", name: "UI Frontend", category: "ui", status: "healthy" },
      { id: "node-ipc", name: "Tauri Bridge", category: "ipc", status: "error", errorMessage: "IPC connection refused at invoke('write_file')" },
      { id: "node-db", name: "SQLite Cache", category: "db", status: "idle" },
      { id: "node-api", name: "AI Model Gateway", category: "api", status: "idle" }
    ]);
    setLogMessages([
      "[10:02:15] Initiating workspace diagnostics scan...",
      "[10:02:17] UI Check: OK",
      "[10:02:18] ERROR: Tauri Bridge IPC connection timeout at line 42."
    ]);
  };

  const getCatIcon = (cat: string) => {
    switch (cat) {
      case "ui": return <Layers className="w-4 h-4" />;
      case "ipc": return <GitMerge className="w-4 h-4" />;
      case "db": return <Database className="w-4 h-4" />;
      case "api": return <Cpu className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col border border-white/[0.05] bg-[#0c0d10] p-4 rounded-2xl w-full max-w-4xl text-left gap-4">
      {/* Header section with status diagnostics */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.04] pb-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-sky-400" />
            <span className="text-[11px] font-bold text-white uppercase tracking-widest">Animated Diagnostic radar Map</span>
          </div>
          <span className="text-[8px] text-gray-550 font-mono">Real-time compilation & dependency debugger</span>
        </div>

        <div className="flex items-center gap-2">
          {scanStatus === "error" && (
            <button
              onClick={handleStartScan}
              className="px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-wider text-black bg-white hover:bg-gray-250 rounded-lg transition-all cursor-pointer shadow active:scale-95 flex items-center gap-1"
            >
              <Wrench className="w-2.5 h-2.5" /> Auto-Repair Nodes
            </button>
          )}

          <button
            onClick={scanStatus === "scanning" ? undefined : scanStatus === "healthy" ? handleInjectError : handleStartScan}
            disabled={scanStatus === "scanning"}
            className="px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-wider text-gray-400 hover:text-white border border-white/5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none rounded-lg transition-all cursor-pointer"
          >
            {scanStatus === "scanning" ? "Scanning..." : scanStatus === "healthy" ? "Inject Test Error" : "Run Fresh Scan"}
          </button>
        </div>
      </div>

      {/* Interactive flowchart with active radar sweep/pulse animation */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Animated Flow Layout */}
        <div className="flex-1 flex flex-col justify-center items-center py-6 bg-black/20 border border-white/[0.03] rounded-xl relative overflow-hidden min-h-[180px]">
          {/* Radar Sweep Effect Backdrop */}
          {scanStatus === "scanning" && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-sky-500/[0.015] to-transparent animate-pulse pointer-events-none" />
          )}

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 z-10 w-full justify-around px-4">
            {nodes.map((node, idx) => {
              const isCurrentScan = idx === activeScanIdx;
              
              // Color coding based on state
              let nodeColor = "border-white/5 bg-black/35 text-gray-550";
              let glowLight = "";
              if (isCurrentScan || node.status === "scanning") {
                nodeColor = "border-sky-500/30 bg-sky-500/[0.02] text-sky-400 animate-bounce";
                glowLight = "shadow-[0_0_15px_rgba(56,189,248,0.1)]";
              } else if (node.status === "healthy") {
                nodeColor = "border-emerald-500/20 bg-emerald-500/[0.01] text-emerald-400";
                glowLight = "shadow-[0_0_15px_rgba(16,185,129,0.08)]";
              } else if (node.status === "error") {
                nodeColor = "border-red-500/30 bg-red-500/[0.02] text-red-400 animate-pulse";
                glowLight = "shadow-[0_0_20px_rgba(239,68,68,0.12)]";
              }

              return (
                <React.Fragment key={node.id}>
                  <div className="flex flex-col items-center gap-1.5 relative">
                    {/* Node block */}
                    <div className={`w-20 h-20 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${nodeColor} ${glowLight}`}>
                      {getCatIcon(node.category)}
                      <span className="text-[8.5px] font-bold font-sans tracking-wide text-center px-1 leading-tight">{node.name}</span>
                    </div>

                    {/* Node status sub-badge */}
                    <span className={`text-[7px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                      node.status === "healthy" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                      node.status === "error" ? "text-red-400 bg-red-500/10 border-red-500/20" :
                      node.status === "scanning" ? "text-sky-400 bg-sky-500/10 border-sky-500/20" :
                      "text-gray-600 bg-white/[0.02] border-white/5"
                    }`}>
                      {node.status}
                    </span>
                  </div>

                  {/* Connecting Animated Arrow */}
                  {idx < 3 && (
                    <div className="flex items-center justify-center flex-shrink-0">
                      {node.status === "healthy" && nodes[idx + 1].status !== "idle" ? (
                        /* Smooth glowing active data line */
                        <div className="w-6 h-0.5 bg-gradient-to-r from-emerald-500/40 to-emerald-500/20 relative">
                          <span className="absolute w-1 h-1 bg-emerald-400 rounded-full left-0 -top-0.5 animate-ping" />
                        </div>
                      ) : node.status === "error" ? (
                        /* Blocked link indicator */
                        <div className="w-6 h-0.5 bg-red-500/30 relative">
                          <X className="w-2.5 h-2.5 text-red-500 absolute -top-1 left-1.5" />
                        </div>
                      ) : (
                        /* Idle link */
                        <div className="w-6 h-0.5 bg-white/5" />
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Diagnostic Logs console */}
        <div className="w-full lg:w-72 flex flex-col border border-white/5 bg-black/25 p-3 rounded-xl gap-2.5">
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
            <div className="flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-gray-550" />
              <span className="text-[9px] text-gray-550 font-bold uppercase tracking-wider">Debugger Trace Logs</span>
            </div>
            {scanStatus === "healthy" ? (
              <span className="text-[7.5px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 rounded">Active</span>
            ) : scanStatus === "error" ? (
              <span className="text-[7.5px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-1 rounded animate-pulse">Blocked</span>
            ) : (
              <span className="text-[7.5px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1 rounded">Scanning</span>
            )}
          </div>

          <div className="flex-1 bg-[#08090b] border border-white/5 p-2 rounded-lg font-mono text-[8px] text-gray-450 h-32 overflow-y-auto leading-relaxed scrollbar-thin select-text">
            {logMessages.map((log, idx) => (
              <div key={idx} className={log.includes("ERROR") || log.includes("CRITICAL") ? "text-red-400 font-bold" : log.includes("🟢") || log.includes("✓") ? "text-emerald-400 font-bold" : "text-gray-455"}>
                {log}
              </div>
            ))}
          </div>

          {scanStatus === "error" && (
            <div className="flex flex-col gap-1 p-2 bg-red-500/[0.02] border border-red-500/10 rounded-lg">
              <div className="flex items-center gap-1 text-[8.5px] font-bold text-red-400">
                <ShieldAlert className="w-3 h-3" />
                <span>Diagnostics Report</span>
              </div>
              <p className="text-[8px] text-gray-400 leading-normal">
                Node [Tauri Bridge] failed verification checks. Error: {nodes[1].errorMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
