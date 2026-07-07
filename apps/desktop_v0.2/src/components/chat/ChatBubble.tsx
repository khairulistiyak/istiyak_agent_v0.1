import React from "react";
import { Message } from "../../types/index.js";
import { Cpu, User } from "lucide-react";

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full gap-4 items-start ${isUser ? "justify-end" : "justify-start"} py-2`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-md bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-gray-500 flex-shrink-0 mt-0.5">
          <Cpu className="w-3.5 h-3.5" />
        </div>
      )}

      <div className={`flex-1 flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}>
        {/* Message Header (Sender name + Timestamp) */}
        <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-wider text-gray-500 uppercase">
          <span>{isUser ? "User" : "Agent"}</span>
          <span className="text-gray-700 font-normal">•</span>
          <span className="text-gray-600 font-normal lowercase">{message.timestamp}</span>
        </div>

        {/* Content Box */}
        <div
          className={`text-xs leading-relaxed whitespace-pre-wrap w-full ${
            isUser
              ? "bg-white/[0.03] border border-white/[0.06] px-3.5 py-2.5 rounded-xl text-gray-200 max-w-2xl shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
              : "text-gray-300 py-0.5"
          }`}
        >
          {message.content}
        </div>
      </div>

      {isUser && (
        <div className="w-6 h-6 rounded-md bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-gray-500 flex-shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
};
