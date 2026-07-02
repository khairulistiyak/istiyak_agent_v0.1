import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface DetectedWorkspace {
  path: string;
  folderName: string;
  ide: string;
  lastUsed: number;
  isActive: boolean;
}

interface DetectResult {
  workspaces: DetectedWorkspace[];
  activeIde: string | null;
}

export interface UseWorkspaceDetectResult {
  workspaces: DetectedWorkspace[];
  activeIde: string | null;
  isDetecting: boolean;
  selectedPath: string;
  selectWorkspace: (path: string) => void;
  openManualPicker: () => Promise<void>;
  refresh: () => Promise<void>;
}

const DETECT_TIMEOUT_MS = 5_000;
const POLL_INTERVAL_MS = 120_000;

export function useWorkspaceDetect(
  currentPath: string,
  onPathChange: (path: string) => void
): UseWorkspaceDetectResult {
  const [workspaces, setWorkspaces] = useState<DetectedWorkspace[]>([]);
  const [activeIde, setActiveIde] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const isMountedRef = useRef(true);
  const isDetectingRef = useRef(false);
  const hasAutoSelected = useRef(false);
  const isTauri =
    typeof window !== "undefined" &&
    "__TAURI_INTERNALS__" in window;

  const detect = useCallback(async () => {
    if (!isTauri) return;
    if (isDetectingRef.current) return;
    isDetectingRef.current = true;
    setIsDetecting(true);
    try {
      const result: DetectResult | null = await Promise.race([
        invoke<DetectResult>("detect_ide_workspaces"),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error("detect_ide_workspaces timeout")), DETECT_TIMEOUT_MS)
        ),
      ]);
      if (!isMountedRef.current || !result) return;
      setWorkspaces(result.workspaces);
      setActiveIde(result.activeIde);

      if (!hasAutoSelected.current && !currentPath && result.workspaces.length > 0) {
        hasAutoSelected.current = true;
        const active = result.workspaces.find((w) => w.isActive);
        const best = active || result.workspaces[0];
        onPathChange(best.path);
      }
    } catch (err) {
      console.warn("[useWorkspaceDetect] Detection failed:", err);
    } finally {
      if (isMountedRef.current) {
        isDetectingRef.current = false;
        setIsDetecting(false);
      }
    }
  }, [isTauri, currentPath, onPathChange]);

  // Initial detect: wait for mount to settle, then run
  useEffect(() => {
    isMountedRef.current = true;
    const timer = setTimeout(detect, 1_000);

    const interval = setInterval(() => {
      if (!document.hidden) detect();
    }, POLL_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [detect]);

  const selectWorkspace = useCallback(
    (path: string) => {
      hasAutoSelected.current = true;
      onPathChange(path);
    },
    [onPathChange]
  );

  const openManualPicker = useCallback(async () => {
    if (!isTauri) return;
    try {
      const selected: string = await invoke("select_directory");
      if (selected) {
        hasAutoSelected.current = true;
        onPathChange(selected);
      }
    } catch {
      // User cancelled
    }
  }, [isTauri, onPathChange]);

  return {
    workspaces,
    activeIde,
    isDetecting,
    selectedPath: currentPath,
    selectWorkspace,
    openManualPicker,
    refresh: detect,
  };
}
