import { useState, memo } from "react";
import type { UIMessage } from "ai";
import type { ParsedAgentMessage } from "../../types/chat.js";
import { AgentWorkflowPanel } from "./AgentWorkflowPanel.js";
import { PermissionCard } from "./PermissionCard.js";
import { MarkdownRenderer } from "./MarkdownRenderer.js";
import { CostBadge } from "./CostTracker.js";
import { FileCapsule } from "../ui/FileCapsule.js";

interface AssistantMessageProps {
  msg: UIMessage;
  parsed: ParsedAgentMessage;
  permissionStates: { [reqId: string]: "pending" | "approved" | "rejected" | "timed_out" };
  resolvedPermissionIds: Set<string>;
  onPermissionResponse: (reqId: string, approved: boolean) => void;
}

/* ── Tool card helpers ── */

function extractFilePath(content: string, params?: Record<string, string>): string | null {
  if (params?.file_path) return params.file_path;
  if (params?.path) return params.path;
  if (params?.target_path) return params.target_path;
  if (params?.file) return params.file;
  const match = content.match(/`([^`]+)`/);
  return match ? match[1] : null;
}

function extractFilePaths(content: string): string[] {
  const paths: string[] = [];
  const regex = /`([^`]+)`/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    paths.push(match[1]);
  }
  return paths;
}

/* File search card — matching `02-filesystem-tools.svg` flow 1 */
function FileSearchCard({ content, actionName }: { content: string; actionName?: string; params?: Record<string, string> }) {
  const timeMatch = content.match(/(\d+ms)/);
  const queryMatch = content.match(/"([^"]+)"/);
  const paths = extractFilePaths(content);
  return (
    <div className="my-2 rounded-xl border border-slate-800 bg-[#0a0d14] px-3.5 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="h-2 w-2 rounded-full bg-blue-400" />
        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
          {actionName?.replace(/_/g, " ") || "Workspace Search"}
        </span>
        {timeMatch && <span className="text-[10px] text-slate-500 font-mono">{timeMatch[1]}</span>}
      </div>
      {queryMatch && (
        <p className="text-[11px] font-mono text-slate-400 mb-2">
          <span className="text-slate-500">Query:</span> &ldquo;{queryMatch[1]}&rdquo;
        </p>
      )}
      <div className="space-y-1.5">
        {paths.slice(0, 4).map((p, i) => (
          <FileCapsule key={i} filePath={p} />
        ))}
        {paths.length > 4 && (
          <p className="text-[10px] text-slate-600">+{paths.length - 4} more results</p>
        )}
      </div>
    </div>
  );
}

/* File read card — `02-filesystem-tools.svg` flow 2 */
function FileReadCard({ filePath, content }: { filePath: string; content: string }) {
  const metaMatch = content.match(/(\d+\.?\d*KB).*?(\d+)\s*lines/i);
  const cacheMatch = content.match(/cache:\s*(HIT|MISS)/i);
  const timeMatch = content.match(/(\d+ms)/);
  return (
    <div className="my-2 rounded-xl border border-slate-800 bg-[#0a0d14] px-3.5 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="h-2 w-2 rounded-full bg-sky-400" />
        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Read File</span>
        {timeMatch && <span className="text-[10px] text-slate-500 font-mono">{timeMatch[1]}</span>}
      </div>
      <FileCapsule filePath={filePath} />
      {metaMatch && (
        <p className="mt-1 text-[10px] text-slate-500 font-mono">
          {metaMatch[1]} • {metaMatch[2]} lines
          {cacheMatch && <span className="ml-2 text-emerald-500">cache: {cacheMatch[1]}</span>}
        </p>
      )}
    </div>
  );
}

