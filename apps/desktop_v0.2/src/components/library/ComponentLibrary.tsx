import React, { useState } from "react";
import { GlassButton } from "../ui/GlassButton.js";
import { InputField } from "../ui/InputField.js";
import { Dropdown } from "../ui/Dropdown.js";
import { 
  AcceptRejectPills, 
  AgentReadingFile, 
  AgentWritingDiff, 
  AgentCommandExecution,
  Kbd,
  AgentStepper,
  AgentDiffViewer,
  FileTreeItem,
  InlineNotification,
  AgentSearchStatus,
  AgentToolBadge,
  StagedTaskList,
  AgentPerformanceStats,
  CustomSlider,
  AgentThinkingBlock,
  EditorTabs,
  PerformanceBarChart,
  ModelSelectorBadge,
  TerminalToolbar,
  BudgetGauge,
  AgentPermissionRequestCard,
  AgentQuestionCard,
  AgentTimerStatus,
  SubagentDelegationCard,
  AgentImplementationPlanCard
} from "./AgentActions.js";

import {
  InlineCodeSandboxEditor,
  TokenCostBreakdown,
  PromptTemplatePills,
  APIHealthMonitor,
  AgentWorkspaceDelegationTree,
  SystemToastAlertStack,
  MergeConflictResolver,
  SettingsDashboardPanel,
  SystemArchitectureViewer,
  DynamicProjectArchitectureMapper,
  ProjectDiagnosticRadarMap,
  DatabaseSchemaMindMap
} from "./AgentAdvancedActions.js";
import { CodeBlockPreview } from "./CodeBlockPreview.js";
import { BookOpen, Code, Eye, Layers, Network, Activity, Database } from "lucide-react";

