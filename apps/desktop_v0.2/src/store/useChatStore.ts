import { create } from "zustand";
import { ChatSession, Message, ModelConfig, CustomProviderConfig, EngineConfig } from "../types/index.js";

interface ChatState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  models: ModelConfig[];
  customProviders: CustomProviderConfig[];
  engineConfig: EngineConfig;
  isSidebarOpen: boolean;
  isSettingsOpen: boolean;
  
  // Actions
  toggleSidebar: () => void;
  setSettingsOpen: (open: boolean) => void;
  
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
        timestamp: "10:25 AM"
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
        timestamp: "Yesterday"
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
  activeSessionId: "session-1",
  models: mockModels,
  customProviders: [],
  engineConfig: defaultEngineConfig,
  isSidebarOpen: true,
  isSettingsOpen: false,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),

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

    // Simulate Agent Response after 1 second for R&D/UI demo purposes
    setTimeout(() => {
      const activeSession = get().sessions.find(s => s.id === get().activeSessionId);
      if (!activeSession) return;
      
      const responseTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      let replyContent = `This is a simulated dynamic response from the agent using **${activeSession.activeModel}** in **${activeSession.activeMode}**.\n\nYou sent: "${content}".\n\nThis app is optimized for desktop, mobile, and Linux devices.`;
      
      if (content.toLowerCase().includes("hello") || content.toLowerCase().includes("hi")) {
        replyContent = "Hello! I am your companion AI. How can I assist with your R&D today?";
      } else if (content.toLowerCase().includes("plan")) {
        replyContent = "Initiating Plan Mode...\n\n1. Analyzing requirements.\n2. Drafting file structures.\n3. Awaiting approval.";
      }
      
      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: replyContent,
        timestamp: responseTime
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
