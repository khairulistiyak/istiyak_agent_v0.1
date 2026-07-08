import React from "react";
import { useChatStore } from "../../store/useChatStore.js";
import { Plus, PanelLeftClose } from "lucide-react";
import { SessionList } from "./SessionList.js";
import { ProfileFooter } from "./ProfileFooter.js";
import { GlassButton } from "../ui/GlassButton.js";

export const SidebarContainer: React.FC = () => {
  const { isSidebarOpen, toggleSidebar, addSession } = useChatStore();

  return (
    <div
      className={`h-full border-r border-cyber-card-border bg-[#090a0f] md:bg-cyber-card flex flex-col justify-between transition-all duration-300 absolute inset-y-0 left-0 z-30 md:relative select-none ${
        isSidebarOpen ? "w-64" : "w-0 overflow-hidden border-r-0"
      }`}
    >
      {/* Top Section */}
      <div className="flex flex-col p-4 gap-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs tracking-wider text-gray-400">
            COMPANION v0.2
          </div>
          <GlassButton
            onClick={toggleSidebar}
            variant="ghost"
            size="xs"
            title="Hide Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </GlassButton>
        </div>

        <GlassButton
          onClick={addSession}
          variant="secondary"
          className="w-full justify-start py-2 px-3 rounded-xl border border-white/5 hover:border-white/10"
        >
          <Plus className="w-4 h-4 text-gray-300" />
          <span className="text-xs font-semibold text-gray-300">New Session</span>
        </GlassButton>
      </div>

      {/* Middle Section (Scrollable list of sessions) */}
      <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin">
        <SessionList />
      </div>

      {/* Bottom Section (Profile & Settings Footer) */}
      <ProfileFooter />
    </div>
  );
};
