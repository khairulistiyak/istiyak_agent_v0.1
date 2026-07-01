import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { API_BASE } from "../utils/config.js";
import { WorkspaceTodo, TelemetryStats } from "../types/chat.js";

interface UsePollingOptions {
  workspacePath: string | null;
  token: string;
  loadSettings: () => Promise<void>;
}

export function usePolling({ workspacePath, token, loadSettings }: UsePollingOptions) {
  const [engineStatus, setEngineStatus] = useState<"connecting" | "online" | "offline">("connecting");
  const [workspaceFiles, setWorkspaceFiles] = useState<string[]>([]);
  const [gitBranch, setGitBranch] = useState<string>("none");
  const [gitInitialized, setGitInitialized] = useState<boolean>(false);
  const [todos, setTodos] = useState<WorkspaceTodo[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryStats | null>(null);
  
  const [isIndexing, setIsIndexing] = useState<boolean>(false);
  const [indexMessage, setIndexMessage] = useState<string>("Workspace index not loaded.");

  const fetchTelemetry = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/telemetry/stats`);
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (e) {
      console.debug("Failed to fetch telemetry:", e);
    }
  };

  const fetchGitStatus = async () => {
    if (!workspacePath) return;
    try {
      const res = await fetch(`${API_BASE}/api/git/status?workspacePath=${encodeURIComponent(workspacePath)}`);
      if (res.ok) {
        const data = await res.json();
        setGitInitialized(!!data.initialized);
        setGitBranch(data.branch || "none");
      }
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
      const res = await fetch(`${API_BASE}/api/rag/reindex`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspacePath })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIndexMessage("Codebase indexed!");
        } else {
          setIndexMessage("Indexing failed.");
        }
      } else {
        setIndexMessage("Indexing failed.");
      }
    } catch (err) {
      setIndexMessage("Error indexing.");
    } finally {
      setIsIndexing(false);
    }
  };

  // Watcher start on workspacePath change
  useEffect(() => {
    if (workspacePath) {
      fetch(`${API_BASE}/api/watcher/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspacePath })
      })
        .then(res => res.json())
        .then(data => {
          console.log("[usePolling] Watcher status:", data);
        })
        .catch(err => console.debug("[usePolling] Failed to start watcher:", err));
        
      handleReindex();
    }
  }, [workspacePath]);

  // Fast poll: health + settings when no token (visibility-aware)
  useEffect(() => {
    const checkHealthAndSettings = async () => {
      if (document.hidden) return;

      // 1. Health Check
      try {
        const res = await fetch(`${API_BASE}/api/health`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "ok") {
            setEngineStatus("online");
          } else {
            setEngineStatus("offline");
          }
        } else {
          setEngineStatus("offline");
        }
      } catch (err) {
        setEngineStatus("offline");
      }

      // 2. Settings Polling (when no token)
      if (!token) {
        try {
          await loadSettings();
        } catch (e) {
          console.debug("Failed to load settings in fast poll:", e);
        }
      }
    };

    checkHealthAndSettings();
    const interval = setInterval(checkHealthAndSettings, 8000);
    return () => clearInterval(interval);
  }, [token, loadSettings]);

  const refreshFiles = async () => {
    if (!workspacePath) return;
    try {
      const files: string[] = await invoke("scan_project", { path: workspacePath });
      setWorkspaceFiles(files);
    } catch (err) {
      console.error("Failed to scan project files:", err);
    }
  };

  // Slow poll: files + git + telemetry + todos (visibility-aware)
  useEffect(() => {
    const pollWorkspaceData = async () => {
      if (!workspacePath || document.hidden) return;

      // 1. Project Scan
      await refreshFiles();

      // 2. Git Status
      await fetchGitStatus();
      
      // 3. Telemetry
      await fetchTelemetry();

      // 4. Watcher TODOs
      try {
        const res = await fetch(`${API_BASE}/api/watcher/todos`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setTodos(data);
          }
        }
      } catch (err) {
        console.debug("Failed to fetch todos:", err);
      }
    };

    pollWorkspaceData();
    const interval = setInterval(pollWorkspaceData, 15000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        pollWorkspaceData();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [workspacePath]);

  return {
    engineStatus,
    workspaceFiles,
    gitBranch,
    gitInitialized,
    todos,
    telemetry,
    isIndexing,
    indexMessage,
    handleReindex,
    refreshFiles
  };
}
