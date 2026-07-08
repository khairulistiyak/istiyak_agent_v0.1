import React, { useState } from "react";
import { 
  Cpu, 
  Settings, 
  Check, 
  Plus, 
  Trash2, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Flame, 
  Info
} from "lucide-react";
import { GlassButton } from "../ui/GlassButton.js";

interface Directive {
  id: string;
  text: string;
  enabled: boolean;
}

export const AgentIdentityDashboard: React.FC = () => {
  // Preset Personality States: balanced | cautious | aggressive
  const [presetMode, setPresetMode] = useState<"balanced" | "cautious" | "aggressive">("balanced");
  
  // Dynamic parameters
  const [temperature, setTemperature] = useState(0.7);
  const [verbosity, setVerbosity] = useState(0.8);
  const [confidenceLimit, setConfidenceLimit] = useState(0.85);
  
  // Interactive Directives checklist
  const [directives, setDirectives] = useState<Directive[]>([
    { id: "dir-1", text: "Maintain absolute monochrome minimal aesthetics (no color glows).", enabled: true },
    { id: "dir-2", text: "Dry run terminal commands and search index first before code edits.", enabled: true },
    { id: "dir-3", text: "Ensure all file links use the file:// absolute scheme correctly.", enabled: true },
    { id: "dir-4", text: "Write clean, modular TypeScript subcomponents and avoid global state pollution.", enabled: false }
  ]);
  const [newDirectiveText, setNewDirectiveText] = useState("");

  // Agent State: calm | active | scanning | resting
  const [agentState, setAgentState] = useState<"calm" | "active" | "scanning" | "resting">("calm");
  const [isAudible, setIsAudible] = useState(false);

  // Auto configure sliders based on presets
  const handlePresetChange = (mode: "balanced" | "cautious" | "aggressive") => {
    setPresetMode(mode);
    if (mode === "balanced") {
      setTemperature(0.7);
      setVerbosity(0.75);
      setConfidenceLimit(0.8);
      setAgentState("calm");
    } else if (mode === "cautious") {
      setTemperature(0.2);
      setVerbosity(0.95);
      setConfidenceLimit(0.95);
      setAgentState("resting");
    } else if (mode === "aggressive") {
      setTemperature(0.95);
      setVerbosity(0.5);
      setConfidenceLimit(0.65);
      setAgentState("active");
    }
  };

  const handleToggleDirective = (id: string) => {
    setDirectives(prev => prev.map(d => d.id === id ? { ...d, enabled: !d.enabled } : d));
  };

  const handleAddDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirectiveText.trim()) return;
    const newDir: Directive = {
      id: `dir-${Date.now()}`,
      text: newDirectiveText.trim(),
      enabled: true
    };
    setDirectives(prev => [...prev, newDir]);
    setNewDirectiveText("");
  };

  const handleDeleteDirective = (id: string) => {
    setDirectives(prev => prev.filter(d => d.id !== id));
  };

  // Determine avatar pulse rates & style classes based on states
  const getAvatarPulseClass = () => {
    switch (agentState) {
      case "active": return "animate-[spin_6s_linear_infinite]";
      case "scanning": return "animate-pulse";
      case "resting": return "opacity-40";
      case "calm":
      default:
        return "animate-[bounce_3s_ease-in-out_infinite]";
    }
  };

  return (
    <div className="flex flex-col border border-white/[0.05] bg-[#0c0d10] p-4 rounded-2xl w-full max-w-4xl text-left gap-4">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.04] pb-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-gray-400" />
            <span className="text-[11px] font-bold text-white uppercase tracking-widest">Agent Identity & Personality Panel</span>
          </div>
          <span className="text-[8px] text-gray-500 font-mono">Configure response temperament, mood matrices, and operational directives</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono text-gray-400 px-2 py-0.5 border border-white/5 bg-white/[0.01] rounded-full">
            Core Engine: Antigravity-v0.2
          </span>
          <button 
            onClick={() => setIsAudible(!isAudible)}
            className="p-1 border border-white/5 bg-white/[0.02] hover:bg-white/10 rounded transition-colors text-gray-500 hover:text-white"
            title={isAudible ? "Mute audio output logs" : "Unmute speech output logs"}
          >
            {isAudible ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Left Column: Visual avatar and config sliders (5 cols) */}
        <div className="md:col-span-5 flex flex-col gap-4 border-r border-white/[0.03] pr-0 md:pr-4">
          
          {/* Neural Matrix Avatar Frame */}
          <div className="flex flex-col items-center p-6 border border-white/[0.03] bg-black/20 rounded-xl relative overflow-hidden text-center min-h-[160px] justify-center">
            
            {/* Grid line background overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

            <div className="relative mb-3">
              {/* Dynamic SVG Brain Core Avatar */}
              <svg 
                width="64" 
                height="64" 
                viewBox="0 0 64 64" 
                className={`${getAvatarPulseClass()} transition-transform duration-500`}
              >
                {/* Outer concentric rings */}
                <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-800" strokeDasharray="3 3" />
                <circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-700" />
                <circle cx="32" cy="32" r="18" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gray-600" strokeDasharray="4 2" />
                
                {/* Dynamic core nodes */}
                <circle cx="32" cy="32" r="6" fill="currentColor" className={`${agentState === 'active' ? 'text-white' : 'text-gray-300'}`} />
                
                {/* Connecting neural web lines */}
                <path d="M32 8 L32 56 M8 32 L56 32 M15 15 L49 49 M15 49 L49 15" stroke="currentColor" strokeWidth="0.5" className="text-gray-700" />
                
                {/* Outer satellite nodes */}
                <circle cx="32" cy="8" r="2" fill="currentColor" className="text-gray-400" />
                <circle cx="32" cy="56" r="2" fill="currentColor" className="text-gray-400" />
                <circle cx="8" cy="32" r="2" fill="currentColor" className="text-gray-400" />
                <circle cx="56" cy="32" r="2" fill="currentColor" className="text-gray-400" />
                <circle cx="15" cy="15" r="1.5" fill="currentColor" className="text-gray-500" />
                <circle cx="49" cy="49" r="1.5" fill="currentColor" className="text-gray-500" />
              </svg>
              
              {/* Rotating outer ring for scanning/active states */}
              {agentState === "scanning" && (
                <div className="absolute inset-[-4px] border border-dashed border-white/20 rounded-full animate-spin" />
              )}
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Antigravity Core</span>
              <span className="text-[8.5px] font-mono text-gray-500">
                Mode: <span className="text-gray-300 font-bold">{presetMode.toUpperCase()}</span> ({agentState})
              </span>
            </div>

            {/* Simulated Live Mode Controls */}
            <div className="flex gap-1.5 mt-3 justify-center">
              {(["calm", "active", "scanning", "resting"] as const).map(state => (
                <button
                  key={state}
                  onClick={() => setAgentState(state)}
                  className={`px-1.5 py-0.5 text-[7.5px] font-mono border rounded ${
                    agentState === state 
                      ? "border-white/20 bg-white/10 text-white" 
                      : "border-white/5 bg-transparent text-gray-600 hover:text-gray-400"
                  }`}
                >
                  {state.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Personality Preset Selectors */}
          <div className="flex flex-col gap-2 p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl">
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">Preset Persona Profile</span>
            <div className="flex gap-1">
              {[
                { id: "cautious" as const, label: "Cautious Guide", icon: ShieldAlert },
                { id: "balanced" as const, label: "Balanced Zen", icon: Settings },
                { id: "aggressive" as const, label: "Agentic Dev", icon: Flame }
              ].map(preset => {
                const Icon = preset.icon;
                const isSelected = presetMode === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetChange(preset.id)}
                    className={`flex-1 py-1 px-1.5 border rounded flex flex-col items-center gap-1 transition-all ${
                      isSelected 
                        ? "border-white/15 bg-white/5 text-white" 
                        : "border-white/[0.04] bg-transparent text-gray-500 hover:text-gray-450 hover:border-white/10"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-mono leading-none">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Configuration Sliders */}
          <div className="flex flex-col gap-3 p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl font-mono text-[9px]">
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">Core Parameters</span>

            {/* Creativity/Temperature slider */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-450">Creativity (Temperature)</span>
                <span className="text-white font-bold">{temperature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => {
                  setTemperature(parseFloat(e.target.value));
                  setPresetMode("balanced"); // break preset
                }}
                className="w-full accent-white bg-white/5 h-1 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Detail Verbosity */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-455">Response Verbosity</span>
                <span className="text-white font-bold">{(verbosity * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={verbosity}
                onChange={(e) => {
                  setVerbosity(parseFloat(e.target.value));
                  setPresetMode("balanced");
                }}
                className="w-full accent-white bg-white/5 h-1 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Confidence Threshold */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-455">Tool Match Confidence</span>
                <span className="text-white font-bold">{(confidenceLimit * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.99"
                step="0.05"
                value={confidenceLimit}
                onChange={(e) => {
                  setConfidenceLimit(parseFloat(e.target.value));
                  setPresetMode("balanced");
                }}
                className="w-full accent-white bg-white/5 h-1 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Directives checklist and text adder (7 cols) */}
        <div className="md:col-span-7 flex flex-col gap-3">
          
          {/* Behavioral Directives Card */}
          <div className="flex-1 flex flex-col p-4 border border-white/[0.04] bg-black/40 rounded-2xl gap-3 text-left">
            <div className="flex flex-col gap-0.5 border-b border-white/[0.04] pb-2">
              <div className="flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-gray-550" />
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Active System Directives</span>
              </div>
              <span className="text-[8px] text-gray-600 font-mono">Checklist of instructions constraining active agent execution</span>
            </div>

            {/* Directives Checklist */}
            <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[220px] scrollbar-thin">
              {directives.map((dir) => (
                <div 
                  key={dir.id}
                  onClick={() => handleToggleDirective(dir.id)}
                  className={`flex gap-2.5 p-2.5 border rounded-xl items-center cursor-pointer transition-colors ${
                    dir.enabled 
                      ? "border-white/10 bg-white/[0.01]" 
                      : "border-white/[0.03] opacity-40 hover:opacity-70 bg-transparent"
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                    dir.enabled 
                      ? "border-white bg-white text-black" 
                      : "border-white/20 bg-transparent text-transparent"
                  }`}>
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  
                  <span className={`text-[10.5px] font-mono leading-snug flex-1 select-none ${
                    dir.enabled ? "text-gray-200" : "text-gray-500 line-through"
                  }`}>
                    {dir.text}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDirective(dir.id);
                    }}
                    className="p-1 border border-transparent hover:border-white/10 hover:bg-white/5 rounded text-gray-600 hover:text-white transition-all"
                    title="Delete directive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Directive Adder Form */}
            <form onSubmit={handleAddDirective} className="flex gap-2 border-t border-white/[0.04] pt-3 mt-1">
              <input
                type="text"
                value={newDirectiveText}
                onChange={(e) => setNewDirectiveText(e.target.value)}
                placeholder="e.g. Always generate markdown diagrams when clarifying code flows..."
                className="flex-1 px-3 py-1.5 bg-black/40 border border-white/[0.04] rounded-lg text-[10.5px] text-gray-300 placeholder-gray-600 focus:outline-none focus:border-white/10 transition-colors"
              />
              <GlassButton
                type="submit"
                disabled={!newDirectiveText.trim()}
                className="flex items-center gap-1 py-1 px-2.5 text-[8.5px] font-bold uppercase tracking-wider"
              >
                <Plus className="w-3 h-3" /> Add Rule
              </GlassButton>
            </form>
          </div>

          {/* Capabilities grid & summary logs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* System Capabilities list */}
            <div className="p-3 border border-white/[0.04] bg-[#090a0f] rounded-xl font-mono text-[9px] flex flex-col gap-1.5">
              <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Local API Capability</span>
              <div className="flex flex-col gap-1 text-[9.5px]">
                {[
                  { name: "SQLite bridge & indexing", ok: true },
                  { name: "Unsandboxed script execution", ok: true },
                  { name: "Browser devtools driver", ok: true },
                  { name: "Git branch synchronization", ok: false }
                ].map(cap => (
                  <div key={cap.name} className="flex items-center gap-1.5">
                    <span className={`w-1 h-1 rounded-full ${cap.ok ? 'bg-white' : 'bg-gray-700'}`} />
                    <span className={cap.ok ? 'text-gray-300' : 'text-gray-600'}>{cap.name}</span>
                    <span className={`text-[7.5px] font-mono ml-auto ${cap.ok ? 'text-gray-400' : 'text-gray-650'}`}>
                      {cap.ok ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Information panel */}
            <div className="p-3 border border-white/[0.04] bg-[#090a0f] rounded-xl font-mono text-[9px] flex flex-col gap-1">
              <span className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Directives Impact</span>
              <div className="flex gap-1.5 items-start mt-1">
                <Info className="w-3.5 h-3.5 text-gray-600 shrink-0 mt-0.5" />
                <p className="text-[9.5px] text-gray-550 leading-normal">
                  Directives are injected dynamically into System Prompts, ensuring absolute alignment with target project constraints and stylistic aesthetics.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
