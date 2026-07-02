import React from "react";
import Editor from "@monaco-editor/react";
import { File, Save } from "lucide-react";

interface EditorPanelProps {
  openedFile: string | null;
  fileContent: string;
  editorLanguage: string;
  isSaving: boolean;
  onContentChange: (val: string) => void;
  onSave: () => void;
  lastCompileError?: string | null;
  onAutoFixError?: () => void;
}

export const EditorPanel = React.memo(({
  openedFile,
  fileContent,
  editorLanguage,
  isSaving,
  onContentChange,
  onSave,
  lastCompileError,
  onAutoFixError
}: EditorPanelProps) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden border-r border-cyber-cardBorder bg-cyber-card">
      {/* Editor Title Bar */}
      <div className="p-3 border-b border-[#1c1e24]/40 bg-cyber-dark flex items-center justify-between min-h-[41px] select-none">
        <span className="text-xs font-mono text-cyber-primary truncate">
          {openedFile ? openedFile : "No File Opened"}
        </span>
        {openedFile && (
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center space-x-1 px-2.5 py-1 bg-cyber-primary/20 hover:bg-cyber-primary/30 border border-cyber-primary/45 text-cyber-primary hover:text-white rounded text-[10px] font-semibold transition-colors disabled:opacity-50"
          >
            <Save size={12} />
            <span>{isSaving ? "Saving..." : "Save"}</span>
          </button>
        )}
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 relative flex flex-col overflow-hidden bg-cyber-dark">
        {lastCompileError && (
          <div className="mx-3 my-2.5 rounded-xl border border-red-500/35 bg-[#2d1313]/30 p-3.5 text-xs select-none shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-bold text-red-400 uppercase tracking-wider text-[9px]">Lint compilation check failed</span>
              </div>
              {onAutoFixError && (
                <button
                  onClick={onAutoFixError}
                  className="text-[9px] bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold px-2 py-0.5 rounded transition-all cursor-pointer"
                >
                  AUTO-FIX ERROR
                </button>
              )}
            </div>
            <p className="font-mono text-[10.5px] text-[#fca5a5] break-all leading-normal">
              {lastCompileError}
            </p>
          </div>
        )}
        {openedFile ? (
          <Editor
            height="100%"
            language={editorLanguage}
            theme="vs-dark"
            value={fileContent}
            onChange={(val) => onContentChange(val || "")}
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
    </div>
  );
});

EditorPanel.displayName = "EditorPanel";
export { EditorPanel as MonorepoEditor }; // Backward compatibility
