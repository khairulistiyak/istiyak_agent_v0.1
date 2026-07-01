import React, { useRef, useEffect } from "react";
import { UIMessage } from "ai";
import { Bot } from "lucide-react";
import { parseAgentMessage } from "../../utils/parser.js";
import { UserMessage } from "./MessageBubble.js";
import { AssistantMessage } from "./AssistantMessage.js";

interface MessageListProps {
  messages: UIMessage[];
  isLoading: boolean;
  permissionStates: { [reqId: string]: "pending" | "approved" | "rejected" | "timed_out" };
  resolvedPermissionIds: Set<string>;
  onPermissionResponse: (reqId: string, approved: boolean) => void;
}

const getMessageText = (msg: UIMessage): string => {
  const rawMsg = msg as any;
  if (rawMsg.content) return rawMsg.content;
  if (!msg.parts) return "";
  return msg.parts
    .filter((part) => part.type === "text")
    .map((part: any) => part.text)
    .join("");
};

export const MessageList = React.memo(
  ({
    messages,
    isLoading,
    permissionStates,
    resolvedPermissionIds,
    onPermissionResponse,
  }: MessageListProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
      <div className="flex-1 overflow-y-auto px-6 py-7 space-y-7 bg-[#0a0d14]">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-[0_0_24px_rgba(6,182,212,0.22)]">
              <Bot size={24} className="text-white" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-white">What do you want to work on?</h3>
            <p className="mt-2 max-w-[420px] text-sm leading-6 text-slate-500">
              Ask questions in Chat or Plan mode, inspect code in Assist mode, and switch to Agent
              mode only when you want edits or commands.
            </p>
            <div className="mt-6 grid w-full max-w-[520px] grid-cols-2 gap-3 text-left">
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <p className="text-sm font-medium text-slate-200">Explain a problem</p>
                <p className="mt-1 text-xs text-slate-500">No files touched in Chat mode.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                <p className="text-sm font-medium text-slate-200">Plan a fix</p>
                <p className="mt-1 text-xs text-slate-500">Roadmap first, action later.</p>
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.role === "user") {
              return <UserMessage key={msg.id} msg={msg} />;
            }

            // Compute parser only once per message
            const rawText = getMessageText(msg);
            const parsed = parseAgentMessage(rawText);

            return (
              <AssistantMessage
                key={msg.id}
                msg={msg}
                parsed={parsed}
                permissionStates={permissionStates}
                resolvedPermissionIds={resolvedPermissionIds}
                onPermissionResponse={onPermissionResponse}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    );
  }
);

MessageList.displayName = "MessageList";
