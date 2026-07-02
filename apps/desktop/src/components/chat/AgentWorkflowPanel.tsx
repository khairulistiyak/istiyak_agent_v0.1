import { memo } from "react";
import type { AgentStep } from "../../types/chat.js";
import { FileCapsule } from "../ui/FileCapsule.js";

interface AgentWorkflowPanelProps {
  steps: AgentStep[];
}

function getStepIcon(status: string) {
  switch (status) {
    case "success":
      return (
        <span className="relative flex h-4 w-4 items-center justify-center">
          <span className="absolute h-2.5 w-2.5 rounded-full bg-emerald-400/30 animate-ping" />
          <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
        </span>
      );
    case "action":
      return (
        <span className="relative flex h-4 w-4 items-center justify-center">
          <span className="absolute h-2.5 w-2.5 rounded-full bg-purple-400/30 animate-pulse" />
          <span className="relative h-2 w-2 rounded-full bg-purple-400" />
        </span>
      );
    case "thought":
    case "reflecting":
      return (
        <span className="relative flex h-4 w-4 items-center justify-center">
          <span className="absolute h-2.5 w-2.5 rounded-full bg-blue-400/30 animate-pulse" />
          <span className="relative h-2 w-2 rounded-full bg-blue-400" />
        </span>
      );
    case "error":
      return (
        <span className="flex h-4 w-4 items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="4" fill="#ef4444" fillOpacity="0.3" />
            <line x1="3.5" y1="3.5" x2="6.5" y2="6.5" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="6.5" y1="3.5" x2="3.5" y2="6.5" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </span>
      );
    case "aborted":
      return (
        <span className="flex h-4 w-4 items-center justify-center">
          <polygon points="3,2 8,5 3,8" fill="#f59e0b" />
        </span>
      );
    default:
      return <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />;
  }
}

function isWriteAction(name?: string) {
  if (!name) return false;
  const writes = ["write_file", "precise_edit", "ast_edit", "create_directory", "rename", "move", "delete", "multi_replace_file_content", "replace_file_content"];
  return writes.includes(name);
}

function isReadAction(name?: string) {
  if (!name) return false;
  const reads = ["read_file", "list_files", "scan_project", "search_workspace", "grep_search"];
  return reads.includes(name);
}

function isCommandAction(name?: string) {
  if (!name) return false;
  return name === "run_command" || name === "sandbox";
}

function isGitAction(name?: string) {
  if (!name) return false;
  const gits = ["git_status", "git_diff", "git_commit", "git_branch", "git_checkout", "git_stash", "git_log"];
  return gits.includes(name);
}

function isWebAction(name?: string) {
  if (!name) return false;
  return name === "google_search" || name === "fetch_url" || name === "crawl_website" || name === "url_context";
}

function isMemoryAction(name?: string) {
  if (!name) return false;
  const memories = ["read_memory", "write_memory", "compress_memory", "summarize_memory"];
  return memories.includes(name);
}

function isAgentAction(name?: string) {
  if (!name) return false;
  return name === "delegate_agent" || name === "spawn_sub_agent" || name === "merge_result";
}

type BadgeDef = { label: string; color: string; dot: string; bg: string };
function getActionBadge(name?: string): BadgeDef | null {
  if (isWriteAction(name)) return { label: "write", color: "text-purple-400", dot: "bg-purple-400", bg: "#a855f7" };
  if (isReadAction(name)) return { label: "read", color: "text-blue-400", dot: "bg-blue-400", bg: "#3b82f6" };
  if (isCommandAction(name)) return { label: "cmd", color: "text-amber-400", dot: "bg-amber-400", bg: "#f59e0b" };
  if (isGitAction(name)) return { label: "git", color: "text-emerald-400", dot: "bg-emerald-400", bg: "#10b981" };
  if (isWebAction(name)) return { label: "web", color: "text-cyan-400", dot: "bg-cyan-400", bg: "#06b6d4" };
  if (isMemoryAction(name)) return { label: "memory", color: "text-violet-400", dot: "bg-violet-400", bg: "#8b5cf6" };
  if (isAgentAction(name)) return { label: "agent", color: "text-pink-400", dot: "bg-pink-400", bg: "#ec4899" };
  return null;
}

