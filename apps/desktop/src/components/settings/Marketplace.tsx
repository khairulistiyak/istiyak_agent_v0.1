import React, { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { curatedThemes } from "../../utils/theme.js";

interface PromptItem {
  title: string;
  prompt: string;
}

interface ExtensionItem {
  id: string;
  name: string;
  description: string;
  commands: Array<{ name: string; command: string }>;
  prompts: Array<{ title: string; prompt: string }>;
}

interface MarketplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: string;
  installedPrompts: PromptItem[];
  installedExtensions: ExtensionItem[];
  updateSettings: (settings: any) => Promise<void>;
}

const curatedPrompts: PromptItem[] = [
  { title: "Code Refactorer", prompt: "Refactor this code to follow clean architecture principles, remove redundancies, and optimize execution flow: " },
  { title: "Bug Hunter", prompt: "Analyze this code snippet for potential race conditions, edge case failures, performance bottlenecks, or hidden bugs: " },
  { title: "SQL Optimizer", prompt: "Optimize this SQL query for execution speed, indexing utilization, and query plan efficiency: " },
  { title: "Unit Test Writer", prompt: "Write comprehensive unit tests with edge-case validation coverage for this component using the standard testing library: " }
];

const curatedExtensions: ExtensionItem[] = [
  {
    id: "git-companion",
    name: "Git Companion",
    description: "Provides Git workflow command shortcuts and commit message generators.",
    commands: [
      { name: "Git Status", command: "git status" },
      { name: "Git Diff", command: "git diff --stat" },
      { name: "Git Log", command: "git log -n 5 --oneline" }
    ],
    prompts: [
      { title: "Commit Gen", prompt: "Generate a semantic git commit message based on these code changes: " },
      { title: "Review Diff", prompt: "Perform a developer code review of these git diff changes: " }
    ]
  },
  {
    id: "docker-companion",
    name: "Docker Companion",
    description: "Provides basic container operations, images list, and Docker configuration check templates.",
    commands: [
      { name: "Docker Status", command: "docker ps" },
      { name: "Docker Images", command: "docker images" },
      { name: "Docker Info", command: "docker info" }
    ],
    prompts: [
      { title: "Dockerfile Review", prompt: "Explain this Dockerfile line-by-line and identify optimization opportunities: " },
      { title: "Compose Scaffold", prompt: "Create a docker-compose.yml configuration to run a service stack with these specs: " }
    ]
  }
];

