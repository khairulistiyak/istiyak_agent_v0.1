import React from "react";
import { Search } from "lucide-react";

interface AgentSearchStatusProps {
  query: string;
  status: "searching" | "indexing" | "done";
}

export const AgentSearchStatus: React.FC<AgentSearchStatusProps> = ({ query, status }) => {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-1.5 border border-white/[0.04] bg-white/[0.01] rounded-lg w-full max-w-sm">
      <div className="flex items-center gap-2 overflow-hidden">
        <Search className="w-3.5 h-3.5 text-gray-550 flex-shrink-0" />
        <span className="text-[10px] text-gray-400 font-mono truncate">Search: "{query}"</span>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[8px] text-sky-400 font-bold uppercase tracking-wider">
          {status}
        </span>
        {status === "searching" && (
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
        )}
      </div>
    </div>
  );
};
