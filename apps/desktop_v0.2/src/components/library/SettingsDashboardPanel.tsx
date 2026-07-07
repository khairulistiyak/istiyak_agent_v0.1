import React from "react";
import { Sliders } from "lucide-react";

interface SettingsDashboardPanelProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

export const SettingsDashboardPanel: React.FC<SettingsDashboardPanelProps> = ({
  activeTab,
  onTabChange,
  children
}) => {
  const tabs = [
    { id: "model", label: "Model Config" },
    { id: "limits", label: "Agent Limits" },
    { id: "system", label: "System Logs" }
  ];

  return (
    <div className="flex flex-col border border-white/[0.05] bg-[#0c0d10] rounded-xl overflow-hidden w-full max-w-sm text-left">
      <div className="flex items-center justify-between px-3 py-2 bg-white/[0.01] border-b border-white/[0.04]">
        <div className="flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-gray-550" />
          <span className="text-[10px] font-bold text-gray-355 uppercase tracking-widest">Settings Panel</span>
        </div>
      </div>
      <div className="flex border-b border-white/[0.03] bg-black/15 p-0.5">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 py-1 text-[8.5px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
                isActive 
                  ? "bg-white/5 text-white border border-white/5" 
                  : "text-gray-500 hover:text-gray-400 bg-transparent border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="p-3.5 min-h-[140px] bg-white/[0.005]">
        {children}
      </div>
    </div>
  );
};
