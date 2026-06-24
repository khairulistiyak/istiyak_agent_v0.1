import React, { useState, useRef, useEffect } from "react";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport, UIMessage } from "ai";
import { Send, Bot, User, Paperclip, Terminal, Settings, History, Plus, Trash2, X, Folder, FolderOpen, File, Save, Columns, Sparkles, Activity } from "lucide-react";
import Editor from "@monaco-editor/react";
import { useChatStore } from "../store/chatStore";
import { useSettingsStore } from "../store/settingsStore";

interface AgentStep {
  step: number;
  status: 'thought' | 'action' | 'success' | 'error';
  content: string;
  actionName?: string;
  params?: { [key: string]: string };
}

interface PermissionRequest {
  id: string;
  type: 'run_command';
  command: string;
}

function parseAgentMessage(rawText: string) {
  const steps: AgentStep[] = [];
  const permissionRequests: PermissionRequest[] = [];
  
  const stepMatches = [...rawText.matchAll(/<agent_step\s+([^>]*?)>(.*?)<\/agent_step>/gi)];
  for (const m of stepMatches) {
    const attrsStr = m[1];
    const content = m[2];
    
    const stepAttr = attrsStr.match(/step="(\d+)"/i)?.[1];
    const statusAttr = attrsStr.match(/status="([^"]+)"/i)?.[1];
    const nameAttr = attrsStr.match(/name="([^"]+)"/i)?.[1];
    
    const stepNum = stepAttr ? parseInt(stepAttr, 10) : 1;
    
    const params: any = {};
    const attrPairs = attrsStr.matchAll(/([a-zA-Z0-9_-]+)="([^"]*?)"/gi);
    for (const ap of attrPairs) {
      const k = ap[1];
      const v = ap[2];
      if (k !== "step" && k !== "status" && k !== "name") {
        params[k] = v.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      }
    }

    steps.push({
      step: stepNum,
      status: (statusAttr || 'thought') as any,
      content: content.replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
      actionName: nameAttr,
      params
    });
  }

  const permMatches = [...rawText.matchAll(/<permission_request\s+([^>]*?)><\/permission_request>/gi)];
  for (const pm of permMatches) {
    const attrsStr = pm[1];
    const id = attrsStr.match(/id="([^"]+)"/i)?.[1];
    const type = attrsStr.match(/type="([^"]+)"/i)?.[1];
    const command = attrsStr.match(/command="([^"]+)"/i)?.[1];
    
    if (id && type && command) {
      const decodedCommand = command.replace(/&quot;/g, '"');
      permissionRequests.push({ id, type: type as any, command: decodedCommand });
    }
  }

  let cleanText = rawText.replace(/<agent_step[^>]*?>.*?<\/agent_step>/gi, "");
  cleanText = cleanText.replace(/<permission_request[^>]*?><\/permission_request>/gi, "");
  
  return {
    steps,
    permissionRequests,
    cleanText: cleanText.trim()
  };
}

