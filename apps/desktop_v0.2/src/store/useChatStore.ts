import { create } from "zustand";
import { ChatSession, Message, ModelConfig, CustomProviderConfig, EngineConfig, ApprovalRequest } from "../types/index.js";

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  models: ModelConfig[];
  customProviders: CustomProviderConfig[];
  engineConfig: EngineConfig;
  isSidebarOpen: boolean;
  isSettingsOpen: boolean;
  viewMode: "chat" | "library";
  pendingApproval: ApprovalRequest | null;
  
  // Active Plan States
  activePlanAnswers: Record<string, string>;
  activePlanFiles: string[];
  activePlanCustomInstructions: string;
  
  // Actions
  toggleSidebar: () => void;
  setSettingsOpen: (open: boolean) => void;
  setViewMode: (mode: "chat" | "library") => void;
  respondToApproval: (approved: boolean) => void;
  
  // Active Plan Actions
  updatePlanAnswer: (qId: string, val: string) => void;
  setPlanFiles: (files: string[]) => void;
  togglePlanFile: (path: string) => void;
  updatePlanCustomInstructions: (val: string) => void;
  
  // Session Actions
  addSession: () => void;
  selectSession: (id: string) => void;
  deleteSession: (id: string) => void;
  sendMessage: (content: string) => void;
  clearMessages: (sessionId: string) => void;
  
  // Model Actions (CRUD)
  addModel: (model: Omit<ModelConfig, "id">) => void;
  updateModel: (id: string, updated: Partial<ModelConfig>) => void;
  deleteModel: (id: string) => void;
  toggleModelStatus: (id: string) => void;
  
  // Custom Provider Actions
  saveCustomProvider: (provider: CustomProviderConfig) => void;
  deleteCustomProvider: (providerId: string) => void;
  
  // Engine Actions
  updateEngineConfig: (config: Partial<EngineConfig>) => void;
}

const mockSessions: ChatSession[] = [
  {
    id: "session-1",
    title: "React Dashboard R&D",
    activeModel: "Gemini 2.5 Flash",
    activeMode: "Agent Mode",
    targetIDE: "Antigravity IDE",
    workspacePath: "/Volumes/SSD/0.1/istiyak_agent_v0.1",
    messages: [
      {
        id: "m1",
        role: "user",
        content: "Hi! Can you help me design a glassmorphic sidebar layout for my React app?",
        timestamp: "10:24 AM"
      },
      {
        id: "m2",
        role: "assistant",
        content: "Certainly! I recommend using a semi-transparent dark background (e.g. `bg-[#09090b]/80`) along with `backdrop-blur-md` and a thin, subtle white border like `border-white/10`. You should also add an Outfit font and high-contrast, glowing accents to make it look premium.",
        timestamp: "10:25 AM",
        fileMonitor: {
          files: [
            { filePath: "src/components/sidebar/SidebarContainer.tsx", linesRead: "L10-L120", status: "completed" }
          ],
          tools: [
            { toolName: "view_file", status: "completed" }
          ]
        }
      }
    ]
  },
  {
    id: "session-2",
    title: "Tauri APK Android Configuration",
    activeModel: "Claude 3.5 Sonnet",
    activeMode: "Plan Mode",
    targetIDE: "Antigravity IDE",
    workspacePath: "/Volumes/SSD/0.1/istiyak_agent_v0.1",
    messages: [
      {
        id: "m3",
        role: "user",
        content: "How do I configure Tauri v2 for Android packaging?",
        timestamp: "Yesterday"
      },
      {
        id: "m4",
        role: "assistant",
        content: "First, run `cargo tauri android init` to generate the Android project files in `src-tauri/gen/android`. Then make sure you have the Android SDK, NDK, and Java configured in your environment. You can compile with `cargo tauri android build` to get the APK.",
        timestamp: "Yesterday",
        fileMonitor: {
          files: [
            { filePath: "src-tauri/Cargo.toml", linesRead: "L1-L30", status: "completed" }
          ],
          diffs: [
            { filePath: "src-tauri/gen/android/AndroidManifest.xml", diffSummary: "Add camera and internet permissions to manifest configuration", progress: 100, additions: 4, deletions: 0 }
          ],
          tools: [
            { toolName: "grep_search", status: "completed" },
            { toolName: "replace_file_content", status: "completed" }
          ]
        }
      }
    ]
  }
];

