import React from "react";
import { Play, Pause, X, RotateCcw } from "lucide-react";

interface TerminalToolbarProps {
  isRunning: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onClear: () => void;
}

export const TerminalToolbar: React.FC<TerminalToolbarProps> = ({
  isRunning,
  isPaused,
  onPlay,
  onPause,
  onStop,
  onClear
}) => {
  return (
    <div className="inline-flex items-center gap-0.5 bg-[#0c0d10] border border-white/[0.04] p-0.5 rounded-lg">
      <button 
        onClick={onPlay} 
        disabled={isRunning && !isPaused}
        className="p-1 text-gray-500 hover:text-emerald-400 disabled:opacity-30 disabled:pointer-events-none transition-colors rounded cursor-pointer"
        title="Run Process"
      >
        <Play className="w-3 h-3" />
      </button>
      <button 
        onClick={onPause} 
        disabled={!isRunning || isPaused}
        className="p-1 text-gray-500 hover:text-sky-400 disabled:opacity-30 disabled:pointer-events-none transition-colors rounded cursor-pointer"
        title="Pause Process"
      >
        <Pause className="w-3 h-3" />
      </button>
      <button 
        onClick={onStop} 
        disabled={!isRunning}
        className="p-1 text-gray-500 hover:text-red-400 disabled:opacity-30 disabled:pointer-events-none transition-colors rounded cursor-pointer"
        title="Terminate Process"
      >
        <X className="w-3 h-3" />
      </button>
      <div className="w-px h-3 bg-white/5 mx-1" />
      <button 
        onClick={onClear}
        className="p-1 text-gray-500 hover:text-gray-300 transition-colors rounded cursor-pointer"
        title="Clear Terminal Output"
      >
        <RotateCcw className="w-3 h-3" />
      </button>
    </div>
  );
};
