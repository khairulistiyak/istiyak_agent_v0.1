import React from "react";
import { UIMessage } from "ai";
import { FileExplorerPanel } from "../ide/FileTree.js";
import { EditorPanel } from "../ide/MonorepoEditor.js";
import { TerminalPanel } from "../ide/TerminalPanel.js";
import { ChatPanel } from "../chat/ChatPanel.js";
import { TerminalLog } from "../../types/chat.js";

interface PromptItem {
  title: string;
  prompt: string;
}

interface ExtensionCommand {
  name: string;
  command: string;
}

interface ExtensionItem {
  id: string;
  name: string;
  description: string;
  commands: ExtensionCommand[];
  prompts: PromptItem[];
}

interface IdeModeLayoutProps {
  workspacePath: string | null;
  workspaceFiles: string[];
  openedFile: string | null;
  gitBranch: string;
  gitInitialized: boolean;
  isIndexing: boolean;
  indexMessage: string;
  onFileSelect: (relPath: string) => void;
  onRefreshExplorer: () => void;
  onSelectWorkspace: () => void;
  onReindex: () => void;
  fileContent: string;
  editorLanguage: string;
  isSaving: boolean;
  onContentChange: (val: string) => void;
  onSaveFile: () => void;
  terminalLogs: TerminalLog[];
  terminalInput: string;
  isTerminalRunning: boolean;
  lastCompileError: string | null;
  installedExtensions: ExtensionItem[];
  onTerminalInputChange: (val: string) => void;
  onExecuteCommand: (e: React.FormEvent) => void;
  onClearTerminalLogs: () => void;
  onAutoFixError: () => void;
  onShortcutClick: (command: string) => void;
  messages: UIMessage[];
  chatInput: string;
  setChatInput: React.Dispatch<React.SetStateAction<string>>;
  isChatLoading: boolean;
  onSendChatMessage: () => void;
  onAbortAgent: () => void;
  onSettingsOpen: () => void;
  installedPrompts: PromptItem[];
  permissionStates: { [reqId: string]: "pending" | "approved" | "rejected" | "timed_out" };
  resolvedPermissionIds: Set<string>;
  onPermissionResponse: (reqId: string, approved: boolean) => void;
}

export const IdeModeLayout = React.memo(({
  workspacePath,
  workspaceFiles,
  openedFile,
  gitBranch,
  gitInitialized,
  isIndexing,
  indexMessage,
  onFileSelect,
  onRefreshExplorer,
  onSelectWorkspace,
  onReindex,
  fileContent,
  editorLanguage,
  isSaving,
  onContentChange,
  onSaveFile,
  terminalLogs,
  terminalInput,
  isTerminalRunning,
  lastCompileError,
  installedExtensions,
  onTerminalInputChange,
  onExecuteCommand,
  onClearTerminalLogs,
  onAutoFixError,
  onShortcutClick,
  messages,
  chatInput,
  setChatInput,
  isChatLoading,
  onSendChatMessage,
  onAbortAgent,
  onSettingsOpen,
  installedPrompts,
  permissionStates,
  resolvedPermissionIds,
  onPermissionResponse
}: IdeModeLayoutProps) => {
  return (
    <div className="flex-1 flex flex-row overflow-hidden">
      {/* Left Panel: File Explorer */}
      <FileExplorerPanel
        workspacePath={workspacePath}
        workspaceFiles={workspaceFiles}
        openedFile={openedFile}
        gitBranch={gitBranch}
        gitInitialized={gitInitialized}
        isIndexing={isIndexing}
        indexMessage={indexMessage}
        onFileSelect={onFileSelect}
        onRefresh={onRefreshExplorer}
        onSelectWorkspace={onSelectWorkspace}
        onReindex={onReindex}
      />

      {/* Center Panel: Editor & Terminal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <EditorPanel
          openedFile={openedFile}
          fileContent={fileContent}
          editorLanguage={editorLanguage}
          isSaving={isSaving}
          onContentChange={onContentChange}
          onSave={onSaveFile}
          lastCompileError={lastCompileError}
          onAutoFixError={onAutoFixError}
        />
        <TerminalPanel
          logs={terminalLogs}
          terminalInput={terminalInput}
          isTerminalRunning={isTerminalRunning}
          workspacePath={workspacePath}
          lastCompileError={lastCompileError}
          installedExtensions={installedExtensions}
          onTerminalInputChange={onTerminalInputChange}
          onExecuteCommand={onExecuteCommand}
          onClearLogs={onClearTerminalLogs}
          onAutoFixError={onAutoFixError}
          onShortcutClick={onShortcutClick}
        />
      </div>

      {/* Right Panel: Chat Panel */}
      <ChatPanel
        messages={messages}
        input={chatInput}
        setInput={setChatInput}
        isLoading={isChatLoading}
        onSend={onSendChatMessage}
        onAbort={onAbortAgent}
        onSettingsOpen={onSettingsOpen}
        installedPrompts={installedPrompts}
        permissionStates={permissionStates}
        resolvedPermissionIds={resolvedPermissionIds}
        onPermissionResponse={onPermissionResponse}
      />
    </div>
  );
});

IdeModeLayout.displayName = "IdeModeLayout";
