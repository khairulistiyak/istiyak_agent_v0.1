import React, { useState } from "react";
import { AgentTaskPlanner, TaskItem } from "./AgentTaskPlanner.js";
import { InteractiveToolCall } from "./InteractiveToolCall.js";
import { DiffCodeReview, DiffLine } from "./DiffCodeReview.js";
import { AgentChatBubble } from "./AgentChatBubble.js";
import { SessionSummaryMetrics } from "./SessionSummaryMetrics.js";
import { RotateCcw, CheckCircle, HelpCircle } from "lucide-react";
import { GlassButton } from "../../ui/GlassButton.js";

export const AgentFlowPreview: React.FC = () => {
  // 1. Task Planner State
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: "step-1", label: "Inspect project directory structure & compile rules", description: "Checked Cargo.toml and src/components for dependencies", status: "done" },
    { id: "step-2", label: "Establish local SQLite database schema & connection helper", description: "Creating src-tauri/src/db.rs with rusqlite boot tables", status: "running" },
    { id: "step-3", label: "Develop Tauri IPC invoke handlers in Rust main kernel", description: "Bind rust invoke hooks to desktop frontend modules", status: "pending" },
    { id: "step-4", label: "Run build check verification with rustc/tsc compiler", description: "Verify package outputs bundle cleanly without dependency breaks", status: "pending" }
  ]);

  // 2. Interactive Tool Call State
  const [toolStatus, setToolStatus] = useState<"idle" | "running" | "success" | "error">("running");
  const toolDuration = 1420;
  const [toolLogs, setToolLogs] = useState<string[]>([
    "[10:45:12] Initializing workspace bridge handler run...",
    "[10:45:13] Checking rusqlite crate bindings in Cargo.toml...",
    "[10:45:14] Generating draft database tables using Connection::open...",
    "[10:45:15] Writing new file to: src-tauri/src/db.rs",
    "[10:45:16] Scanning compilation targets with cargo check --workspace...",
    "[10:45:17] STAGING PROGRESS: Waiting for user code-review confirmation..."
  ]);

  // 3. Diff Code Review State
  const [reviewState, setReviewState] = useState<"approved" | "rejected" | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);

  const mockDiffLines: DiffLine[] = [
    { type: "normal", content: "use rusqlite::{Connection, Result};" },
    { type: "deletion", content: "pub fn init_db() -> Result<()> { Ok(()) }" },
    { type: "addition", content: "pub fn establish_connection(db_path: &str) -> Result<Connection> {" },
    { type: "addition", content: "    let conn = Connection::open(db_path)?;" },
    { type: "addition", content: "    conn.execute(\"CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY)\", [])?;" },
    { type: "addition", content: "    Ok(conn)" },
    { type: "addition", content: "}" },
    { type: "normal", content: "// End of database helper bindings" }
  ];

  // 4. Chat Bubble State
  const thoughtSteps = [
    { label: "Parsing user request guidelines", durationMs: 120, status: "done" as const },
    { label: "Identifying database schema dependencies", durationMs: 430, status: "done" as const },
    { label: "Constructing rust rusqlite helper methods", durationMs: 820, status: "done" as const },
    { label: "Synthesizing code differences for review", durationMs: 250, status: "done" as const }
  ];

  const thoughtLog = `I analyzed the workspace context and found that Cargo.toml requires rusqlite dependency. I am implementing Connection::open inside 'src-tauri/src/db.rs' to bootstrap SQLite local cache database. I have generated a diff file for your review before compiling.`;

  const chatMessage = `I have successfully prepared the SQLite database schema helper! 

Please review the proposed Rust code changes in the Diff Panel below. Once you approve, I will merge the changes and proceed to bind the Tauri IPC command handlers in 'main.rs'.`;

  // 5. Session Metrics State
  const [inputTokens, setInputTokens] = useState(48200);
  const [outputTokens, setOutputTokens] = useState(12800);
  const [costUsd, setCostUsd] = useState(0.1830);
  const [successRate, setSuccessRate] = useState(90);
  const [toolCallsCount, setToolCallsCount] = useState(9);

  // User Actions
  const handleApprove = () => {
    setReviewState("approved");
    setHasReviewed(true);
    setToolStatus("success");
    
    // Update Task Checklist: step-2 -> done, step-3 -> running
    setTasks(prev => prev.map(t => {
      if (t.id === "step-2") return { ...t, status: "done" };
      if (t.id === "step-3") return { ...t, status: "running" };
      return t;
    }));

    // Update Logs
    setToolLogs(prev => [
      ...prev,
      "[10:46:02] USER APPROVED proposed code changes.",
      "[10:46:03] Merging diff to: src-tauri/src/db.rs successfully.",
      "[10:46:05] Triggering cargo build check: OK.",
      "[10:46:06] Initiating next step: Develop Tauri IPC invoke handlers..."
    ]);

    // Increase Stats
    setInputTokens(prev => prev + 4500);
    setOutputTokens(prev => prev + 1200);
    setCostUsd(prev => prev + 0.0185);
    setToolCallsCount(prev => prev + 1);
    setSuccessRate(92);
  };

  const handleReject = () => {
    setReviewState("rejected");
    setHasReviewed(true);
    setToolStatus("error");

    // Update Task Checklist: step-2 -> failed
    setTasks(prev => prev.map(t => {
      if (t.id === "step-2") return { ...t, status: "failed" };
      return t;
    }));

    // Update Logs
    setToolLogs(prev => [
      ...prev,
      "[10:46:02] USER REJECTED proposed code changes. Requesting adjustments.",
      "❌ TASK ERROR: Code check aborted by developer."
    ]);

    setToolCallsCount(prev => prev + 1);
    setSuccessRate(80);
  };

  const handleReset = () => {
    setReviewState(null);
    setHasReviewed(false);
    setToolStatus("running");
    setTasks([
      { id: "step-1", label: "Inspect project directory structure & compile rules", description: "Checked Cargo.toml and src/components for dependencies", status: "done" },
      { id: "step-2", label: "Establish local SQLite database schema & connection helper", description: "Creating src-tauri/src/db.rs with rusqlite boot tables", status: "running" },
      { id: "step-3", label: "Develop Tauri IPC invoke handlers in Rust main kernel", description: "Bind rust invoke hooks to desktop frontend modules", status: "pending" },
      { id: "step-4", label: "Run build check verification with rustc/tsc compiler", description: "Verify package outputs bundle cleanly without dependency breaks", status: "pending" }
    ]);
    setToolLogs([
      "[10:45:12] Initializing workspace bridge handler run...",
      "[10:45:13] Checking rusqlite crate bindings in Cargo.toml...",
      "[10:45:14] Generating draft database tables using Connection::open...",
      "[10:45:15] Writing new file to: src-tauri/src/db.rs",
      "[10:45:16] Scanning compilation targets with cargo check --workspace...",
      "[10:45:17] STAGING PROGRESS: Waiting for user code-review confirmation..."
    ]);
    setInputTokens(48200);
    setOutputTokens(12800);
    setCostUsd(0.1830);
    setToolCallsCount(9);
    setSuccessRate(90);
  };

  return (
    <div className="flex flex-col border border-white/[0.05] bg-[#0c0d10] p-5 rounded-3xl w-full max-w-6xl text-left gap-5">
      
      {/* Simulation Controller Topbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.04] pb-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4.5 h-4.5 text-white animate-pulse" />
            <span className="text-[12px] font-bold text-white uppercase tracking-widest">Interactive Agent Workspace Interface</span>
          </div>
          <span className="text-[8.5px] text-gray-500 font-mono">Simulating a live bug-fixing / feature-building session with agent tools</span>
        </div>

        <div className="flex items-center gap-2">
          {hasReviewed && (
            <GlassButton
              onClick={handleReset}
              className="!px-3 !py-1 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset Session Simulation
            </GlassButton>
          )}
          <span className="text-[9.5px] font-mono text-gray-550 px-3 py-1 border border-white/5 bg-white/[0.01] rounded-full">
            Active Scenario: SQLite Setup
          </span>
        </div>
      </div>

      {/* Unified 5-Component Grid Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Side: Conversation Bubble, Tool Call Output, and Diff Code Review (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          
          {/* Component 4: Agent Chat Bubble */}
          <AgentChatBubble
            thinkingTimeMs={1620}
            thinkingSteps={thoughtSteps}
            thoughtContentText={thoughtLog}
            chatMessageText={chatMessage}
          />

          {/* Component 2: Interactive Tool Call */}
          <InteractiveToolCall
            toolName="write_to_file"
            argumentsText="TargetFile: 'src-tauri/src/db.rs', Overwrite: true"
            durationMs={toolDuration}
            status={toolStatus}
            outputLogs={toolLogs}
          />

          {/* Component 3: Diff Code Review */}
          <DiffCodeReview
            fileName="db.rs"
            filePath="src-tauri/src/db.rs"
            linesAdded={5}
            linesRemoved={1}
            diffLines={mockDiffLines}
            onApprove={handleApprove}
            onReject={handleReject}
            hasReviewed={hasReviewed}
            reviewState={reviewState}
          />

        </div>

        {/* Right Side: Task Checklist Planner and Session Summary Metrics (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          
          {/* Component 1: Agent Task Checklist Planner */}
          <AgentTaskPlanner
            tasks={tasks}
          />

          {/* Component 5: Session Summary Metrics */}
          <SessionSummaryMetrics
            inputTokens={inputTokens}
            outputTokens={outputTokens}
            costUsd={costUsd}
            elapsedTimeMs={224000} // 3m 44s elapsed
            toolCallsCount={toolCallsCount}
            successRate={successRate}
          />

          {/* Guidelines info card for developer preview */}
          <div className="p-4 border border-white/[0.04] bg-[#08090c] rounded-2xl flex flex-col gap-2 font-mono text-[9px]">
            <span className="text-white uppercase tracking-wider text-[8px] font-bold flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-gray-600" /> Staging Sandbox Info
            </span>
            <p className="text-gray-550 leading-relaxed">
              This panel combines all 5 core elements of the agent's interactive UI: planner, logger, diff reviewer, chat bubble, and diagnostics counter. Approve the diff inside the review panel to watch the checklist progress, metrics, and logs update in real-time.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
