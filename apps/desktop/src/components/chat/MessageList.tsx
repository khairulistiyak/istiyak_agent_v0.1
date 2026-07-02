import { memo, useRef, useEffect } from "react";
import type { UIMessage } from "ai";
import { Bot } from "lucide-react";
import { parseAgentMessage } from "../../utils/parser.js";
import type { ParsedAgentMessage } from "../../types/chat.js";
import { UserMessage } from "./MessageBubble.js";
import { AssistantMessage } from "./AssistantMessage.js";

const getMessageText = (msg: UIMessage): string => {
  const raw = msg as UIMessage & { content?: string };
  if (raw.content) return raw.content;
  if (!msg.parts) return "";
  return msg.parts
    .filter((part) => part.type === "text")
    .map((part) => (part as { type: "text"; text: string }).text)
    .join("");
};

/* ── Welcome Screen matching 14-chat-welcome-screen.svg ── */
const WELCOME_SUGGESTIONS = [
  {
    title: "Scan workspace for storage issues",
    desc: "Find and fix potential memory and storage problems",
  },
  {
    title: "Refactor Zustand store to IndexedDB",
    desc: "Migrate state persistence to async DB storage",
  },
  {
    title: "Create a React theme selector component",
    desc: "Build a reusable dark/light theme switcher",
  },
  {
    title: "Add compile test script to build pipeline",
    desc: "Add test runner and CI compilation checks",
  },
];

function WelcomeScreen({ onSuggestionClick }: { onSuggestionClick?: (prompt: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-6">
      {/* Brand icon — minimal hexagon (14-welcome spec) */}
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div className="absolute h-12 w-12 rotate-45 rounded-lg border border-cyan-400/40 bg-cyan-400/5" />
        <div className="absolute h-8 w-8 rotate-12 rounded-md border border-cyan-400/60 bg-cyan-400/10" />
        <Bot size={20} className="relative text-cyan-300" />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-white">
        How can I help you today?
      </h3>
      <p className="mt-2 max-w-[420px] text-sm leading-6 text-slate-500">
        Choose a template below or press <span className="inline-flex items-center gap-0.5 rounded border border-slate-700 bg-slate-800 px-1 py-0.5 text-[9px] font-bold text-slate-300">⌘K</span> to select agent tools configuration.
      </p>

      <div className="mt-6 grid w-full max-w-[540px] grid-cols-2 gap-3 text-left">
        {WELCOME_SUGGESTIONS.map((item, i) => (
          <div
            key={i}
            onClick={() => onSuggestionClick?.(item.title)}
            className="rounded-xl border border-slate-800 bg-[#11131e] px-3.5 py-3 transition-colors duration-200 hover:border-cyan-400/30 hover:bg-cyan-400/[0.02] cursor-pointer"
          >
            <p className="text-sm font-medium text-slate-200">{item.title}</p>
            <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}



interface MessageListProps {
  messages: UIMessage[];
  isLoading: boolean;
  permissionStates: { [reqId: string]: "pending" | "approved" | "rejected" | "timed_out" };
  resolvedPermissionIds: Set<string>;
  onPermissionResponse: (reqId: string, approved: boolean) => void;
  onSuggestionClick?: (value: string) => void;
}

export const MessageList = memo(
  ({
    messages,
    isLoading,
    permissionStates,
    resolvedPermissionIds,
    onPermissionResponse,
    onSuggestionClick,
  }: MessageListProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const parseCacheRef = useRef<Map<string, { text: string; parsed: ParsedAgentMessage }>>(
      new Map()
    );

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    // Clean stale parse cache entries when messages change
    useEffect(() => {
      const activeIds = new Set(messages.map((m) => m.id));
      for (const id of parseCacheRef.current.keys()) {
        if (!activeIds.has(id)) parseCacheRef.current.delete(id);
      }
    }, [messages]);

    return (
      <div className="flex-1 overflow-y-auto px-6 py-7 space-y-7 bg-[#0a0d14]">
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestionClick={onSuggestionClick} />
        ) : (
          messages.map((msg) => {
            if (msg.role === "user") {
              return <UserMessage key={msg.id} msg={msg} />;
            }

            // Compute parser only once per message
            const rawText = getMessageText(msg);
            const cached = parseCacheRef.current.get(msg.id);
            let parsed: ParsedAgentMessage;
            if (cached && cached.text === rawText) {
              parsed = cached.parsed;
            } else {
              parsed = parseAgentMessage(rawText);
              parseCacheRef.current.set(msg.id, { text: rawText, parsed });
            }

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
