import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport, UIMessage } from "ai";
import { useChatStore } from "../store/chatStore.js";
import { useSettingsStore } from "../store/settingsStore.js";
import { API_BASE } from "../utils/config.js";
import { parseAgentMessage } from "../utils/parser.js";

// Layout components
import { TitleBar } from "./layout/TitleBar.js";
import { HistoryDrawer } from "./layout/HistoryDrawer.js";

// Chat components
import { ChatPanel, MODES as AGENT_MODES, type AgentMode } from "./chat/ChatPanel.js";

// Settings/Modal components
import { SettingsDrawer } from "./settings/SettingsDrawer.js";
import { AuthModal } from "./settings/AuthModal.js";
import { MarketplaceModal } from "./settings/Marketplace.js";
import { TelemetryModal } from "./settings/TelemetryModal.js";
import { Toggle } from "./ui/Toggle.js";

// Custom hooks
import { usePolling } from "../hooks/usePolling.js";
import { usePermissions } from "../hooks/usePermissions.js";
import { useWorkspaceDetect } from "../hooks/useWorkspaceDetect.js";

const getSidebarActiveStyles = (modeId: AgentMode) => {
  const themes: Record<AgentMode, { border: string; bg: string; text: string; dot: string; badgeBg: string; badgeBorder: string; badgeText: string }> = {
    chat: {
      border: "0.75px solid rgba(6, 182, 212, 0.6)",
      bg: "bg-[#0c1926]/40",
      text: "text-cyan-200",
      dot: "bg-cyan-400",
      badgeBg: "rgba(6, 182, 212, 0.15)",
      badgeBorder: "0.5px solid rgba(6, 182, 212, 0.4)",
      badgeText: "text-cyan-300",
    },
    plan: {
      border: "0.75px solid rgba(168, 85, 247, 0.6)",
      bg: "bg-[#180c26]/40",
      text: "text-violet-200",
      dot: "bg-violet-400",
      badgeBg: "rgba(168, 85, 247, 0.15)",
      badgeBorder: "0.5px solid rgba(168, 85, 247, 0.4)",
      badgeText: "text-violet-300",
    },
    assist: {
      border: "0.75px solid rgba(245, 158, 11, 0.6)",
      bg: "bg-[#26150c]/40",
      text: "text-amber-200",
      dot: "bg-amber-400",
      badgeBg: "rgba(245, 158, 11, 0.15)",
      badgeBorder: "0.5px solid rgba(245, 158, 11, 0.4)",
      badgeText: "text-amber-300",
    },
    agent: {
      border: "0.75px solid rgba(16, 185, 129, 0.6)",
      bg: "bg-[#0c2619]/40",
      text: "text-emerald-200",
      dot: "bg-emerald-400",
      badgeBg: "rgba(16, 185, 129, 0.15)",
      badgeBorder: "0.5px solid rgba(16, 185, 129, 0.4)",
      badgeText: "text-emerald-300",
    },
  };
  return themes[modeId];
};