function extractFilePath(content: string, params?: Record<string, string>): string | null {
  if (params?.file_path) return params.file_path;
  if (params?.path) return params.path;
  if (params?.target_path) return params.target_path;
  const pathMatch = content.match(/`([^`]+)`/);
  if (pathMatch) return pathMatch[1];
  return null;
}

function extractCommand(content: string, params?: Record<string, string>): string | null {
  if (params?.command) return params.command;
  const cmdMatch = content.match(/`([^`]+)`/);
  if (cmdMatch) return cmdMatch[1];
  return null;
}

export const AgentWorkflowPanel = memo(({ steps }: AgentWorkflowPanelProps) => {
  const completedCount = steps.filter((s) => s.status === "success").length;
  const totalSteps = steps.length;
  const percent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
  const visibleSteps = steps.slice(-8);
  const hasAction = visibleSteps.some((s) => s.status === "action");

  return (
    <div className="my-3 w-full max-w-[720px] select-none rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
      {/* Header with progress */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          <span className={`h-1.5 w-1.5 rounded-full ${hasAction ? "bg-purple-400 animate-pulse" : "bg-cyan-300"}`} />
          {hasAction ? "Agent executing" : "Agent activity"}
        </div>
        <span className="text-[10px] text-slate-500 font-mono">{percent}% ({completedCount}/{totalSteps})</span>
      </div>

      {/* Progress bar */}
      {totalSteps > 1 && (
        <div className="mb-3 h-1 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      {/* Steps timeline */}
      <div className="space-y-2 relative">
        {visibleSteps.map((s, idx) => {
          const filePath = extractFilePath(s.content, s.params);
          const command = extractCommand(s.content, s.params);
          const badge = getActionBadge(s.actionName);

          return (
            <div key={idx} className="flex items-start gap-2.5 text-[11px] leading-5">
              {/* Connector line */}
              {idx < visibleSteps.length - 1 && (
                <div className="absolute left-[5px] top-4 h-[calc(100%+4px)] w-px bg-slate-800" style={{ zIndex: 0 }} />
              )}

              {/* Icon */}
              <div className="relative z-10 mt-0.5 shrink-0">
                {getStepIcon(s.status)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {s.actionName && (
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider ${
                        s.status === "success" ? "text-emerald-400" :
                        s.status === "error" ? "text-red-400" :
                        s.status === "aborted" ? "text-amber-400" :
                        "text-cyan-300"
                      }`}
                    >
                      {s.actionName.replace(/_/g, " ")}
                    </span>
                  )}
                  {badge && (
                    <span className={`inline-flex items-center gap-1 rounded px-1 py-0.5 text-[8px] font-bold uppercase tracking-wider ${badge.color}`}
                      style={{ backgroundColor: `${badge.bg}15` }}
                    >
                      <span className={`h-1 w-1 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  )}
                  {s.status === "success" && <span className="text-[9px] text-emerald-400/70">✓ done</span>}
                  {s.status === "action" && <span className="text-[9px] text-purple-400/70 animate-pulse">● active</span>}
                  {s.status === "error" && <span className="text-[9px] text-red-400/70">✗ failed</span>}
                  {s.status === "reflecting" && <span className="text-[9px] text-blue-400/70">⟳ reflecting</span>}
                </div>

                <div className="text-slate-400 mt-0.5 leading-relaxed">
                  {s.content && (
                    <span className="text-[10.5px]">{s.content}</span>
                  )}
                </div>

                {/* File path capsule */}
                {filePath && (
                  <div className="mt-1">
                    <FileCapsule filePath={filePath} />
                  </div>
                )}

                {/* Command display */}
                {command && !filePath && (
                  <div className="mt-1 text-[10px] font-mono text-slate-500 bg-slate-800/50 rounded px-2 py-1 truncate">
                    $ {command}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

AgentWorkflowPanel.displayName = "AgentWorkflowPanel";
