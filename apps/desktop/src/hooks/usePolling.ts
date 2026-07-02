import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { API_BASE } from "../utils/config.js";
import { WorkspaceTodo, TelemetryStats } from "../types/chat.js";

const FETCH_TIMEOUT_MS = 5_000;

interface UsePollingOptions {
  workspacePath: string | null;
}

export interface UsePollingResult {
  engineStatus: "connecting" | "online" | "offline";
  pollingError: string | null;
  workspaceFiles: string[];
  gitBranch: string;
  gitInitialized: boolean;
  todos: WorkspaceTodo[];
  telemetry: TelemetryStats | null;
  isIndexing: boolean;
  indexMessage: string;
  handleReindex: () => Promise<void>;
  refreshFiles: () => Promise<void>;
}

async function fetchWithTimeout(url: string, options?: RequestInit, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchWithTimeout(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export function usePolling({ workspacePath }: UsePollingOptions): UsePollingResult {
  const [engineStatus, setEngineStatus] = useState<"connecting" | "online" | "offline">(
    "connecting"
  );
  const [workspaceFiles, setWorkspaceFiles] = useState<string[]>([]);
  const [gitBranch, setGitBranch] = useState<string>("none");
  const [gitInitialized, setGitInitialized] = useState<boolean>(false);
  const [todos, setTodos] = useState<WorkspaceTodo[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryStats | null>(null);

  const [isIndexing, setIsIndexing] = useState<boolean>(false);
  const [indexMessage, setIndexMessage] = useState<string>("Workspace index not loaded.");
  const [pollingError, setPollingError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // Auto-clear error after 10s
  useEffect(() => {
    if (!pollingError) return;
    const t = setTimeout(() => setPollingError(null), 10000);
    return () => clearTimeout(t);
  }, [pollingError]);

  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/api/telemetry/stats`);
      if (res.ok && isMountedRef.current) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch {
      // Silently fail - telemetry is optional
      if (isMountedRef.current) setTelemetry(null);
    }
  }, []);

  const fetchGitStatus = useCallback(async () => {
    if (!workspacePath) return;
    try {
      const res = await fetchWithTimeout(
        `${API_BASE}/api/git/status?workspacePath=${encodeURIComponent(workspacePath)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (isMountedRef.current) {
          setGitInitialized(!!data.initialized);
          setGitBranch(data.branch || "none");
        }
      } else if (isMountedRef.current) {
        setGitInitialized(false);
        setGitBranch("none");
        setPollingError("Git status unavailable: " + res.statusText);
      }
    } catch {
      if (isMountedRef.current) {
        setGitInitialized(false);
        setGitBranch("none");
        setPollingError("Git connection failed");
      }
    }
  }, [workspacePath]);

  const handleReindex = useCallback(async () => {
    if (!workspacePath) return;
    setIsIndexing(true);
    setIndexMessage("Indexing codebase...");
    setPollingError(null);
    try {
      const res = await fetchWithTimeout(`${API_BASE}/api/rag/reindex`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspacePath }),
      });
      if (res.ok && isMountedRef.current) {
        const data = await res.json();
        setIndexMessage(data.success ? "Codebase indexed!" : "Indexing failed.");
        if (!data.success) setPollingError("Re-index request failed on server.");
      } else if (isMountedRef.current) {
        setIndexMessage("Indexing failed.");
        setPollingError("Re-index returned non-OK status.");
      }
    } catch {
      if (isMountedRef.current) {
        setIndexMessage("Error indexing.");
        setPollingError("Could not reach server for re-index.");
      }
    } finally {
      if (isMountedRef.current) setIsIndexing(false);
    }
  }, [workspacePath]);

  const startWatcher = useCallback(async (path: string) => {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/api/watcher/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspacePath: path }),
      });
      if (res.ok && isMountedRef.current) {
        const data = await res.json();
        console.log("[usePolling] Watcher status:", data);
      } else if (isMountedRef.current) {
        setPollingError("Failed to start file watcher.");
      }
    } catch {
      if (isMountedRef.current) {
        setPollingError("Failed to start file watcher.");
      }
    }
  }, []);

  const stopWatcher = useCallback(async (path: string) => {
    try {
      await fetchWithTimeout(`${API_BASE}/api/watcher/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspacePath: path }),
      });
    } catch {
      // Ignore cleanup errors
    }
  }, []);

  const refreshFiles = useCallback(async () => {
    if (!workspacePath) return;
    try {
      const files: string[] = await invoke("scan_project", { path: workspacePath });
      if (isMountedRef.current) setWorkspaceFiles(files);
    } catch {
      if (isMountedRef.current) {
        setPollingError("Failed to scan workspace files.");
      }
    }
  }, [workspacePath]);

  const fetchTodos = useCallback(async () => {
    if (!workspacePath) return;
    try {
      const res = await fetchWithTimeout(`${API_BASE}/api/watcher/todos`);
      if (res.ok && isMountedRef.current) {
        const data = await res.json();
        if (Array.isArray(data)) setTodos(data);
      }
    } catch {
      if (isMountedRef.current) {
        setPollingError("Failed to fetch workspace todos.");
      }
    }
  }, [workspacePath]);

  useEffect(() => {
    isMountedRef.current = true;

    let fastPollCount = 0;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    // Define runPoll OUTSIDE the try block so visibilityChange can access it
    const runPoll = async () => {
      if (!isMountedRef.current || document.hidden) return;

      try {
        fastPollCount++;

        // Health check every poll (8s)
        try {
          const res = await fetchWithTimeout(`${API_BASE}/api/health`);
          if (isMountedRef.current) {
            setEngineStatus(res.ok ? "online" : "offline");
          }
        } catch {
          if (isMountedRef.current) setEngineStatus("offline");
        }

        // First 3 polls all do health + git + todos (0s, 8s, 16s).
        // refreshFiles (scan_project) is heavy — manual only via IDE mode.
        const doPartialFetch = fastPollCount <= 3 || fastPollCount % 2 === 0;
        if (doPartialFetch) {
          await fetchGitStatus();
          await fetchTodos();
        }

        // Every 4th poll (32s): telemetry (optional, lightweight)
        if (fastPollCount % 4 === 0) {
          await fetchTelemetry();
        }
      } catch (pollError) {
        if (isMountedRef.current) {
          setPollingError(
            `Polling error: ${pollError instanceof Error ? pollError.message : String(pollError)}`
          );
        }
      }
    };

    // Start watcher only (no auto reindex — manual via button click)
    if (workspacePath) {
      startWatcher(workspacePath);
    }

    // Run immediately, then every 8s
    runPoll();
    intervalId = setInterval(runPoll, 8000);
    intervalRef.current = intervalId;

    const handleVisibilityChange = () => {
      if (!document.hidden) runPoll();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      if (intervalId) clearInterval(intervalId);
      intervalRef.current = null;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (workspacePath) stopWatcher(workspacePath);
    };
  }, [
    workspacePath,
    refreshFiles,
    fetchGitStatus,
    fetchTodos,
    fetchTelemetry,
    handleReindex,
    startWatcher,
    stopWatcher,
  ]);

  // Clear todos when workspacePath changes
  useEffect(() => {
    if (!workspacePath) {
      setTodos([]);
    }
  }, [workspacePath]);

  return {
    engineStatus,
    pollingError,
    workspaceFiles,
    gitBranch,
    gitInitialized,
    todos,
    telemetry,
    isIndexing,
    indexMessage,
    handleReindex,
    refreshFiles,
  };
}
