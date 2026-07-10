import React, { useState } from "react";
import { Message } from "../../types/index.js";
import { Sparkles, Terminal } from "lucide-react";
import {
  AgentReadingFile,
  AgentWritingDiff,
  AgentToolBadge,
  AgentImplementationPlanCard,
  AgentThinkingBlock,
  AgentStepper,
  StagedTaskList,
  SubagentDelegationCard,
  InlineNotification,
  AgentDiffViewer,
  AgentPermissionRequestCard,
  AgentQuestionCard,
  AgentSearchStatus,
  AgentCommandExecution,
  CodeBlockPreview,
  TokenCostBreakdown,
  APIHealthMonitor,
  AgentPerformanceStats,
  BudgetGauge,
  AgentTimerStatus
} from "../library/index.js";

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";
  const [questionAnswer, setQuestionAnswer] = useState<string>("");
  const [permAnswered, setPermAnswered] = useState<"granted" | "denied" | null>(null);

  return (
    <div className={`flex w-full gap-4 items-start ${isUser ? "justify-end" : "justify-start"} py-2`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-md bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-gray-500 flex-shrink-0 mt-0.5">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      )}

      <div className={`flex-1 flex flex-col gap-2.5 ${isUser ? "items-end" : "items-start"}`}>
        {/* Message Header */}
        <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-wider text-gray-500 uppercase">
          <span>{isUser ? "User" : "Agent"}</span>
          <span className="text-gray-700 font-normal">•</span>
          <span className="text-gray-600 font-normal lowercase">{message.timestamp}</span>
        </div>

        {/* Content Box */}
        <div
          className={`text-xs leading-relaxed whitespace-pre-wrap w-full ${
            isUser
              ? "bg-white/[0.03] border border-white/[0.06] px-3.5 py-2.5 rounded-xl text-gray-300 max-w-2xl shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
              : "text-gray-400 py-0.5"
          }`}
        >
          {message.content}
        </div>

        {/* 1. Agent Thinking Block */}
        {!isUser && message.thinkingBlock && (
          <div className="w-full max-w-lg">
            <AgentThinkingBlock
              thoughts={message.thinkingBlock.thoughts}
              durationSec={message.thinkingBlock.durationSec}
              initialCollapsed={true}
            />
          </div>
        )}

        {/* 2. Permission Request Card */}
        {!isUser && message.permissionRequest && (
          <div className="w-full max-w-md">
            {permAnswered ? (
              <div className={`p-3 rounded-xl border text-[9px] font-bold uppercase tracking-widest flex items-center justify-between ${
                permAnswered === "granted"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
                <span>Permission {permAnswered === "granted" ? "Granted ✓" : "Denied ✗"}</span>
                <span className="font-mono text-[8px]">{message.permissionRequest.target}</span>
              </div>
            ) : (
              <AgentPermissionRequestCard
                action={message.permissionRequest.action}
                target={message.permissionRequest.target}
                reason={message.permissionRequest.reason}
                onGrant={() => setPermAnswered("granted")}
                onDeny={() => setPermAnswered("denied")}
              />
            )}
          </div>
        )}

        {/* 3. Clarification Question Card */}
        {!isUser && message.questionCard && (
          <div className="w-full max-w-md">
            {questionAnswer ? (
              <div className="p-3 rounded-xl border border-sky-500/20 bg-sky-500/[0.02] text-[9px] font-bold uppercase tracking-widest flex items-center justify-between text-sky-400">
                <span>Answered ✓</span>
                <span className="font-mono text-[8px] text-gray-400">{questionAnswer}</span>
              </div>
            ) : (
              <AgentQuestionCard
                question={message.questionCard.question}
                options={message.questionCard.options}
                selectedOption={questionAnswer}
                onSelect={setQuestionAnswer}
                onSubmit={() => {/* Confirmed */}}
              />
            )}
          </div>
        )}

        {/* 4. Staged Task List */}
        {!isUser && message.stagedTasks && message.stagedTasks.length > 0 && (
          <div className="w-full max-w-md">
            <StagedTaskList tasks={message.stagedTasks} />
          </div>
        )}

        {/* 5. Agent Stepper */}
        {!isUser && message.stepperSteps && message.stepperSteps.length > 0 && (
          <div className="w-full max-w-md">
            <AgentStepper steps={message.stepperSteps} />
          </div>
        )}

        {/* 6. Sub-agent Delegation Card */}
        {!isUser && message.subagentDelegation && (
          <div className="w-full max-w-md">
            <SubagentDelegationCard
              subagentId={`sa-${message.id.slice(-4)}`}
              taskName={message.subagentDelegation.task}
              status={message.subagentDelegation.status === "running" ? "running" : message.subagentDelegation.status === "completed" ? "completed" : "failed"}
              progressReport={message.subagentDelegation.model ? `Model: ${message.subagentDelegation.model} — Agent: ${message.subagentDelegation.agentName}` : undefined}
            />
          </div>
        )}

        {/* 7. Inline Notification */}
        {!isUser && message.notification && (
          <div className="w-full max-w-md">
            <InlineNotification
              type={message.notification.type}
              title={
                message.notification.type === "success" ? "Success" :
                message.notification.type === "warning" ? "Warning" :
                message.notification.type === "error" ? "Error" : "Info"
              }
              message={message.notification.message}
            />
          </div>
        )}

        {/* 8. Agent Diff Viewer */}
        {!isUser && message.diffLines && message.diffLines.length > 0 && (
          <div className="w-full max-w-lg">
            <AgentDiffViewer
              filePath="src/store/useChatStore.ts"
              lines={message.diffLines}
            />
          </div>
        )}

        {/* 9. File Monitor Section */}
        {!isUser && message.fileMonitor && (
          <div className="mt-1 p-3 border border-white/[0.04] bg-[#0c0d10]/60 rounded-xl flex flex-col gap-2.5 w-full max-w-md backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/[0.04] pb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              <span>Agent Activity & File Monitor</span>
            </div>

            {message.fileMonitor.files && message.fileMonitor.files.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {message.fileMonitor.files.map((f, idx) => (
                  <AgentReadingFile key={idx} filePath={f.filePath} linesRead={f.linesRead} status={f.status} />
                ))}
              </div>
            )}

            {message.fileMonitor.diffs && message.fileMonitor.diffs.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {message.fileMonitor.diffs.map((d, idx) => (
                  <AgentWritingDiff key={idx} filePath={d.filePath} diffSummary={d.diffSummary} progress={d.progress} additions={d.additions} deletions={d.deletions} />
                ))}
              </div>
            )}

            {message.fileMonitor.tools && message.fileMonitor.tools.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {message.fileMonitor.tools.map((t, idx) => (
                  <AgentToolBadge key={idx} toolName={t.toolName} status={t.status} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 10. Proposed Plan Card */}
        {!isUser && message.proposedPlan && (
          <div className="mt-2.5 w-full max-w-sm md:max-w-xl lg:max-w-3xl">
            <AgentImplementationPlanCard
              planTitle={message.proposedPlan.planTitle}
              description={message.proposedPlan.description}
              risks={message.proposedPlan.risks}
              proposedChanges={message.proposedPlan.proposedChanges}
              openQuestions={message.proposedPlan.openQuestions}
              showFooterActions={false}
              useGlobalStore={true}
            />
            {message.planReviewState && (
              <div className={`mt-2 p-2.5 rounded-xl border text-[9px] font-bold uppercase tracking-widest flex items-center justify-between ${
                message.planReviewState === "approved"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-450 shadow-[0_0_12px_rgba(16,185,129,0.06)]"
                  : "bg-red-500/10 border-red-500/20 text-red-450 shadow-[0_0_12px_rgba(239,68,68,0.06)]"
              }`}>
                <span>Plan Status</span>
                <span>{message.planReviewState}</span>
              </div>
            )}
          </div>
        )}

        {/* 11. Agent Search Status */}
        {!isUser && message.searchStatus && (
          <div className="w-full max-w-md">
            <AgentSearchStatus 
              query={message.searchStatus.query} 
              status={message.searchStatus.status} 
            />
          </div>
        )}

        {/* 12. Command Execution */}
        {!isUser && message.commandExecution && (
          <div className="w-full max-w-lg">
            <AgentCommandExecution
              command={message.commandExecution.command}
              status={message.commandExecution.status}
              output={message.commandExecution.output}
            />
          </div>
        )}

        {/* 13. Code Block Preview */}
        {!isUser && message.codeBlock && (
          <div className="w-full max-w-2xl">
            <CodeBlockPreview
              code={message.codeBlock.code}
              language={message.codeBlock.language}
              fileName={message.codeBlock.fileName}
              fileSize={message.codeBlock.fileSize}
            />
          </div>
        )}

        {/* 14. Token Cost Breakdown */}
        {!isUser && message.tokenUsage && (
          <div className="w-full max-w-md">
            <TokenCostBreakdown
              inputTokens={message.tokenUsage.inputTokens}
              outputTokens={message.tokenUsage.outputTokens}
              cachedTokens={message.tokenUsage.cachedTokens}
              costUSD={message.tokenUsage.costUSD}
            />
          </div>
        )}

        {/* 15. API Health Monitor */}
        {!isUser && message.apiHealth && (
          <div className="w-full max-w-md">
            <APIHealthMonitor services={message.apiHealth.services} />
          </div>
        )}

        {/* 16. Performance Stats */}
        {!isUser && message.performanceStats && (
          <div className="w-full max-w-md">
            <AgentPerformanceStats
              tokensUsed={message.performanceStats.tokensUsed}
              latencySec={message.performanceStats.latencySec}
              speedTps={message.performanceStats.speedTps}
            />
          </div>
        )}

        {/* 17. Budget Gauge */}
        {!isUser && message.budgetGauge && (
          <div className="w-full max-w-md">
            <BudgetGauge
              spent={message.budgetGauge.spent}
              limit={message.budgetGauge.limit}
            />
          </div>
        )}

        {/* 18. Timer Status */}
        {!isUser && message.timerStatus && (
          <div className="w-full max-w-md">
            <AgentTimerStatus
              durationSeconds={message.timerStatus.durationSeconds}
              prompt={message.timerStatus.prompt}
              onCancel={() => {/* Timer cancelled */}}
            />
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-6 h-6 rounded-md bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-gray-500 flex-shrink-0 mt-0.5">
          <Terminal className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
};
