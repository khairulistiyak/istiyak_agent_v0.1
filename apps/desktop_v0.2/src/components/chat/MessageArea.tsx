import React, { useEffect, useRef } from "react";
import { Message } from "../../types/index.js";
import { ChatBubble } from "./ChatBubble.js";
import { Sparkles } from "lucide-react";

interface MessageAreaProps {
  messages: Message[];
}

export const MessageArea: React.FC<MessageAreaProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 mb-4">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-gray-200 mb-1">
          Companion AI R&D Workspace
        </h3>
        <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
          Type a prompt below to see the premium glassmorphic chat bubble design and dynamic simulated model responses.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto px-4 py-6 flex flex-col gap-4 scrollbar-thin">
      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};