const mockModels: ModelConfig[] = [
  {
    id: "model-1",
    name: "Gemini Pro Plan",
    baseUrl: "https://generativelanguage.googleapis.com",
    apiKey: "••••••••••••••••",
    modelId: "gemini-2.5-pro",
    status: true
  },
  {
    id: "model-2",
    name: "GPT-4o Speed",
    baseUrl: "https://api.openai.com/v1",
    apiKey: "••••••••••••••••",
    modelId: "gpt-4o",
    status: true
  },
  {
    id: "model-3",
    name: "DeepSeek Reasoner",
    baseUrl: "https://api.deepseek.com/v1",
    apiKey: "••••••••••••••••",
    modelId: "deepseek-reasoner",
    status: false
  }
];

const defaultEngineConfig: EngineConfig = {
  provider: "Google Gemini",
  selectedModel: "Gemini 2.5 Flash",
  customModelName: "",
  authentication: "API Key",
  apiKey: "AIzaSyD-mock-key-12345",
  serviceAccountPath: "/Users/user/credentials/gcp-sa.json",
  gcpProjectId: "istiyak-companion-dev",
  vertexRegion: "us-central1"
};

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: mockSessions,
  activeSessionId: "session-2",
  models: mockModels,
  customProviders: [],
  engineConfig: defaultEngineConfig,
  isSidebarOpen: true,
  isSettingsOpen: false,
  viewMode: "chat",
  pendingApproval: null,
  activePlanAnswers: {},
  activePlanFiles: [],
  activePlanCustomInstructions: "",

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setViewMode: (mode) => set({ viewMode: mode }),

  updatePlanAnswer: (qId, val) => set((state) => ({
    activePlanAnswers: { ...state.activePlanAnswers, [qId]: val }
  })),
  setPlanFiles: (files) => set({ activePlanFiles: files }),
  togglePlanFile: (path) => set((state) => ({
    activePlanFiles: state.activePlanFiles.includes(path)
      ? state.activePlanFiles.filter(p => p !== path)
      : [...state.activePlanFiles, path]
  })),
  updatePlanCustomInstructions: (val) => set({ activePlanCustomInstructions: val }),

  respondToApproval: (approved) => {
    const { pendingApproval, activeSessionId, sessions } = get();
    if (!pendingApproval || !activeSessionId) return;

    const activeSession = sessions.find(s => s.id === activeSessionId);
    if (!activeSession) return;

    const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let assistantMsg: Message;

    if (approved) {
      if (pendingApproval.type === "file_edit") {
        assistantMsg = {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: `✅ **Action Approved**: Successfully edited **${pendingApproval.target}**.\n\nChanges have been merged into the workspace. Code review is now complete.`,
          timestamp: responseTime,
          fileMonitor: {
            files: [
              { filePath: pendingApproval.target, linesRead: "L1-L150", status: "completed" }
            ],
            diffs: [
              { filePath: pendingApproval.target, diffSummary: pendingApproval.description, progress: 100, additions: 24, deletions: 2 }
            ],
            tools: [
              { toolName: "replace_file_content", status: "completed" }
            ]
          }
        };
      } else if (pendingApproval.type === "plan_proposal") {
        const { activePlanAnswers, activePlanFiles, activePlanCustomInstructions } = get();
        assistantMsg = {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: `✅ **Plan Approved**: Starting execution of **${pendingApproval.target}**.\n\n` +
                   `**Selected Files to Modify**: ${activePlanFiles.map(f => `\`${f.split("/").pop()}\``).join(", ") || "None"}\n` +
                   (Object.keys(activePlanAnswers).length > 0 ? `**Feedback Captured**:\n${Object.keys(activePlanAnswers).map(k => `- ${k}: *${activePlanAnswers[k]}*`).join("\n")}\n` : "") +
                   (activePlanCustomInstructions ? `**Custom Instructions**: *"${activePlanCustomInstructions}"*\n` : "") +
                   `\nRunning file modifications and tests...`,
          timestamp: responseTime,
          fileMonitor: {
            files: activePlanFiles.map(path => ({ filePath: path, linesRead: "L1-L100", status: "completed" as const })),
            diffs: activePlanFiles.slice(0, 2).map(path => ({
              filePath: path,
              diffSummary: "Applied plan specification changes",
              progress: 100,
              additions: 12,
              deletions: 1
            })),
            tools: [
              { toolName: "replace_file_content", status: "completed" as const },
              { toolName: "run_command", status: "completed" as const }
            ]
          }
        };
      } else {
        assistantMsg = {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: `✅ **Action Approved**: Executed command \`${pendingApproval.target}\` successfully.\n\nAll tests passed and build verified.`,
          timestamp: responseTime,
          fileMonitor: {
            tools: [
              { toolName: "run_command", status: "completed" }
            ]
          }
        };
      }
    } else {
      if (pendingApproval.type === "plan_proposal") {
        assistantMsg = {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: `❌ **Plan Rejected / Revisions Requested**: The proposed plan **${pendingApproval.target}** was sent back for edits.\n\nAborting execution. Please suggest plan adjustments or new directives.`,
          timestamp: responseTime
        };
      } else {
        assistantMsg = {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: `❌ **Action Rejected**: User denied permission to ${pendingApproval.type === "file_edit" ? "edit" : "run"} **${pendingApproval.target}**.\n\nAborting execution path. Please let me know how you would like to proceed.`,
          timestamp: responseTime,
          fileMonitor: {
            tools: [
              { toolName: pendingApproval.type === "file_edit" ? "replace_file_content" : "run_command", status: "denied" }
            ]
          }
        };
      }
    }

    set((state) => ({
      pendingApproval: null,
      activePlanAnswers: {},
      activePlanFiles: [],
      activePlanCustomInstructions: "",
      sessions: state.sessions.map((s) => {
        if (s.id === activeSessionId) {
          const updatedMessages = s.messages.map((m) => {
            if (m.id === pendingApproval.planId) {
              return {
                ...m,
                planReviewState: approved ? ("approved" as const) : ("rejected" as const)
              };
            }
            return m;
          });
          return {
            ...s,
            messages: [...updatedMessages, assistantMsg]
          };
        }
        return s;
      })
    }));
  },

  addSession: () => set((state) => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: `New Session ${state.sessions.length + 1}`,
      activeModel: state.engineConfig.provider === "Custom Provider"
        ? "Custom Model"
        : state.engineConfig.selectedModel,
      activeMode: "Agent Mode",
      targetIDE: "Antigravity IDE",
      workspacePath: "/Volumes/SSD/0.1/istiyak_agent_v0.1",
      messages: []
    };
    return {
      sessions: [newSession, ...state.sessions],
      activeSessionId: newId
    };
  }),

  selectSession: (id) => set({ activeSessionId: id }),

  deleteSession: (id) => set((state) => {
    const filtered = state.sessions.filter((s) => s.id !== id);
    let nextActive = state.activeSessionId;
    if (state.activeSessionId === id) {
      nextActive = filtered.length > 0 ? filtered[0].id : null;
    }
    return {
      sessions: filtered,
      activeSessionId: nextActive
    };
  }),

  sendMessage: (content) => set((state) => {
    if (!state.activeSessionId) return {};

    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: formattedTime
    };

    // Update session with user message
    const updatedSessions = state.sessions.map((s) => {
      if (s.id === state.activeSessionId) {
        return {
          ...s,
          messages: [...s.messages, userMsg]
        };
      }
      return s;
    });

    const lowerContent = content.toLowerCase();
    const isFileEdit = lowerContent.includes("edit") || lowerContent.includes("update") || lowerContent.includes("modify");
    const isCommandRun = lowerContent.includes("run") || lowerContent.includes("execute");
    const isPlan = lowerContent.includes("plan");

    if (isPlan) {
      setTimeout(() => {
        const activeSession = get().sessions.find(s => s.id === get().activeSessionId);
        if (!activeSession) return;

        const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const messageId = `msg-${Date.now()}`;
        
        const planTitle = "Integrate R&D UI Component Library Playground";
        const proposedPlan = {
          planTitle,
          description: "Establish a localized sandbox inside /src/components/library/ to preview, stage, and verify new monochrome UI components before publishing them to the workspace shell.",
          risks: [
            "Will modify index.css slightly to add global scrollbar styling rules",
            "Will add 25 new dynamic subcomponents to the source catalog"
          ],
          proposedChanges: [
            { type: "new" as const, fileName: "ComponentLibrary.tsx", path: "src/components/library/ComponentLibrary.tsx", description: "Create a playground component to isolate and view R&D code modules." },
            { type: "modify" as const, fileName: "AgentActions.tsx", path: "src/components/library/AgentActions.tsx", description: "Refactor plan proposal card to display inline file checkboxes and explanation descriptions." }
          ],
          openQuestions: [
            { id: "visual-tests", text: "Should we support visual regression tests using our browser subagent now?", options: ["Yes, verify visual state", "No, skip for now"] },
            { id: "pills-layout", text: "Should we make the Accept/Reject pills absolute or block-layout?", options: ["Absolute Float", "Standard Block"] }
          ]
        };

        const assistantMsg: Message = {
          id: messageId,
          role: "assistant",
          content: "I have analyzed your request and formulated an implementation plan. Please review the details below and select your feedback choices. You can approve or reject the plan from the bottom action bar.",
          timestamp: responseTime,
          proposedPlan,
          planReviewState: null
        };

        const initialFiles = proposedPlan.proposedChanges.map(c => c.path);
        
        set((state) => ({
          activePlanAnswers: {},
          activePlanFiles: initialFiles,
          activePlanCustomInstructions: "",
          pendingApproval: {
            id: `req-${Date.now()}`,
            type: "plan_proposal",
            target: planTitle,
            description: "Review and approve proposed implementation plan",
            planId: messageId
          },
          sessions: state.sessions.map((s) => {
            if (s.id === state.activeSessionId) {
              return {
                ...s,
                messages: [...s.messages, assistantMsg]
              };
            }
            return s;
          })
        }));
      }, 1000);

      return { sessions: updatedSessions };
    }

    if (isFileEdit || isCommandRun) {
      setTimeout(() => {
        set({
          pendingApproval: {
            id: `req-${Date.now()}`,
            type: isFileEdit ? "file_edit" : "command_run",
            target: isFileEdit ? "src/components/chat/ChatBubble.tsx" : "npm run build",
            description: isFileEdit ? "Add glassmorphic file monitor block under response" : "Type checking & Verification"
          }
        });
      }, 800);

      return { sessions: updatedSessions };
    }

    // Simulate Agent Response after 1 second for R&D/UI demo purposes
    setTimeout(() => {
      const activeSession = get().sessions.find(s => s.id === get().activeSessionId);
      if (!activeSession) return;

      const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      let replyContent = `This is a simulated dynamic response from the agent using **${activeSession.activeModel}** in **${activeSession.activeMode}**.\n\nYou sent: "${content}".\n\nThis app is optimized for desktop, mobile, and Linux devices.`;
      let fileMonitor = undefined;

      if (lowerContent.includes("hello") || lowerContent.includes("hi")) {
        replyContent = "Hello! I am your companion AI. How can I assist with your R&D today?";
        fileMonitor = {
          files: [
            { filePath: "src/App.tsx", linesRead: "L1-L43", status: "completed" as const }
          ],
          tools: [
            { toolName: "view_file", status: "completed" as const }
          ]
        };
      } else if (lowerContent.includes("plan")) {
        replyContent = "Initiating Plan Mode...\n\n1. Analyzing requirements.\n2. Drafting file structures.\n3. Awaiting approval.";
        fileMonitor = {
          files: [
            { filePath: "src/types/index.ts", linesRead: "L1-L50", status: "completed" as const },
            { filePath: "src/store/useChatStore.ts", linesRead: "L1-L150", status: "completed" as const }
          ],
          diffs: [
            { filePath: "src/store/useChatStore.ts", diffSummary: "Prepare active mode settings bindings", progress: 100, additions: 15, deletions: 2 }
          ],
          tools: [
            { toolName: "grep_search", status: "completed" as const },
            { toolName: "replace_file_content", status: "completed" as const }
          ]
        };
      } else if (lowerContent.includes("monitor") || lowerContent.includes("file") || lowerContent.includes("show") || lowerContent.includes("activity")) {
        fileMonitor = {
          files: [
            { filePath: "src/components/chat/ChatWorkspace.tsx", linesRead: "L1-L79", status: "completed" as const },
            { filePath: "src/components/chat/ChatBubble.tsx", linesRead: "L15-L48", status: "reading" as const }
          ],
          diffs: [
            { filePath: "src/components/chat/ChatBubble.tsx", diffSummary: "Add glassmorphic file monitor block under response", progress: 45, additions: 18, deletions: 1 }
          ],
          tools: [
            { toolName: "view_file", status: "completed" as const },
            { toolName: "replace_file_content", status: "calling" as const }
          ]
        };
      } else if (lowerContent.includes("search") || lowerContent.includes("find") || lowerContent.includes("grep")) {
        fileMonitor = {
          files: [
            { filePath: "src/components/library/ComponentLibrary.tsx", linesRead: "L370-L389", status: "completed" as const }
          ],
          tools: [
            { toolName: "grep_search", status: "completed" as const }
          ]
        };
      } else if (lowerContent.includes("think")) {
        replyContent = "I am processing your request deeply before forming a response.";
        fileMonitor = undefined;
      } else if (lowerContent.includes("permission")) {
        replyContent = "Permission gate triggered. Review and respond.";
        fileMonitor = undefined;
      } else if (lowerContent.includes("question")) {
        replyContent = "I need your input before I proceed.";
        fileMonitor = undefined;
      } else if (lowerContent.includes("tasks")) {
        replyContent = "Here is the execution checklist for this task:";
        fileMonitor = undefined;
      } else if (lowerContent.includes("step")) {
        replyContent = "Executing in sequential steps:";
        fileMonitor = undefined;
      } else if (lowerContent.includes("delegate")) {
        replyContent = "Delegating this task to a sub-agent:";
        fileMonitor = undefined;
      } else if (lowerContent.includes("notify")) {
        replyContent = "Operation completed successfully.";
        fileMonitor = undefined;
      } else if (lowerContent.includes("diff")) {
        replyContent = "Here is the code diff for the file I just modified:";
        fileMonitor = undefined;
      } else {
        fileMonitor = {
          files: [
            { filePath: "src/types/index.ts", linesRead: "L1-L25", status: "completed" as const }
          ],
          tools: [
            { toolName: "view_file", status: "completed" as const }
          ]
        };
      }

      // Build rich UI extras based on keyword
      const thinkingBlock = lowerContent.includes("think") ? {
        thoughts: "Step 1: Reading user intent...\nStep 2: Checking workspace context for relevant files...\nStep 3: Formulating a precise, minimal diff response to apply changes without breaking existing patterns.\nStep 4: Validating the approach against TypeScript types.\nStep 5: Ready to respond.",
        durationSec: 3.7
      } : undefined;

      const permissionRequest = lowerContent.includes("permission") ? {
        action: "write_file",
        target: "src/store/useChatStore.ts",
        reason: "Need to persist new session state changes to this file.",
        answered: undefined
      } : undefined;

      const questionCard = lowerContent.includes("question") ? {
        question: "Which mode should I use to handle the state persistence?",
        options: ["Zustand Persist Middleware", "localStorage Manual Sync", "In-memory Only (No Persist)"],
        answered: undefined
      } : undefined;

      const stagedTasks = lowerContent.includes("tasks") ? [
        { id: "t1", label: "Scan project for affected files", status: "done" as const },
        { id: "t2", label: "Apply diff to ChatBubble.tsx", status: "running" as const },
        { id: "t3", label: "Run TypeScript compile check", status: "pending" as const },
        { id: "t4", label: "Verify in browser at port 1421", status: "pending" as const }
      ] : undefined;

      const stepperSteps = lowerContent.includes("step") ? [
        { label: "Reading workspace structure", status: "done" as const },
        { label: "Analyzing component dependencies", status: "done" as const },
        { label: "Applying library integration changes", status: "current" as const },
        { label: "TypeScript verification", status: "pending" as const },
        { label: "Browser QA pass", status: "pending" as const }
      ] : undefined;

      const subagentDelegation = lowerContent.includes("delegate") ? {
        agentName: "FileOps Subagent",
        task: "Scan and patch all responsive breakpoints in library components",
        status: "running" as const,
        model: "Gemini 2.5 Flash"
      } : undefined;

      const notification = lowerContent.includes("notify") ? {
        type: "success" as const,
        message: "All library components have been integrated into the live chat successfully."
      } : undefined;

      const diffLines = lowerContent.includes("diff") ? [
        { type: "normal" as const, content: "import React from 'react';" },
        { type: "deletion" as const, content: "const MAX_MESSAGES = 50;" },
        { type: "addition" as const, content: "const MAX_MESSAGES = 200;" },
        { type: "normal" as const, content: "" },
        { type: "deletion" as const, content: "  const [isSidebarOpen, setIsSidebarOpen] = useState(false);" },
        { type: "addition" as const, content: "  const [isSidebarOpen, setIsSidebarOpen] = useState(true);" },
        { type: "normal" as const, content: "  const [activeTab, setActiveTab] = useState('chat');" },
      ] : undefined;

      const editorTabs = (lowerContent.includes("edit") || lowerContent.includes("diff")) ? [
        { id: "tab-1", name: "ChatBubble.tsx", isModified: true },
        { id: "tab-2", name: "useChatStore.ts", isModified: true },
        { id: "tab-3", name: "types/index.ts", isModified: false }
      ] : undefined;

      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: replyContent,
        timestamp: responseTime,
        fileMonitor,
        thinkingBlock,
        permissionRequest,
        questionCard,
        stagedTasks,
        stepperSteps,
        subagentDelegation,
        notification,
        diffLines,
        editorTabs
      };

      set((state) => ({
        sessions: state.sessions.map((s) => {
          if (s.id === state.activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, assistantMsg]
            };
          }
          return s;
        })
      }));
    }, 1000);

    return { sessions: updatedSessions };
  }),

  clearMessages: (sessionId) => set((state) => ({
    sessions: state.sessions.map((s) =>
      s.id === sessionId ? { ...s, messages: [] } : s
    )
  })),

  // Model Actions
  addModel: (model) => set((state) => ({
    models: [...state.models, { ...model, id: `model-${Date.now()}` }]
  })),

  updateModel: (id, updated) => set((state) => ({
    models: state.models.map((m) => (m.id === id ? { ...m, ...updated } : m))
  })),

  deleteModel: (id) => set((state) => ({
    models: state.models.filter((m) => m.id !== id)
  })),

  toggleModelStatus: (id) => set((state) => ({
    models: state.models.map((m) => (m.id === id ? { ...m, status: !m.status } : m))
  })),

  // Custom Provider Actions
  saveCustomProvider: (provider) => set((state) => {
    const exists = state.customProviders.some((p) => p.providerId === provider.providerId);
    const updated = exists
      ? state.customProviders.map((p) => (p.providerId === provider.providerId ? provider : p))
      : [...state.customProviders, provider];
    return { customProviders: updated };
  }),

  deleteCustomProvider: (providerId) => set((state) => ({
    customProviders: state.customProviders.filter((p) => p.providerId !== providerId)
  })),

  // Engine Actions
  updateEngineConfig: (config) => set((state) => {
    const nextConfig = { ...state.engineConfig, ...config };

    // Update active model in active session if provider/model changes
    const updatedSessions = state.sessions.map((s) => {
      if (s.id === state.activeSessionId) {
        return {
          ...s,
          activeModel: nextConfig.provider === "Custom Provider"
            ? "Custom Model"
            : nextConfig.selectedModel
        };
      }
      return s;
    });

    return {
      engineConfig: nextConfig,
      sessions: updatedSessions
    };
  })
}));
