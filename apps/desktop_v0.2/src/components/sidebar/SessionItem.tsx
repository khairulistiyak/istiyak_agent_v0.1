import React from "react";
import { ChatSession } from "../../types/index.js";
import { useChatStore } from "../../store/useChatStore.js";
import { MessageSquare, Trash2 } from "lucide-react";
import { GlassButton } from "../ui/GlassButton.js";

interface SessionItemProps {
  session: ChatSession;
}

export const SessionItem: React.FC<SessionItemProps> = ({ session }) => {
  const { activeSessionId, selectSession, deleteSession } = useChatStore();
  const isActive = activeSessionId === session.id;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession(session.id);
  };

  return (
    <div
      onClick={() => selectSession(session.id)}
      className={`group w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 border ${
        isActive
          ? "bg-white/5 border-white/10 text-white"
          : "bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200"
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden flex-1">
        <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-500"}`} />
        <div className="flex flex-col text-left overflow-hidden">
          <span className="text-xs font-medium truncate leading-tight">
            {session.title}
          </span>
          <span className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">
            {session.activeModel}
          </span>
        </div>
      </div>

      <GlassButton
        onClick={handleDelete}
        variant="ghost"
        size="xs"
        className="opacity-0 group-hover:opacity-100 flex-shrink-0 !border-transparent hover:!bg-white/5 hover:!text-white"
        title="Delete Session"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </GlassButton>
    </div>
  );
};
