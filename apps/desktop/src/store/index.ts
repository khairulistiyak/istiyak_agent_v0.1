import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createChatSlice, ChatSlice } from "./slices/chatSlice.js";
import { createSettingsSlice, SettingsSlice } from "./slices/settingsSlice.js";
import { createUiSlice, UiSlice } from "./slices/uiSlice.js";

type GlobalStoreState = ChatSlice & SettingsSlice & UiSlice;

export const useGlobalStore = create<GlobalStoreState>()(
  persist(
    (...a) => ({
      ...createChatSlice(...a),
      ...createSettingsSlice(...a),
      ...createUiSlice(...a),
    }),
    {
      name: "istiyak-companion-global-store",
      partialize: (state) => ({
        conversations: state.conversations,
        activeId: state.activeId,
        provider: state.provider,
        authMethod: state.authMethod,
        apiKey: state.apiKey,
        selectedModel: state.selectedModel,
        workspacePath: state.workspacePath,
        googleSearchEnabled: state.googleSearchEnabled,
        dockerSandboxEnabled: state.dockerSandboxEnabled,
        cloudSandboxEnabled: state.cloudSandboxEnabled,
        sandboxImage: state.sandboxImage,
        token: state.token,
        userEmail: state.userEmail,
        activeTheme: state.activeTheme,
        installedPrompts: state.installedPrompts,
        installedExtensions: state.installedExtensions,
      }),
    }
  )
);
