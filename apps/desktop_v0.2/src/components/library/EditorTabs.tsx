import React from "react";
import { X } from "lucide-react";

interface EditorTab {
  id: string;
  name: string;
  isModified?: boolean;
}

interface EditorTabsProps {
  tabs: EditorTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab?: (id: string) => void;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab
}) => {
  return (
    <div className="flex items-center border border-white/[0.04] bg-[#0c0d10] p-0.5 rounded-lg overflow-x-auto scrollbar-none w-full max-w-sm">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[9.5px] font-mono cursor-pointer transition-all ${
              isActive
                ? "bg-white/5 border border-white/10 text-gray-300"
                : "bg-transparent border border-transparent text-gray-555 hover:text-gray-400 hover:bg-white/[0.01]"
            }`}
          >
            <span>{tab.name}</span>
            {tab.isModified && <span className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />}
            {onCloseTab && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className="hover:text-red-400/80 rounded ml-1 transition-colors flex items-center justify-center p-0.2"
              >
                <X className="w-2.5 h-2.5 text-gray-650 hover:text-red-400" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
