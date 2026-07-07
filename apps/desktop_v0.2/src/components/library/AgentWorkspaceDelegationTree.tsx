import React from "react";
import { Users } from "lucide-react";

interface DelegatedAgent {
  id: string;
  name: string;
  activeFile: string;
  tasksCount: number;
}

interface AgentWorkspaceDelegationTreeProps {
  agents: DelegatedAgent[];
  onSelectAgent?: (id: string) => void;
}

export const AgentWorkspaceDelegationTree: React.FC<AgentWorkspaceDelegationTreeProps> = ({
  agents,
  onSelectAgent
}) => {
  return (
    <div className="flex flex-col gap-2 w-full max-w-sm border border-white/5 bg-black/15 p-3 rounded-xl text-left">
      <div className="flex items-center gap-1.5 border-b border-white/[0.04] pb-1.5 mb-1">
        <Users className="w-3.5 h-3.5 text-gray-550" />
        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Active Agent Grid Workspace</span>
      </div>
      <div className="flex flex-col gap-2">
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => onSelectAgent?.(agent.id)}
            className="flex items-center justify-between p-2 border border-white/[0.03] bg-white/[0.005] hover:bg-white/[0.02] rounded-lg cursor-pointer transition-colors"
          >
            <div className="flex flex-col overflow-hidden max-w-[170px]">
              <span className="text-[10px] font-bold text-gray-300 truncate">{agent.name}</span>
              <span className="text-[8px] font-mono text-gray-505 truncate mt-0.5" title={agent.activeFile}>
                Focus: {agent.activeFile.split("/").pop()}
              </span>
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              <span className="text-[8px] text-gray-600 font-bold uppercase">Active Runs</span>
              <span className="text-[9.5px] font-mono font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 rounded mt-0.5">
                {agent.tasksCount} tasks
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
