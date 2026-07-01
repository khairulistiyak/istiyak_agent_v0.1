import React from "react";
import { UIMessage } from "ai";
import { ParsedAgentMessage } from "../../types/chat.js";
import { AgentWorkflowPanel } from "./AgentWorkflowPanel.js";
import { PermissionCard } from "./PermissionCard.js";
import { MarkdownRenderer } from "./MarkdownRenderer.js";
import { CostBadge } from "./CostTracker.js";

interface AssistantMessageProps {
  msg: UIMessage;
  parsed: ParsedAgentMessage;
  permissionStates: { [reqId: string]: "pending" | "approved" | "rejected" | "timed_out" };
  resolvedPermissionIds: Set<string>;
  onPermissionResponse: (reqId: string, approved: boolean) => void;
}

export const AssistantMessage = React.memo(
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

          {cleanText && (
            <div className="w-full select-text text-sm font-medium leading-6 text-slate-300">
              <MarkdownRenderer text={cleanText} messageId={msg.id} />
            </div>
          )}

          <CostBadge costMeta={costMeta} />
        </div>
      </div>
    );
  }
);

AssistantMessage.displayName = "AssistantMessage";
