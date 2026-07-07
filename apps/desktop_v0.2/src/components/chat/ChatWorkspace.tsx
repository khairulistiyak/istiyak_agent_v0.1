import React from "react";
import { useChatStore } from "../../store/useChatStore.js";
import { PanelLeftOpen, Trash2, HelpCircle } from "lucide-react";
import { MessageArea } from "./MessageArea.js";
import { InputContainer } from "./InputContainer.js";
import { GlassButton } from "../ui/GlassButton.js";

export const ChatWorkspace: React.FC = () => {
  const { 
    sessions, 
    activeSessionId, 
    isSidebarOpen, 
    toggleSidebar, 
    clearMessages 
  } = useChatStore();

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  if (!activeSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-cyber-dark text-gray-500">
        <HelpCircle className="w-12 h-12 text-gray-600 mb-3 animate-pulse" />
        <span className="text-sm font-medium">Create or select a session to get started.</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-cyber-dark relative">
      {/* Workspace Bar */}
      <div className="h-14 border-b border-cyber-card-border px-4 flex items-center justify-between bg-cyber-dark/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          {!isSidebarOpen && (
            <GlassButton
              onClick={toggleSidebar}
              variant="ghost"
              size="xs"
              title="Show Sidebar"
            >
              <PanelLeftOpen className="w-4.5 h-4.5" />
            </GlassButton>
          )}
          <div className="flex flex-col text-left">
            <h2 className="text-xs font-semibold text-gray-300 truncate max-w-[200px] sm:max-w-[400px]">
              {activeSession.title}
            </h2>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
              Active: {activeSession.activeModel} ({activeSession.activeMode})
            </p>
          </div>
        </div>

        {activeSession.messages.length > 0 && (
          <GlassButton
            onClick={() => clearMessages(activeSession.id)}
            variant="ghost"
            size="sm"
            className="hover:!text-white hover:!bg-white/5"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">Clear Chat</span>
          </GlassButton>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-hidden relative">
        <MessageArea messages={activeSession.messages} />
      </div>

      {/* Bottom Floating/Fixed Input */}
      <div className="p-4 bg-gradient-to-t from-cyber-dark via-cyber-dark/95 to-transparent">
        <InputContainer />
      </div>
    </div>
  );
};
