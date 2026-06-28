import Editor from "@monaco-editor/react";

export function MonorepoEditor({ filePath, content, onChange }: { filePath: string | null; content: string; onChange: (val: string) => void }) {
  if (!filePath) {
    return (
      <div className="flex-1 bg-[#12141c] flex items-center justify-center text-white/40 text-xs">
        Select a file from the repository sidebar to open the editor.
      </div>
    );
  }

  const getLanguage = (file: string) => {
    if (file.endsWith(".ts") || file.endsWith(".tsx")) return "typescript";
    if (file.endsWith(".js") || file.endsWith(".jsx")) return "javascript";
    if (file.endsWith(".json")) return "json";
    if (file.endsWith(".css")) return "css";
    if (file.endsWith(".html")) return "html";
    if (file.endsWith(".md")) return "markdown";
    return "plaintext";
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#12141c]">
      <div className="px-4 py-2 bg-black/30 border-b border-white/5 text-[10px] text-white/50 font-semibold select-none">
        {filePath}
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={getLanguage(filePath)}
          theme="vs-dark"
          value={content}
          onChange={(val) => onChange(val || "")}
          options={{
            fontSize: 12,
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false
          }}
        />
      </div>
    </div>
  );
}
