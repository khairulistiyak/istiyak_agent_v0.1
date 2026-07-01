import React from "react";
import { Activity, X } from "lucide-react";
import { TelemetryStats } from "../../types/chat.js";

interface TelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryStats | null;
}

export const TelemetryModal = React.memo(({
  isOpen,
  onClose,
  telemetry
}: TelemetryModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 bg-cyber-dark/85 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] max-h-[85%] bg-cyber-card/95 border border-cyber-cardBorder/60 p-5 rounded-2xl shadow-2xl backdrop-blur-md relative z-10 flex flex-col space-y-4 overflow-hidden text-xs text-cyber-textPrimary"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-cyber-cardBorder/40 pb-3">
          <span className="font-semibold text-xs tracking-wider uppercase text-cyber-textPrimary/80 flex items-center space-x-1.5">
            <Activity size={14} className="text-cyber-primary animate-pulse" />
            <span>Live Performance & Cost Telemetry</span>
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded text-cyber-textSecondary hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Metrics cards grid */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <div className="bg-cyber-dark/45 border border-cyber-cardBorder rounded-xl p-3 flex flex-col justify-center items-center text-center">
            <span className="text-[10px] uppercase font-bold text-cyber-textSecondary tracking-wider">Total Calls</span>
            <span className="text-lg font-extrabold text-white mt-1">{telemetry?.callCount || 0}</span>
          </div>
          <div className="bg-cyber-dark/45 border border-cyber-cardBorder rounded-xl p-3 flex flex-col justify-center items-center text-center">
            <span className="text-[10px] uppercase font-bold text-cyber-textSecondary tracking-wider">Avg Latency</span>
            <span className="text-lg font-extrabold text-white mt-1">{(telemetry?.avgLatencyMs || 0)}ms</span>
          </div>
          <div className="bg-cyber-dark/45 border border-cyber-cardBorder rounded-xl p-3 flex flex-col justify-center items-center text-center">
            <span className="text-[10px] uppercase font-bold text-cyber-textSecondary tracking-wider">Avg Speed</span>
            <span className="text-lg font-extrabold text-cyber-primary mt-1">{(telemetry?.avgSpeed || 0)} t/s</span>
          </div>
          <div className="bg-cyber-dark/45 border border-cyber-cardBorder rounded-xl p-3 flex flex-col justify-center items-center text-center">
            <span className="text-[10px] uppercase font-bold text-cyber-textSecondary tracking-wider">Session Cost</span>
            <span className="text-lg font-extrabold text-emerald-400 mt-1">
              ${(telemetry ? telemetry.history.reduce((acc, m) => {
                const p = (m.provider || "").toLowerCase();
                let inputRate = 0.075, outputRate = 0.30; // Gemini defaults (per 1M tokens)
                if (p.includes("openai") || p.includes("gpt")) { inputRate = 2.50; outputRate = 10.00; }
                else if (p.includes("claude") || p.includes("anthropic")) { inputRate = 3.00; outputRate = 15.00; }
                else if (p.includes("deepseek")) { inputRate = 0.14; outputRate = 0.28; }
                else if (p.includes("ollama") || p.includes("custom")) { inputRate = 0; outputRate = 0; }
                return acc + ((m.tokensIn / 1_000_000) * inputRate + (m.tokensOut / 1_000_000) * outputRate);
              }, 0) : 0).toFixed(6)}
            </span>
          </div>
        </div>

        {/* Recent API Call Logs list */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <h3 className="font-bold text-cyber-primary uppercase tracking-wider text-[9px] mb-2 shrink-0">Call History & Rates</h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {!telemetry || telemetry.history.length === 0 ? (
              <p className="text-[10.5px] text-cyber-textSecondary italic text-center py-4">No metrics logged in this session.</p>
            ) : (
              [...telemetry.history].reverse().map((item, idx) => (
                <div key={idx} className="p-3 bg-cyber-dark/30 border border-cyber-cardBorder/50 rounded-xl space-y-1 text-[11px]">
                  <div className="flex justify-between items-center text-white">
                    <span className="font-bold">{item.provider.toUpperCase()} ({item.model})</span>
                    <span className="text-[9px] text-cyber-textSecondary font-mono">{item.timestamp}</span>
                  </div>
                  <div className="flex justify-between items-center text-cyber-textSecondary text-[10px] font-mono">
                    <span>Latency: <span className="text-white">{item.latencyMs}ms</span></span>
                    <span>Tokens: <span className="text-white">{item.tokensIn} in / {item.tokensOut} out</span></span>
                    <span>Speed: <span className="text-cyber-primary font-bold">{item.tokensPerSec} t/s</span></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

TelemetryModal.displayName = "TelemetryModal";