export const ComponentLibrary: React.FC = () => {
  const [dropdownValue, setDropdownValue] = useState("option1");
  const [textInput, setTextInput] = useState("");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [sliderVal, setSliderVal] = useState(0.7);

  const [activeTabId, setActiveTabId] = useState("tab-1");
  const [editorTabs, setEditorTabs] = useState([
    { id: "tab-1", name: "App.tsx", isModified: true },
    { id: "tab-2", name: "index.css" },
    { id: "tab-3", name: "README.md" }
  ]);

  const handleCloseTab = (id: string) => {
    setEditorTabs(prev => prev.filter(t => t.id !== id));
  };
  
  const [tasks, setTasks] = useState([
    { id: "task-1", label: "Bootstrap Tauri v2 configuration workspace", status: "done" as const },
    { id: "task-2", label: "Run build check verification with tsc", status: "running" as const },
    { id: "task-3", label: "Verify android APK bundles cleanly", status: "pending" as const }
  ]);

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id 
        ? { ...t, status: t.status === "done" ? "pending" : "done" as const } 
        : t
    ));
  };

  const dropdownOptions = [
    { label: "Option 1 (Engine)", value: "option1" },
    { label: "Option 2 (Agent)", value: "option2" },
    { label: "Option 3 (Plan)", value: "option3" }
  ];

  const mockSteps = [
    { label: "Analyzing Directory", status: "done" as const },
    { label: "Formulating Plan", status: "done" as const },
    { label: "Generating Code Changes", status: "current" as const },
    { label: "Running Verification Tests", status: "pending" as const }
  ];

  const mockDiff = [
    { type: "normal" as const, content: "export const App = () => {" },
    { type: "deletion" as const, content: "  const title = 'Istiyak App';" },
    { type: "addition" as const, content: "  const title = 'Companion R&D Playground';" },
    { type: "normal" as const, content: "  return <div>{title}</div>;" },
    { type: "normal" as const, content: "};" }
  ];

  const chartData = [
    { label: "Sess 1", value: 35, metric: "35k" },
    { label: "Sess 2", value: 55, metric: "55k" },
    { label: "Sess 3", value: 42, metric: "42k" },
    { label: "Sess 4", value: 78, metric: "78k" },
    { label: "Sess 5", value: 92, metric: "92k" }
  ];

  // Staging state variables for newly introduced controls
  const [modelSel, setModelSel] = useState<"active" | "inactive">("active");
  const [termRunning, setTermRunning] = useState(true);
  const [termPaused, setTermPaused] = useState(false);
  const [selectedQuestionOpt, setSelectedQuestionOpt] = useState("Tailwind v4");
  const [timerVal, setTimerVal] = useState(45);
  const [planScenario, setPlanScenario] = useState<"rd" | "website" | "large">("rd");

  // final additions states
  const [toasts, setToasts] = useState<{ id: string; type: "success" | "warning" | "error" | "info"; message: string }[]>([
    { id: "toast-success", type: "success", message: "Production bundle built successfully in 1.45s." },
    { id: "toast-error", type: "error", message: "Type mismatch error in AgentActions.tsx at line 12." }
  ]);
  const [settingsTab, setSettingsTab] = useState("model");

  const handleRemoveToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const mockPlanChanges = [
    { type: "new" as const, fileName: "ComponentLibrary.tsx", path: "src/components/library/ComponentLibrary.tsx", description: "Create a playground component to isolate and view R&D code modules." },
    { type: "modify" as const, fileName: "AgentActions.tsx", path: "src/components/library/AgentActions.tsx", description: "Refactor plan proposal card to display inline file checkboxes and explanation descriptions." },
    { type: "delete" as const, fileName: "old_logic.ts", path: "src/utils/old_logic.ts", description: "Clean up obsolete, unused utility helpers to optimize application performance." }
  ];

  const mockWebsiteChanges = [
    { type: "new" as const, fileName: "tailwind.config.js", path: "./tailwind.config.js", description: "Configure theme presets, fonts, slate/indigo custom palettes, and global responsive layouts." },
    { type: "new" as const, fileName: "postcss.config.js", path: "./postcss.config.js", description: "Mount autoprefixer extensions to output cross-platform browser styling." },
    { type: "new" as const, fileName: "App.tsx", path: "./src/App.tsx", description: "Inject primary landing layout, header navigations, and landing hero blocks." },
    { type: "new" as const, fileName: "index.css", path: "./src/index.css", description: "Load core Tailwind CSS base, components, and utility modules." },
    { type: "modify" as const, fileName: "package.json", path: "./package.json", description: "Register tailwindcss, postcss, and autoprefixer as devDependencies." }
  ];

  // Realistic, large, complex R&D plan changes
  const mockLargePlanChanges = [
    { type: "new" as const, fileName: "visual-regression.spec.ts", path: "tests/visual-regression.spec.ts", description: "Implement E2E regression checks using Playwright visual pixel diff engine." },
    { type: "new" as const, fileName: "playwright.config.ts", path: "playwright.config.ts", description: "Set chromium browser specs, baseline screenshot thresholds, and execution timeouts." },
    { type: "new" as const, fileName: "StagedVisualRunner.tsx", path: "src/components/library/StagedVisualRunner.tsx", description: "Create interactive playground panels to trigger manual tests from UI." },
    { type: "new" as const, fileName: "visual-test.yml", path: ".github/workflows/visual-test.yml", description: "Define GitHub Actions automated workflow run on target pull requests." },
    { type: "modify" as const, fileName: "package.json", path: "package.json", description: "Register playwright devDependencies and script hooks." },
    { type: "modify" as const, fileName: "App.tsx", path: "src/App.tsx", description: "Hook pipeline execution states and output visual indicators." },
    { type: "modify" as const, fileName: "Cargo.toml", path: "src-tauri/Cargo.toml", description: "Add rusqlite dependency to boot cache database tables in Rust." },
    { type: "modify" as const, fileName: "main.rs", path: "src-tauri/src/main.rs", description: "Initialize SQLite connection on system startup, serving cached baseline metadata." },
    { type: "delete" as const, fileName: "cypress.json", path: "old_tests/cypress.json", description: "Remove deprecated Cypress test configurations to clear codebase." }
  ];

  const handleApprovePlan = (
    answers: Record<string, string>, 
    selectedFiles: string[], 
    customInstructions: string
  ) => {
    alert(
      "🚀 Plan Approved!\n\n" +
      "1. Selected Options:\n" + JSON.stringify(answers, null, 2) + "\n\n" +
      `2. Approved Files (${selectedFiles.length}/${planScenario === "rd" ? 3 : planScenario === "website" ? 5 : 9}):\n` + 
      selectedFiles.map(f => `  • ${f.split("/").pop()}`).join("\n") + "\n\n" +
      `3. Special Instructions:\n"${customInstructions || "None provided"}"`
    );
  };

  const initialConfigCode = `module.exports = {
  theme: {
    extend: {
      colors: {
        brand: '#0ea5e9',
        accent: '#f59e0b'
      }
    }
  }
};`;

  const promptTemplates = [
    { id: "tpl-1", label: "Write Test Suite", action: "Write comprehensive unit tests for App.tsx" },
    { id: "tpl-2", label: "Apply Lints", action: "Run tsc and fix formatting errors in active file" },
    { id: "tpl-3", label: "Optimize LCP", action: "Analyze Largest Contentful Paint images in resources" }
  ];

  const apiServices = [
    { name: "gemini-2.5-pro", latencyMs: 240, status: "online" as const },
    { name: "claude-3.5-sonnet", latencyMs: 380, status: "online" as const },
    { name: "local-rust-server", latencyMs: 45, status: "online" as const }
  ];

  const activeAgents = [
    { id: "agt-1", name: "Build Tester Agent", activeFile: "src-tauri/src/main.rs", tasksCount: 3 },
    { id: "agt-2", name: "LCP Performance Profiler", activeFile: "src/components/chat/MessageArea.tsx", tasksCount: 1 }
  ];

  const mockCodeString = `import React from "react";
import { Database, Link } from "lucide-react";

export const DatabaseSchema = () => {
  const connString = process.env.DATABASE_URL;
  
  const connectDB = async () => {
    try {
      console.log("Connecting to SQL database...");
      // Simulating connection logic
      const active = true;
      return active;
    } catch (err) {
      console.error("Database connection failed", err);
    }
  };

  return (
    <div className="p-4 border border-white/5 bg-black/40">
      <h3>Schema active status</h3>
      <button onClick={connectDB}>Check Auth Token</button>
    </div>
  );
};`;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08090a] overflow-y-auto p-6 scrollbar-thin select-text">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-white/[0.04] pb-4 mb-6">
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-gray-400" />
            <h1 className="text-sm font-bold text-gray-200 uppercase tracking-widest">
              Companion R&D Component Library
            </h1>
          </div>
          <p className="text-[10px] text-gray-500 mt-1 leading-relaxed max-w-xl">
            This workspace serves as a playground for staging and testing custom UI modules before introducing them into the production flow. It ensures strict monochrome consistency, tight sizing, and responsive designs.
          </p>
        </div>

        <div className="flex items-center bg-black/20 rounded-lg p-0.5 border border-white/5">
          <GlassButton
            onClick={() => setActiveTab("preview")}
            active={activeTab === "preview"}
            variant="ghost"
            size="xs"
            className="!border-transparent !bg-transparent"
          >
            <Eye className="w-3 h-3" /> Preview
          </GlassButton>
          <GlassButton
            onClick={() => setActiveTab("code")}
            active={activeTab === "code"}
            variant="ghost"
            size="xs"
            className="!border-transparent !bg-transparent"
          >
            <Code className="w-3 h-3" /> Architecture Docs
          </GlassButton>
        </div>
      </div>

      {activeTab === "preview" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pb-10">
          {/* Section: Atomic Buttons */}
          <div className="p-4 border border-white/[0.04] bg-white/[0.01] rounded-xl flex flex-col gap-4">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/[0.04] pb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-gray-500" /> Atomic Buttons & Toggles
            </h2>

            {/* Standard Glass Buttons */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">GlassButton Variants</span>
              <div className="flex flex-wrap gap-2 items-center">
                <GlassButton variant="primary" size="sm">Primary Action</GlassButton>
                <GlassButton variant="secondary" size="sm">Secondary</GlassButton>
                <GlassButton variant="danger" size="sm">Danger Action</GlassButton>
                <GlassButton variant="ghost" size="sm">Ghost Style</GlassButton>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Button Sizes</span>
              <div className="flex flex-wrap gap-2 items-center">
                <GlassButton size="xs">Size XS</GlassButton>
                <GlassButton size="sm">Size SM</GlassButton>
                <GlassButton size="md">Size MD</GlassButton>
                <GlassButton size="lg">Size LG</GlassButton>
              </div>
            </div>

            {/* Micro-compact pills */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Accept / Reject Pills</span>
              <div className="flex flex-col gap-1 items-start">
                <AcceptRejectPills 
                  onAccept={() => alert("Accepted")} 
                  onReject={() => alert("Rejected")} 
                />
              </div>
            </div>
          </div>

          {/* Section: Input Fields & Selectors */}
          <div className="p-4 border border-white/[0.04] bg-white/[0.01] rounded-xl flex flex-col gap-4">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/[0.04] pb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-gray-500" /> Input Fields & Selectors
            </h2>

            <div className="flex flex-col gap-3">
              <InputField 
                label="Standard Text Input"
                placeholder="Type here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
              />

              <InputField 
                label="Input With Browse Button"
                placeholder="Select project directory..."
                value="/Volumes/SSD/0.1/istiyak_agent"
                onBrowse={() => alert("Browse triggered")}
                readOnly
              />

              <div className="flex flex-col gap-2">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Model Selector Badges</span>
                <div className="flex flex-wrap gap-2">
                  <ModelSelectorBadge 
                    modelName="gemini-2.5-pro" 
                    provider="Google" 
                    status={modelSel} 
                    onClick={() => setModelSel(modelSel === "active" ? "inactive" : "active")} 
                  />
                  <ModelSelectorBadge 
                    modelName="claude-3.5-sonnet" 
                    provider="Anthropic" 
                    status={modelSel === "active" ? "inactive" : "active"} 
                    onClick={() => setModelSel(modelSel === "active" ? "inactive" : "active")} 
                  />
                </div>
              </div>

              <div className="w-64">
                <Dropdown 
                  label="Dynamic Dropdown Selector"
                  options={dropdownOptions}
                  value={dropdownValue}
                  onChange={(val) => setDropdownValue(val)}
                />
              </div>

              <CustomSlider 
                label="Model Temperature Control" 
                value={sliderVal} 
                min={0} 
                max={1.5} 
                step={0.05} 
                onChange={(val) => setSliderVal(val)} 
              />
            </div>
          </div>

          {/* Section: Agent Activity & File Reading */}
          <div className="p-4 border border-white/[0.04] bg-white/[0.01] rounded-xl flex flex-col gap-4">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/[0.04] pb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-gray-500" /> Agent Task & File Monitoring
            </h2>

            <div className="flex flex-col gap-3">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">File Read/Write Statuses</span>
              <AgentReadingFile filePath="src/store/useChatStore.ts" linesRead="L40-L135" status="reading" />
              <AgentReadingFile filePath="src/components/chat/ChatBubble.tsx" linesRead="L1-L48" status="completed" />
              <AgentWritingDiff filePath="src/components/ui/GlassButton.tsx" diffSummary="Adding monochrome classes" progress={65} additions={15} deletions={3} />

              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-2">External Agent Tool Badge</span>
              <div className="flex flex-wrap gap-2">
                <AgentToolBadge toolName="replace_file_content" status="calling" />
                <AgentToolBadge toolName="grep_search" status="completed" />
              </div>
            </div>
          </div>

          {/* Section: Terminal Command Outputs */}
          <div className="p-4 border border-white/[0.04] bg-white/[0.01] rounded-xl flex flex-col gap-4">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/[0.04] pb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-gray-500" /> Command Executions
            </h2>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Terminal Execution Frame</span>
                <TerminalToolbar 
                  isRunning={termRunning} 
                  isPaused={termPaused} 
                  onPlay={() => { setTermRunning(true); setTermPaused(false); }}
                  onPause={() => setTermPaused(true)}
                  onStop={() => setTermRunning(false)}
                  onClear={() => alert("Clear logs triggered")}
                />
              </div>
              <AgentCommandExecution 
                command="npm run build"
                status={termRunning ? (termPaused ? "success" : "running") : "failed"}
                onStop={() => setTermRunning(false)}
                output={[
                  "> tsc && vite build",
                  "vite v5.4.21 building for production...",
                  termPaused ? "✓ built in 1.42s" : "transforming... [45/1598 modules]",
                  termPaused ? "" : "compiling typescript structures..."
                ].filter(Boolean)}
              />

              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-2">Semantic & Web Search</span>
              <AgentSearchStatus query="GCP Application Default Credentials" status="searching" />
            </div>
          </div>

          {/* Section: Keyboard Shortcuts & Timeline Stepper */}
          <div className="p-4 border border-white/[0.04] bg-white/[0.01] rounded-xl flex flex-col gap-4">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/[0.04] pb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-gray-500" /> Keyboard Shortcuts & Phase Timeline
            </h2>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Hotkeys Helpcaps</span>
                <div className="flex items-center gap-2 text-xs">
                  <span>Send Message:</span>
                  <div className="flex items-center gap-1">
                    <Kbd>Enter</Kbd>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs mt-1">
                  <span>Toggle Workspace Playground:</span>
                  <div className="flex items-center gap-1">
                    <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>L</Kbd>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Execution Pipeline Phases</span>
                <AgentStepper steps={mockSteps} />
              </div>
            </div>
          </div>

          {/* Section: Diff Viewer & Directory Staging */}
          <div className="p-4 border border-white/[0.04] bg-white/[0.01] rounded-xl flex flex-col gap-4">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/[0.04] pb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-gray-500" /> Diff Viewer & Directory Staging
            </h2>

            <div className="flex flex-col gap-3">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Editor Stage Tabs</span>
              {editorTabs.length > 0 ? (
                <EditorTabs 
                  tabs={editorTabs} 
                  activeTabId={activeTabId} 
                  onSelectTab={(id) => setActiveTabId(id)} 
                  onCloseTab={handleCloseTab}
                />
              ) : (
                <span className="text-[9px] text-gray-600">No active tabs open</span>
              )}

              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-2">Subtle Diff Visualizer</span>
              <AgentDiffViewer filePath="src/App.tsx" lines={mockDiff} />

              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-2">Workspace File Tree</span>
              <div className="border border-white/5 bg-black/15 p-2 rounded-lg flex flex-col gap-1">
                <FileTreeItem name="src" type="dir" depth={0} isOpen={true} />
                <FileTreeItem name="components" type="dir" depth={1} isOpen={false} />
                <FileTreeItem name="App.tsx" type="file" depth={1} />
                <FileTreeItem name="package.json" type="file" depth={0} />
              </div>
            </div>
          </div>

          {/* Section: Agent Thought Accordion */}
          <div className="p-4 border border-white/[0.04] bg-white/[0.01] rounded-xl flex flex-col gap-4">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/[0.04] pb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-gray-500" /> Agent Thought Accordion
            </h2>

            <div className="flex flex-col gap-3">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Collapsible Reasoning Block</span>
              <AgentThinkingBlock 
                durationSec={3.12} 
                initialCollapsed={true}
                thoughts={`1. Inspected user workspace to identify directory configuration.
2. Verified that dependencies inside package.json are compatible with Tauri v2.
3. Created staging folder components/library/ to isolate development scripts.
4. Compiled code successfully via tsc to prevent UI rendering lockups.`}
              />
            </div>
          </div>

          {/* Section: Agent Checklist & Statistics */}
          <div className="p-4 border border-white/[0.04] bg-white/[0.01] rounded-xl flex flex-col gap-4">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/[0.04] pb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-gray-500" /> Agent Checklist & Execution Performance
            </h2>

            <div className="flex flex-col gap-3">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Action Task List</span>
              <StagedTaskList tasks={tasks} onToggleTask={handleToggleTask} />

              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-2">Performance Metrics Banner</span>
              <AgentPerformanceStats tokensUsed={84120} latencySec={3.45} speedTps={85} />

              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-2">API Budget and Limit Gauge</span>
              <BudgetGauge spent={1.24} limit={5.00} />
            </div>
          </div>

          {/* Section: Token Usage chart */}
          <div className="p-4 border border-white/[0.04] bg-white/[0.01] rounded-xl flex flex-col gap-4">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/[0.04] pb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-gray-500" /> Token Usage Over Sessions
            </h2>

            <div className="flex flex-col gap-3">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Usage Statistics</span>
              <PerformanceBarChart data={chartData} title="Session Token Usage (K tokens)" />
            </div>
          </div>

          {/* Section: Agent Tool Permissions & Clarifications */}
          <div className="p-4 border border-white/[0.04] bg-white/[0.01] rounded-xl flex flex-col gap-4">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/[0.04] pb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-gray-500" /> Tool Permissions & Question Clarifications
            </h2>

            <div className="flex flex-col gap-3.5">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Interactive Permission Request Gate</span>
              <AgentPermissionRequestCard 
                action="write_file" 
                target="/Volumes/SSD/0.1/istiyak_agent_v0.1/src/index.css" 
                reason="To append custom scrollbar global CSS configurations"
                onGrant={() => alert("Access Granted")}
                onDeny={() => alert("Access Denied")}
              />

              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-1">Interactive Multiple Choice Clarification</span>
              <AgentQuestionCard 
                question="Which layout style do you prefer for the model selector drawer?" 
                options={["Minimal Bottom Sheet", "Floating Pill Toggle Drawer"]} 
                selectedOption={selectedQuestionOpt}
                onSelect={(val) => setSelectedQuestionOpt(val)}
                onSubmit={() => alert(`Confirmed: ${selectedQuestionOpt}`)}
              />
            </div>
          </div>

          {/* Section: Scheduled Tasks & Multi-Agent Delegations */}
          <div className="p-4 border border-white/[0.04] bg-white/[0.01] rounded-xl flex flex-col gap-4">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/[0.04] pb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-gray-500" /> Scheduled Background Timers & Subagents
            </h2>

            <div className="flex flex-col gap-3.5">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Background Cron & Timer Schedules</span>
              <AgentTimerStatus 
                durationSeconds={timerVal} 
                prompt="Trigger verify build checks in background"
                onCancel={() => setTimerVal(0)}
              />

              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-1">Multi-Agent Subagent Delegation</span>
              <SubagentDelegationCard 
                subagentId="sub-x981" 
                taskName="Run dev-server and check LCP performance metrics" 
                status="running"
                progressReport="Navigating browser window to http://localhost:5173..."
              />
            </div>
          </div>

          {/* Section: Code Sandbox Refiner & Prompts Panel */}
          <div className="p-4 border border-white/[0.04] bg-white/[0.01] rounded-xl flex flex-col gap-4">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/[0.04] pb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-gray-500" /> Code Refiner & Action Shortcuts
            </h2>

            <div className="flex flex-col gap-4">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Proposed Code Sandbox Editor</span>
              <InlineCodeSandboxEditor 
                fileName="tailwind.config.js" 
                initialCode={initialConfigCode} 
                onSave={(code) => alert("Code sandbox saved:\n" + code)}
                onReset={() => alert("Sandbox reset back to initial content.")}
              />

              <div className="mt-1">
                <PromptTemplatePills 
                  templates={promptTemplates} 
                  onSelect={(act) => alert("Template Prompt Selected:\n" + act)}
                />
              </div>
            </div>
          </div>

          {/* Section: Token Distribution & Health Monitors */}
          <div className="p-4 border border-white/[0.04] bg-white/[0.01] rounded-xl flex flex-col gap-4">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/[0.04] pb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-gray-500" /> Token Audits & API Latency Status
            </h2>

            <div className="flex flex-col gap-4">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Session Token Distribution</span>
              <TokenCostBreakdown 
                inputTokens={84200} 
                outputTokens={3500} 
                cachedTokens={120500} 
                costUSD={0.3842} 
              />

              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-1">API Latency Health Indicators</span>
              <APIHealthMonitor services={apiServices} />

              <div className="mt-1">
                <AgentWorkspaceDelegationTree 
                  agents={activeAgents} 
                  onSelectAgent={(id) => alert("Focused agent selected: " + id)}
                />
              </div>
            </div>
          </div>

          {/* Section: Toasts Stack & Conflict Resolvers */}
          <div className="p-4 border border-white/[0.04] bg-white/[0.01] rounded-xl flex flex-col gap-4">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/[0.04] pb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-gray-500" /> Toast Alerts & Code Conflict Resolution
            </h2>

            <div className="flex flex-col gap-4">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Floating Toast Notification Stack</span>
              {toasts.length > 0 ? (
                <SystemToastAlertStack toasts={toasts} onRemove={handleRemoveToast} />
              ) : (
                <div className="text-[9.5px] text-gray-600 italic">All toasts closed. Click below to add toast.</div>
              )}
              <GlassButton 
                onClick={() => setToasts([...toasts, { id: `toast-${Date.now()}`, type: "info", message: "Verification compiler check running..." }])}
                size="xs" 
                className="w-fit"
              >
                Spawn Info Toast
              </GlassButton>

              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-2">Active Merge Conflict Resolver Card</span>
              <MergeConflictResolver 
                filePath="src/components/ui/GlassButton.tsx" 
                conflictCount={1}
                currentCode={`export const GlassButton = ({ children }) => {\n  return <button className="glass-btn">{children}</button>;\n};`}
                incomingCode={`export const GlassButton = ({ children, disabled }) => {\n  return <button disabled={disabled} className="glass-btn-active">{children}</button>;\n};`}
                onResolve={(res) => alert("Conflict resolved using: " + res)}
              />
            </div>
          </div>

          {/* Section: Interactive Settings Panel Container */}
          <div className="p-4 border border-white/[0.04] bg-white/[0.01] rounded-xl flex flex-col gap-4">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/[0.04] pb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-gray-500" /> Integrated Settings Drawer Dashboard
            </h2>

            <div className="flex flex-col gap-3">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Settings Panel Wrapper Preview</span>
              <SettingsDashboardPanel activeTab={settingsTab} onTabChange={(tab) => setSettingsTab(tab)}>
                {settingsTab === "model" && (
                  <div className="flex flex-col gap-3">
                    <span className="text-[8.5px] text-gray-500 font-bold uppercase tracking-wider">Active Target Engine</span>
                    <div className="flex flex-wrap gap-1.5">
                      <ModelSelectorBadge modelName="gemini-2.5" provider="Google" status="active" />
                      <ModelSelectorBadge modelName="claude-3.5" provider="Anthropic" status="inactive" />
                    </div>
                    <CustomSlider label="Temperature" value={sliderVal} min={0} max={1.5} step={0.05} onChange={(val) => setSliderVal(val)} />
                  </div>
                )}
                {settingsTab === "limits" && (
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[8.5px] text-gray-500 font-bold uppercase tracking-wider">API Constraints limits</span>
                    <InputField label="Max Cost Per Session (USD)" value="$5.00" readOnly />
                    <InputField label="Max File Read Range" value="800 lines" readOnly />
                  </div>
                )}
                {settingsTab === "system" && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[8.5px] text-gray-500 font-bold uppercase tracking-wider">Active Agent Audit Logs</span>
                    <div className="bg-[#08090b] border border-white/5 p-2 rounded-lg font-mono text-[8px] text-gray-500 h-20 overflow-y-auto leading-normal">
                      [08:02:15] spawned visual browser subagent ID: sub-x981<br />
                      [08:02:18] grep_search executed matches: 15 lines<br />
                      [08:02:40] write_file applied diff src/index.css (+15, -3)
                    </div>
                  </div>
                )}
              </SettingsDashboardPanel>
            </div>
          </div>

          {/* Section: Planning Mode Proposal Card */}
          <div className="p-4 border border-white/[0.04] bg-white/[0.01] rounded-xl flex flex-col gap-4 col-span-1 md:col-span-2">
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-1.5 gap-2">
              <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-gray-500" /> Planning Mode Implementation Proposals
              </h2>
              <div className="flex items-center bg-black/25 rounded p-0.5 border border-white/5 gap-1 overflow-x-auto scrollbar-none">
                <button 
                  onClick={() => setPlanScenario("rd")} 
                  className={`text-[8.5px] px-2 py-0.5 font-bold rounded cursor-pointer transition-colors whitespace-nowrap ${
                    planScenario === "rd" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  R&D Staging Scenario
                </button>
                <button 
                  onClick={() => setPlanScenario("website")} 
                  className={`text-[8.5px] px-2 py-0.5 font-bold rounded cursor-pointer transition-colors whitespace-nowrap ${
                    planScenario === "website" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  React + Tailwind App Scenario
                </button>
                <button 
                  onClick={() => setPlanScenario("large")} 
                  className={`text-[8.5px] px-2 py-0.5 font-bold rounded cursor-pointer transition-colors whitespace-nowrap ${
                    planScenario === "large" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Realistic Large Plan (E2E Playwright Suite)
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              {planScenario === "rd" ? (
                <AgentImplementationPlanCard 
                  planTitle="Integrate R&D UI Component Library Playground"
                  description="Establish a localized sandbox inside /src/components/library/ to preview, stage, and verify new monochrome UI components before publishing them to the workspace shell."
                  risks={[
                    "Will modify index.css slightly to add global scrollbar styling rules",
                    "Will add 25 new dynamic subcomponents to the source catalog"
                  ]}
                  proposedChanges={mockPlanChanges}
                  openQuestions={[
                    { id: "visual-tests", text: "Should we support visual regression tests using our browser subagent now?", options: ["Yes, verify visual state", "No, skip for now"] },
                    { id: "pills-layout", text: "Should we make the Accept/Reject pills absolute or block-layout?", options: ["Absolute Float", "Standard Block"] }
                  ]}
                  onApprove={handleApprovePlan}
                  onReject={() => alert("Plan rejected. Requesting revision options from agent...")}
                />
              ) : planScenario === "website" ? (
                <AgentImplementationPlanCard 
                  planTitle="React + Tailwind CSS Website Bootstrapper"
                  description="Bootstrap a lightweight React single-page website with direct Tailwind CSS utility bindings, configuring build pipelines, standard responsive layout folders, and active routing sheets."
                  risks={[
                    "Will run npm/npx installations in your active workspace",
                    "Will inject root PostCSS parameters into your workspace configurations",
                    "Will overwrite current index.css to import tailwind modules"
                  ]}
                  proposedChanges={mockWebsiteChanges}
                  openQuestions={[
                    { id: "tailwind-version", text: "Confirm target Tailwind CSS version?", options: ["Tailwind v3", "Tailwind v4"] },
                    { id: "primary-palette", text: "What is your primary brand color palette?", options: ["Slate", "Indigo", "Emerald", "Amber"] },
                    { id: "router-setup", text: "Do you require react-router integration?", options: ["Yes (Configure routing)", "No (Single-page simple layout)"] }
                  ]}
                  onApprove={handleApprovePlan}
                  onReject={() => alert("Plan rejected. Requesting revision options from agent...")}
                />
              ) : (
                <AgentImplementationPlanCard 
                  planTitle="Feature Handoff: Implement Multi-Agent Visual Regression & Playwright E2E Suite"
                  description="Establish a comprehensive Playwright Visual Screenshot regression suite, deploying visual comparison baseline engines, configuring SQLite state databases to track snapshot metadata, and hooking hooks into active CI pipelines."
                  risks={[
                    "Will download Playwright browser binaries (~350MB) on local host machine",
                    "Will provision SQLite db files in /src-tauri/db.sqlite, modifying startup Rust handlers",
                    "Will write custom YAML templates to .github/workflows/ for automated action runner tests"
                  ]}
                  proposedChanges={mockLargePlanChanges}
                  openQuestions={[
                    { id: "viewport", text: "What window viewport resolution should we target?", options: ["1440x900 (Desktop)", "1024x768 (Tablet)", "375x812 (Mobile)"] },
                    { id: "db-path", text: "Specify SQLite local cache database storage location:", placeholder: "e.g., src-tauri/db.sqlite" },
                    { id: "ci-trigger", text: "Should visual regression tests execute on every push?", options: ["Git Push", "Pull Request Only", "Manual Dispatch"] },
                    { id: "threshold", text: "Set maximum visual pixel mis-match threshold allowance (percentage):", placeholder: "e.g., 0.05 (5%)" }
                  ]}
                  onApprove={handleApprovePlan}
                  onReject={() => alert("Plan rejected. Requesting revision options from agent...")}
                />
              )}
            </div>
          </div>

          {/* Section: Interactive Codebase Diagnostic Scan & Radar Map */}
          <div className="p-4 border border-white/[0.04] bg-white/[0.01] rounded-xl flex flex-col gap-4 col-span-1 md:col-span-2">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/[0.04] pb-1.5 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-gray-500" /> Codebase Diagnostic Check & Radar Map
            </h2>
            <div className="flex justify-center w-full">
              <ProjectDiagnosticRadarMap />
            </div>
          </div>

          {/* Section: Inline Banner Log Alerts */}
          <div className="p-4 border border-white/[0.04] bg-white/[0.01] rounded-xl flex flex-col gap-4 col-span-1 md:col-span-2">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-white/[0.04] pb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-gray-500" /> Inline Status Banners & Warnings
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <InlineNotification 
                type="info" 
                title="System Diagnostic" 
                message="The agent successfully established a connection with vertex-ai API." 
              />
              <InlineNotification 
                type="warning" 
                title="Configuration Warning" 
                message="The API Key you entered has mock formats. Simulated replies will be used instead." 
              />
              <InlineNotification 
                type="error" 
                title="Runtime Fatal Error" 
                message="The tsc compiler failed with exit code 2. Check the logs for JSX tag balancing." 
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
          {/* Section: Live Interactive Architecture Inspector */}
          <div className="flex flex-col gap-2">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5 text-gray-500" /> Interactive App Kernel Flow
            </h2>
            <SystemArchitectureViewer />
          </div>

          {/* Section: Dynamic Workspace Project Architecture Mapper */}
          <div className="flex flex-col gap-2 mt-2">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1.5 mb-1">
              <Network className="w-3.5 h-3.5 text-gray-500" /> Dynamic Codebase Architecture Mapper
            </h2>
            <DynamicProjectArchitectureMapper />
          </div>

          {/* Section: Database Schema Mind Map */}
          <div className="flex flex-col gap-2 mt-2">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1.5 mb-1">
              <Database className="w-3.5 h-3.5 text-gray-500" /> Database Schema Mind Map
            </h2>
            <DatabaseSchemaMindMap />
          </div>

          {/* Section: Minimal Code Block & Copy Box */}
          <div className="flex flex-col gap-2 mt-2">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 flex items-center gap-1.5 mb-1">
              <Code className="w-3.5 h-3.5 text-gray-500" /> Minimal Code Block & Copy Box
            </h2>
            <CodeBlockPreview 
              code={mockCodeString} 
              language="typescript" 
              fileName="DatabaseSchema.tsx"
              fileSize="0.5 KB"
            />
          </div>

          <div className="border border-white/[0.04] bg-[#090a0f] rounded-xl p-6 text-left flex flex-col gap-6 font-mono text-xs text-gray-400 leading-relaxed select-text scrollbar-thin">
            <div>
              <h3 className="text-gray-200 font-bold text-sm mb-2 border-b border-white/[0.04] pb-1">Code Architecture Rules</h3>
              <p>To preserve monochrome consistency and modular layout:</p>
              <ul className="list-disc pl-5 mt-2 flex flex-col gap-1 text-[11px]">
                <li>Never inject static colors (e.g., text-sky-400, bg-red-500/10) directly into production components. Use neutral translucent values like bg-white/5, text-gray-300.</li>
                <li>Always default to modular subcomponents (e.g., &lt;GlassButton&gt;) rather than raw &lt;button&gt; tags to maintain theme parameters.</li>
                <li>Keep layout spacing tight and developer-native. Avoid floating bubbles where flat direct-content previews feel cleaner.</li>
              </ul>
            </div>

            <div>
              <h3 className="text-gray-200 font-bold text-sm mb-2 border-b border-white/[0.04] pb-1">Micro-Compact Pills Sizing</h3>
              <p className="mb-2">Matching the specifications of the 07-accept-reject-zen.svg schema, the Accept/Reject buttons must reside inside a single inline pill wrapper:</p>
              <pre className="bg-black/35 border border-white/[0.04] p-3 rounded-lg text-[10px] text-gray-300">
{`<AcceptRejectPills 
  onAccept={() => handleAccept()}
  onReject={() => handleReject()}
/>`}
              </pre>
            </div>

            <div>
              <h3 className="text-gray-200 font-bold text-sm mb-2 border-b border-white/[0.04] pb-1">Agent Reading / Writing Indicators</h3>
              <p className="mb-2">Use the reading and writing indicators to show live file reads and writes inside logs without rendering long, unreadable raw texts:</p>
              <pre className="bg-black/35 border border-white/[0.04] p-3 rounded-lg text-[10px] text-gray-300">
{`<AgentReadingFile 
  filePath="src/components/chat/ChatBubble.tsx" 
  status="reading" 
/>`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
