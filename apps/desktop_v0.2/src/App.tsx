import { SidebarContainer } from "./components/sidebar/SidebarContainer.js";
import { ChatWorkspace } from "./components/chat/ChatWorkspace.js";
import { ComponentLibrary } from "./components/library/ComponentLibrary.js";
import { SettingsDrawer } from "./components/settings/SettingsDrawer.js";
import { useChatStore } from "./store/useChatStore.js";
import { PanelLeftOpen } from "lucide-react";
import { GlassButton } from "./components/ui/GlassButton.js";

export default function App() {
  const { isSidebarOpen, toggleSidebar, viewMode } = useChatStore();

  return (
    <div className="w-screen h-screen overflow-hidden flex bg-cyber-dark font-outfit text-gray-200 relative select-none">
      
      {/* Collapsible Sidebar */}
      <SidebarContainer />

      {/* Sidebar Backdrop for Mobile */}
      {isSidebarOpen && (
        <div 
          onClick={toggleSidebar}
          className="md:hidden fixed inset-0 bg-black/60 z-20 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* Main Workspace (Toggled between Chat and Library Playground) */}
      {viewMode === "chat" ? (
        <ChatWorkspace />
      ) : (
        <ComponentLibrary />
      )}

      {/* Settings Drawer Modal */}
      <SettingsDrawer />

      {/* Floating Toggle button when Sidebar is closed */}
      {!isSidebarOpen && viewMode !== "chat" && (
        <GlassButton
          onClick={toggleSidebar}
          variant="ghost"
          size="xs"
          className="absolute top-3.5 left-4 z-20 !p-1.5 text-gray-400 hover:text-white"
          title="Show Sidebar"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </GlassButton>
      )}
    </div>
  );
}
