import { StateCreator } from "zustand";

export interface UiSlice {
  isSidebarOpen: boolean;
  isSettingsOpen: boolean;
  isMarketplaceOpen: boolean;
  isPermissionAlertOpen: boolean;
  activePermissionRequest: { id: string; command: string } | null;
  
  toggleSidebar: () => void;
  setSettingsOpen: (isOpen: boolean) => void;
  setMarketplaceOpen: (isOpen: boolean) => void;
  setPermissionRequest: (req: { id: string; command: string } | null) => void;
}

export const createUiSlice: StateCreator<UiSlice> = (set) => ({
  isSidebarOpen: true,
  isSettingsOpen: false,
  isMarketplaceOpen: false,
  isPermissionAlertOpen: false,
  activePermissionRequest: null,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
  setMarketplaceOpen: (isOpen) => set({ isMarketplaceOpen: isOpen }),
  setPermissionRequest: (req) => set({
    activePermissionRequest: req,
    isPermissionAlertOpen: !!req
  }),
});
