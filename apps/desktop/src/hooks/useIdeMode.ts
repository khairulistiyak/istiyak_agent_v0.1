import { useState, useCallback } from "react";
import { getCurrentWindow, LogicalSize } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { API_BASE } from "../utils/config.js";
import { TerminalLog } from "../types/chat.js";

interface UseIdeModeOptions {
  workspacePath: string | null;
}

export function useIdeMode({ workspacePath }: UseIdeModeOptions) {
  const isTauri = typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__ !== undefined;
  const appWindow = isTauri
    ? getCurrentWindow()
    : {
        setSize: async () => {},
        close: async () => {},
        minimize: async () => {},
        toggleMaximize: async () => {},
      };

  const [isIdeMode, setIsIdeMode] = useState(false);
  const [openedFile, setOpenedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [editorLanguage, setEditorLanguage] = useState<string>("javascript");
  const [isSaving, setIsSaving] = useState(false);

  const [terminalInput, setTerminalInput] = useState("");
  const [isTerminalRunning, setIsTerminalRunning] = useState(false);
  const [lastCompileError, setLastCompileError] = useState<string | null>(null);
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      time: new Date().toLocaleTimeString(),
      message: "IDE Workspace Terminal initialized.",
      type: "info",
    },
  ]);

  const toggleIdeMode = useCallback(async () => {
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
  }, [isIdeMode, appWindow]);

  const handleOpenFile = useCallback(
    async (relPath: string) => {
      if (!workspacePath) return;

      // Binary file guard
      const binaryExtensions = [
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".webp",
        ".pdf",
        ".zip",
        ".tar",
        ".gz",
        ".exe",
        ".dll",
        ".so",
        ".dylib",
        ".mp4",
        ".mp3",
        ".wav",
        ".ico",
        ".woff",
        ".woff2",
        ".ttf",
        ".eot",
      ];
      const hasBinaryExt = binaryExtensions.some((ext) => relPath.toLowerCase().endsWith(ext));
      if (hasBinaryExt) {
        alert("Binary files cannot be opened in Monaco Editor.");
        return;
      }

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
        setLogs((prev) => [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            message: `Opened file: ${relPath}`,
            type: "info",
          },
        ]);
      } catch (err) {
        logFailed(err);
      }
    },
    [workspacePath]
  );

  const logFailed = (err: unknown) => {
    console.error("Failed to read file:", err);
    const msg = err instanceof Error ? err.message : String(err);
    setLogs((prev) => [
      ...prev,
      {
        time: new Date().toLocaleTimeString(),
        message: `Failed to read file: ${msg}`,
        type: "error",
      },
    ]);
  };

  const handleSaveFile = useCallback(async () => {
    if (!workspacePath || !openedFile) return;
    setIsSaving(true);
    try {
      const absPath = `${workspacePath}/${openedFile}`;

      // Lock validation check
      try {
        const locksRes = await fetch(`${API_BASE}/api/watcher/locks`);
        if (locksRes.ok) {
          const locks: Array<{ filePath: string; relativePath: string; owner: string }> =
            await locksRes.json();
          const activeLock = locks.find(
            (l) => l.relativePath === openedFile || l.filePath === absPath
          );
          if (activeLock && activeLock.owner !== "developer") {
            throw new Error(`File is currently locked by: ${activeLock.owner}`);
          }
        }
      } catch (lockErr) {
        const lockMsg = lockErr instanceof Error ? lockErr.message : String(lockErr);
        if (lockMsg.includes("locked by")) {
          throw lockErr;
        }
        console.warn("Could not verify file locks, engine may be offline:", lockErr);
      }

      await invoke("write_file", { path: absPath, content: fileContent });
      setLogs((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          message: `Successfully saved file: ${openedFile}`,
          type: "success",
        },
      ]);
    } catch (err) {
      console.error("Failed to save file:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setLogs((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          message: `Failed to save file: ${openedFile}. Error: ${msg}`,
          type: "error",
        },
      ]);
    } finally {
      setIsSaving(false);
    }
  }, [workspacePath, openedFile, fileContent]);

  const handleExecuteTerminalCommand = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!terminalInput.trim() || isTerminalRunning || !workspacePath) return;

      const cmd = terminalInput.trim();
      setTerminalInput("");
      setIsTerminalRunning(true);

      setLogs((prev) => [
        ...prev,
        {
          time: new Date().toLocaleTimeString(),
          message: `$ ${cmd}`,
          type: "info",
        },
      ]);

      // Safety check for dangerous commands
      const dangerousCommands = ["rm -rf /", "rm -rf *", "mkfs", "dd if=", "format "];
      const isDangerous = dangerousCommands.some((dc) => cmd.toLowerCase().includes(dc));
      if (isDangerous) {
        const confirmed = window.confirm(
          `WARNING: The command "${cmd}" looks potentially dangerous. Do you still want to execute it?`
        );
        if (!confirmed) {
          setLogs((prev) => [
            ...prev,
            {
              time: new Date().toLocaleTimeString(),
              message: `Execution of dangerous command cancelled by user.`,
              type: "error",
            },
          ]);
          setIsTerminalRunning(false);
          return;
        }
      }

      try {
        const res = await fetch(`${API_BASE}/api/run-command`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspacePath, command: cmd }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Execution failed");
        }

        const output = data.output || "";
        const hasError =
          output.toLowerCase().includes("error") ||
          output.toLowerCase().includes("failed") ||
          output.toLowerCase().includes("exception");

        if (hasError) {
          setLastCompileError(output);
        } else {
          setLastCompileError(null);
        }

        setLogs((prev) => [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            message: output || "Command execution completed with no output.",
            type: hasError ? "error" : "success",
          },
        ]);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        setLastCompileError(errMsg);
        setLogs((prev) => [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            message: `Command failed: ${errMsg}`,
            type: "error",
          },
        ]);
      } finally {
        setIsTerminalRunning(false);
      }
    },
    [terminalInput, isTerminalRunning, workspacePath]
  );

  return {
    isIdeMode,
    toggleIdeMode,
    openedFile,
    fileContent,
    editorLanguage,
    isSaving,
    terminalInput,
    isTerminalRunning,
    logs,
    lastCompileError,
    handleOpenFile,
    handleSaveFile,
    handleExecuteTerminalCommand,
    setTerminalInput,
    setFileContent,
    setLogs,
    setLastCompileError,
  };
}
