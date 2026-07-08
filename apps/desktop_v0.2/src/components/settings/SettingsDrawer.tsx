import React, { useState } from "react";
import { useChatStore } from "../../store/useChatStore.js";
import { X, Cpu, Settings2, Sliders } from "lucide-react";
import { EngineConfigForm } from "./EngineConfigForm.js";
import { CustomProviderForm } from "./CustomProviderForm.js";
import { ModelTable } from "./ModelTable.js";
import { GlassButton } from "../ui/GlassButton.js";

export const SettingsDrawer: React.FC = () => {
  const { isSettingsOpen, setSettingsOpen, viewMode, setViewMode } = useChatStore();
  const [activeTab, setActiveTab] = useState<"engine" | "providers" | "models">("engine");

  if (!isSettingsOpen) return null;

  const tabs = [
    { id: "engine", label: "Engine Config", icon: Settings2 },
    { id: "providers", label: "Custom Providers", icon: Sliders },
    { id: "models", label: "Manage Models (CRUD)", icon: Cpu }
  ] as const;

  return (
    <div className="absolute inset-0 z-50 flex justify-end select-none animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        onClick={() => setSettingsOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-xl h-full border-l border-cyber-card-border bg-cyber-card flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="h-14 border-b border-cyber-card-border px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-bold text-gray-200">Settings Manager</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <GlassButton
              onClick={() => {
                setViewMode(viewMode === "chat" ? "library" : "chat");
                setSettingsOpen(false);
              }}
              variant="ghost"
              size="xs"
              className="!border-white/5 !bg-white/5 hover:!bg-white/10 text-gray-300"
            >
              {viewMode === "chat" ? "📐 UI Playground" : "💬 Back to Chat"}
            </GlassButton>
            <GlassButton
              onClick={() => setSettingsOpen(false)}
              variant="ghost"
              size="xs"
            >
              <X className="w-4 h-4" />
            </GlassButton>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-cyber-card-border px-4 py-1 gap-2 overflow-x-auto scrollbar-none whitespace-nowrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <GlassButton
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                active={isActive}
                variant="ghost"
                size="sm"
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </GlassButton>
            );
          })}
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          {activeTab === "engine" && <EngineConfigForm />}
          {activeTab === "providers" && <CustomProviderForm />}
          {activeTab === "models" && <ModelTable />}
        </div>
      </div>
    </div>
  );
};
