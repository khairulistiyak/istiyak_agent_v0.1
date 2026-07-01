import { useState, useEffect, useCallback } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport, UIMessage } from "ai";
import { useChatStore } from "../store/chatStore.js";
import { useSettingsStore } from "../store/settingsStore.js";
import { API_BASE } from "../utils/config.js";
import { parseAgentMessage } from "../utils/parser.js";

// Layout components
import { TitleBar } from "./layout/TitleBar.js";
import { HistoryDrawer } from "./layout/HistoryDrawer.js";
import { IdeModeLayout } from "./layout/IdeModeLayout.js";

// Chat components
import { ChatPanel, type AgentMode } from "./chat/ChatPanel.js";

// Settings/Modal components
import { SettingsDrawer } from "./settings/SettingsDrawer.js";
import { AuthModal } from "./settings/AuthModal.js";
import { MarketplaceModal } from "./settings/Marketplace.js";
import { TelemetryModal } from "./settings/TelemetryModal.js";
import { Toggle } from "./ui/Toggle.js";

// Custom hooks
import { usePolling } from "../hooks/usePolling.js";
import { usePermissions } from "../hooks/usePermissions.js";
import { useIdeMode } from "../hooks/useIdeMode.js";

const getMessageText = (msg: UIMessage): string => {
  const rawMsg = msg as any;
  if (rawMsg.content) return rawMsg.content;
  if (!msg.parts) return "";
  return msg.parts
    .filter((part) => part.type === "text")
    .map((part: any) => part.text)
    .join("");
};

const AGENT_MODES: Array<{ id: AgentMode; label: string; hint: string }> = [
  { id: "chat", label: "Chat", hint: "No tools" },
  { id: "plan", label: "Plan", hint: "No edits" },
  { id: "assist", label: "Assist", hint: "Read only" },
  { id: "agent", label: "Agent", hint: "Approve" },
];

const MODE_POLICY: Record<AgentMode, { title: string; detail: string; card: string; dot: string }> =
  {
    chat: {
      title: "CHAT MODE",
      detail: "Plain answer only. No file access or terminal tools.",
      card: "border-cyan-400/60 bg-cyan-400/10 text-cyan-100",
      dot: "bg-cyan-300",
    },
    plan: {
      title: "PLAN MODE",
      detail: "Analyze and roadmap only. No edits or commands.",
      card: "border-violet-400/60 bg-violet-500/10 text-violet-100",
      dot: "bg-violet-300",
    },
    assist: {
      title: "ASSIST MODE",
      detail: "Read/search allowed. Write and run actions are blocked.",
      card: "border-amber-400/60 bg-amber-500/10 text-amber-100",
      dot: "bg-amber-300",
    },
    agent: {
      title: "AGENT MODE",
      detail: "Read/write/run allowed with approval gates for risky tools.",
      card: "border-emerald-400/60 bg-emerald-500/10 text-emerald-100",
      dot: "bg-emerald-300",
    },
  };