/* Diff card — inline diff for write operations */
function DiffCard({ filePath, content }: { filePath: string; content: string }) {
  const additions = (content.match(/\+/g) || []).length;
  const deletions = (content.match(/-/g) || []).length;
  const diffLines = content.split("\n").filter(l => l.trim().startsWith("+") || l.trim().startsWith("-")).slice(0, 6);
  return (
    <div className="my-2 rounded-xl border border-slate-800 bg-[#0a0d14] px-3.5 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="h-2 w-2 rounded-full bg-purple-400" />
        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Write modifications</span>
        <span className="text-[10px] font-mono">
          <span className="text-emerald-400">+{additions}</span> <span className="text-red-400">-{deletions}</span>
        </span>
      </div>
      <FileCapsule filePath={filePath} />
      {diffLines.length > 0 && (
        <div className="mt-2 rounded border border-slate-800 bg-[#05060b] p-2 font-mono text-[10px] leading-relaxed overflow-x-auto">
          {diffLines.slice(0, 5).map((line, i) => (
            <div key={i} className={line.trim().startsWith("+") ? "text-emerald-400" : "text-red-400"}>
              {line}
            </div>
          ))}
          {diffLines.length > 5 && <p className="text-slate-600">...</p>}
        </div>
      )}
    </div>
  );
}

/* Command execution card — `03-terminal-git-tools.svg` flow 1 */
function CommandCard({ content, actionName }: { content: string; actionName?: string }) {
  const cmdMatch = content.match(/`([^`]+)`/);
  const pidMatch = content.match(/PID:\s*(\d+)/i);
  const successMatch = content.match(/exit(?:ed)?.*?0/i);
  const errorMatch = content.match(/exit(?:ed)?.*?(?:1|failure)/i);
  return (
    <div className="my-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.02] px-3.5 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
          {actionName?.replace(/_/g, " ") || "Run Command"}
        </span>
        {pidMatch && <span className="text-[10px] text-slate-500 font-mono">PID: {pidMatch[1]}</span>}
        {successMatch && <span className="text-[10px] text-emerald-400">✓ success</span>}
        {errorMatch && <span className="text-[10px] text-red-400">✗ failed</span>}
      </div>
      {cmdMatch && (
        <code className="block rounded border border-slate-800 bg-[#0b0c0e] px-2.5 py-2 font-mono text-[10.5px] text-slate-200 break-all">
          $ {cmdMatch[1]}
        </code>
      )}
    </div>
  );
}

/* Git status card — `03-terminal-git-tools.svg` flow 2 */
function GitStatusCard({ content }: { content: string }) {
  const branchMatch = content.match(/branch\s+`?([^`\s]+)`?/i);
  const files = extractFilePaths(content);
  return (
    <div className="my-2 rounded-xl border border-slate-800 bg-[#0a0d14] px-3.5 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Git Status</span>
      </div>
      {branchMatch && <p className="text-[10px] text-slate-500 mb-2">Branch <span className="text-white font-mono">{branchMatch[1]}</span></p>}
      {files.map((f, i) => (
        <FileCapsule key={i} filePath={f} />
      ))}
    </div>
  );
}

/* Web search card — `04-web-search-tools.svg` */
function WebSearchCard({ content }: { content: string }) {
  const resultMatch = content.match(/(\d+)\s*results?/i);
  const timeMatch = content.match(/(\d+ms)/i);
  const paths = extractFilePaths(content);
  return (
    <div className="my-2 rounded-xl border border-slate-800 bg-[#0a0d14] px-3.5 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="h-2 w-2 rounded-full bg-cyan-400" />
        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Web Search</span>
        {resultMatch && <span className="text-[10px] text-slate-500">{resultMatch[1]}</span>}
        {timeMatch && <span className="text-[10px] text-slate-500 font-mono">{timeMatch[1]}</span>}
      </div>
      <p className="text-[11px] font-mono text-slate-400 break-all">&ldquo;{paths[0] || content.substring(0, 80)}&rdquo;</p>
    </div>
  );
}

/* Memory card — `05-agent-memory-planning.svg` flow 1 */
function MemoryCard({ content }: { content: string }) {
  return (
    <div className="my-2 rounded-xl border border-slate-800 bg-[#0a0d14] px-3.5 py-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="h-2 w-2 rounded-full bg-violet-400" />
        <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Memory</span>
      </div>
      <p className="text-[11px] text-slate-400">{content}</p>
    </div>
  );
}

