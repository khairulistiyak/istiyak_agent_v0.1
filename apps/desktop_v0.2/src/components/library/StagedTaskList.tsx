import React from "react";
import { CheckSquare, Square } from "lucide-react";

interface StagedTask {
  id: string;
  label: string;
  status: "done" | "running" | "pending" | "failed";
}

interface StagedTaskListProps {
  tasks: StagedTask[];
  onToggleTask?: (id: string) => void;
}

export const StagedTaskList: React.FC<StagedTaskListProps> = ({ tasks, onToggleTask }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full max-w-sm border border-white/5 bg-black/10 p-2.5 rounded-xl">
      <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider pb-1.5 border-b border-white/[0.04] mb-1.5 text-left">
        Task Execution Checklist
      </div>
      {tasks.map((task) => {
        const isDone = task.status === "done";
        const isRunning = task.status === "running";
        const isFailed = task.status === "failed";
        
        return (
          <div 
            key={task.id} 
            onClick={() => onToggleTask && onToggleTask(task.id)}
            className="flex items-center gap-2.5 py-1 cursor-pointer select-none text-left"
          >
            {isDone ? (
              <CheckSquare className="w-3.5 h-3.5 text-emerald-500/80 flex-shrink-0" />
            ) : (
              <Square className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
            )}
            <span className={`text-[10px] font-sans font-medium transition-all ${
              isDone ? "text-gray-550 line-through" : isRunning ? "text-sky-400 font-bold" : isFailed ? "text-red-400 font-bold" : "text-gray-300"
            }`}>
              {task.label}
            </span>
            {isRunning && (
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse ml-auto" />
            )}
          </div>
        );
      })}
    </div>
  );
};
