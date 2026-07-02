import React from "react";
import { UIMessage } from "ai";
import { MarkdownRenderer } from "./MarkdownRenderer.js";

interface UserMessageProps {
  msg: UIMessage;
}

const getMessageText = (msg: UIMessage): string => {
  // `content` exists at runtime on UIMessage but isn't in the public type
  const raw = msg as UIMessage & { content?: string };
  if (raw.content) return raw.content;
  if (!msg.parts) return "";
  return msg.parts
    .filter((part) => part.type === "text")
    .map((part) => (part as { type: "text"; text: string }).text)
    .join("");
};

export const UserMessage = React.memo(({ msg }: UserMessageProps) => {
  const text = getMessageText(msg);

  return (
    <div className="flex w-full justify-end animate-slide-up">
      <div className="max-w-[78%] rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm leading-6 text-slate-100 shadow-sm select-text">
        <MarkdownRenderer text={text} messageId={msg.id} />
      </div>
    </div>
  );
});

UserMessage.displayName = "UserMessage";
export { UserMessage as MessageBubble }; // Keep alias for backward compatibility if needed