const getMessageText = (msg: UIMessage): string => {
  const raw = msg as UIMessage & { content?: string };
  if (raw.content) return raw.content;
  if (!msg.parts) return "";
  return msg.parts
    .filter((part) => part.type === "text")
    .map((part) => (part as { type: "text"; text: string }).text)
    .join("");
};

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
  } = useSettingsStore() as any;

  // Chat store
  const {
    conversations,
    activeId,
    createConversation,
    deleteConversation,
    setActiveConversation,
    addMessage,
    updateConversationMode,
  } = useChatStore() as any;

  // Custom hooks
  const polling = usePolling({ workspacePath });
  const permissions = usePermissions();
  const workspace = useWorkspaceDetect(workspacePath || "", (path: string) =>
    updateSettings({ workspacePath: path })
  );

  // Workspace picker dropdown state
  const [wsPickerOpen, setWsPickerOpen] = useState(false);

  // UI state
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [marketplaceOpen, setMarketplaceOpen] = useState(false);
  const [telemetryOpen, setTelemetryOpen] = useState(false);

  // Auto-initialize conversation if list is empty
  useEffect(() => {
    if (conversations.length === 0) {
      createConversation();
    } else if (!activeId) {
      setActiveConversation(conversations[0].id);
    }
  }, [conversations, activeId, createConversation, setActiveConversation]);

  // Vercel AI SDK useChat Hook
  const activeConvo = (conversations as any[]).find((c: any) => c.id === activeId);
  const agentMode: AgentMode = activeConvo?.agentMode ?? "chat";

  // Stable reference: only recompute when conversation switches (M1: prevent re-init loop)
  const initialMessages = useMemo(
    () =>
      activeConvo?.messages.map((m: any) => ({
        id: m.id,
        role: m.role as "user" | "assistant" | "system",
        parts: [{ type: "text" as const, text: m.content }],
      })) || [],
    [activeId]
  );

  // Stable transport: capture `activeId` once per conversation (M1: prevent re-init loop)
  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        fetch: async (_url, options) => {
          if (!options || !options.body) {
            return new Response("Error: Invalid request body", { status: 400 });
          }

          const reqBody = JSON.parse(options.body as string);
          const userMessages: UIMessage[] = reqBody.messages;
          const lastUserMsg = userMessages[userMessages.length - 1];
          const lastUserMsgText = getMessageText(lastUserMsg);

          // Save user message to Zustand history store
          if (activeId) {
            const currentConvo = useChatStore
              .getState()
              .conversations.find((c) => c.id === activeId);
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

          const mappedMessages = userMessages.map((m) => ({
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
              agentMode: activeId
                ? (useChatStore.getState().conversations.find((c) => c.id === activeId)
                    ?.agentMode ?? "chat")
                : "chat",
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
              } catch (streamErr) {
                console.error("Stream reading error:", streamErr);
                const errMsg = streamErr instanceof Error ? streamErr.message : String(streamErr);
                const errChunk = `\n\n[Generation Error: ${errMsg}]`;
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
    [activeId, addMessage]
  );

  const { messages, sendMessage, status, stop } = useChat({
    id: activeId || undefined,
    messages: initialMessages,
    transport,
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Init refs for the current conversation
  const lastSyncedRef = useRef(0);
  const processedPermRef = useRef(new Set<string>());

  // Trigger permission timeouts for new assistant messages
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.role === "assistant" && !processedPermRef.current.has(msg.id)) {
        const text = getMessageText(msg);
        if (text.includes("permission_request")) {
          const parsed = parseAgentMessage(text);
          parsed.permissionRequests.forEach((req) => {
            permissions.addPermissionTimeout(req.id);
          });
        }
        processedPermRef.current.add(msg.id);
      }
    });
  }, [messages, permissions.addPermissionTimeout]);

  // Sync messages to Zustand store
  useEffect(() => {
    if (isLoading) return;

    if (activeId && messages.length > lastSyncedRef.current) {
      const currentConvo = useChatStore.getState().conversations.find((c) => c.id === activeId);
      if (currentConvo) {
        for (let i = lastSyncedRef.current; i < messages.length; i++) {
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
        lastSyncedRef.current = messages.length;
      }
    }
  }, [activeId, isLoading, messages.length]);

  // Reset per-conversation refs when switching conversations
  useEffect(() => {
    processedPermRef.current.clear();
    lastSyncedRef.current = 0;
  }, [activeId]);

  // Settings loaded at mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Abort running agent
  const handleAbortAgent = useCallback(async () => {
    try {
      // First ask server to gracefully stop — this lets it write final error/status
      const res = await fetch(`${API_BASE}/api/agent/abort`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      console.log("[ChatUI] Abort response:", data);
    } catch (err) {
      console.error("Failed to abort agent:", err);
    }
    // Then force-stop the local stream (any remaining server chunks won't be read,
    // but the critical error message was already sent before the server closed)
    stop();
  }, [stop]);

  // Send message
  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return;
    sendMessage({
      role: "user" as const,
      parts: [{ type: "text" as const, text: input.trim() }],
    });
    setInput("");
  }, [input, isLoading, sendMessage]);

  const isTauri = typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__ !== undefined;
  const appWindow = isTauri
    ? getCurrentWindow()
    : {
        setSize: async () => {},
        close: async () => {},
        minimize: async () => {},
        toggleMaximize: async () => {},
      };

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

      {/* Polling error bar — auto-dismisses after 10s */}
      {polling.pollingError && (
        <div className="px-4 py-1.5 text-[10px] text-red-300 bg-red-900/20 border-b border-red-800/30 text-center font-medium">
          ⚠ {polling.pollingError}
        </div>
      )}

      {/* Workspace Bar — compact bar above chat */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-cyber-cardBorder/40 bg-[#0a0d14]">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`h-2 w-2 rounded-full shrink-0 ${workspace.activeIde ? "bg-emerald-400" : "bg-slate-600"}`}
            title={workspace.activeIde ? `${workspace.activeIde} running` : "No IDE detected"}
          />
          <span className="text-[10px] text-slate-400 shrink-0">
            {workspace.activeIde || "No IDE"}
          </span>
          <span className="text-[10px] text-slate-600 shrink-0">·</span>
          <p
            className="truncate font-mono text-[11px] text-slate-300 min-w-0"
            title={workspacePath || "No workspace selected"}
          >
            {workspacePath ? workspacePath.split(/[\\/]/).pop() : "No workspace"}
          </p>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setWsPickerOpen(!wsPickerOpen)}
            className="px-2 py-1 rounded-lg text-[10px] text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/50 transition-colors cursor-pointer"
          >
            Change
          </button>
          {wsPickerOpen && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-[#0d0f16] border border-slate-700 rounded-xl shadow-2xl z-50 p-2 max-h-64 overflow-y-auto">
              <p className="text-[9px] text-slate-500 px-2 py-1 font-semibold uppercase tracking-wider border-b border-slate-800/40 mb-1">
                Detected Workspaces
              </p>
              {workspace.workspaces.length === 0 && (
                <p className="text-[10px] text-slate-500 px-2 py-2">No workspaces detected.</p>
              )}
              {workspace.workspaces.map((ws, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    workspace.selectWorkspace(ws.path);
                    setWsPickerOpen(false);
                  }}
                  className={`w-full text-left px-2 py-2 rounded-lg text-[10px] transition-colors cursor-pointer ${
                    ws.path === workspacePath
                      ? "bg-cyan-400/15 text-cyan-200"
                      : "text-white hover:bg-slate-800"
                  }`}
                  title={ws.path}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${ws.isActive ? "bg-emerald-400" : "bg-slate-600"}`} />
                    <span className="font-bold truncate">{ws.folderName}</span>
                    <span className="text-[8px] text-slate-500 ml-auto shrink-0">{ws.ide}</span>
                  </div>
                </button>
              ))}
              <div className="border-t border-slate-800/40 mt-1 pt-1">
                <button
                  onClick={() => {
                    workspace.openManualPicker();
                    setWsPickerOpen(false);
                  }}
                  className="w-full text-left px-2 py-2 rounded-lg text-[10px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Pick folder manually...
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat-only layout */}
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

            <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Mode selector
            </p>
            <div className="mt-3 space-y-1.5">
              {AGENT_MODES.map((mode) => {
                const active = mode.id === agentMode;
                const policy = MODE_POLICY[mode.id];
                const theme = getSidebarActiveStyles(mode.id as AgentMode);
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      if (activeId) updateConversationMode(activeId, mode.id);
                    }}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-left transition-all duration-200 ${
                      active
                        ? `border ${theme.bg} ${theme.text}`
                        : "border-0 bg-transparent text-slate-400 hover:bg-slate-800/30 hover:text-white"
                    }`}
                    style={active ? { border: theme.border } : {}}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`h-2 w-2 rounded-full ${active ? theme.dot : "bg-slate-600"}`}
                        />
                        <span className="text-sm font-bold">{mode.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {active && (
                          <span
                            className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${theme.badgeText}`}
                            style={{
                              backgroundColor: theme.badgeBg,
                              border: theme.badgeBorder,
                            }}
                          >
                            ACTIVE
                          </span>
                        )}
                        <span className="text-[9px] text-slate-600 font-mono">{mode.hint}</span>
                      </div>
                    </div>
                    <p className={`mt-1 text-[10px] leading-relaxed ${active ? "text-slate-400" : "text-slate-600"}`}>
                      {policy.detail}
                    </p>
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
        isActiveLicense={false}
        gitInitialized={polling.gitInitialized}
        gitBranch={polling.gitBranch}
        isIndexing={polling.isIndexing}
        userEmail={userEmail}
        todos={polling.todos}
        updateSettings={updateSettings}
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
        installedExtensions={installedExtensions}
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
