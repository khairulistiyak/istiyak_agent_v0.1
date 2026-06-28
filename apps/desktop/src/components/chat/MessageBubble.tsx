import { Message } from "../../store/slices/chatSlice.js";

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%] p-3 rounded-lg ${isUser ? "bg-cyan-600 text-white rounded-br-none" : "bg-white/5 border border-white/10 text-white/90 rounded-bl-none"}`}>
        <p className="text-sm font-semibold mb-1 opacity-65">
          {isUser ? "You" : "Assistant"}
        </p>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </p>
      </div>
    </div>
  );
}