/* Session walkthrough — `10-session-walkthrough.svg` */
type CostMeta = { cost: string; tokens: number };
function SessionWalkthroughCard({ content, costMeta }: { content: string; costMeta?: CostMeta }) {
  const isComplete = content.toLowerCase().includes("task completed") || content.toLowerCase().includes("successfully");
  if (!isComplete) return null;

  const fileMods = extractFilePaths(content);
  return (
    <div className="my-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] px-4 py-3.5">
      <div className="flex items-center gap-2 mb-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-900/50 border border-emerald-500/50">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4 7L8 3" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="text-xs font-bold text-emerald-400">Objective Successfully Resolved</span>
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed">{content.replace(/[*`]/g, "")}</p>
      {fileMods.length > 0 && (
        <div className="mt-2 space-y-1">
          {fileMods.map((f, i) => <FileCapsule key={i} filePath={f} />)}
        </div>
      )}
      {costMeta && (
        <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500">
          <span>Runtime: <span className="text-white font-mono">—</span></span>
          <span>Cost: <span className="text-emerald-400 font-bold">${costMeta.cost}</span></span>
          <span>Tokens: <span className="text-white font-mono">{costMeta.tokens}</span></span>
        </div>
      )}
    </div>
  );
}

/* ── Action routing ── */
function classifyStep(actionName?: string): "file_search" | "file_read" | "file_write" | "command" | "git" | "web" | "memory" | "session" | "other" {
  if (!actionName) return "other";
  const name = actionName.toLowerCase();
  if (["search_workspace", "scan_project", "list_files", "grep_search"].includes(name)) return "file_search";
  if (["read_file"].includes(name)) return "file_read";
  if (["write_file", "precise_edit", "ast_edit", "multi_replace_file_content", "replace_file_content", "rename", "move", "delete"].includes(name)) return "file_write";
  if (["run_command", "sandbox"].includes(name)) return "command";
  if (["git_status", "git_diff", "git_log", "git_commit", "git_branch", "git_checkout", "git_stash"].includes(name)) return "git";
  if (["google_search", "fetch_url", "crawl_website", "url_context"].includes(name)) return "web";
  if (["read_memory", "write_memory", "compress_memory", "summarize_memory"].includes(name)) return "memory";
  if (["done", "walkthrough"].includes(name)) return "session";
  return "other";
}

interface PlanningStep {
  phase: string;
  tasks: string[];
}

interface PlanningData {
  title: string;
  objective: string;
  steps: PlanningStep[];
}

function tryParsePlanningJson(text: string): PlanningData | null {
  try {
    const trimmed = text.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && parsed.title && Array.isArray(parsed.steps)) {
        return parsed as PlanningData;
      }
    }
  } catch {
    // Ignore
  }
  return null;
}