export const MarketplaceModal = React.memo(({
  isOpen,
  onClose,
  activeTheme,
  installedPrompts,
  installedExtensions,
  updateSettings
}: MarketplaceModalProps) => {
  const [customPromptTitle, setCustomPromptTitle] = useState("");
  const [customPromptText, setCustomPromptText] = useState("");

  const handleInstallPrompt = (p: PromptItem) => {
    const isInstalled = installedPrompts.some(item => item.title === p.title);
    if (isInstalled) {
      updateSettings({
        installedPrompts: installedPrompts.filter(item => item.title !== p.title)
      });
    } else {
      updateSettings({
        installedPrompts: [...installedPrompts, p]
      });
    }
  };

  const handleInstallExtension = (ext: ExtensionItem) => {
    const isInstalled = installedExtensions.some(item => item.id === ext.id);
    if (isInstalled) {
      updateSettings({
        installedExtensions: installedExtensions.filter(item => item.id !== ext.id),
        installedPrompts: installedPrompts.filter(p => !ext.prompts.some(ep => ep.title === p.title))
      });
    } else {
      updateSettings({
        installedExtensions: [...installedExtensions, ext],
        installedPrompts: [...installedPrompts, ...ext.prompts.filter(ep => !installedPrompts.some(p => p.title === ep.title))]
      });
    }
  };

  const handleAddCustomPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPromptTitle.trim() || !customPromptText.trim()) return;
    const newPrompt = { title: customPromptTitle.trim(), prompt: customPromptText.trim() };
    updateSettings({
      installedPrompts: [...installedPrompts, newPrompt]
    });
    setCustomPromptTitle("");
    setCustomPromptText("");
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 bg-cyber-dark/85 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[500px] max-h-[90%] bg-cyber-card/95 border border-cyber-cardBorder/60 p-6 rounded-2xl shadow-2xl backdrop-blur-md relative z-10 flex flex-col space-y-4 overflow-hidden text-xs text-cyber-textPrimary"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-cyber-cardBorder/40 pb-3">
          <span className="font-semibold text-xs tracking-wider uppercase text-cyber-textPrimary/80 flex items-center space-x-1.5">
            <Sparkles size={14} className="text-cyber-primary" />
            <span>Marketplace & Customizations</span>
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded text-cyber-textSecondary hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable Catalog Sections */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1.5">
          
          {/* Section 1: Themes */}
          <div className="space-y-2">
            <h3 className="font-bold text-cyber-primary uppercase tracking-wider text-[10px]">1. Custom UI Themes</h3>
            <div className="grid grid-cols-2 gap-2">
              {curatedThemes.map((t) => {
                const isActive = activeTheme === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => updateSettings({ activeTheme: t.id })}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isActive 
                        ? "bg-cyber-primary/10 border-cyber-primary text-white font-semibold" 
                        : "bg-cyber-card/45 border-cyber-cardBorder text-cyber-textSecondary hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="font-medium">{t.name}</span>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Prompts Catalog */}
          <div className="space-y-2">
            <h3 className="font-bold text-cyber-primary uppercase tracking-wider text-[10px]">2. Prompts Catalog</h3>
            <div className="space-y-2">
              {curatedPrompts.map((p, idx) => {
                const isInstalled = installedPrompts.some(item => item.title === p.title);
                return (
                  <div key={idx} className="p-2.5 bg-cyber-card/45 border border-cyber-cardBorder rounded-xl flex items-center justify-between space-x-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white truncate">{p.title}</div>
                      <div className="text-[10px] text-cyber-textSecondary truncate">{p.prompt}</div>
                    </div>
                    <button
                      onClick={() => handleInstallPrompt(p)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer shrink-0 ${
                        isInstalled 
                          ? "bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400" 
                          : "bg-cyber-primary/20 hover:bg-cyber-primary/30 border border-cyber-primary/40 text-cyber-primary"
                      }`}
                    >
                      {isInstalled ? "Uninstall" : "Install"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Extension Plugins */}
          <div className="space-y-2">
            <h3 className="font-bold text-cyber-primary uppercase tracking-wider text-[10px]">3. Extension SDK Plugins</h3>
            <div className="space-y-2">
              {curatedExtensions.map((ext) => {
                const isInstalled = installedExtensions.some(item => item.id === ext.id);
                return (
                  <div key={ext.id} className="p-2.5 bg-cyber-card/45 border border-cyber-cardBorder rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-white">{ext.name}</div>
                      <button
                        onClick={() => handleInstallExtension(ext)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer shrink-0 ${
                          isInstalled 
                            ? "bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400" 
                            : "bg-cyber-primary/20 hover:bg-cyber-primary/30 border border-cyber-primary/40 text-cyber-primary"
                        }`}
                      >
                        {isInstalled ? "Uninstall" : "Install"}
                      </button>
                    </div>
                    <p className="text-[10px] text-cyber-textSecondary leading-relaxed">{ext.description}</p>
                    <div className="flex flex-wrap gap-1 text-[9px]">
                      {ext.commands.map((c, cIdx) => (
                        <span key={cIdx} className="bg-cyber-dark/65 border border-cyber-cardBorder text-cyber-primary px-1.5 py-0.5 rounded font-mono">
                          cmd: {c.name}
                        </span>
                      ))}
                      {ext.prompts.map((p, pIdx) => (
                        <span key={pIdx} className="bg-cyber-dark/65 border border-cyber-cardBorder text-cyber-secondary px-1.5 py-0.5 rounded font-mono">
                          prompt: {p.title}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Add Custom Prompt */}
          <div className="space-y-2">
            <h3 className="font-bold text-cyber-primary uppercase tracking-wider text-[10px]">4. Create Custom Chat Prompt</h3>
            <form onSubmit={handleAddCustomPrompt} className="p-3 bg-cyber-card/45 border border-cyber-cardBorder rounded-xl space-y-2.5">
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-cyber-textSecondary">Prompt Shortcut Name</label>
                <input
                  type="text"
                  required
                  value={customPromptTitle}
                  onChange={(e) => setCustomPromptTitle(e.target.value)}
                  placeholder="e.g. Code Reviewer"
                  className="w-full bg-cyber-dark/80 border border-cyber-cardBorder rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-cyber-primary/60 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-cyber-textSecondary">Prompt Instruction Text</label>
                <textarea
                  required
                  rows={2}
                  value={customPromptText}
                  onChange={(e) => setCustomPromptText(e.target.value)}
                  placeholder="e.g. Please analyze this code for complexity..."
                  className="w-full bg-cyber-dark/80 border border-cyber-cardBorder rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-cyber-primary/60 text-xs resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-cyber-primary text-cyber-dark font-bold rounded-lg text-[10px] hover:shadow-[0_0_8px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
              >
                ADD CUSTOM PROMPT
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
});

MarketplaceModal.displayName = "MarketplaceModal";
