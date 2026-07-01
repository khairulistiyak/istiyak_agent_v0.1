import React from "react";
import { User, Settings, History } from "lucide-react";

interface TitleBarProps {
  engineStatus: "connecting" | "online" | "offline";
  isLoading: boolean;
  token: string;
  userEmail: string;
  onClose: () => void;
  onMinimize: () => void;
  onExpand: () => void;
  onAuthOpen: () => void;
  onSettingsOpen: () => void;
  onHistoryOpen: () => void;
}

export const TitleBar = React.memo(({
  engineStatus,
  isLoading,
  token,
  userEmail,
  onClose,
  onMinimize,
  onExpand,
  onAuthOpen,
  onSettingsOpen,
  onHistoryOpen
}: TitleBarProps) => {
  return (
    <header
      data-tauri-drag-region
      className="relative z-20 flex items-center justify-between px-4 py-3 bg-cyber-dark cursor-grab active:cursor-grabbing select-none"
    >
      {/* macOS-style Window controls on the top-left (Subtle Flat Gray default, lights up on group hover) */}
      <div className="flex items-center space-x-2 group/traffic w-[64px] z-30" data-tauri-drag-region>
        <button
          onClick={onClose}
          className="w-2.5 h-2.5 rounded-full bg-[#22242a] group-hover/traffic:bg-[#ff5f56] flex items-center justify-center text-transparent group-hover/traffic:text-[#4c0002] transition-all duration-150 cursor-pointer relative"
          title="Close"
        >
          <span className="absolute text-[7px] font-bold opacity-0 group-hover/traffic:opacity-100 transition-opacity leading-none select-none bottom-[1.5px] pointer-events-none">×</span>
        </button>
        <button
          onClick={onMinimize}
          className="w-2.5 h-2.5 rounded-full bg-[#22242a] group-hover/traffic:bg-[#ffbd2e] flex items-center justify-center text-transparent group-hover/traffic:text-[#5c3e00] transition-all duration-150 cursor-pointer relative"
          title="Minimize"
        >
          <span className="absolute text-[7px] font-bold opacity-0 group-hover/traffic:opacity-100 transition-opacity leading-none select-none bottom-[2px] pointer-events-none">-</span>
        </button>
        <button
          onClick={onExpand}
          className="w-2.5 h-2.5 rounded-full bg-[#22242a] group-hover/traffic:bg-[#27c93f] flex items-center justify-center text-transparent group-hover/traffic:text-[#024d00] transition-all duration-150 cursor-pointer relative"
          title="Maximize"
        >
          <span className="absolute text-[5px] font-bold opacity-0 group-hover/traffic:opacity-100 transition-opacity select-none leading-none bottom-[1.5px] pointer-events-none">+</span>
        </button>
      </div>

      {/* Centered Title */}
      <div className="flex items-center justify-center space-x-2 pointer-events-none flex-1" data-tauri-drag-region>
        <div className="relative pointer-events-none flex items-center">
          <span className="flex h-1.5 w-1.5 pointer-events-none">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 pointer-events-none ${
              engineStatus === "online" ? "bg-[#10b981]" : engineStatus === "offline" ? "bg-[#ef4444]" : "bg-[#f59e0b]"
            }`}></span>
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 pointer-events-none ${
              engineStatus === "online" ? "bg-[#10b981]" : engineStatus === "offline" ? "bg-[#ef4444]" : "bg-[#f59e0b]"
            }`}></span>
          </span>
        </div>
        <span className="font-extrabold text-[9px] tracking-wider uppercase text-[#88888c] pointer-events-none" data-tauri-drag-region>
          {engineStatus === "offline" 
            ? "ENGINE OFFLINE" 
            : isLoading 
            ? "GENERATING..." 
            : "ISTIYAK COMPANION"}
        </span>
      </div>

      {/* Action Toggle buttons on top-right */}
      <div className="flex items-center justify-end space-x-1.5 z-30">
        <button
          onClick={onAuthOpen}
          className="p-1.5 rounded-lg text-cyber-textMuted hover:text-white transition-colors cursor-pointer"
          title={token ? `Logged in as ${userEmail}` : "Account Login"}
        >
          <User size={14} className={token ? "text-[#10b981]" : "text-cyber-textMuted"} />
        </button>
        <button
          onClick={onSettingsOpen}
          className="p-1.5 rounded-lg text-cyber-textMuted hover:text-white transition-colors cursor-pointer"
          title="Settings & System Config"
        >
          <Settings size={14} />
        </button>
        <button
          onClick={onHistoryOpen}
          className="p-1.5 rounded-lg text-cyber-textMuted hover:text-white transition-colors mr-1 cursor-pointer"
          title="Chat History"
        >
          <History size={14} />
        </button>
      </div>
    </header>
  );
});

TitleBar.displayName = "TitleBar";
