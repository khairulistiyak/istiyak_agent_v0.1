import React, { useState } from "react";
import { X } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { SettingsSlice } from "../../store/slices/settingsSlice.js";

interface WorkspaceTodo {
  filePath: string;
  relativePath: string;
  line: number;
  text: string;
}

interface SettingsDrawerProps {
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  workspacePath: string | null;
  provider: string;
  selectedModel: string;
  customModel: string;
  authMethod: "apiKey" | "serviceAccount";
  apiKey: string;
  serviceAccountPath: string;
  projectId: string;
  location: string;
  googleSearchEnabled: boolean;
  dockerSandboxEnabled: boolean;
  sandboxImage: string;
  cloudSandboxEnabled: boolean;
  isActiveLicense: boolean;
  gitInitialized: boolean;
  gitBranch: string;
  isIndexing: boolean;
  userEmail: string;
  todos: WorkspaceTodo[];
  updateSettings: (settings: Partial<SettingsSlice>) => void;
  setTelemetryOpen: (open: boolean) => void;
  setMarketplaceOpen: (open: boolean) => void;
  handleReindex: () => void;
  setInput: (input: string) => void;
  renderToggle: (checked: boolean, onChange: () => void, disabled?: boolean) => React.ReactNode;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  settingsOpen,
  setSettingsOpen,
  workspacePath,
  provider,
  selectedModel,
  customModel,
  authMethod,
  apiKey,
  serviceAccountPath,
  projectId,
  location,
  googleSearchEnabled,
  dockerSandboxEnabled,
  sandboxImage,
  cloudSandboxEnabled,
  isActiveLicense,
  gitInitialized,
  gitBranch,
  isIndexing,
  userEmail,
  todos,
  updateSettings,
  setTelemetryOpen,
  setMarketplaceOpen,
  handleReindex,
  setInput,
  renderToggle,
}) => {
  const [modelFolderOpen, setModelFolderOpen] = useState(true);
  const [systemFolderOpen, setSystemFolderOpen] = useState(true);

  return (
    <>
      {/* Settings Drawer Overlay Panel */}
      <div
        className={`absolute inset-0 bg-[#08090a]/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          settingsOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSettingsOpen(false)}
      >
        <div
          className={`absolute top-0 right-0 bottom-0 w-80 bg-[#08090a] border-l border-[#16181d] shadow-2xl flex flex-col p-5 space-y-4 transition-transform duration-300 transform ${
            settingsOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-[#16181d]/40 pb-3">
            <span className="font-extrabold text-[11px] tracking-wider uppercase text-[#88888c]">
              SETTINGS
            </span>
            <button
              onClick={() => setSettingsOpen(false)}
              className="p-1 rounded text-[#44444a] hover:text-white transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Drawer content */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs select-none scrollbar-none">
            {/* ==================== FOLDER 1: MODEL ENGINE CONFIG ==================== */}
            <div className="space-y-3">
              <div
                onClick={() => setModelFolderOpen(!modelFolderOpen)}
                className="flex items-center cursor-pointer select-none text-[10.5px] font-extrabold text-white tracking-wider space-x-1.5"
              >
                <span>{modelFolderOpen ? "▼" : "▶"}</span>
                <span>MODEL ENGINE CONFIG</span>
              </div>

              {modelFolderOpen && (
                <div className="pl-4 space-y-3">
                  {/* LLM Provider */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#44444a] text-[10px]">Provider</label>
                    <select
                      value={provider}
                      onChange={(e) => {
                        const newProvider = e.target.value as
                          | "gemini"
                          | "openai"
                          | "claude"
                          | "ollama"
                          | "custom";
                        let newModel = "gemini-2.5-flash";
                        if (newProvider === "openai") newModel = "gpt-4o";
                        else if (newProvider === "claude") newModel = "claude-3-5-sonnet-20241022";
                        else if (newProvider === "ollama") newModel = "llama3";
                        else if (newProvider === "custom") newModel = "custom";

                        updateSettings({
                          provider: newProvider,
                          selectedModel: newModel,
                          authMethod: newProvider === "gemini" ? authMethod : "apiKey",
                        });
                      }}
                      className="w-full bg-[#121318] border border-[#1f232b] rounded px-2.5 py-1.5 text-[#d1d5db] text-[10px] outline-none cursor-pointer"
                    >
                      <option value="gemini">Google Gemini</option>
                      <option value="openai">OpenAI</option>
                      <option value="claude">Anthropic Claude</option>
                      <option value="ollama">Ollama</option>
                      <option value="custom">Custom Provider</option>
                    </select>
                  </div>

                  {/* Model Selection Dropdown */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#44444a] text-[10px]">Selected Model</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => updateSettings({ selectedModel: e.target.value })}
                      className="w-full bg-[#121318] border border-[#1f232b] rounded px-2.5 py-1.5 text-[#d1d5db] text-[10px] outline-none cursor-pointer"
                    >
                      {provider === "gemini" && (
                        <>
                          <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                          <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                          <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                          <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                          <option value="custom">Custom Model</option>
                        </>
                      )}
                      {provider === "openai" && (
                        <>
                          <option value="gpt-4o">GPT-4o</option>
                          <option value="gpt-4-turbo">GPT-4 Turbo</option>
                          <option value="custom">Custom Model</option>
                        </>
                      )}
                      {provider === "claude" && (
                        <>
                          <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                          <option value="custom">Custom Model</option>
                        </>
                      )}
                      {provider === "ollama" && (
                        <>
                          <option value="llama3">Llama 3</option>
                          <option value="mistral">Mistral</option>
                          <option value="custom">Custom Model</option>
                        </>
                      )}
                      {provider === "custom" && <option value="custom">Custom Model</option>}
                    </select>
                  </div>

                  {/* Custom Model input if Custom selected */}
                  {selectedModel === "custom" && (
                    <div className="space-y-1">
                      <label className="font-bold text-[#44444a] text-[10px]">
                        Custom Model Name
                      </label>
                      <input
                        type="text"
                        value={customModel}
                        onChange={(e) => updateSettings({ customModel: e.target.value })}
                        placeholder="Enter custom model name..."
                        className="w-full bg-[#121318] border border-[#1f232b] rounded px-2.5 py-1.5 text-[#d1d5db] outline-none text-[10px] font-mono"
                      />
                    </div>
                  )}

                  {/* Auth Method selection - only for Gemini */}
                  {provider === "gemini" && (
                    <div className="space-y-1">
                      <label className="font-bold text-[#44444a] text-[10px]">Authentication</label>
                      <select
                        value={authMethod}
                        onChange={(e) => {
                          updateSettings({
                            authMethod: e.target.value as "apiKey" | "serviceAccount",
                          });
                        }}
                        className="w-full bg-[#121318] border border-[#1f232b] rounded px-2.5 py-1.5 text-[#d1d5db] text-[10px] outline-none cursor-pointer"
                      >
                        <option value="apiKey">API Key</option>
                        <option value="serviceAccount">Service Account JSON</option>
                      </select>
                    </div>
                  )}

                  {/* API Key input (if authMethod is apiKey and not Ollama) */}
                  {authMethod === "apiKey" && provider !== "ollama" && (
                    <div className="space-y-1">
                      <label className="font-bold text-[#44444a] text-[10px]">API Key Value</label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => updateSettings({ apiKey: e.target.value })}
                        placeholder="••••••••••••••••••••••••"
                        className="w-full bg-[#121318] border border-[#1f232b] rounded px-2.5 py-1.5 text-[#d1d5db] outline-none text-[10px] font-mono"
                      />
                    </div>
                  )}

                  {/* Service Account inputs (if authMethod is serviceAccount and Gemini) */}
                  {authMethod === "serviceAccount" && provider === "gemini" && (
                    <>
                      <div className="space-y-1">
                        <label className="font-bold text-[#44444a] text-[10px]">
                          Service Account JSON Path
                        </label>
                        <div className="flex space-x-1.5">
                          <input
                            type="text"
                            value={serviceAccountPath}
                            onChange={(e) => updateSettings({ serviceAccountPath: e.target.value })}
                            placeholder="e.g. /path/to/service-account.json"
                            className="flex-1 bg-[#121318] border border-[#1f232b] rounded px-2 py-1 text-[#d1d5db] outline-none text-[9.5px] font-mono"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const selected: string = await invoke("select_file");
                                if (selected) {
                                  updateSettings({ serviceAccountPath: selected });
                                }
                              } catch (err) {
                                // User cancelled or Tauri command failed silently
                              }
                            }}
                            className="px-2.5 py-1 bg-cyber-primary/20 hover:bg-cyber-primary/30 border border-cyber-primary/45 text-cyber-primary rounded text-[9.5px] font-bold transition-all cursor-pointer"
                          >
                            Browse
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-[#44444a] text-[10px]">
                          GCP Project ID
                        </label>
                        <input
                          type="text"
                          value={projectId}
                          onChange={(e) => updateSettings({ projectId: e.target.value })}
                          placeholder="e.g. my-gcp-project-123"
                          className="w-full bg-[#121318] border border-[#1f232b] rounded px-2.5 py-1.5 text-[#d1d5db] outline-none text-[10px]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-[#44444a] text-[10px]">
                          Vertex Region
                        </label>
                        <select
                          value={location}
                          onChange={(e) => updateSettings({ location: e.target.value })}
                          className="w-full bg-[#121318] border border-[#1f232b] rounded px-2.5 py-1.5 text-[#d1d5db] text-[10px] outline-none cursor-pointer"
                        >
                          <option value="global">global</option>
                          <option value="us-central1">us-central1</option>
                          <option value="us-east4">us-east4</option>
                          <option value="europe-west4">europe-west4</option>
                          <option value="asia-southeast1">asia-southeast1</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ==================== FOLDER 2: SYSTEM PREFERENCES & UTILITIES ==================== */}
            <div className="space-y-3">
              <div
                onClick={() => setSystemFolderOpen(!systemFolderOpen)}
                className="flex items-center cursor-pointer select-none text-[10.5px] font-extrabold text-white tracking-wider space-x-1.5 mt-3 border-t border-[#16181d]/40 pt-4"
              >
                <span>{systemFolderOpen ? "▼" : "▶"}</span>
                <span>SYSTEM PREFERENCES & UTILITIES</span>
              </div>

              {systemFolderOpen && (
                <div className="pl-4 space-y-4">
                  {/* Google Search Integration */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#d1d5db] text-[10px]">
                      Enable Google Search
                    </span>
                    {renderToggle(googleSearchEnabled, () =>
                      updateSettings({ googleSearchEnabled: !googleSearchEnabled })
                    )}
                  </div>

                  {/* CLI Docker Sandbox */}
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#d1d5db] text-[10px]">
                        CLI Docker Sandbox
                      </span>
                      {renderToggle(dockerSandboxEnabled, () =>
                        updateSettings({
                          dockerSandboxEnabled: !dockerSandboxEnabled,
                          ...(!dockerSandboxEnabled ? { cloudSandboxEnabled: false } : {}),
                        })
                      )}
                    </div>
                    <span className="text-[#44444a] text-[8px]">
                      Executes terminal tasks in local isolated container
                    </span>
                  </div>

                  {/* Sandbox Container Image Input */}
                  {dockerSandboxEnabled && (
                    <div className="space-y-1 pl-2 border-l-2 border-[#1f232b] ml-1">
                      <label className="font-bold text-[#44444a] text-[8px]">Sandbox Image</label>
                      <input
                        type="text"
                        value={sandboxImage}
                        onChange={(e) => updateSettings({ sandboxImage: e.target.value })}
                        placeholder="e.g. node:20-alpine"
                        className="w-full bg-[#121318] border border-[#1f232b] rounded px-2.5 py-1 text-[#d1d5db] outline-none text-[8.5px] font-mono"
                      />
                    </div>
                  )}

                  {/* Cloud Sandbox (Pro) */}
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-bold text-[10px] ${isActiveLicense ? "text-[#d1d5db]" : "text-[#44444a]"}`}
                      >
                        SaaS Cloud Sandbox (Pro)
                      </span>
                      {renderToggle(
                        cloudSandboxEnabled,
                        () =>
                          updateSettings({
                            cloudSandboxEnabled: !cloudSandboxEnabled,
                            ...(!cloudSandboxEnabled ? { dockerSandboxEnabled: false } : {}),
                          }),
                        !isActiveLicense
                      )}
                    </div>
                  </div>

                  {/* Telemetry & Cost Dashboard */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-0.5">
                      <span className="font-bold text-[#d1d5db] text-[10px]">
                        Telemetry &amp; Cost
                      </span>
                      <span className="text-[#44444a] text-[8px]">
                        View metrics and real-time usage cost dashboard
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTelemetryOpen(true)}
                      className="px-2.5 py-1 bg-[#15171c] hover:bg-white/5 border border-[#1c1e24] text-white rounded text-[8px] font-bold transition-all cursor-pointer uppercase shrink-0"
                    >
                      OPEN CHART
                    </button>
                  </div>

                  {/* Marketplace & Plugins */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-0.5">
                      <span className="font-bold text-[#d1d5db] text-[10px]">
                        Marketplace &amp; Plugins
                      </span>
                      <span className="text-[#44444a] text-[8px]">
                        Browse and install helper extensions and customizations
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMarketplaceOpen(true)}
                      className="px-2.5 py-1 bg-[#15171c] hover:bg-white/5 border border-[#1c1e24] text-white rounded text-[8px] font-bold transition-all cursor-pointer uppercase shrink-0"
                    >
                      BROWSE
                    </button>
                  </div>

                  {/* Workspace Context settings — matching 12-settings-drawer.svg */}
                  {workspacePath && (
                    <div className="space-y-2.5 pt-2 border-t border-[#16181d]/40">
                      <div className="flex flex-col space-y-0.5">
                        <span className="font-bold text-[#44444a] text-[10px]">Active Workspace Directory</span>
                        <span className="font-mono text-[9px] text-slate-400 truncate">
                          {workspacePath}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-[#44444a]">Git Branch</span>
                        <span className="font-mono font-bold text-[#d1d5db]">
                          {gitInitialized ? gitBranch : "No Repo"}
                        </span>
                      </div>
                      {/* Session Cost Budget Guard (12 spec) */}
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#44444a] text-[10px]">Session Cost Budget Guard</span>
                        <span className="font-mono text-[9px] text-emerald-400">$10.00 max (Active)</span>
                      </div>
                      <button
                        disabled={isIndexing}
                        onClick={handleReindex}
                        className="w-full py-1.5 bg-[#15171c] hover:bg-white/5 border border-[#1c1e24] text-white rounded text-[9px] font-bold transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        {isIndexing && (
                          <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        <span>REINDEX WORKSPACE CODEBASE</span>
                      </button>
                    </div>
                  )}

                  {/* User Account / Session */}
                  {userEmail && (
                    <div className="flex items-center justify-between pt-2 border-t border-[#16181d]/40">
                      <div className="flex flex-col space-y-0.5">
                        <span className="font-bold text-[#44444a] text-[10px]">Active Account</span>
                        <span
                          className="text-[#d1d5db] text-[9.5px] truncate max-w-[140px]"
                          title={userEmail}
                        >
                          {userEmail}
                        </span>
                      </div>
                      <button
                        onClick={async () => {
                          await updateSettings({ token: "", userEmail: "" });
                        }}
                        className="px-2.5 py-1 bg-[#1c1012] hover:bg-red-500/10 border border-[#ef4444] text-[#ef4444] rounded text-[8.5px] font-bold transition-colors cursor-pointer"
                      >
                        LOGOUT
                      </button>
                    </div>
                  )}

                  {/* Workspace TODOs list */}
                  {workspacePath && (
                    <div className="space-y-2 pt-2 border-t border-[#16181d]/40">
                      <span className="font-bold text-white text-[10px]">
                        Workspace TODO comments ({todos.length})
                      </span>
                      <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                        {todos.length === 0 ? (
                          <p className="text-[9px] text-[#44444a] italic">
                            No pending TODO comments found.
                          </p>
                        ) : (
                          todos.map((todo, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                setInput(
                                  `Please resolve this TODO comment: "${todo.text}" on line ${todo.line} of ${todo.relativePath}`
                                );
                                setSettingsOpen(false);
                              }}
                              className="hover:bg-white/5 rounded p-1.5 text-[9px] cursor-pointer transition-all duration-200 flex flex-col space-y-0.5"
                              title="Click to copy task prompt to chat input"
                            >
                              <span
                                className="text-[#5f8aa8] truncate font-semibold"
                                title={todo.relativePath}
                              >
                                {todo.relativePath}
                              </span>
                              <span className="text-zinc-300 line-clamp-2">{todo.text}</span>
                              <span className="text-[8px] text-[#44444a] font-bold uppercase tracking-wider">
                                Line {todo.line}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
