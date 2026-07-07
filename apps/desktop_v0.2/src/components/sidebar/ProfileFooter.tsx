import React from "react";
import { Settings } from "lucide-react";
import { useChatStore } from "../../store/useChatStore.js";
import { Avatar } from "../ui/Avatar.js";
import { GlassButton } from "../ui/GlassButton.js";

export const ProfileFooter: React.FC = () => {
  const { setSettingsOpen } = useChatStore();

  return (
    <div className="p-4 border-t border-cyber-card-border flex items-center justify-between">
      <div className="flex items-center gap-2.5 overflow-hidden">
        <Avatar name="Developer Istiyak" status="online" />
        <div className="flex flex-col text-left overflow-hidden">
          <span className="text-xs font-semibold text-gray-200 truncate">
            Dev Istiyak
          </span>
          <span className="text-[10px] text-gray-500 font-medium">
            Pro R&D Mode
          </span>
        </div>
      </div>

      <GlassButton
        onClick={() => setSettingsOpen(true)}
        variant="ghost"
        size="sm"
        title="Settings"
      >
        <Settings className="w-4 h-4" />
      </GlassButton>
    </div>
  );
};
