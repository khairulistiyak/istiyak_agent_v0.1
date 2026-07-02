import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StateStorage } from "zustand/middleware";
import { createChatSlice, ChatSlice } from "./slices/chatSlice.js";
import { createSettingsSlice, SettingsSlice } from "./slices/settingsSlice.js";
import { createUiSlice, UiSlice } from "./slices/uiSlice.js";

type GlobalStoreState = ChatSlice & SettingsSlice & UiSlice;

// Custom IndexedDB storage backend with automatic migration from localStorage
const indexedDBStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    // 1. Try to get from IndexedDB first
    const value = await new Promise<string | null>((resolve) => {
      const request = indexedDB.open("istiyak-db", 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore("store");
      };
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("store", "readonly");
        const store = tx.objectStore("store");
        const getReq = store.get(name);
        getReq.onsuccess = () => resolve(getReq.result || null);
        getReq.onerror = () => resolve(null);
      };
      request.onerror = () => resolve(null);
    });

    if (value !== null) {
      return value;
    }

    // 2. If not found in IndexedDB, check localStorage for migration
    try {
      const localValue = localStorage.getItem(name);
      if (localValue !== null) {
        console.warn(`Migrating store ${name} from localStorage to IndexedDB...`);
        // Save to IndexedDB so it's migrated
        await indexedDBStorage.setItem(name, localValue);
        // Remove from localStorage to free up space
        localStorage.removeItem(name);
        return localValue;
      }
    } catch (e) {
      console.warn("localStorage read failed during migration:", e);
    }

    return null;
  },

  setItem: async (name: string, value: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("istiyak-db", 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore("store");
      };
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("store", "readwrite");
        const store = tx.objectStore("store");
        const putReq = store.put(value, name);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      };
      request.onerror = () => reject(request.error);
    });
  },

  removeItem: async (name: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("istiyak-db", 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore("store");
      };
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("store", "readwrite");
        const store = tx.objectStore("store");
        const delReq = store.delete(name);
        delReq.onsuccess = () => resolve();
        delReq.onerror = () => reject(delReq.error);
      };
      request.onerror = () => reject(request.error);
    });
  },
};

export const useGlobalStore = create<GlobalStoreState>()(
   persist(
     (...a) => ({
       ...createChatSlice(...a),
       ...createSettingsSlice(...a),
       ...createUiSlice(...a),
     }),
     {
       name: "istiyak-companion-global-store",
       storage: createJSONStorage(() => indexedDBStorage),
       // Only persist non-sensitive settings; secrets use memory/session storage
       partialize: (state) => ({
         conversations: state.conversations,
         activeId: state.activeId,
         provider: state.provider,
         authMethod: state.authMethod,
         serviceAccountPath: state.serviceAccountPath,
         projectId: state.projectId,
         location: state.location,
         selectedModel: state.selectedModel,
         customModel: state.customModel,
         workspacePath: state.workspacePath,
         googleSearchEnabled: state.googleSearchEnabled,
         dockerSandboxEnabled: state.dockerSandboxEnabled,
         cloudSandboxEnabled: state.cloudSandboxEnabled,
         sandboxImage: state.sandboxImage,
         userEmail: state.userEmail,
         activeTheme: state.activeTheme,
         installedPrompts: state.installedPrompts,
         installedExtensions: state.installedExtensions,
       }),
     }
   )
 );
