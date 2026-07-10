import React, { useState } from "react";
import { useChatStore } from "../../store/useChatStore.js";
import { PanelLeftOpen, HelpCircle } from "lucide-react";
import { MessageArea } from "./MessageArea.js";
import { InputContainer } from "./InputContainer.js";
import { GlassButton } from "../ui/GlassButton.js";
import { AcceptRejectPills, EditorTabs } from "../library/AgentActions.js";

export const ChatWorkspace: React.FC = () => {
  const {
    sessions,
    activeSessionId,
    isSidebarOpen,
    toggleSidebar,
    pendingApproval,
    respondToApproval
  } = useChatStore();

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  // Collect editor tabs from the latest message that has them
  const latestEditorTabs = (() => {
    if (!activeSession) return undefined;
    for (let i = activeSession.messages.length - 1; i >= 0; i--) {
      if (activeSession.messages[i].editorTabs?.length) {
        return activeSession.messages[i].editorTabs;
      }
    }
    return undefined;
  })();

  const [activeTabId, setActiveTabId] = useState<string>("");
  const [openTabs, setOpenTabs] = useState<typeof latestEditorTabs>(undefined);

  // Sync open tabs when latestEditorTabs changes
  React.useEffect(() => {
    if (latestEditorTabs && latestEditorTabs.length > 0) {
      setOpenTabs(latestEditorTabs);
      setActiveTabId(latestEditorTabs[0].id);
    }
  }, [latestEditorTabs?.map(t => t.id).join(",")]);

  const handleCloseTab = (id: string) => {
    setOpenTabs((prev) => prev?.filter((t) => t.id !== id));
  };

  if (!activeSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-cyber-dark text-gray-500">
        <HelpCircle className="w-12 h-12 text-gray-600 mb-3 animate-pulse" />
        <span className="text-sm font-medium">Create or select a session to get started.</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-cyber-dark relative">
      {/* Workspace Bar */}
      <div className="border-b border-cyber-card-border bg-cyber-dark/80 backdrop-blur-md z-10">


        {/* Editor Tabs Row — shown when agent is editing files */}
        {openTabs && openTabs.length > 0 && (
          <div className="px-4 pb-2.5 flex items-center gap-2">
            <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest shrink-0">Editing:</span>
            <EditorTabs
              tabs={openTabs}
              activeTabId={activeTabId}
              onSelectTab={setActiveTabId}
              onCloseTab={handleCloseTab}
            />
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-hidden relative">
        <MessageArea messages={activeSession.messages} />
      </div>

      {/* Bottom Floating/Fixed Input */}
      <div className="p-4 bg-gradient-to-t from-cyber-dark via-cyber-dark/95 to-transparent flex flex-col gap-2.5">
        {pendingApproval && (
          <div className="w-full max-w-4xl mx-auto flex justify-end">
            <div className="flex items-center gap-3 px-4 py-2.5 border border-white/[0.05] bg-[#0d0e12]/95 backdrop-blur-md rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col text-right">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                  {pendingApproval.type === "file_edit"
                    ? "Proposed File Edit"
                    : pendingApproval.type === "plan_proposal"
                      ? "Proposed Implementation Plan"
                      : "Proposed Command Execution"}
                </span>
                <span className="text-[10px] text-gray-300 font-mono font-bold max-w-[250px] truncate mt-0.5">
                  {pendingApproval.target}
                </span>
              </div>
              <div className="h-6 w-[1px] bg-white/10" />
              <AcceptRejectPills
                onAccept={() => respondToApproval(true)}
                onReject={() => respondToApproval(false)}
                acceptLabel={pendingApproval.type === "plan_proposal" ? "Approve Plan" : "Approve"}
                rejectLabel={pendingApproval.type === "plan_proposal" ? "Request Edit" : "Reject"}
              />
            </div>
          </div>
        )}
        <InputContainer />
      </div>
    </div>
  );
};
