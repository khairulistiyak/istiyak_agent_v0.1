import React from "react";
import { CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react";

export interface TaskItem {
  id: string;
  label: string;
  description: string;
  status: "done" | "running" | "pending" | "failed";
}

interface AgentTaskPlannerProps {
  tasks: TaskItem[];
  onToggleTask?: (id: string) => void;
}

export const AgentTaskPlanner: React.FC<AgentTaskPlannerProps> = ({ tasks, onToggleTask }) => {
  const completedCount = tasks.filter(t => t.status === "done").length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const getStatusIcon = (status: TaskItem["status"]) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="w-4 h-4 text-white" />;
      case "running":
        return <Loader2 className="w-4 h-4 text-white animate-spin" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      case "pending":
      default:
        return <Circle className="w-4 h-4 text-gray-650" />;
    }
  };

  const getStatusTextClass = (status: TaskItem["status"]) => {
    switch (status) {
      case "done":
        return "text-gray-400 line-through";
      case "running":
        return "text-white font-bold";
      case "failed":
        return "text-gray-500";
      case "pending":
      default:
        return "text-gray-300";
    }
  };

  return (
    <div className="flex flex-col p-4 border border-white/[0.04] bg-black/40 rounded-2xl gap-3 text-left w-full">
      <div className="flex justify-between items-center border-b border-white/[0.04] pb-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">Agent Checklist & Plan</span>
          <span className="text-[8px] text-gray-500 font-mono">Dynamic execution phases</span>
        </div>
        <span className="text-[10px] font-mono text-gray-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full font-bold">
          {progressPercent}% Complete
        </span>
      </div>

      {/* Progress slider bar */}
      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-white h-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Checklist list */}
      <div className="flex flex-col gap-2 mt-1">
        {tasks.map((task) => (
          <div 
            key={task.id}
            onClick={() => onToggleTask && onToggleTask(task.id)}
            className={`flex gap-3 p-2.5 border rounded-xl items-center transition-all cursor-pointer ${
              task.status === "running" 
                ? "border-white/15 bg-white/[0.02]" 
                : "border-white/[0.03] bg-transparent hover:bg-white/[0.01]"
            }`}
          >
            <div className="shrink-0">{getStatusIcon(task.status)}</div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className={`text-[11px] font-mono leading-tight ${getStatusTextClass(task.status)}`}>
                {task.label}
              </span>
              <span className="text-[8.5px] text-gray-600 font-mono truncate leading-normal mt-0.5">
                {task.description}
              </span>
            </div>
            {task.status === "running" && (
              <span className="text-[7.5px] font-mono text-white/55 px-1.5 py-0.5 border border-white/10 bg-white/5 rounded-full uppercase tracking-wider animate-pulse shrink-0">
                Active Step
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