function PlanningCard({ data }: { data: PlanningData }) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const toggleTask = (key: string) => {
    setCompleted(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="my-3.5 overflow-hidden rounded-xl border border-violet-500/25 bg-[#0e0a14] p-4 shadow-xl select-text animate-slide-up">
      {/* Header with Violet glowing indicator */}
      <div className="flex items-center gap-2 mb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-violet-400 animate-zenglow" />
        <span className="text-[9.5px] font-bold text-violet-300 uppercase tracking-wider">
          Architecture & Implementation Plan
        </span>
      </div>

      <h3 className="text-base font-bold text-white mb-2">{data.title}</h3>
      {data.objective && (
        <p className="text-[11.5px] text-slate-400 mb-4 leading-relaxed bg-[#1c1426]/30 p-2.5 rounded-lg border border-violet-900/20 italic">
          <strong className="text-violet-300 font-semibold not-italic mr-1.5">Objective:</strong> {data.objective}
        </p>
      )}

      <div className="space-y-4">
        {data.steps.map((step, idx) => (
          <div key={idx} className="border-l border-violet-800/40 pl-3.5 ml-1.5 space-y-2">
            <h4 className="text-[11px] font-bold text-violet-200 uppercase tracking-wider">
              {step.phase}
            </h4>
            <div className="space-y-1.5">
              {step.tasks.map((task, tidx) => {
                const key = `${idx}-${tidx}`;
                const isDone = !!completed[key];
                return (
                  <div key={tidx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <button
                      type="button"
                      onClick={() => toggleTask(key)}
                      className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-all duration-200 ${
                        isDone
                          ? "bg-violet-500/20 border-violet-400 text-violet-300"
                          : "border-slate-700 bg-slate-800/40 hover:border-violet-500/50"
                      }`}
                    >
                      {isDone && <span className="text-[8px] font-extrabold">✓</span>}
                    </button>
                    <span className={`leading-relaxed transition-all duration-200 ${isDone ? "line-through text-slate-500" : ""}`}>{task}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const AssistantMessage = memo(
  ({
    msg,
    parsed,
    permissionStates,
    resolvedPermissionIds,
    onPermissionResponse,
  }: AssistantMessageProps) => {
    const { steps, permissionRequests, cleanText, costMeta } = parsed;

    const isWorkflow = steps.some(
      (s) =>
        s.status === "action" ||
        (s.actionName && s.actionName !== "done") ||
        (s.content &&
          (s.content.includes("read_file") ||
            s.content.includes("write_to_file") ||
            s.content.includes("replace_file_content") ||
            s.content.includes("multi_replace_file_content") ||
            s.content.includes("run_command") ||
            s.content.includes("grep_search") ||
            s.content.includes("list_dir") ||
            s.content.includes("search_web") ||
            s.content.includes("browser_subagent") ||
            s.content.includes("generate_image")))
    );

    return (
      <div className="grid w-full grid-cols-[28px_1fr] gap-3 animate-slide-up">
        <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-[10px] font-bold text-white">
          AI
        </div>

        <div className="w-full max-w-[760px] space-y-3 text-sm leading-6 text-slate-300">
          {isWorkflow && steps.length > 0 && <AgentWorkflowPanel steps={steps} />}

          {/* Permission requests */}
          {permissionRequests
            .filter((req) => !resolvedPermissionIds.has(req.id) || permissionStates[req.id])
            .map((req) => {
              const state = permissionStates[req.id] || "pending";
              return (
                <PermissionCard
                  key={req.id}
                  request={req}
                  state={state}
                  onApprove={() => onPermissionResponse(req.id, true)}
                  onReject={() => onPermissionResponse(req.id, false)}
                />
              );
            })}

          {/* Tool-specific cards for the latest action step */}
          {steps
            .filter((s) => s.status === "action" || s.status === "success")
            .slice(-1)
            .map((s, i) => {
              const kind = classifyStep(s.actionName);
              const filePath = extractFilePath(s.content, s.params);

              switch (kind) {
                case "file_search":
                  return <FileSearchCard key={`tool-${i}`} content={s.content} actionName={s.actionName} params={s.params} />;
                case "file_read":
                  return filePath ? <FileReadCard key={`tool-${i}`} filePath={filePath} content={s.content} /> : null;
                case "file_write":
                  return filePath ? <DiffCard key={`tool-${i}`} filePath={filePath} content={s.content} /> : null;
                case "command":
                  return <CommandCard key={`tool-${i}`} content={s.content} actionName={s.actionName} />;
                case "git":
                  return <GitStatusCard key={`tool-${i}`} content={s.content} />;
                case "web":
                  return <WebSearchCard key={`tool-${i}`} content={s.content} />;
                case "memory":
                  return <MemoryCard key={`tool-${i}`} content={s.content} />;
                case "session":
                  return <SessionWalkthroughCard key={`tool-${i}`} content={s.content} costMeta={costMeta} />;
                default:
                  return null;
              }
            })}

          {/* Clean markdown text or Custom Planning card */}
          {cleanText && (() => {
            const planningData = tryParsePlanningJson(cleanText);
            if (planningData) {
              return <PlanningCard data={planningData} />;
            }
            return (
              <div className="w-full select-text text-sm font-medium leading-6 text-slate-300">
                <MarkdownRenderer text={cleanText} messageId={msg.id} />
              </div>
            );
          })()}

          <CostBadge costMeta={costMeta} />
        </div>
      </div>
    );
  }
);

AssistantMessage.displayName = "AssistantMessage";
