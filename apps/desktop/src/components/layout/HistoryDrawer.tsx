import React from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Conversation } from "../../store/slices/chatSlice.js";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
}

export const HistoryDrawer = React.memo(({
  isOpen,
  onClose,
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation
}: HistoryDrawerProps) => {
  return (
    <div
      className={`absolute inset-0 bg-cyber-dark/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      {/* Drawer content */}
      <div
        className={`absolute top-0 left-0 bottom-0 w-64 bg-cyber-dark border-r border-cyber-cardBorder shadow-2xl flex flex-col p-4 space-y-4 transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-cyber-cardBorder/40 pb-3">
          <span className="font-semibold text-xs tracking-wider uppercase text-cyber-textPrimary/80">Chats History</span>
          <button
            onClick={onClose}
            className="p-1 rounded text-cyber-textSecondary hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* New Chat Trigger */}
        <button
          onClick={() => {
            onNewChat();
            onClose();
          }}
          className="flex items-center justify-center space-x-2 py-2 px-3 border border-cyber-primary/30 text-cyber-primary rounded-lg text-xs font-semibold hover:bg-cyber-primary/10 hover:border-cyber-primary transition-all duration-300 cursor-pointer"
        >
          <Plus size={14} />
          <span>Start New Chat</span>
        </button>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {conversations.map((convo) => (
            <div
              key={convo.id}
              onClick={() => {
                onSelectConversation(convo.id);
                onClose();
              }}
              className={`flex items-center justify-between p-2 rounded-lg text-xs group cursor-pointer border transition-all ${
                convo.id === activeId
                  ? "bg-cyber-primary/10 border-cyber-primary/30 text-cyber-primary"
                  : "bg-cyber-card/30 border-transparent text-cyber-textSecondary hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="truncate flex-1 font-medium pr-2">{convo.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(convo.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-cyber-textSecondary hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer"
                title="Delete Chat"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* Drawer Footer */}
        <div className="text-[10px] text-cyber-textMuted text-center select-none pt-2 border-t border-cyber-cardBorder/30">
          ISTIYAK AI Companion v0.1.0
        </div>
      </div>
    </div>
  );
});

HistoryDrawer.displayName = "HistoryDrawer";