export default function ChatUI() {
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

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const appWindow = getCurrentWindow();

  // Permission state tracking
  const [permState, setPermState] = useState<{ [reqId: string]: 'pending' | 'approved' | 'rejected' }>({});

  const handlePermissionResponse = async (reqId: string, approved: boolean) => {
    setPermState(prev => ({ ...prev, [reqId]: approved ? 'approved' : 'rejected' }));
    try {
      const res = await fetch("http://localhost:3001/api/agent/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: reqId, approved })
      });
      if (!res.ok) {
        console.error("Failed to submit approval response");
      }
    } catch (err) {
      console.error("Error submitting approval response:", err);
    }
  };

  // Marketplace & Extension state variables
  const [marketplaceOpen, setMarketplaceOpen] = useState(false);
  const [customPromptTitle, setCustomPromptTitle] = useState("");
  const [customPromptText, setCustomPromptText] = useState("");
  const [promptsDropdownOpen, setPromptsDropdownOpen] = useState(false);

  // Authentication UI state
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // User subscription / billing status states
  const [isActiveLicense, setIsActiveLicense] = useState(false);
  const [isProfileFetching, setIsProfileFetching] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Watcher TODOs state
  interface WorkspaceTodo {
    filePath: string;
    relativePath: string;
    line: number;
    text: string;
  }
  const [todos, setTodos] = useState<WorkspaceTodo[]>([]);

  // IDE layout states
  const [isIdeMode, setIsIdeMode] = useState(false);
  const [workspaceFiles, setWorkspaceFiles] = useState<string[]>([]);
  const [openDirs, setOpenDirs] = useState<{ [key: string]: boolean }>({});
  const [openedFile, setOpenedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [editorLanguage, setEditorLanguage] = useState<string>("javascript");
  const [isSaving, setIsSaving] = useState(false);
  const [terminalInput, setTerminalInput] = useState("");
  const [isTerminalRunning, setIsTerminalRunning] = useState(false);
  const [logs, setLogs] = useState<Array<{ time: string, message: string, type: 'info' | 'error' | 'success' }>>([
    { time: new Date().toLocaleTimeString(), message: "IDE Workspace Terminal initialized.", type: "info" }
  ]);

  // Git branch and RAG states
  const [gitBranch, setGitBranch] = useState<string>("none");
  const [gitInitialized, setGitInitialized] = useState<boolean>(false);
  const [isIndexing, setIsIndexing] = useState<boolean>(false);
  const [indexMessage, setIndexMessage] = useState<string>("Workspace index not loaded.");

  // Telemetry states
  interface TelemetryMetric {
    timestamp: string;
    provider: string;
    model: string;
    latencyMs: number;
    tokensIn: number;
    tokensOut: number;
    totalTokens: number;
    tokensPerSec: number;
  }
  interface TelemetryStats {
    callCount: number;
    avgLatencyMs: number;
    avgSpeed: number;
    totalTokensIn: number;
    totalTokensOut: number;
    history: TelemetryMetric[];
  }
  const [telemetry, setTelemetry] = useState<TelemetryStats | null>(null);
  const [telemetryOpen, setTelemetryOpen] = useState<boolean>(false);
  const [lastCompileError, setLastCompileError] = useState<string | null>(null);

  const fetchTelemetry = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/telemetry/stats");
      const data = await res.json();
      setTelemetry(data);
    } catch (e) {
      console.debug("Failed to fetch telemetry:", e);
    }
  };

  const fetchGitStatus = async () => {
    if (!workspacePath) return;
    try {
      const res = await fetch(`http://localhost:3001/api/git/status?workspacePath=${encodeURIComponent(workspacePath)}`);
      const data = await res.json();
      setGitInitialized(!!data.initialized);
      setGitBranch(data.branch || "none");
    } catch (e) {
      setGitInitialized(false);
      setGitBranch("none");
    }
  };

  const handleReindex = async () => {
    if (!workspacePath) return;
    setIsIndexing(true);
    setIndexMessage("Indexing codebase...");
    try {
      const res = await fetch("http://localhost:3001/api/rag/reindex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspacePath })
      });
      const data = await res.json();
      if (data.success) {
        setIndexMessage("Codebase indexed!");
      } else {
        setIndexMessage("Indexing failed.");
      }
    } catch (err) {
      setIndexMessage("Error indexing.");
    } finally {
      setIsIndexing(false);
    }
  };

  const toggleIdeMode = async () => {
    const nextMode = !isIdeMode;
    setIsIdeMode(nextMode);
    try {
      if (nextMode) {
        await appWindow.setSize(new LogicalSize(1150, 680));
      } else {
        await appWindow.setSize(new LogicalSize(380, 620));
      }
    } catch (err) {
      console.error("Failed to resize Tauri window:", err);
    }
  };

  const handleOpenFile = async (relPath: string) => {
    if (!workspacePath) return;
    try {
      const ext = relPath.substring(relPath.lastIndexOf(".")).toLowerCase();
      let lang = "javascript";
      if (ext === ".ts" || ext === ".tsx") lang = "typescript";
      else if (ext === ".py") lang = "python";
      else if (ext === ".css") lang = "css";
      else if (ext === ".json") lang = "json";
      else if (ext === ".md") lang = "markdown";
      else if (ext === ".html") lang = "html";
      else if (ext === ".cpp" || ext === ".h") lang = "cpp";
      else if (ext === ".cs") lang = "csharp";
      
      setEditorLanguage(lang);
      
      const absPath = `${workspacePath}/${relPath}`;
      const content: string = await invoke("read_file", { path: absPath });
      setFileContent(content);
      setOpenedFile(relPath);
      setLogs(prev => [...prev, {
        time: new Date().toLocaleTimeString(),
        message: `Opened file: ${relPath}`,
        type: "info"
      }]);
    } catch (err: any) {
      console.error("Failed to read file:", err);
      setLogs(prev => [...prev, {
        time: new Date().toLocaleTimeString(),
        message: `Failed to read file: ${relPath}. Error: ${err.message || err}`,
        type: "error"
      }]);
    }
  };

  const handleSaveFile = async () => {
    if (!workspacePath || !openedFile) return;
    setIsSaving(true);
    try {
      const absPath = `${workspacePath}/${openedFile}`;
      
      // Lock validation check
      try {
        const locksRes = await fetch("http://localhost:3001/api/watcher/locks");
        if (locksRes.ok) {
          const locks: Array<{ filePath: string, relativePath: string, owner: string }> = await locksRes.json();
          const activeLock = locks.find(l => l.relativePath === openedFile || l.filePath === absPath);
          if (activeLock && activeLock.owner !== "developer") {
            throw new Error(`File is currently locked by: ${activeLock.owner}`);
          }
        }
      } catch (lockErr: any) {
        if (lockErr.message.includes("locked by")) {
          throw lockErr;
        }
        console.warn("Could not verify file locks, engine may be offline:", lockErr);
      }

      await invoke("write_file", { path: absPath, content: fileContent });
      setLogs(prev => [...prev, {
        time: new Date().toLocaleTimeString(),
        message: `Successfully saved file: ${openedFile}`,
        type: "success"
      }]);
    } catch (err: any) {
      console.error("Failed to save file:", err);
      setLogs(prev => [...prev, {
        time: new Date().toLocaleTimeString(),
        message: `Failed to save file: ${openedFile}. Error: ${err.message || err}`,
        type: "error"
      }]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecuteTerminalCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim() || isTerminalRunning || !workspacePath) return;
    
    const cmd = terminalInput.trim();
    setTerminalInput("");
    setIsTerminalRunning(true);
    
    setLogs(prev => [...prev, {
      time: new Date().toLocaleTimeString(),
      message: `$ ${cmd}`,
      type: "info"
    }]);

    try {
      const res = await fetch("http://localhost:3001/api/run-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspacePath, command: cmd })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Execution failed");
      }
      
      const output = data.output || "";
      const hasError = output.toLowerCase().includes("error") || output.toLowerCase().includes("failed") || output.toLowerCase().includes("exception");
      
      if (hasError) {
        setLastCompileError(output);
      } else {
        setLastCompileError(null);
      }

      setLogs(prev => [...prev, {
        time: new Date().toLocaleTimeString(),
        message: output || "Command execution completed with no output.",
        type: hasError ? "error" : "success"
      }]);
    } catch (err: any) {
      const errMsg = err.message || err;
      setLastCompileError(errMsg);
      setLogs(prev => [...prev, {
        time: new Date().toLocaleTimeString(),
        message: `Command failed: ${errMsg}`,
        type: "error"
      }]);
    } finally {
      setIsTerminalRunning(false);
    }
  };

  // Load workspace files for File Tree Explorer
  useEffect(() => {
    const loadFiles = async () => {
      if (workspacePath) {
        try {
          const files: string[] = await invoke("scan_project", { path: workspacePath });
          setWorkspaceFiles(files);
        } catch (err) {
          console.error("Failed to scan project files:", err);
        }
      }
    };

    if (workspacePath) {
      loadFiles();
      const interval = setInterval(loadFiles, 10000);
      return () => clearInterval(interval);
    }
  }, [workspacePath]);

  // Poll Git status, telemetry, and auto-index workspace on mount/change
  useEffect(() => {
    if (workspacePath) {
      fetchGitStatus();
      handleReindex();
      fetchTelemetry();
      const interval = setInterval(() => {
        fetchGitStatus();
        fetchTelemetry();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [workspacePath]);

  // Settings store loaded at top

  const curatedThemes = [
    { id: "cursor-dark", name: "Cursor Dark", color: "#38bdf8" },
    { id: "cyber-dark", name: "Cyber Dark", color: "#06b6d4" },
    { id: "matrix-green", name: "Matrix Green", color: "#00ff46" },
    { id: "dracula-purple", name: "Dracula Purple", color: "#ff79c6" },
    { id: "nordic-ice", name: "Nordic Ice", color: "#88c0d0" },
    { id: "solarized-amber", name: "Solarized Amber", color: "#b58900" }
  ];

  const curatedPrompts = [
    { title: "Code Refactorer", prompt: "Refactor this code to follow clean architecture principles, remove redundancies, and optimize execution flow: " },
    { title: "Bug Hunter", prompt: "Analyze this code snippet for potential race conditions, edge case failures, performance bottlenecks, or hidden bugs: " },
    { title: "SQL Optimizer", prompt: "Optimize this SQL query for execution speed, indexing utilization, and query plan efficiency: " },
    { title: "Unit Test Writer", prompt: "Write comprehensive unit tests with edge-case validation coverage for this component using the standard testing library: " }
  ];

  const curatedExtensions = [
    {
      id: "git-companion",
      name: "Git Companion",
      description: "Provides Git workflow command shortcuts and commit message generators.",
      commands: [
        { name: "Git Status", command: "git status" },
        { name: "Git Diff", command: "git diff --stat" },
        { name: "Git Log", command: "git log -n 5 --oneline" }
      ],
      prompts: [
        { title: "Commit Gen", prompt: "Generate a semantic git commit message based on these code changes: " },
        { title: "Review Diff", prompt: "Perform a developer code review of these git diff changes: " }
      ]
    },
    {
      id: "docker-companion",
      name: "Docker Companion",
      description: "Provides basic container operations, images list, and Docker configuration check templates.",
      commands: [
        { name: "Docker Status", command: "docker ps" },
        { name: "Docker Images", command: "docker images" },
        { name: "Docker Info", command: "docker info" }
      ],
      prompts: [
        { title: "Dockerfile Review", prompt: "Explain this Dockerfile line-by-line and identify optimization opportunities: " },
        { title: "Compose Scaffold", prompt: "Create a docker-compose.yml configuration to run a service stack with these specs: " }
      ]
    }
  ];

  const themes: { [key: string]: { [cssVar: string]: string } } = {
    "cursor-dark": {
      "--cyber-dark": "#18181c",
      "--cyber-card": "#1e1e24",
      "--cyber-card-border": "#2e2e32",
      "--cyber-glow": "transparent",
      "--cyber-primary": "#38bdf8",
      "--cyber-secondary": "#818cf8",
      "--cyber-accent": "#34d399",
      "--cyber-text-primary": "#f3f4f6",
      "--cyber-text-secondary": "#9ca3af",
      "--cyber-text-muted": "#4b5563",
    },
    "cyber-dark": {
      "--cyber-dark": "#07080d",
      "--cyber-card": "#12141c",
      "--cyber-card-border": "#1f222f",
      "--cyber-glow": "transparent",
      "--cyber-primary": "#06b6d4",
      "--cyber-secondary": "#8b5cf6",
      "--cyber-accent": "#10b981",
      "--cyber-text-primary": "#f3f4f6",
      "--cyber-text-secondary": "#a1a1aa",
      "--cyber-text-muted": "#52525b",
    },
    "matrix-green": {
      "--cyber-dark": "#020b05",
      "--cyber-card": "#041209",
      "--cyber-card-border": "#0d3a1b",
      "--cyber-glow": "transparent",
      "--cyber-primary": "#00ff46",
      "--cyber-secondary": "#00aa30",
      "--cyber-accent": "#39ff14",
      "--cyber-text-primary": "#e6ffe9",
      "--cyber-text-secondary": "#80ff9c",
      "--cyber-text-muted": "#1a662c",
    },
    "dracula-purple": {
      "--cyber-dark": "#282a36",
      "--cyber-card": "#222430",
      "--cyber-card-border": "#3a3d52",
      "--cyber-glow": "transparent",
      "--cyber-primary": "#ff79c6",
      "--cyber-secondary": "#bd93f9",
      "--cyber-accent": "#50fa7b",
      "--cyber-text-primary": "#f8f8f2",
      "--cyber-text-secondary": "#6272a4",
      "--cyber-text-muted": "#44475a",
    },
    "nordic-ice": {
      "--cyber-dark": "#2e3440",
      "--cyber-card": "#242933",
      "--cyber-card-border": "#3b4252",
      "--cyber-glow": "transparent",
      "--cyber-primary": "#88c0d0",
      "--cyber-secondary": "#81a1c1",
      "--cyber-accent": "#a3be8c",
      "--cyber-text-primary": "#eceff4",
      "--cyber-text-secondary": "#d8dee9",
      "--cyber-text-muted": "#4c566a",
    },
    "solarized-amber": {
      "--cyber-dark": "#002b36",
      "--cyber-card": "#073642",
      "--cyber-card-border": "#0b4c5c",
      "--cyber-glow": "transparent",
      "--cyber-primary": "#b58900",
      "--cyber-secondary": "#cb4b16",
      "--cyber-accent": "#859900",
      "--cyber-text-primary": "#fdf6e3",
      "--cyber-text-secondary": "#93a1a1",
      "--cyber-text-muted": "#586e75",
    }
  };

  // Dynamically apply selected theme variable overrides on :root
  useEffect(() => {
    const themeProps = themes[activeTheme] || themes["cyber-dark"];
    const root = document.documentElement;
    Object.entries(themeProps).forEach(([variable, val]) => {
      root.style.setProperty(variable, val);
    });
  }, [activeTheme]);

  const handleInstallPrompt = (p: { title: string, prompt: string }) => {
    const isInstalled = installedPrompts.some(item => item.title === p.title);
    if (isInstalled) {
      updateSettings({
        installedPrompts: installedPrompts.filter(item => item.title !== p.title)
      });
    } else {
      updateSettings({
        installedPrompts: [...installedPrompts, p]
      });
    }
  };

  const handleInstallExtension = (ext: typeof curatedExtensions[0]) => {
    const isInstalled = installedExtensions.some(item => item.id === ext.id);
    if (isInstalled) {
      updateSettings({
        installedExtensions: installedExtensions.filter(item => item.id !== ext.id),
        installedPrompts: installedPrompts.filter(p => !ext.prompts.some(ep => ep.title === p.title))
      });
    } else {
      updateSettings({
        installedExtensions: [...installedExtensions, ext],
        installedPrompts: [...installedPrompts, ...ext.prompts.filter(ep => !installedPrompts.some(p => p.title === ep.title))]
      });
    }
  };

  const handleAddCustomPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPromptTitle.trim() || !customPromptText.trim()) return;
    const newPrompt = { title: customPromptTitle.trim(), prompt: customPromptText.trim() };
    updateSettings({
      installedPrompts: [...installedPrompts, newPrompt]
    });
    setCustomPromptTitle("");
    setCustomPromptText("");
  };

  const fetchUserProfile = async () => {
    if (!token) return;
    setIsProfileFetching(true);
    try {
      const res = await fetch("http://localhost:3002/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setIsActiveLicense(!!data.isActive);
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    } finally {
      setIsProfileFetching(false);
    }
  };

  const handleUpgradeToPro = async () => {
    if (!token) return;
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch("http://localhost:3002/api/billing/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned from server.");
      }
    } catch (err: any) {
      setCheckoutError(err.message || "An unexpected error occurred during upgrade.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Fetch subscription profile state on token change or profile open
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setIsActiveLicense(false);
    }
  }, [token]);

  useEffect(() => {
    if (authOpen && token) {
      fetchUserProfile();
    }
  }, [authOpen, token]);

  // Load configuration settings on component mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Poll configuration settings to detect dynamic browser login completion
  useEffect(() => {
    let interval: any;
    if (!token) {
      interval = setInterval(() => {
        loadSettings();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [token, loadSettings]);

  // Start or update directory watcher when workspacePath changes
  useEffect(() => {
    if (workspacePath) {
      fetch("http://localhost:3001/api/watcher/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspacePath })
      })
        .then(res => res.json())
        .then(data => {
          console.log("[ChatUI] Watcher status:", data);
        })
        .catch(err => console.debug("[ChatUI] Failed to start watcher:", err));
    }
  }, [workspacePath]);

  // Poll detected TODO comments from local engine
  useEffect(() => {
    let interval: any;

    const fetchTodos = () => {
      if (workspacePath) {
        fetch("http://localhost:3001/api/watcher/todos")
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              setTodos(data);
            }
          })
          .catch(err => console.debug("[ChatUI] Failed to fetch todos:", err));
      }
    };

    fetchTodos();
    interval = setInterval(fetchTodos, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [workspacePath]);

  // Load chat history state from Zustand store
  const {
    conversations,
    activeId,
    createConversation,
    deleteConversation,
    setActiveConversation,
    addMessage,
  } = useChatStore();

  interface FileNode {
    name: string;
    path: string;
    isDir: boolean;
    children: FileNode[];
  }

  const buildTree = (files: string[]): FileNode[] => {
    const root: FileNode[] = [];
    for (const file of files) {
      const parts = file.split("/");
      let currentLevel = root;
      let currentPath = "";
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part) continue;
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        const isDir = i < parts.length - 1;
        let existingNode = currentLevel.find((node) => node.name === part);
        if (!existingNode) {
          existingNode = {
            name: part,
            path: currentPath,
            isDir: isDir,
            children: [],
          };
          currentLevel.push(existingNode);
        }
        currentLevel = existingNode.children;
      }
    }

    const sortTree = (nodes: FileNode[]) => {
      nodes.sort((a, b) => {
        if (a.isDir && !b.isDir) return -1;
        if (!a.isDir && b.isDir) return 1;
        return a.name.localeCompare(b.name);
      });
      for (const node of nodes) {
        if (node.isDir) {
          sortTree(node.children);
        }
      }
    };
    sortTree(root);
    return root;
  };

  const toggleDir = (dirPath: string) => {
    setOpenDirs(prev => ({
      ...prev,
      [dirPath]: !prev[dirPath]
    }));
  };

  const renderFileTree = (nodes: FileNode[], depth = 0): React.ReactNode[] => {
    return nodes.map((node) => {
      const isExpanded = !!openDirs[node.path];
      const paddingLeft = `${depth * 12 + 8}px`;

      if (node.isDir) {
        return (
          <div key={node.path} className="select-none">
            <div
              onClick={() => toggleDir(node.path)}
              style={{ paddingLeft }}
              className="flex items-center space-x-1.5 py-1 px-2 hover:bg-cyber-primary/10 rounded cursor-pointer text-xs text-cyber-textPrimary/90 hover:text-white transition-colors"
            >
              {isExpanded ? (
                <FolderOpen size={14} className="text-cyber-primary shrink-0" />
              ) : (
                <Folder size={14} className="text-cyber-primary shrink-0" />
              )}
              <span className="truncate">{node.name}</span>
            </div>
            {isExpanded && (
              <div className="mt-0.5">
                {renderFileTree(node.children, depth + 1)}
              </div>
            )}
          </div>
        );
      } else {
        const isCurrent = openedFile === node.path;
        return (
          <div
            key={node.path}
            onClick={() => handleOpenFile(node.path)}
            style={{ paddingLeft }}
            className={`flex items-center space-x-1.5 py-1 px-2 rounded cursor-pointer text-xs transition-colors truncate select-none ${
              isCurrent
                ? "bg-cyber-primary/20 text-cyber-primary font-medium"
                : "text-cyber-textSecondary hover:bg-white/5 hover:text-cyber-textPrimary"
            }`}
          >
            <File size={13} className={`shrink-0 ${isCurrent ? "text-cyber-primary" : "text-cyber-textSecondary"}`} />
            <span className="truncate">{node.name}</span>
          </div>
        );
      }
    });
  };

  const activeConvo = conversations.find((c) => c.id === activeId);

  // Auto-initialize conversation if list is empty
  useEffect(() => {
    if (conversations.length === 0) {
      createConversation();
    } else if (!activeId) {
      setActiveConversation(conversations[0].id);
    }
  }, [conversations, activeId, createConversation, setActiveConversation]);

  // Helper to extract plain text from UIMessage parts
  const getMessageText = (msg: UIMessage) => {
    if (!msg.parts) return "";
    return msg.parts
      .filter((part) => part.type === "text")
      .map((part: any) => part.text)
      .join("");
  };

  // Vercel AI SDK useChat Hook
  const {
    messages,
    setMessages,
    sendMessage,
    status,
  } = useChat({
    id: activeId || undefined,
    messages: activeConvo?.messages.map((m) => ({
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

        // Helper to extract content from UIMessage
        const getMsgContent = (m: any) => {
          if (!m.parts) return m.content || "";
          return m.parts
            .filter((p: any) => p.type === "text")
            .map((p: any) => p.text)
            .join("");
        };

        const lastUserMsgText = getMsgContent(lastUserMsg);

        // Save user message to Zustand history store
        if (activeId) {
          const currentConvo = useChatStore.getState().conversations.find(c => c.id === activeId);
          const alreadyHasUserMsg = currentConvo?.messages.some(m => m.id === lastUserMsg.id);
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
        const activeModel = settings.selectedModel === "custom" ? settings.customModel : settings.selectedModel;
        const activeApiKey = settings.apiKey;

        if (settings.authMethod === "apiKey" && !activeApiKey && activeProvider !== "ollama") {
          const errorMsg = `Error: API Key for "${activeProvider}" is not configured. Please open Settings and set it.`;
          const errorStream = new ReadableStream({
            start(controller) {
              const encoder = new TextEncoder();
              controller.enqueue(encoder.encode(errorMsg));
              controller.close();
            }
          });
          return new Response(errorStream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
        }

        if (settings.authMethod === "serviceAccount" && activeProvider === "gemini" && !settings.serviceAccountPath) {
          const errorMsg = `Error: Service Account JSON path is not configured. Please open Settings and set it.`;
          const errorStream = new ReadableStream({
            start(controller) {
              const encoder = new TextEncoder();
              controller.enqueue(encoder.encode(errorMsg));
              controller.close();
            }
          });
          return new Response(errorStream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
        }

        const mappedMessages = userMessages.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: getMsgContent(m),
        }));

        // Call local Express engine
        const response = await fetch("http://localhost:3001/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: mappedMessages,
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
            token: settings.token,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Engine request failed: ${response.status} ${errText}`);
        }

        // Save placeholder for assistant response in Zustand history store
        const assistantMsgId = "assistant-" + Date.now();
        if (activeId) {
          addMessage(activeId, {
            id: assistantMsgId,
            role: "assistant",
            content: "",
          });
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";

        const stream = new ReadableStream({
          async start(controller) {
            try {
              if (reader) {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  
                  const text = decoder.decode(value, { stream: true });
                  accumulatedText += text;
                  
                  // Live update the assistant message in Zustand store
                  if (activeId) {
                    useChatStore.getState().updateLastMessageContent(activeId, accumulatedText);
                  }
                  
                  controller.enqueue(value);
                }
              }
            } catch (streamErr: any) {
              console.error("Stream reading error:", streamErr);
              const errChunk = `\n\n[Generation Error: ${streamErr.message || streamErr}]`;
              accumulatedText += errChunk;
              if (activeId) {
                useChatStore.getState().updateLastMessageContent(activeId, accumulatedText);
              }
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

  // Sync Vercel AI SDK messages list when switching between conversation threads
  useEffect(() => {
    if (activeConvo) {
      setMessages(
        activeConvo.messages.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant" | "system",
          parts: [{ type: "text" as const, text: m.content }],
        }))
      );
    } else {
      setMessages([]);
    }
  }, [activeId, activeConvo, setMessages]);

  // Scroll to bottom on new message additions or active text generation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleMinimize = async () => {
    try {
      await appWindow.minimize();
    } catch (err) {
      console.error("Failed to minimize window:", err);
    }
  };

  const handleClose = async () => {
    try {
      await appWindow.close();
    } catch (err) {
      console.error("Failed to close window:", err);
    }
  };

  const handleExpand = async () => {
    try {
      await appWindow.toggleMaximize();
    } catch (err) {
      console.error("Failed to toggle maximize:", err);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage({
      role: "user" as const,
      parts: [{ type: "text" as const, text: input }]
    });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper formatter to display structured markdown (bold, list bullets, code blocks)
  const renderMessageContent = (text: string) => {
    const codeBlocks = text.split("```");
    return codeBlocks.map((block, index) => {
      if (index % 2 === 1) {
        // Render Code block
        const lines = block.trim().split("\n");
        const language = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : "";
        const code = language ? lines.slice(1).join("\n") : lines.join("\n");
        return (
          <div key={index} className="my-2.5 border border-cyber-cardBorder bg-cyber-dark/90 rounded-xl p-3 font-mono text-xs overflow-x-auto text-emerald-400 select-text">
            {language && <div className="text-[10px] text-cyber-textSecondary mb-1.5 uppercase font-bold tracking-wider">{language}</div>}
            <pre><code>{code}</code></pre>
          </div>
        );
      } else {
        // Render plain text with inline code blocks, bold text, list spacing, and linebreaks
        const lines = block.split("\n");
        return lines.map((line, lIdx) => {
          const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
          const cleanLine = isBullet ? line.trim().substring(2) : line;

          const formattedLine = cleanLine.split("`").map((chunk, cIdx) => {
            if (cIdx % 2 === 1) {
              return (
                <code key={cIdx} className="bg-cyber-dark/80 text-cyber-primary px-1.5 py-0.5 rounded font-mono text-xs select-text">
                  {chunk}
                </code>
              );
            }
            return chunk.split("**").map((part, bIdx) => {
              if (bIdx % 2 === 1) {
                return (
                  <strong key={bIdx} className="text-cyber-primary font-semibold">
                    {part}
                  </strong>
                );
              }
              return part;
            });
          });

          if (isBullet) {
            return (
              <div key={lIdx} className="flex items-start space-x-2 my-1 ml-2">
                <span className="text-cyber-primary mt-1">•</span>
                <span className="flex-1">{formattedLine}</span>
              </div>
            );
          }
          return (
            <div key={lIdx} className="min-h-[1.25em]">
              {formattedLine}
            </div>
          );
        });
      }
    });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError("Please fill in all fields.");
      return;
    }
    setAuthError(null);
    setAuthLoading(true);

    try {
      const endpoint = authMode === "login" ? "login" : "register";
      const response = await fetch(`http://localhost:3002/api/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Save token and email in settings store
      await updateSettings({
        token: data.token,
        userEmail: data.email,
      });
      setAuthOpen(false);
    } catch (err: any) {
      setAuthError(err.message || "An unexpected error occurred.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-screen w-full bg-cyber-dark border border-cyber-cardBorder rounded-xl overflow-hidden shadow-2xl animate-fade-in text-cyber-textPrimary">
      
      <header
        data-tauri-drag-region
        className="relative z-20 flex items-center justify-between px-4 py-3 bg-cyber-dark border-b border-cyber-cardBorder cursor-grab active:cursor-grabbing select-none"
      >
        {/* macOS-style Window controls on the top-left */}
        <div className="flex items-center space-x-2 group/traffic w-[64px]" data-tauri-drag-region>
          <button
            onClick={handleClose}
            className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center text-[#4c0002] hover:bg-[#ff5f56]/90 transition-all cursor-pointer relative z-30"
            title="Close"
          >
            <span className="absolute text-[8px] font-bold opacity-0 group-hover/traffic:opacity-100 transition-opacity pointer-events-none">×</span>
          </button>
          <button
            onClick={handleMinimize}
            className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] flex items-center justify-center text-[#5c3e00] hover:bg-[#ffbd2e]/90 transition-all cursor-pointer relative z-30"
            title="Minimize"
          >
            <span className="absolute text-[8px] font-bold opacity-0 group-hover/traffic:opacity-100 transition-opacity leading-none select-none bottom-[3px] pointer-events-none">-</span>
          </button>
          <button
            onClick={handleExpand}
            className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] flex items-center justify-center text-[#024d00] hover:bg-[#27c93f]/90 transition-all cursor-pointer relative z-30"
            title="Maximize"
          >
            <span className="absolute text-[6px] font-bold opacity-0 group-hover/traffic:opacity-100 transition-opacity select-none leading-none bottom-[2px] pointer-events-none">+</span>
          </button>
        </div>

        {/* Centered Title */}
        <div className="flex items-center justify-center space-x-2 pointer-events-none flex-1" data-tauri-drag-region>
          <div className="relative pointer-events-none">
            <span className="flex h-2 w-2 pointer-events-none">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-primary opacity-75 pointer-events-none ${isLoading ? "bg-amber-400" : "bg-cyber-primary"}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 bg-cyber-primary pointer-events-none ${isLoading ? "bg-amber-400" : "bg-cyber-primary"}`}></span>
            </span>
          </div>
          <span className="font-semibold text-xs tracking-wider uppercase text-cyber-textPrimary/90 pointer-events-none" data-tauri-drag-region>
            {isLoading ? "Generating..." : "Istiyak Companion"}
          </span>
        </div>

        {/* Clock/History Toggle Button on the top-right */}
        <div className="flex items-center justify-end space-x-1.5 z-30">
          <button
            onClick={() => setAuthOpen(true)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              token 
                ? "text-cyber-primary hover:bg-cyber-primary/10" 
                : "text-cyber-textSecondary hover:text-white hover:bg-white/10"
            }`}
            title={token ? `Logged in as ${userEmail}` : "Account Login"}
          >
            <User size={14} />
          </button>
          <button
            onClick={() => {
              fetchTelemetry();
              setTelemetryOpen(true);
            }}
            className="p-1.5 rounded-lg text-cyber-textSecondary hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Live Telemetry & Cost Dashboard"
          >
            <Activity size={14} />
          </button>
          <button
            onClick={() => setMarketplaceOpen(true)}
            className="p-1.5 rounded-lg text-cyber-textSecondary hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Marketplace & Customizations"
          >
            <Sparkles size={14} />
          </button>
          <button
            onClick={toggleIdeMode}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isIdeMode 
                ? "text-cyber-primary hover:bg-cyber-primary/10" 
                : "text-cyber-textSecondary hover:text-white hover:bg-white/10"
            }`}
            title={isIdeMode ? "Switch to Companion Widget" : "Switch to Full IDE Mode"}
          >
            <Columns size={14} />
          </button>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-cyber-textSecondary hover:text-white hover:bg-white/10 transition-colors mr-1 cursor-pointer"
            title="Chat History"
          >
            <History size={14} />
          </button>
        </div>
      </header>

      {isIdeMode ? (
        <div className="flex-1 flex flex-row overflow-hidden">
          {/* Left Panel: File Explorer */}
          <div className="w-[240px] bg-cyber-dark border-r border-cyber-cardBorder flex flex-col overflow-hidden">
            <div className="p-3 border-b border-cyber-cardBorder/40 flex items-center justify-between select-none">
              <span className="font-semibold text-xs tracking-wider uppercase text-cyber-textPrimary/80">File Explorer</span>
              <button 
                onClick={async () => {
                  if (workspacePath) {
                    try {
                      const files: string[] = await invoke("scan_project", { path: workspacePath });
                      setWorkspaceFiles(files);
                    } catch (err) {
                      console.error("Failed to scan project files:", err);
                    }
                  }
                }}
                className="p-1 rounded text-cyber-textSecondary hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Refresh File Explorer"
              >
                <Plus size={12} className="rotate-45" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {workspacePath ? (
                workspaceFiles.length === 0 ? (
                  <p className="text-[10px] text-cyber-textSecondary italic p-2">Empty or scanning...</p>
                ) : (
                  renderFileTree(buildTree(workspaceFiles))
                )
              ) : (
                <div className="text-center p-4">
                  <p className="text-[10px] text-cyber-textMuted mb-2">No workspace selected.</p>
                  <button
                    onClick={async () => {
                      try {
                        const selected: string = await invoke("select_directory");
                        if (selected) {
                          updateSettings({ workspacePath: selected });
                        }
                      } catch (err) {
                        console.log("Directory selection cancelled or failed:", err);
                      }
                    }}
                    className="px-2 py-1.5 bg-cyber-primary/20 hover:bg-cyber-primary/30 border border-cyber-primary/40 hover:border-cyber-primary text-cyber-primary rounded text-[10px] font-semibold transition-all duration-300"
                  >
                    Select Workspace
                  </button>
                </div>
              )}
            </div>

            {workspacePath && (
              <div className="p-3 border-t border-cyber-cardBorder/40 bg-cyber-dark/40 text-[10px] space-y-2 select-none">
                <div className="flex justify-between items-center text-cyber-textSecondary">
                  <span>Branch:</span>
                  <span className={`font-mono px-1.5 py-0.5 rounded truncate max-w-[120px] ${gitInitialized ? "text-white bg-cyber-primary/10 border border-cyber-primary/20" : "text-amber-400 bg-amber-400/10 border border-amber-400/20"}`} title={gitBranch}>
                    {gitInitialized ? gitBranch : "No Repo"}
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between items-center text-cyber-textSecondary">
                    <span>Search Index:</span>
                    <span className="text-white truncate max-w-[100px]" title={indexMessage}>
                      {indexMessage}
                    </span>
                  </div>
                  <button
                    disabled={isIndexing}
                    onClick={handleReindex}
                    className="w-full py-1 bg-cyber-primary/25 border border-cyber-primary/40 hover:border-cyber-primary text-cyber-primary hover:bg-cyber-primary/20 rounded font-semibold transition-all disabled:opacity-50 flex items-center justify-center space-x-1 cursor-pointer text-[9px]"
                  >
                    {isIndexing ? (
                      <span className="w-2.5 h-2.5 border-2 border-cyber-primary border-t-transparent rounded-full animate-spin mr-1" />
                    ) : null}
                    <span>REINDEX CODEBASE</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Center Panel: Monaco Editor & Terminal simulator */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-cyber-cardBorder bg-cyber-card">
            {/* Editor Title Bar */}
            <div className="p-3 border-b border-cyber-cardBorder/40 bg-cyber-dark flex items-center justify-between min-h-[41px] select-none">
              <span className="text-xs font-mono text-cyber-primary truncate">
                {openedFile ? openedFile : "No File Opened"}
              </span>
              {openedFile && (
                <button
                  onClick={handleSaveFile}
                  disabled={isSaving}
                  className="flex items-center space-x-1 px-2.5 py-1 bg-cyber-primary/20 hover:bg-cyber-primary/30 border border-cyber-primary/45 text-cyber-primary hover:text-white rounded text-[10px] font-semibold transition-colors disabled:opacity-50"
                >
                  <Save size={12} />
                  <span>{isSaving ? "Saving..." : "Save"}</span>
                </button>
              )}
            </div>

            {/* Monaco Editor Container */}
            <div className="flex-1 relative overflow-hidden bg-cyber-dark">
              {openedFile ? (
                <Editor
                  height="100%"
                  language={editorLanguage}
                  theme="vs-dark"
                  value={fileContent}
                  onChange={(val) => setFileContent(val || "")}
                  options={{
                    fontSize: 12,
                    fontFamily: "Fira Code, Monaco, Courier New, monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    lineNumbers: "on",
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 10,
                    lineNumbersMinChars: 3,
                    wordWrap: "on",
                    padding: { top: 8, bottom: 8 }
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-2 opacity-50 select-none">
                  <File size={32} className="text-cyber-textSecondary animate-pulse" />
                  <p className="text-xs text-cyber-textSecondary">Select a file from the explorer to view/edit</p>
                </div>
              )}
            </div>

            {/* Terminal Simulator Log at Bottom-Center */}
            <div className="h-[200px] border-t border-cyber-cardBorder flex flex-col overflow-hidden bg-cyber-dark">
              <div className="p-2 border-b border-cyber-cardBorder/40 bg-cyber-dark flex items-center justify-between select-none">
                <span className="font-semibold text-[10px] tracking-wider uppercase text-cyber-textSecondary flex items-center space-x-1.5">
                  <Terminal size={12} className="text-cyber-primary" />
                  <span>Terminal Outputs</span>
                </span>
                <div className="flex items-center space-x-2">
                  {lastCompileError && (
                    <button
                      onClick={() => {
                        setInput(`I encountered the following execution error in the terminal:\n\n${lastCompileError}\n\nPlease diagnose and edit the codebase to fix this error.`);
                        setLastCompileError(null);
                      }}
                      className="text-[9px] bg-cyan-500/25 border border-cyan-500/45 text-cyan-400 hover:bg-cyan-500/35 hover:border-cyan-300 font-bold px-2 py-0.5 rounded transition-all animate-pulse cursor-pointer"
                      title="Diagnose & auto-fix this terminal/compilation error"
                    >
                      AUTO-FIX ERROR
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setLogs([{ time: new Date().toLocaleTimeString(), message: "Terminal logs cleared.", type: "info" }]);
                      setLastCompileError(null);
                    }}
                    className="text-[9px] text-cyber-textMuted hover:text-white px-1.5 py-0.5 rounded hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Extension command shortcuts */}
              {installedExtensions.some(ext => ext.commands.length > 0) && (
                <div className="px-3 py-1.5 bg-cyber-dark/40 border-b border-cyber-cardBorder/30 flex items-center space-x-2 overflow-x-auto select-none shrink-0 scrollbar-none">
                  <span className="text-[9px] text-cyber-textSecondary font-bold uppercase tracking-wider shrink-0">Shortcuts:</span>
                  {installedExtensions.flatMap(ext => ext.commands.map(cmd => ({ extName: ext.name, ...cmd }))).map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setTerminalInput(c.command);
                      }}
                      className="px-2 py-0.5 bg-cyber-card/60 hover:bg-cyber-primary/20 border border-cyber-cardBorder hover:border-cyber-primary/40 rounded text-[9px] text-cyber-textSecondary hover:text-white transition-all duration-200 truncate cursor-pointer font-mono"
                      title={`Command: ${c.command} (${c.extName})`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Terminal Logs List */}
              <div className="flex-1 overflow-y-auto p-3 font-mono text-[11px] space-y-1.5 select-text">
                {logs.map((log, idx) => {
                  let colorClass = "text-white/80";
                  if (log.type === "error") colorClass = "text-red-400";
                  if (log.type === "success") colorClass = "text-emerald-400 font-semibold";
                  if (log.type === "info") colorClass = "text-cyan-400";
                  return (
                    <div key={idx} className="leading-relaxed break-words whitespace-pre-wrap">
                      <span className="text-cyber-textMuted select-none mr-2">[{log.time}]</span>
                      <span className={colorClass}>{log.message}</span>
                    </div>
                  );
                })}
              </div>

              {/* Terminal Command Input Form */}
              <form onSubmit={handleExecuteTerminalCommand} className="flex border-t border-cyber-cardBorder/50 bg-cyber-dark/40">
                <span className="pl-3 py-2 text-cyber-primary font-mono text-xs select-none">$</span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="Execute shell commands in sandbox environment..."
                  disabled={isTerminalRunning || !workspacePath}
                  className="flex-1 bg-transparent border-0 px-2 py-2 text-xs text-white placeholder-cyber-textMuted focus:outline-none focus:ring-0 font-mono disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isTerminalRunning || !terminalInput.trim() || !workspacePath}
                  className="px-3 bg-cyber-primary/10 border-l border-cyber-cardBorder/50 text-cyber-primary hover:bg-cyber-primary/20 text-xs font-semibold font-mono transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  RUN
                </button>
              </form>
            </div>
          </div>

          {/* Right Panel: Companion Chat UI */}
          <div className="w-[380px] flex flex-col overflow-hidden bg-cyber-dark">
            {/* Messages Scroll Panel */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3 opacity-60">
                  <Bot size={40} className="text-cyber-primary animate-pulse" />
                  <h3 className="font-semibold text-sm">Welcome to Istiyak Companion</h3>
                  <p className="text-xs text-cyber-textSecondary max-w-[240px]">
                    Start typing a message below. I can generate code, answer questions, and execute commands.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-2.5 animate-slide-up ${
                      msg.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center h-8 w-8 rounded-full border shadow-sm select-none ${
                        msg.role === "user"
                          ? "bg-cyber-secondary/20 border-cyber-secondary/35 text-cyber-secondary"
                          : "bg-cyber-primary/20 border-cyber-primary/35 text-cyber-primary"
                      }`}
                    >
                      {msg.role === "user" ? <User size={15} /> : <Bot size={15} />}
                    </div>

                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed shadow-sm transition-all ${
                        msg.role === "user"
                          ? "bg-cyber-secondary/20 border border-cyber-secondary/30 text-white rounded-tr-none"
                          : "bg-cyber-card border border-cyber-cardBorder text-cyber-textPrimary/95 rounded-tl-none"
                      }`}
                    >
                      {msg.role === "assistant" ? (() => {
                        const { steps, permissionRequests, cleanText } = parseAgentMessage(getMessageText(msg as UIMessage));
                        return (
                          <div className="space-y-3">
                            {steps.length > 0 && (
                              <div className="border border-cyber-cardBorder/40 bg-cyber-dark/40 rounded-xl p-3 space-y-2.5 font-mono text-[11px] select-none mb-3">
                                <div className="flex items-center space-x-1.5 text-cyber-primary border-b border-cyber-cardBorder/20 pb-1.5">
                                  <Terminal size={13} className="animate-pulse" />
                                  <span className="font-bold uppercase tracking-wider text-[10px]">Agent Reasoning Stack</span>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                  {steps.map((s, idx) => (
                                    <div key={idx} className="border-l border-cyber-primary/30 pl-2 py-0.5 space-y-0.5">
                                      <div className="flex justify-between items-center font-bold text-white text-[10.5px]">
                                        <span>Step {s.step}: {s.status.toUpperCase()} {s.actionName ? `(${s.actionName})` : ''}</span>
                                        <span className={`text-[8.5px] px-1 rounded uppercase ${
                                          s.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                                          s.status === 'error' ? 'bg-red-500/20 text-red-400' : 
                                          s.status === 'action' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/20 text-amber-400 animate-pulse'
                                        }`}>
                                          {s.status}
                                        </span>
                                      </div>
                                      {s.content && <p className="text-cyber-textSecondary text-[10px] leading-relaxed italic">{s.content}</p>}
                                      {s.actionName === 'run_command' && s.params?.command && (
                                        <code className="block bg-cyber-dark/80 px-1 py-0.5 rounded text-[9.5px] text-cyan-400 font-mono truncate max-w-full">
                                          $ {s.params.command.replace(/&quot;/g, '"')}
                                        </code>
                                      )}
                                      {s.actionName === 'read_file' && s.params?.relPath && (
                                        <div className="text-[9.5px] text-cyber-textSecondary">
                                          Reading file: <span className="text-cyber-primary font-semibold">{s.params.relPath}</span>
                                        </div>
                                      )}
                                      {s.actionName === 'write_file' && s.params?.relPath && (
                                        <div className="text-[9.5px] text-cyber-textSecondary">
                                          Writing file: <span className="text-cyber-accent font-semibold">{s.params.relPath}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {permissionRequests.map((req) => {
                              const state = permState[req.id] || 'pending';
                              return (
                                <div key={req.id} className="border border-amber-500/35 bg-amber-500/5 rounded-xl p-3.5 space-y-3 text-xs select-none mb-3">
                                  <div className="font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                                    <span>⚠️ Execution Permission Required</span>
                                  </div>
                                  <p className="text-cyber-textSecondary text-[11.5px] leading-relaxed">
                                    এজেন্ট আপনার লোকাল ওয়ার্কস্পেসে নিচের কমান্ডটি রান করার অনুমতি চাচ্ছে:
                                  </p>
                                  <code className="block bg-cyber-dark/90 p-2 rounded text-white font-mono border border-cyber-cardBorder text-[10.5px] break-all whitespace-pre-wrap">
                                    {req.command}
                                  </code>
                                  
                                  {state === 'pending' ? (
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => handlePermissionResponse(req.id, true)}
                                        className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-cyber-dark font-bold rounded-lg transition-colors cursor-pointer text-[11px]"
                                      >
                                        Approve (রান করো)
                                      </button>
                                      <button
                                        onClick={() => handlePermissionResponse(req.id, false)}
                                        className="flex-1 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-bold rounded-lg transition-colors cursor-pointer text-[11px]"
                                      >
                                        Block (রান করিও না)
                                      </button>
                                    </div>
                                  ) : (
                                    <div className={`text-center py-1 font-semibold rounded text-[11px] ${
                                      state === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                    }`}>
                                      {state === 'approved' ? '✓ APPROVED & EXECUTED' : '✗ BLOCKED BY USER'}
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            {cleanText && (
                              <div className="chat-text-content">
                                {renderMessageContent(cleanText)}
                              </div>
                            )}
                          </div>
                        );
                      })() : renderMessageContent(getMessageText(msg as UIMessage))}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input controls form */}
            <div className="p-4 bg-cyber-dark border-t border-cyber-cardBorder">
              <div className="relative flex flex-col bg-cyber-card border border-cyber-cardBorder rounded-xl focus-within:border-cyber-primary/50 focus-within:ring-1 focus-within:ring-cyber-primary/20 transition-all duration-300">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask ISTIYAK to build code..."
                  rows={1}
                  disabled={isLoading}
                  className="w-full resize-none bg-transparent border-0 px-4 py-3 text-sm focus:outline-none focus:ring-0 text-white placeholder-cyber-textMuted max-h-32 min-h-[44px] disabled:opacity-50"
                />

                {/* Action Bar */}
                <div className="flex items-center justify-between px-3 py-2 border-t border-cyber-cardBorder/30">
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-cyber-textSecondary hover:text-cyber-primary hover:bg-cyber-primary/10 transition-colors cursor-pointer"
                      title="Attach file (Phase 3)"
                    >
                      <Paperclip size={15} />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-cyber-textSecondary hover:text-cyber-accent hover:bg-cyber-accent/10 transition-colors cursor-pointer"
                      title="Run command (Phase 4)"
                    >
                      <Terminal size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsOpen(true)}
                      className="p-1.5 rounded-lg text-cyber-textSecondary hover:text-cyber-secondary hover:bg-cyber-secondary/10 transition-colors cursor-pointer"
                      title="Companion Settings"
                    >
                      <Settings size={15} />
                    </button>
                    
                    {/* Dynamic Prompt Selector library */}
                    {installedPrompts.length > 0 && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setPromptsDropdownOpen(!promptsDropdownOpen)}
                          className="px-2 py-0.5 bg-cyber-primary/15 hover:bg-cyber-primary/25 border border-cyber-primary/30 text-cyber-primary rounded text-[9px] font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                        >
                          <span>Prompts</span>
                          <span className="text-[8px] bg-cyber-primary/20 text-cyber-primary px-1 rounded-full">{installedPrompts.length}</span>
                        </button>
                        {promptsDropdownOpen && (
                          <div className="absolute bottom-full left-0 mb-1.5 w-48 bg-cyber-dark border border-cyber-cardBorder rounded-xl shadow-2xl z-50 p-2 space-y-1 max-h-48 overflow-y-auto">
                            <div className="text-[9px] text-cyber-textSecondary px-2 py-1 font-semibold uppercase tracking-wider border-b border-cyber-cardBorder/40">Select Prompt</div>
                            {installedPrompts.map((p, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setInput(prev => prev ? `${prev}\n${p.prompt}` : p.prompt);
                                  setPromptsDropdownOpen(false);
                                }}
                                className="w-full text-left px-2 py-1.5 hover:bg-cyber-primary/15 rounded text-[10px] text-white truncate transition-colors cursor-pointer"
                                title={p.prompt}
                              >
                                {p.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className={`p-2 rounded-lg transition-all duration-300 cursor-pointer ${
                      input.trim() && !isLoading
                        ? "bg-cyber-primary text-cyber-dark hover:shadow-[0_0_12px_rgba(6,182,212,0.5)] transform hover:scale-105"
                        : "bg-cyber-cardBorder text-cyber-textMuted cursor-not-allowed"
                    }`}
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Messages Scroll Panel */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3 opacity-60">
                <Bot size={40} className="text-cyber-primary animate-pulse" />
                <h3 className="font-semibold text-sm">Welcome to Istiyak Companion</h3>
                <p className="text-xs text-cyber-textSecondary max-w-[240px]">
                  Start typing a message below. I can generate code, answer questions, and execute commands.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2.5 animate-slide-up ${
                    msg.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex items-center justify-center h-8 w-8 rounded-full border shadow-sm select-none ${
                      msg.role === "user"
                        ? "bg-cyber-secondary/20 border-cyber-secondary/35 text-cyber-secondary"
                        : "bg-cyber-primary/20 border-cyber-primary/35 text-cyber-primary"
                    }`}
                  >
                    {msg.role === "user" ? <User size={15} /> : <Bot size={15} />}
                  </div>

                  {/* Chat Bubble */}
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed shadow-sm transition-all ${
                      msg.role === "user"
                        ? "bg-cyber-secondary/20 border border-cyber-secondary/30 text-white rounded-tr-none"
                        : "bg-cyber-card border border-cyber-cardBorder text-cyber-textPrimary/95 rounded-tl-none"
                    }`}
                  >
                    {msg.role === "assistant" ? (() => {
                      const { steps, permissionRequests, cleanText } = parseAgentMessage(getMessageText(msg as UIMessage));
                      return (
                        <div className="space-y-3">
                          {steps.length > 0 && (
                            <div className="border border-cyber-cardBorder/40 bg-cyber-dark/40 rounded-xl p-3 space-y-2.5 font-mono text-[11px] select-none mb-3">
                              <div className="flex items-center space-x-1.5 text-cyber-primary border-b border-cyber-cardBorder/20 pb-1.5">
                                <Terminal size={13} className="animate-pulse" />
                                <span className="font-bold uppercase tracking-wider text-[10px]">Agent Reasoning Stack</span>
                              </div>
                              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {steps.map((s, idx) => (
                                  <div key={idx} className="border-l border-cyber-primary/30 pl-2 py-0.5 space-y-0.5">
                                    <div className="flex justify-between items-center font-bold text-white text-[10.5px]">
                                      <span>Step {s.step}: {s.status.toUpperCase()} {s.actionName ? `(${s.actionName})` : ''}</span>
                                      <span className={`text-[8.5px] px-1 rounded uppercase ${
                                        s.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                                        s.status === 'error' ? 'bg-red-500/20 text-red-400' : 
                                        s.status === 'action' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-amber-500/20 text-amber-400 animate-pulse'
                                      }`}>
                                        {s.status}
                                      </span>
                                    </div>
                                    {s.content && <p className="text-cyber-textSecondary text-[10px] leading-relaxed italic">{s.content}</p>}
                                    {s.actionName === 'run_command' && s.params?.command && (
                                      <code className="block bg-cyber-dark/80 px-1 py-0.5 rounded text-[9.5px] text-cyan-400 font-mono truncate max-w-full">
                                        $ {s.params.command.replace(/&quot;/g, '"')}
                                      </code>
                                    )}
                                    {s.actionName === 'read_file' && s.params?.relPath && (
                                      <div className="text-[9.5px] text-cyber-textSecondary">
                                        Reading file: <span className="text-cyber-primary font-semibold">{s.params.relPath}</span>
                                      </div>
                                    )}
                                    {s.actionName === 'write_file' && s.params?.relPath && (
                                      <div className="text-[9.5px] text-cyber-textSecondary">
                                        Writing file: <span className="text-cyber-accent font-semibold">{s.params.relPath}</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {permissionRequests.map((req) => {
                            const state = permState[req.id] || 'pending';
                            return (
                              <div key={req.id} className="border border-amber-500/35 bg-amber-500/5 rounded-xl p-3.5 space-y-3 text-xs select-none mb-3">
                                <div className="font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                                  <span>⚠️ Execution Permission Required</span>
                                </div>
                                <p className="text-cyber-textSecondary text-[11.5px] leading-relaxed">
                                  এজেন্ট আপনার লোকাল ওয়ার্কস্পেসে নিচের কমান্ডটি রান করার অনুমতি চাচ্ছে:
                                  </p>
                                <code className="block bg-cyber-dark/90 p-2 rounded text-white font-mono border border-cyber-cardBorder text-[10.5px] break-all whitespace-pre-wrap">
                                  {req.command}
                                </code>
                                
                                {state === 'pending' ? (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handlePermissionResponse(req.id, true)}
                                      className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-cyber-dark font-bold rounded-lg transition-colors cursor-pointer text-[11px]"
                                    >
                                      Approve (রান করো)
                                    </button>
                                    <button
                                      onClick={() => handlePermissionResponse(req.id, false)}
                                      className="flex-1 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-bold rounded-lg transition-colors cursor-pointer text-[11px]"
                                    >
                                      Block (রান করিও না)
                                    </button>
                                  </div>
                                ) : (
                                  <div className={`text-center py-1 font-semibold rounded text-[11px] ${
                                    state === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                  }`}>
                                    {state === 'approved' ? '✓ APPROVED & EXECUTED' : '✗ BLOCKED BY USER'}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {cleanText && (
                            <div className="chat-text-content">
                              {renderMessageContent(cleanText)}
                            </div>
                          )}
                        </div>
                      );
                    })() : renderMessageContent(getMessageText(msg as UIMessage))}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input controls form */}
          <div className="p-4 bg-cyber-dark border-t border-cyber-cardBorder">
            <div className="relative flex flex-col bg-cyber-card border border-cyber-cardBorder rounded-xl focus-within:border-cyber-primary/50 focus-within:ring-1 focus-within:ring-cyber-primary/20 transition-all duration-300">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask ISTIYAK to build code..."
                rows={1}
                disabled={isLoading}
                className="w-full resize-none bg-transparent border-0 px-4 py-3 text-sm focus:outline-none focus:ring-0 text-white placeholder-cyber-textMuted max-h-32 min-h-[44px] disabled:opacity-50"
              />

              {/* Action Bar */}
              <div className="flex items-center justify-between px-3 py-2 border-t border-cyber-cardBorder/30">
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    className="p-1.5 rounded-lg text-cyber-textSecondary hover:text-cyber-primary hover:bg-cyber-primary/10 transition-colors cursor-pointer"
                    title="Attach file (Phase 3)"
                  >
                    <Paperclip size={15} />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 rounded-lg text-cyber-textSecondary hover:text-cyber-accent hover:bg-cyber-accent/10 transition-colors cursor-pointer"
                    title="Run command (Phase 4)"
                  >
                    <Terminal size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(true)}
                    className="p-1.5 rounded-lg text-cyber-textSecondary hover:text-cyber-secondary hover:bg-cyber-secondary/10 transition-colors cursor-pointer"
                    title="Companion Settings"
                  >
                    <Settings size={15} />
                  </button>
                  
                  {/* Dynamic Prompt Selector library */}
                  {installedPrompts.length > 0 && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setPromptsDropdownOpen(!promptsDropdownOpen)}
                        className="px-2 py-0.5 bg-cyber-primary/15 hover:bg-cyber-primary/25 border border-cyber-primary/30 text-cyber-primary rounded text-[9px] font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Prompts</span>
                        <span className="text-[8px] bg-cyber-primary/20 text-cyber-primary px-1 rounded-full">{installedPrompts.length}</span>
                      </button>
                      {promptsDropdownOpen && (
                        <div className="absolute bottom-full left-0 mb-1.5 w-48 bg-cyber-dark border border-cyber-cardBorder rounded-xl shadow-2xl z-50 p-2 space-y-1 max-h-48 overflow-y-auto">
                          <div className="text-[9px] text-cyber-textSecondary px-2 py-1 font-semibold uppercase tracking-wider border-b border-cyber-cardBorder/40">Select Prompt</div>
                          {installedPrompts.map((p, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setInput(prev => prev ? `${prev}\n${p.prompt}` : p.prompt);
                                setPromptsDropdownOpen(false);
                              }}
                              className="w-full text-left px-2 py-1.5 hover:bg-cyber-primary/15 rounded text-[10px] text-white truncate transition-colors cursor-pointer"
                              title={p.prompt}
                            >
                              {p.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`p-2 rounded-lg transition-all duration-300 cursor-pointer ${
                    input.trim() && !isLoading
                      ? "bg-cyber-primary text-cyber-dark hover:shadow-[0_0_12px_rgba(6,182,212,0.5)] transform hover:scale-105"
                      : "bg-cyber-cardBorder text-cyber-textMuted cursor-not-allowed"
                  }`}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* History Drawer Overlay Panel */}
      <div
        className={`absolute inset-0 bg-cyber-dark/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        {/* Drawer content */}
        <div
          className={`absolute top-0 left-0 bottom-0 w-64 bg-cyber-dark border-r border-cyber-cardBorder shadow-2xl flex flex-col p-4 space-y-4 transition-transform duration-300 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-cyber-cardBorder/40 pb-3">
            <span className="font-semibold text-xs tracking-wider uppercase text-cyber-textPrimary/80">Chats History</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded text-cyber-textSecondary hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* New Chat Trigger */}
          <button
            onClick={() => {
              createConversation();
              setSidebarOpen(false);
            }}
            className="flex items-center justify-center space-x-2 py-2 px-3 border border-cyber-primary/30 text-cyber-primary rounded-lg text-xs font-semibold hover:bg-cyber-primary/10 hover:border-cyber-primary transition-all duration-300 cursor-pointer"
          >
            <Plus size={14} />
            <span>Start New Chat</span>
          </button>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {conversations.map((convo) => (
              <div
                key={convo.id}
                onClick={() => {
                  setActiveConversation(convo.id);
                  setSidebarOpen(false);
                }}
                className={`flex items-center justify-between p-2 rounded-lg text-xs group cursor-pointer border transition-all ${
                  convo.id === activeId
                    ? "bg-cyber-primary/10 border-cyber-primary/30 text-cyber-primary"
                    : "bg-cyber-card/30 border-transparent text-cyber-textSecondary hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="truncate flex-1 font-medium pr-2">{convo.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(convo.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-cyber-textSecondary hover:text-red-400 hover:bg-red-500/10 rounded transition-all cursor-pointer"
                  title="Delete Chat"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Drawer Footer */}
          <div className="text-[10px] text-cyber-textMuted text-center select-none pt-2 border-t border-cyber-cardBorder/30">
            ISTIYAK AI Companion v0.1.0
          </div>
        </div>
      </div>

      {/* Settings Drawer Overlay Panel */}
      <div
        className={`absolute inset-0 bg-cyber-dark/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          settingsOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSettingsOpen(false)}
      >
        <div
          className={`absolute top-0 right-0 bottom-0 w-80 bg-cyber-dark border-l border-cyber-cardBorder shadow-2xl flex flex-col p-5 space-y-4 transition-transform duration-300 transform ${
            settingsOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-cyber-cardBorder/40 pb-3">
            <span className="font-semibold text-xs tracking-wider uppercase text-cyber-textPrimary/80">Settings</span>
            <button
              onClick={() => setSettingsOpen(false)}
              className="p-1 rounded text-cyber-textSecondary hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Drawer content */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            {/* Provider selection */}
            <div className="space-y-1.5">
              <label className="font-medium text-cyber-textSecondary">LLM Provider</label>
              <select
                value={provider}
                onChange={(e) => {
                  const newProvider = e.target.value as any;
                  let newModel = "gemini-2.5-flash";
                  if (newProvider === "openai") newModel = "gpt-4o";
                  else if (newProvider === "claude") newModel = "claude-3-5-sonnet-20241022";
                  else if (newProvider === "ollama") newModel = "llama3";
                  else if (newProvider === "custom") newModel = "custom";
                  
                  updateSettings({
                    provider: newProvider,
                    selectedModel: newModel,
                    authMethod: newProvider === "gemini" ? authMethod : "apiKey"
                  });
                }}
                className="w-full bg-cyber-card border border-cyber-cardBorder rounded-lg px-2.5 py-2 text-white outline-none focus:border-cyber-primary/60 cursor-pointer"
              >
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI</option>
                <option value="claude">Anthropic Claude</option>
                <option value="ollama">Ollama</option>
                <option value="custom">Custom Provider</option>
              </select>
            </div>

            {/* Auth Method selection - only for Gemini */}
            {provider === "gemini" && (
              <div className="space-y-1.5">
                <label className="font-medium text-cyber-textSecondary">Authentication Method</label>
                <select
                  value={authMethod}
                  onChange={(e) => {
                    updateSettings({ authMethod: e.target.value as any });
                  }}
                  className="w-full bg-cyber-card border border-cyber-cardBorder rounded-lg px-2.5 py-2 text-white outline-none focus:border-cyber-primary/60 cursor-pointer"
                >
                  <option value="apiKey">API Key</option>
                  <option value="serviceAccount">Service Account JSON</option>
                </select>
              </div>
            )}

            {/* API Key input (if authMethod is apiKey and not Ollama) */}
            {authMethod === "apiKey" && provider !== "ollama" && (
              <div className="space-y-1.5">
                <label className="font-medium text-cyber-textSecondary">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => updateSettings({ apiKey: e.target.value })}
                  placeholder={`Paste ${provider} API Key...`}
                  className="w-full bg-cyber-card border border-cyber-cardBorder rounded-lg px-2.5 py-2 text-white outline-none focus:border-cyber-primary/60 font-mono text-xs"
                />
              </div>
            )}

            {/* Service Account inputs (if authMethod is serviceAccount and Gemini) */}
            {authMethod === "serviceAccount" && provider === "gemini" && (
              <>
                <div className="space-y-1.5">
                  <label className="font-medium text-cyber-textSecondary">Service Account JSON Path</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={serviceAccountPath}
                      onChange={(e) => updateSettings({ serviceAccountPath: e.target.value })}
                      placeholder="e.g. /path/to/service-account.json"
                      className="flex-1 bg-cyber-card border border-cyber-cardBorder rounded-lg px-2.5 py-2 text-white outline-none focus:border-cyber-primary/60 text-xs font-mono"
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
                          console.log("File selection cancelled or failed:", err);
                        }
                      }}
                      className="px-3 py-2 bg-cyber-primary/20 hover:bg-cyber-primary/30 border border-cyber-primary/40 hover:border-cyber-primary text-cyber-primary rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer"
                    >
                      Browse
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-cyber-textSecondary">GCP Project ID</label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={(e) => updateSettings({ projectId: e.target.value })}
                    placeholder="e.g. my-gcp-project-123"
                    className="w-full bg-cyber-card border border-cyber-cardBorder rounded-lg px-2.5 py-2 text-white outline-none focus:border-cyber-primary/60 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-cyber-textSecondary">Vertex Region</label>
                  <select
                    value={location}
                    onChange={(e) => updateSettings({ location: e.target.value })}
                    className="w-full bg-cyber-card border border-cyber-cardBorder rounded-lg px-2.5 py-2 text-white outline-none focus:border-cyber-primary/60 cursor-pointer"
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

            {/* Model Selection Dropdown */}
            <div className="space-y-1.5">
              <label className="font-medium text-cyber-textSecondary">Model</label>
              <select
                value={selectedModel}
                onChange={(e) => updateSettings({ selectedModel: e.target.value })}
                className="w-full bg-cyber-card border border-cyber-cardBorder rounded-lg px-2.5 py-2 text-white outline-none focus:border-cyber-primary/60 cursor-pointer"
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
                {provider === "custom" && (
                  <option value="custom">Custom Model</option>
                )}
              </select>
            </div>

            {/* Custom Model input if Custom selected */}
            {selectedModel === "custom" && (
              <div className="space-y-1.5">
                <label className="font-medium text-cyber-textSecondary">Custom Model Name</label>
                <input
                  type="text"
                  value={customModel}
                  onChange={(e) => updateSettings({ customModel: e.target.value })}
                  placeholder="Enter custom model name..."
                  className="w-full bg-cyber-card border border-cyber-cardBorder rounded-lg px-2.5 py-2 text-white outline-none focus:border-cyber-primary/60 font-mono text-xs"
                />
              </div>
            )}



            {/* Google Search Toggle */}
            <div className="flex items-center justify-between border-t border-cyber-cardBorder/30 pt-4 my-2">
              <span className="font-medium text-cyber-textSecondary">Enable Google Search</span>
              <button
                type="button"
                onClick={() => updateSettings({ googleSearchEnabled: !googleSearchEnabled })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  googleSearchEnabled ? "bg-cyber-primary" : "bg-cyber-cardBorder"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-cyber-dark shadow ring-0 transition duration-200 ease-in-out ${
                    googleSearchEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Docker Sandbox Toggle */}
            <div className="flex items-center justify-between border-t border-cyber-cardBorder/30 pt-4 my-2">
              <div className="flex flex-col">
                <span className="font-medium text-cyber-textSecondary">CLI Docker Sandbox</span>
                <span className="text-[9px] text-cyber-textMuted">Local containers for execution</span>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ 
                  dockerSandboxEnabled: !dockerSandboxEnabled,
                  ...(!dockerSandboxEnabled ? { cloudSandboxEnabled: false } : {})
                })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  dockerSandboxEnabled ? "bg-cyber-primary" : "bg-cyber-cardBorder"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-cyber-dark shadow ring-0 transition duration-200 ease-in-out ${
                    dockerSandboxEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Sandbox Container Image Input */}
            {dockerSandboxEnabled && (
              <div className="space-y-1.5 pl-2 border-l-2 border-cyber-primary/40 mb-2">
                <label className="font-medium text-cyber-textSecondary text-[10px]">Sandbox Image</label>
                <input
                  type="text"
                  value={sandboxImage}
                  onChange={(e) => updateSettings({ sandboxImage: e.target.value })}
                  placeholder="e.g. node:20-alpine"
                  className="w-full bg-cyber-card border border-cyber-cardBorder rounded-lg px-2.5 py-1.5 text-cyber-textPrimary outline-none focus:border-cyber-primary/60 font-mono text-[10px]"
                />
              </div>
            )}

            {/* Cloud Sandbox Toggle */}
            <div className="flex items-center justify-between border-t border-cyber-cardBorder/30 pt-4 my-2">
              <div className="flex flex-col">
                <span className="font-medium text-cyber-textSecondary">Cloud Sandbox (Pro)</span>
                <span className="text-[9px] text-cyber-textMuted">Isolated executions on SaaS servers</span>
              </div>
              <button
                type="button"
                disabled={!isActiveLicense}
                onClick={() => updateSettings({ 
                  cloudSandboxEnabled: !cloudSandboxEnabled,
                  ...(!cloudSandboxEnabled ? { dockerSandboxEnabled: false } : {})
                })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                  cloudSandboxEnabled ? "bg-cyber-primary" : "bg-cyber-cardBorder"
                }`}
                title={!isActiveLicense ? "Upgrade to Pro to enable SaaS Cloud Sandbox" : ""}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-cyber-dark shadow ring-0 transition duration-200 ease-in-out ${
                    cloudSandboxEnabled ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Workspace Context settings */}
            {workspacePath && (
              <div className="border-t border-cyber-cardBorder/30 my-4 pt-4 space-y-3">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-cyber-textSecondary block">Workspace Context</span>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-cyber-textSecondary">Git Branch:</span>
                  <span className={`font-mono px-2 py-0.5 rounded truncate max-w-[140px] ${gitInitialized ? "text-white bg-cyber-primary/10 border border-cyber-primary/20" : "text-amber-400 bg-amber-400/10 border border-amber-400/20"}`} title={gitBranch}>
                    {gitInitialized ? gitBranch : "No Repo"}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-cyber-textSecondary">Code Search Index:</span>
                    <span className="text-white truncate max-w-[120px]" title={indexMessage}>
                      {indexMessage}
                    </span>
                  </div>
                  <button
                    disabled={isIndexing}
                    onClick={handleReindex}
                    className="w-full py-1.5 bg-cyber-primary/20 hover:bg-cyber-primary/30 border border-cyber-primary/45 hover:border-cyber-primary text-cyber-primary rounded-lg text-[10.5px] font-bold transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    {isIndexing && (
                      <span className="w-3 h-3 border-2 border-cyber-primary border-t-transparent rounded-full animate-spin mr-1" />
                    )}
                    <span>REINDEX CODEBASE</span>
                  </button>
                </div>
              </div>
            )}

            {/* User Session */}
            {userEmail && (
              <div className="border-t border-cyber-cardBorder/30 my-4 pt-4 space-y-2">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-cyber-textSecondary block">Account</span>
                <div className="flex items-center justify-between bg-cyber-card/45 border border-cyber-cardBorder rounded-lg p-2 text-xs">
                  <span className="truncate text-white max-w-[150px]" title={userEmail}>{userEmail}</span>
                  <button
                    onClick={async () => {
                      await updateSettings({ token: "", userEmail: "" });
                    }}
                    className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 rounded-md text-[10px] font-semibold transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            {/* Workspace TODOs list */}
            {workspacePath && (
              <div className="border-t border-cyber-cardBorder/30 my-4 pt-4 space-y-2">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-cyber-textSecondary block">Workspace Tasks ({todos.length})</span>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {todos.length === 0 ? (
                    <p className="text-[10px] text-cyber-textSecondary italic">No pending TODO comments found.</p>
                  ) : (
                    todos.map((todo, idx) => (
                      <div 
                        key={idx}
                        onClick={() => {
                          setInput(`Please resolve this TODO comment: "${todo.text}" on line ${todo.line} of ${todo.relativePath}`);
                          setSettingsOpen(false);
                        }}
                        className="bg-cyber-card/45 hover:bg-cyber-primary/10 border border-cyber-cardBorder/60 hover:border-cyber-primary/40 rounded-lg p-2 text-[10px] cursor-pointer transition-all duration-200"
                        title="Click to copy task prompt to chat input"
                      >
                        <div className="flex justify-between items-center text-cyber-primary font-mono truncate mb-0.5">
                          <span className="truncate">{todo.relativePath}</span>
                          <span className="text-[9px] bg-cyber-primary/20 text-cyber-primary px-1 rounded">L{todo.line}</span>
                        </div>
                        <p className="text-white truncate">{todo.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>

          <div className="text-[10px] text-cyber-textMuted text-center select-none pt-2 border-t border-cyber-cardBorder/30">
            Settings saved locally to ~/.istiyak_agent_config.json
          </div>
        </div>
      </div>
      
      {/* Profile / Authentication Modal Overlay */}
      {authOpen && (
        <div
          className="absolute inset-0 bg-cyber-dark/85 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in"
          onClick={() => {
            setAuthOpen(false);
          }}
        >
          <div
            className="w-full max-w-[320px] bg-cyber-card/90 border border-cyber-cardBorder/60 p-6 rounded-2xl shadow-2xl backdrop-blur-md relative z-10 flex flex-col space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button on modal card */}
            <button
              onClick={() => {
                setAuthOpen(false);
                setAuthError(null);
              }}
              className="absolute top-3 right-3 p-1 rounded-lg text-cyber-textSecondary hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>

            {!token ? (
              // Login / Sign Up Form
              <>
                <div className="flex flex-col items-center text-center space-y-1">
                  <Bot size={36} className="text-cyber-primary animate-pulse" />
                  <h2 className="text-base font-bold text-white tracking-wide uppercase">
                    {authMode === "login" ? "Welcome Back" : "Create Account"}
                  </h2>
                  <p className="text-[11px] text-cyber-textSecondary">
                    {authMode === "login" ? "Enter details to access your companion" : "Get started with 3 accounts per IP limitation"}
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} className="flex flex-col space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-cyber-textSecondary">Email Address</label>
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="developer@domain.com"
                      className="w-full bg-cyber-dark/80 border border-cyber-cardBorder rounded-lg px-3 py-2 text-white outline-none focus:border-cyber-primary/60 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-cyber-textSecondary">Password</label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-cyber-dark/80 border border-cyber-cardBorder rounded-lg px-3 py-2 text-white outline-none focus:border-cyber-primary/60 text-xs font-mono"
                    />
                  </div>

                  {authError && (
                    <div className="p-2 border border-red-500/20 bg-red-500/10 text-red-400 rounded-lg text-[10.5px] leading-relaxed text-center">
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2 bg-cyber-primary text-cyber-dark rounded-lg text-xs font-bold transition-all duration-300 hover:shadow-[0_0_12px_rgba(6,182,212,0.5)] active:scale-[0.98] disabled:opacity-50 cursor-pointer flex justify-center items-center"
                  >
                    {authLoading ? (
                      <span className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
                    ) : (
                      authMode === "login" ? "LOGIN" : "REGISTER"
                    )}
                  </button>
                </form>

                {/* OAuth Brand Login Buttons */}
                <div className="flex flex-col space-y-2 border-t border-cyber-cardBorder/30 pt-3">
                  <div className="text-center text-[9px] text-cyber-textSecondary font-semibold uppercase tracking-wider mb-1">
                    Or Sign In With
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      window.open("http://localhost:3002/api/auth/google", "_blank");
                    }}
                    className="w-full py-1.5 bg-[#ea4335]/15 hover:bg-[#ea4335]/25 border border-[#ea4335]/30 hover:border-[#ea4335]/50 text-white rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer flex justify-center items-center"
                  >
                    Google Account
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      window.open("http://localhost:3002/api/auth/github", "_blank");
                    }}
                    className="w-full py-1.5 bg-[#24292e]/40 hover:bg-[#24292e]/60 border border-[#24292e]/60 hover:border-white/30 text-white rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer flex justify-center items-center"
                  >
                    GitHub Account
                  </button>
                </div>

                {/* Toggle Tab */}
                <div className="text-center pt-2 text-[11px] border-t border-cyber-cardBorder/30">
                  <span className="text-cyber-textSecondary">
                    {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
                  </span>
                  <button
                    onClick={() => {
                      setAuthMode(authMode === "login" ? "register" : "login");
                      setAuthError(null);
                    }}
                    className="text-cyber-primary hover:underline font-semibold cursor-pointer"
                  >
                    {authMode === "login" ? "Sign Up" : "Sign In"}
                  </button>
                </div>
              </>
            ) : (
              // Logged In Profile Card
              <div className="flex flex-col space-y-4 pt-2">
                <div className="flex flex-col items-center text-center space-y-1">
                  <div className="w-12 h-12 rounded-full bg-cyber-primary/20 border border-cyber-primary/45 flex items-center justify-center text-cyber-primary text-lg font-bold select-none mb-1">
                    {userEmail.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-sm font-bold text-white truncate max-w-[240px]" title={userEmail}>
                    {userEmail}
                  </h2>
                  {isActiveLicense ? (
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                      Pro License Active
                    </div>
                  ) : (
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25 animate-pulse">
                      Free Tier User
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 border-t border-cyber-cardBorder/30 pt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-cyber-textSecondary">Status</span>
                    <span className="text-white font-medium">Verified</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyber-textSecondary">Plan</span>
                    <span className="text-white font-medium">{isActiveLicense ? "SaaS Pro Developer" : "SaaS Free Tier"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cyber-textSecondary">Sync License</span>
                    <button
                      type="button"
                      onClick={fetchUserProfile}
                      disabled={isProfileFetching}
                      className="text-[10px] text-cyber-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isProfileFetching ? "Syncing..." : "Sync Status"}
                    </button>
                  </div>
                </div>

                {!isActiveLicense && (
                  <div className="flex flex-col space-y-2 pt-2 border-t border-cyber-cardBorder/30">
                    {checkoutError && (
                      <div className="p-2 border border-red-500/20 bg-red-500/10 text-red-400 rounded-lg text-[10px] text-center leading-relaxed">
                        {checkoutError}
                      </div>
                    )}
                    <button
                      onClick={handleUpgradeToPro}
                      disabled={checkoutLoading}
                      className="w-full py-2 bg-cyber-primary text-cyber-dark rounded-lg text-xs font-bold transition-all duration-300 hover:shadow-[0_0_12px_rgba(6,182,212,0.5)] active:scale-[0.98] disabled:opacity-50 cursor-pointer flex justify-center items-center"
                    >
                      {checkoutLoading ? (
                        <span className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "UPGRADE TO PRO ($19/mo)"
                      )}
                    </button>
                  </div>
                )}

                <button
                  onClick={async () => {
                    await updateSettings({ token: "", userEmail: "" });
                    setAuthOpen(false);
                  }}
                  className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  LOGOUT
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Marketplace Modal */}
      {marketplaceOpen && (
        <div
          className="absolute inset-0 bg-cyber-dark/85 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setMarketplaceOpen(false)}
        >
          <div
            className="w-full max-w-[500px] max-h-[90%] bg-cyber-card/95 border border-cyber-cardBorder/60 p-6 rounded-2xl shadow-2xl backdrop-blur-md relative z-10 flex flex-col space-y-4 overflow-hidden text-xs text-cyber-textPrimary"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-cyber-cardBorder/40 pb-3">
              <span className="font-semibold text-xs tracking-wider uppercase text-cyber-textPrimary/80 flex items-center space-x-1.5">
                <Sparkles size={14} className="text-cyber-primary" />
                <span>Marketplace & Customizations</span>
              </span>
              <button
                onClick={() => setMarketplaceOpen(false)}
                className="p-1 rounded text-cyber-textSecondary hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Scrollable Catalog Sections */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1.5">
              
              {/* Section 1: Themes */}
              <div className="space-y-2">
                <h3 className="font-bold text-cyber-primary uppercase tracking-wider text-[10px]">1. Custom UI Themes</h3>
                <div className="grid grid-cols-2 gap-2">
                  {curatedThemes.map((t) => {
                    const isActive = activeTheme === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => updateSettings({ activeTheme: t.id })}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isActive 
                            ? "bg-cyber-primary/10 border-cyber-primary text-white font-semibold" 
                            : "bg-cyber-card/45 border-cyber-cardBorder text-cyber-textSecondary hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className="font-medium">{t.name}</span>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Prompts Catalog */}
              <div className="space-y-2">
                <h3 className="font-bold text-cyber-primary uppercase tracking-wider text-[10px]">2. Prompts Catalog</h3>
                <div className="space-y-2">
                  {curatedPrompts.map((p, idx) => {
                    const isInstalled = installedPrompts.some(item => item.title === p.title);
                    return (
                      <div key={idx} className="p-2.5 bg-cyber-card/45 border border-cyber-cardBorder rounded-xl flex items-center justify-between space-x-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white truncate">{p.title}</div>
                          <div className="text-[10px] text-cyber-textSecondary truncate">{p.prompt}</div>
                        </div>
                        <button
                          onClick={() => handleInstallPrompt(p)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer shrink-0 ${
                            isInstalled 
                              ? "bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400" 
                              : "bg-cyber-primary/20 hover:bg-cyber-primary/30 border border-cyber-primary/40 text-cyber-primary"
                          }`}
                        >
                          {isInstalled ? "Uninstall" : "Install"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Extension Plugins */}
              <div className="space-y-2">
                <h3 className="font-bold text-cyber-primary uppercase tracking-wider text-[10px]">3. Extension SDK Plugins</h3>
                <div className="space-y-2">
                  {curatedExtensions.map((ext) => {
                    const isInstalled = installedExtensions.some(item => item.id === ext.id);
                    return (
                      <div key={ext.id} className="p-2.5 bg-cyber-card/45 border border-cyber-cardBorder rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-white">{ext.name}</div>
                          <button
                            onClick={() => handleInstallExtension(ext)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer shrink-0 ${
                              isInstalled 
                                ? "bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400" 
                                : "bg-cyber-primary/20 hover:bg-cyber-primary/30 border border-cyber-primary/40 text-cyber-primary"
                            }`}
                          >
                            {isInstalled ? "Uninstall" : "Install"}
                          </button>
                        </div>
                        <p className="text-[10px] text-cyber-textSecondary leading-relaxed">{ext.description}</p>
                        <div className="flex flex-wrap gap-1 text-[9px]">
                          {ext.commands.map((c, cIdx) => (
                            <span key={cIdx} className="bg-cyber-dark/65 border border-cyber-cardBorder text-cyber-primary px-1.5 py-0.5 rounded font-mono">
                              cmd: {c.name}
                            </span>
                          ))}
                          {ext.prompts.map((p, pIdx) => (
                            <span key={pIdx} className="bg-cyber-dark/65 border border-cyber-cardBorder text-cyber-secondary px-1.5 py-0.5 rounded font-mono">
                              prompt: {p.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 4: Add Custom Prompt */}
              <div className="space-y-2">
                <h3 className="font-bold text-cyber-primary uppercase tracking-wider text-[10px]">4. Create Custom Chat Prompt</h3>
                <form onSubmit={handleAddCustomPrompt} className="p-3 bg-cyber-card/45 border border-cyber-cardBorder rounded-xl space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-cyber-textSecondary">Prompt Shortcut Name</label>
                    <input
                      type="text"
                      required
                      value={customPromptTitle}
                      onChange={(e) => setCustomPromptTitle(e.target.value)}
                      placeholder="e.g. Code Reviewer"
                      className="w-full bg-cyber-dark/80 border border-cyber-cardBorder rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-cyber-primary/60 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-cyber-textSecondary">Prompt Instruction Text</label>
                    <textarea
                      required
                      rows={2}
                      value={customPromptText}
                      onChange={(e) => setCustomPromptText(e.target.value)}
                      placeholder="e.g. Please analyze this code for complexity..."
                      className="w-full bg-cyber-dark/80 border border-cyber-cardBorder rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-cyber-primary/60 text-xs resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-cyber-primary text-cyber-dark font-bold rounded-lg text-[10px] hover:shadow-[0_0_8px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
                  >
                    ADD CUSTOM PROMPT
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Telemetry Modal */}
      {telemetryOpen && (
        <div
          className="absolute inset-0 bg-cyber-dark/85 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in"
          onClick={() => setTelemetryOpen(false)}
        >
          <div
            className="w-full max-w-[480px] max-h-[85%] bg-cyber-card/95 border border-cyber-cardBorder/60 p-5 rounded-2xl shadow-2xl backdrop-blur-md relative z-10 flex flex-col space-y-4 overflow-hidden text-xs text-cyber-textPrimary"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-cyber-cardBorder/40 pb-3">
              <span className="font-semibold text-xs tracking-wider uppercase text-cyber-textPrimary/80 flex items-center space-x-1.5">
                <Activity size={14} className="text-cyber-primary animate-pulse" />
                <span>Live Performance & Cost Telemetry</span>
              </span>
              <button
                onClick={() => setTelemetryOpen(false)}
                className="p-1 rounded text-cyber-textSecondary hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="bg-cyber-dark/45 border border-cyber-cardBorder rounded-xl p-3 flex flex-col justify-center items-center text-center">
                <span className="text-[10px] uppercase font-bold text-cyber-textSecondary tracking-wider">Total Calls</span>
                <span className="text-lg font-extrabold text-white mt-1">{telemetry?.callCount || 0}</span>
              </div>
              <div className="bg-cyber-dark/45 border border-cyber-cardBorder rounded-xl p-3 flex flex-col justify-center items-center text-center">
                <span className="text-[10px] uppercase font-bold text-cyber-textSecondary tracking-wider">Avg Latency</span>
                <span className="text-lg font-extrabold text-white mt-1">{(telemetry?.avgLatencyMs || 0)}ms</span>
              </div>
              <div className="bg-cyber-dark/45 border border-cyber-cardBorder rounded-xl p-3 flex flex-col justify-center items-center text-center">
                <span className="text-[10px] uppercase font-bold text-cyber-textSecondary tracking-wider">Avg Speed</span>
                <span className="text-lg font-extrabold text-cyber-primary mt-1">{(telemetry?.avgSpeed || 0)} t/s</span>
              </div>
              <div className="bg-cyber-dark/45 border border-cyber-cardBorder rounded-xl p-3 flex flex-col justify-center items-center text-center">
                <span className="text-[10px] uppercase font-bold text-cyber-textSecondary tracking-wider">Session Cost</span>
                <span className="text-lg font-extrabold text-emerald-400 mt-1">
                  ${(telemetry ? telemetry.history.reduce((acc, m) => acc + (m.tokensIn * 0.000000075 + m.tokensOut * 0.0000003), 0) : 0).toFixed(6)}
                </span>
              </div>
            </div>

            {/* Recent API Call Logs list */}
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              <h3 className="font-bold text-cyber-primary uppercase tracking-wider text-[9px] mb-2 shrink-0">Call History & Rates</h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {!telemetry || telemetry.history.length === 0 ? (
                  <p className="text-[10.5px] text-cyber-textSecondary italic text-center py-4">No metrics logged in this session.</p>
                ) : (
                  [...telemetry.history].reverse().map((item, idx) => (
                    <div key={idx} className="p-3 bg-cyber-dark/30 border border-cyber-cardBorder/50 rounded-xl space-y-1 text-[11px]">
                      <div className="flex justify-between items-center text-white">
                        <span className="font-bold">{item.provider.toUpperCase()} ({item.model})</span>
                        <span className="text-[9px] text-cyber-textSecondary font-mono">{item.timestamp}</span>
                      </div>
                      <div className="flex justify-between items-center text-cyber-textSecondary text-[10px] font-mono">
                        <span>Latency: <span className="text-white">{item.latencyMs}ms</span></span>
                        <span>Tokens: <span className="text-white">{item.tokensIn} in / {item.tokensOut} out</span></span>
                        <span>Speed: <span className="text-cyber-primary font-bold">{item.tokensPerSec} t/s</span></span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
