import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface SettingsState {
  provider: 'gemini' | 'openai' | 'claude' | 'ollama' | 'custom';
  authMethod: 'apiKey' | 'serviceAccount';
  apiKey: string;
  serviceAccountPath: string;
  projectId: string;
  location: string;
  selectedModel: string;
  customModel: string;
  workspacePath: string;
  googleSearchEnabled: boolean;
  dockerSandboxEnabled: boolean;
  cloudSandboxEnabled: boolean;
  sandboxImage: string;
  token: string;
  userEmail: string;
  isLoading: boolean;
  error: string | null;
  activeTheme: string;
  installedPrompts: Array<{ title: string, prompt: string }>;
  installedExtensions: Array<{
    id: string;
    name: string;
    description: string;
    commands: Array<{ name: string, command: string }>;
    prompts: Array<{ title: string, prompt: string }>;
  }>;

  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<Omit<SettingsState, 'isLoading' | 'error' | 'loadSettings' | 'updateSettings'>>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  provider: "gemini",
  authMethod: "apiKey",
  apiKey: "",
  serviceAccountPath: "",
  projectId: "",
  location: "global",
  selectedModel: "gemini-2.5-flash",
  customModel: "",
  workspacePath: "",
  googleSearchEnabled: false,
  dockerSandboxEnabled: false,
  cloudSandboxEnabled: false,
  sandboxImage: "node:20-alpine",
  token: "",
  userEmail: "",
  activeTheme: "cursor-dark",
  installedPrompts: [],
  installedExtensions: [],
  isLoading: false,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      // Call Tauri command
      const config: any = await invoke("load_config");
      
      const provider = (config.PROVIDER || "gemini") as any;
      const authMethod = (config.AUTH_METHOD || "apiKey") as any;
      const apiKey = config.API_KEY || config.GEMINI_API_KEY || config.OPENAI_API_KEY || config.CLAUDE_API_KEY || "";
      const serviceAccountPath = config.SERVICE_ACCOUNT_PATH || "";
      const projectId = config.PROJECT_ID || "";
      const location = config.LOCATION || "global";
      const selectedModel = config.SELECTED_MODEL || config.MODEL || "gemini-2.5-flash";
      const customModel = config.CUSTOM_MODEL || "";
      const workspacePath = config.WORKSPACE_PATH || "";
      const googleSearchEnabled = !!config.GOOGLE_SEARCH_ENABLED;
      const dockerSandboxEnabled = !!config.DOCKER_SANDBOX_ENABLED;
      const cloudSandboxEnabled = !!config.CLOUD_SANDBOX_ENABLED;
      const sandboxImage = config.SANDBOX_IMAGE || "node:20-alpine";
      const token = config.TOKEN || "";
      const userEmail = config.USER_EMAIL || "";
      const activeTheme = config.ACTIVE_THEME || "cursor-dark";
      const installedPrompts = Array.isArray(config.INSTALLED_PROMPTS) ? config.INSTALLED_PROMPTS : [];
      const installedExtensions = Array.isArray(config.INSTALLED_EXTENSIONS) ? config.INSTALLED_EXTENSIONS : [];

      set({
        provider,
        authMethod,
        apiKey,
        serviceAccountPath,
        projectId,
        location,
        selectedModel,
        customModel,
        workspacePath,
        googleSearchEnabled,
        dockerSandboxEnabled,
        cloudSandboxEnabled,
        sandboxImage,
        token,
        userEmail,
        activeTheme,
        installedPrompts,
        installedExtensions,
        isLoading: false,
      });
    } catch (err: any) {
      console.error("Failed to load settings from Rust config:", err);
      set({ error: err.message || "Failed to load settings", isLoading: false });
    }
  },

  updateSettings: async (newSettings) => {
    set((state) => ({
      ...state,
      ...newSettings,
    }));
    // Save to Rust config
    await saveToRustConfig(get());
  },
}));

async function saveToRustConfig(state: SettingsState) {
  try {
    const config = {
      PROVIDER: state.provider,
      AUTH_METHOD: state.authMethod,
      API_KEY: state.apiKey,
      SERVICE_ACCOUNT_PATH: state.serviceAccountPath,
      PROJECT_ID: state.projectId,
      LOCATION: state.location,
      SELECTED_MODEL: state.selectedModel,
      CUSTOM_MODEL: state.customModel,
      WORKSPACE_PATH: state.workspacePath,
      GOOGLE_SEARCH_ENABLED: state.googleSearchEnabled,
      DOCKER_SANDBOX_ENABLED: state.dockerSandboxEnabled,
      CLOUD_SANDBOX_ENABLED: state.cloudSandboxEnabled,
      SANDBOX_IMAGE: state.sandboxImage,
      TOKEN: state.token,
      USER_EMAIL: state.userEmail,
      ACTIVE_THEME: state.activeTheme,
      INSTALLED_PROMPTS: state.installedPrompts,
      INSTALLED_EXTENSIONS: state.installedExtensions,
    };
    await invoke("save_config", { config });
  } catch (err) {
    console.error("Failed to save settings to Rust config:", err);
  }
}