export default function ChatUI() {
  // Settings store
  const {
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
    loadSettings,
    updateSettings,
  } = useSettingsStore();

  // Chat store
  const {
    conversations,
    activeId,
    createConversation,
    deleteConversation,
    setActiveConversation,
    addMessage,
  } = useChatStore();

  // Custom hooks
  const polling = usePolling({ workspacePath, token, loadSettings });
  const permissions = usePermissions();
  const ide = useIdeMode({ workspacePath });

  // UI state
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [marketplaceOpen, setMarketplaceOpen] = useState(false);
  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const [agentMode, setAgentMode] = useState<AgentMode>("chat");

  // Auto-initialize conversation if list is empty
  useEffect(() => {
    if (conversations.length === 0) {
      createConversation();
    } else if (!activeId) {
      setActiveConversation(conversations[0].id);
    }
  }, [conversations, activeId, createConversation, setActiveConversation]);

  // Vercel AI SDK useChat Hook
  const activeConvo = conversations.find((c) => c.id === activeId);
  const { messages, setMessages, sendMessage, status, stop } = useChat({
    id: activeId || undefined,
    messages:
      activeConvo?.messages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant" | "system",
        parts: [{ type: "text" as const, text: m.content }],
      })) || [],

    // Intercept default REST fetch and stream locally from local Express server
    transport: new TextStreamChatTransport({
      fetch: async (_url, options) => {
        if (!options || !options.body) {
          return new Response("Error: Invalid request body", { status: 400 });
        }

        const reqBody = JSON.parse(options.body as string);
        const userMessages = reqBody.messages;
        const lastUserMsg = userMessages[userMessages.length - 1];
        const lastUserMsgText = getMessageText(lastUserMsg);

        // Save user message to Zustand history store
        if (activeId) {
          const currentConvo = useChatStore.getState().conversations.find((c) => c.id === activeId);
          const alreadyHasUserMsg = currentConvo?.messages.some((m) => m.id === lastUserMsg.id);
          if (!alreadyHasUserMsg) {
            addMessage(activeId, {
              id: lastUserMsg.id,
              role: "user",
              content: lastUserMsgText,
            });
          }
        }

        // Get config from useSettingsStore
        const settings = useSettingsStore.getState();
        const activeProvider = settings.provider;
        const activeModel =
          settings.selectedModel === "custom" ? settings.customModel : settings.selectedModel;
        const activeApiKey = settings.apiKey;

        if (settings.authMethod === "apiKey" && !activeApiKey && activeProvider !== "ollama") {
          const errorMsg = `Error: API Key for "${activeProvider}" is not configured. Please open Settings and set it.`;
          const errorStream = new ReadableStream({
            start(controller) {
              const encoder = new TextEncoder();
              controller.enqueue(encoder.encode(errorMsg));
              controller.close();
            },
          });
          return new Response(errorStream, {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }

        if (
          settings.authMethod === "serviceAccount" &&
          activeProvider === "gemini" &&
          !settings.serviceAccountPath
        ) {
          const errorMsg = `Error: Service Account JSON path is not configured. Please open Settings and set it.`;
          const errorStream = new ReadableStream({
            start(controller) {
              const encoder = new TextEncoder();
              controller.enqueue(encoder.encode(errorMsg));
              controller.close();
            },
          });
          return new Response(errorStream, {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }

        const mappedMessages = userMessages.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: getMessageText(m),
        }));

        // Truncate to last 60 messages to prevent oversized payloads
        const MAX_MESSAGES_TO_SEND = 60;
        const truncatedMessages =
          mappedMessages.length > MAX_MESSAGES_TO_SEND
            ? [mappedMessages[0], ...mappedMessages.slice(-MAX_MESSAGES_TO_SEND + 1)]
            : mappedMessages;

        // Call local Express engine
        const response = await fetch(`${API_BASE}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: truncatedMessages,
            provider: activeProvider,
            model: activeModel,
            authMethod: settings.authMethod,
            apiKey: activeApiKey,
            serviceAccountPath: settings.serviceAccountPath,
            projectId: settings.projectId,
            location: settings.location,
            workspacePath: settings.workspacePath,
            googleSearchEnabled: settings.googleSearchEnabled,
            cloudSandboxEnabled: settings.cloudSandboxEnabled,
            dockerSandboxEnabled: settings.dockerSandboxEnabled,
            sandboxImage: settings.sandboxImage,
            token: settings.token,
            agentMode,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Engine request failed: ${response.status} ${errText}`);
        }

        const reader = response.body?.getReader();

        const stream = new ReadableStream({
          async start(controller) {
            try {
              if (reader) {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  controller.enqueue(value);
                }
              }
            } catch (streamErr: any) {
              console.error("Stream reading error:", streamErr);
              const errChunk = `\n\n[Generation Error: ${streamErr.message || streamErr}]`;
              const encoder = new TextEncoder();
              controller.enqueue(encoder.encode(errChunk));
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        });
      },
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Trigger timeout on new pending permission requests
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.role === "assistant") {
        const text = getMessageText(msg);
        if (text.includes("permission_request")) {
          const parsed = parseAgentMessage(text);
          parsed.permissionRequests.forEach((req) => {
            permissions.addPermissionTimeout(req.id);
          });
        }
      }
    });
  }, [messages, permissions.addPermissionTimeout]);

  // Sync messages between Vercel AI SDK (useChat) and Zustand store
  useEffect(() => {
    if (isLoading) return;

    if (activeId && messages.length > 0) {
      const currentConvo = useChatStore.getState().conversations.find((c) => c.id === activeId);
      if (currentConvo) {
        const currentMsgCount = currentConvo.messages.length;
        const hookMsgCount = messages.length;
        if (hookMsgCount > currentMsgCount) {
          for (let i = currentMsgCount; i < hookMsgCount; i++) {
            const msg = messages[i];
            const msgText = getMessageText(msg);
            if (msgText) {
              useChatStore.getState().addMessage(activeId, {
                id: msg.id,
                role: msg.role as "user" | "assistant" | "system",
                content: msgText,
              });
            }
          }
        }
      }
    }
  }, [activeId, isLoading, messages.length]);

  // Load messages from Zustand when switching to a different conversation
  useEffect(() => {
    if (isLoading) return;

    const convo = useChatStore.getState().conversations.find((c) => c.id === activeId);
    if (convo) {
      setMessages(
        convo.messages.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant" | "system",
          parts: [{ type: "text" as const, text: m.content }],
        }))
      );
    } else {
      setMessages([]);
    }
  }, [activeId, setMessages, isLoading]);

  // Settings loaded at mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Abort running agent
  const handleAbortAgent = useCallback(async () => {
    try {
      stop();
      const res = await fetch(`${API_BASE}/api/agent/abort`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      console.log("[ChatUI] Abort response:", data);
    } catch (err) {
      console.error("Failed to abort agent:", err);
    }
  }, [stop]);

  // Send message
  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return;
    sendMessage({
      role: "user" as const,
      parts: [{ type: "text" as const, text: input }],
    });
    setInput("");
  }, [input, isLoading, sendMessage]);

  const appWindow = getCurrentWindow();

  const handleClose = useCallback(async () => {
    try {
      await appWindow.close();
    } catch (err) {
      console.error(err);
    }
  }, [appWindow]);

  const handleMinimize = useCallback(async () => {
    try {
      await appWindow.minimize();
    } catch (err) {
      console.error(err);
    }
  }, [appWindow]);

  const handleExpand = useCallback(async () => {
    try {
      await appWindow.toggleMaximize();
    } catch (err) {
      console.error(err);
    }
  }, [appWindow]);

  const renderToggle = useCallback((checked: boolean, onChange: () => void, disabled?: boolean) => {
    return <Toggle active={checked} onChange={onChange} disabled={disabled} />;
  }, []);

  const handleOpenWorkspace = useCallback(async () => {
    try {
      const selected: string = await invoke("select_directory");
      if (selected) {
        updateSettings({ workspacePath: selected });
      }
    } catch (err) {
      console.log("Directory selection cancelled or failed:", err);
    }
  }, [updateSettings]);

  const currentPolicy = MODE_POLICY[agentMode];

  return (
    <div className="relative flex flex-col h-screen w-full bg-cyber-dark border border-cyber-cardBorder rounded-xl overflow-hidden shadow-2xl animate-fade-in text-cyber-textPrimary">
      <TitleBar
        engineStatus={polling.engineStatus}
        isLoading={isLoading}
        token={token}
        userEmail={userEmail}
        onClose={handleClose}
        onMinimize={handleMinimize}
        onExpand={handleExpand}
        onAuthOpen={() => setAuthOpen(true)}
        onSettingsOpen={() => setSettingsOpen(true)}
        onHistoryOpen={() => setSidebarOpen(true)}
      />

      {ide.isIdeMode ? (
        <IdeModeLayout
          workspacePath={workspacePath}
          workspaceFiles={polling.workspaceFiles}
          openedFile={ide.openedFile}
          gitBranch={polling.gitBranch}
          gitInitialized={polling.gitInitialized}
          isIndexing={polling.isIndexing}
          indexMessage={polling.indexMessage}
          onFileSelect={ide.handleOpenFile}
          onRefreshExplorer={polling.refreshFiles}
          onSelectWorkspace={handleOpenWorkspace}
          onReindex={polling.handleReindex}
          fileContent={ide.fileContent}
          editorLanguage={ide.editorLanguage}
          isSaving={ide.isSaving}
          onContentChange={ide.setFileContent}
          onSaveFile={ide.handleSaveFile}
          terminalLogs={ide.logs}
          terminalInput={ide.terminalInput}
          isTerminalRunning={ide.isTerminalRunning}
          lastCompileError={ide.lastCompileError}
          installedExtensions={installedExtensions as any}
          onTerminalInputChange={ide.setTerminalInput}
          onExecuteCommand={ide.handleExecuteTerminalCommand}
          onClearTerminalLogs={() =>
            ide.setLogs([
              {
                time: new Date().toLocaleTimeString(),
                message: "Terminal logs cleared.",
                type: "info",
              },
            ])
          }
          onAutoFixError={() => {
            setInput(
              `I encountered the following execution error in the terminal:\n\n${ide.lastCompileError}\n\nPlease diagnose and edit the codebase to fix this error.`
            );
            ide.setLastCompileError(null);
          }}
          onShortcutClick={ide.setTerminalInput}
          messages={messages}
          chatInput={input}
          setChatInput={setInput}
          isChatLoading={isLoading}
          onSendChatMessage={handleSend}
          onAbortAgent={handleAbortAgent}
          onSettingsOpen={() => setSettingsOpen(true)}
          installedPrompts={installedPrompts}
          permissionStates={permissions.permissionStates}
          resolvedPermissionIds={permissions.resolvedPermissionIds}
          onPermissionResponse={permissions.handlePermissionResponse}
        />
      ) : (
        <div className="flex-1 min-h-0 p-5 bg-gradient-to-br from-[#05060a] via-[#080a10] to-[#090b12]">
          <div className="grid h-full grid-cols-[236px_minmax(420px,1fr)_248px] gap-5">
            <aside className="flex flex-col rounded-[22px] border border-[#171b25] bg-gradient-to-b from-[#10131b] to-[#07080d] p-5">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500" />
                <div>
                  <h2 className="text-sm font-bold text-white">Istiyak Agent</h2>
                  <p className="text-[10px] text-cyber-textMuted">Current workspace</p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-[#1e2533] bg-[#0c0f16] px-3 py-3">
                <p
                  className="truncate font-mono text-[11px] text-slate-300"
                  title={workspacePath || "No workspace selected"}
                >
                  {workspacePath ? workspacePath.split(/[\\/]/).pop() : "No workspace"}
                </p>
              </div>

              <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.22em] text-cyber-textMuted">
                Mode selector
              </p>
              <div className="mt-3 space-y-2.5">
                {AGENT_MODES.map((mode) => {
                  const active = mode.id === agentMode;
                  const policy = MODE_POLICY[mode.id];
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setAgentMode(mode.id)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${active ? policy.card : "border-[#1e2533] bg-[#0b0e14] text-cyber-textSecondary hover:border-cyber-primary/40 hover:text-white"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${active ? policy.dot : "bg-slate-600"}`}
                          />
                          <span className="text-sm font-bold">{mode.label}</span>
                        </div>
                        <span className="text-[10px] opacity-70">{mode.hint}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-auto rounded-[18px] border border-emerald-500/25 bg-emerald-500/5 px-4 py-4">
                <h3 className="text-sm font-bold text-white">Safety Guard</h3>
                <p className="mt-2 text-[11px] leading-5 text-cyber-textSecondary">
                  Tool execution blocked until the selected mode allows it.
                </p>
              </div>
            </aside>

            <main className="flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-[#171b25] bg-[#0a0d14] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#171b25] bg-[#0d111a] px-6 py-4">
                <div>
                  <h1 className="text-base font-bold text-white">Chat-first Agent</h1>
                  <p className="text-[11px] text-cyber-textMuted">
                    Switch mode before giving an action.
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-[11px] font-bold ${currentPolicy.card}`}
                >
                  {currentPolicy.title}
                </span>
              </div>
              <ChatPanel
                messages={messages}
                input={input}
                setInput={setInput}
                isLoading={isLoading}
                onSend={handleSend}
                onAbort={handleAbortAgent}
                onSettingsOpen={() => setSettingsOpen(true)}
                installedPrompts={installedPrompts}
                permissionStates={permissions.permissionStates}
                resolvedPermissionIds={permissions.resolvedPermissionIds}
                onPermissionResponse={permissions.handlePermissionResponse}
                mode={agentMode}
                showModeHeader={false}
                className="flex-1 min-h-0 flex flex-col overflow-hidden bg-transparent"
              />
            </main>

            <aside className="rounded-[22px] border border-[#171b25] bg-[#0a0d14] p-6">
              <h2 className="text-base font-bold text-white">Permission Policy</h2>
              <p className="mt-1 text-xs text-cyber-textMuted">Backend-enforced rules</p>

              <div className="mt-8 space-y-4">
                {AGENT_MODES.map((mode) => {
                  const policy = MODE_POLICY[mode.id];
                  const active = mode.id === agentMode;
                  return (
                    <div
                      key={mode.id}
                      className={`rounded-[18px] border p-4 transition-all ${active ? policy.card : "border-[#1e2533] bg-[#0b0e14] text-cyber-textSecondary"}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${policy.dot}`} />
                        <h3 className="text-sm font-bold">{mode.label.toUpperCase()}</h3>
                      </div>
                      <p className="mt-3 text-xs leading-5 opacity-80">{policy.detail}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 rounded-[18px] border border-[#1f2937] bg-[#111827] p-4">
                <h3 className="text-sm font-bold text-white">Result</h3>
                <p className="mt-2 text-xs text-cyber-textSecondary">No accidental actions.</p>
              </div>
            </aside>
          </div>
        </div>
      )}

      <HistoryDrawer
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={setActiveConversation}
        onNewChat={createConversation}
        onDeleteConversation={deleteConversation}
      />

      <SettingsDrawer
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        workspacePath={workspacePath}
        provider={provider}
        selectedModel={selectedModel}
        customModel={customModel}
        authMethod={authMethod}
        apiKey={apiKey}
        serviceAccountPath={serviceAccountPath}
        projectId={projectId}
        location={location}
        googleSearchEnabled={googleSearchEnabled}
        dockerSandboxEnabled={dockerSandboxEnabled}
        sandboxImage={sandboxImage}
        cloudSandboxEnabled={cloudSandboxEnabled}
        isIdeMode={ide.isIdeMode}
        isActiveLicense={false} // wait, this will fetch in AuthModal. Keep mock or get from state
        gitInitialized={polling.gitInitialized}
        gitBranch={polling.gitBranch}
        isIndexing={polling.isIndexing}
        userEmail={userEmail}
        todos={polling.todos}
        updateSettings={updateSettings}
        toggleIdeMode={ide.toggleIdeMode}
        setTelemetryOpen={setTelemetryOpen}
        setMarketplaceOpen={setMarketplaceOpen}
        handleReindex={polling.handleReindex}
        setInput={setInput}
        renderToggle={renderToggle}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        token={token}
        userEmail={userEmail}
        updateSettings={updateSettings}
      />

      <MarketplaceModal
        isOpen={marketplaceOpen}
        onClose={() => setMarketplaceOpen(false)}
        activeTheme={activeTheme}
        installedPrompts={installedPrompts}
        installedExtensions={installedExtensions as any}
        updateSettings={updateSettings}
      />

      <TelemetryModal
        isOpen={telemetryOpen}
        onClose={() => setTelemetryOpen(false)}
        telemetry={polling.telemetry}
      />
    </div>
  );
}
