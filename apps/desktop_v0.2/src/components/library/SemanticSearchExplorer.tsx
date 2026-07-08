import React, { useState, useEffect } from "react";
import { 
  Search, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Loader2, 
  Network, 
  FileCode, 
  Sparkles, 
  Pin, 
  ExternalLink,
  Code
} from "lucide-react";
import { GlassButton } from "../ui/GlassButton.js";

interface MockFile {
  fileName: string;
  path: string;
  language: string;
  similarity: number;
  snippet: string;
  imports: string[];
  exports: string[];
}

const mockCodebase: MockFile[] = [
  {
    fileName: "TauriBridge.ts",
    path: "src/services/TauriBridge.ts",
    language: "typescript",
    similarity: 0.96,
    snippet: `// Tauri Core IPC Invoker channel
export const invokeTauri = async <T>(cmd: string, args?: Record<string, any>): Promise<T> => {
  if (!(window as any).__TAURI_IPC__) {
    console.warn(\`[Tauri Mock] IPC: \${cmd}\`, args);
    return Promise.resolve({} as T);
  }
  return window.__TAURI__.invoke<T>(cmd, args);
};`,
    imports: ["window", "Promise"],
    exports: ["invokeTauri"]
  },
  {
    fileName: "SQLiteDatabase.rs",
    path: "src-tauri/src/SQLiteDatabase.rs",
    language: "rust",
    similarity: 0.91,
    snippet: `// Setup local Tauri workspace SQLite tables
pub fn establish_connection(db_path: &str) -> Result<Connection, rusqlite::Error> {
    let conn = Connection::open(db_path)?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS workspace_cache (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
         )",
        [],
    )?;
    Ok(conn)
}`,
    imports: ["Connection", "rusqlite"],
    exports: ["establish_connection"]
  },
  {
    fileName: "index.css",
    path: "src/index.css",
    language: "css",
    similarity: 0.86,
    snippet: `/* Cyberpunk Monochrome Glass Theme */
.cyber-dark {
  background-color: #050608;
  color: #e2e8f0;
}
.glass-panel {
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
}`,
    imports: [],
    exports: ["cyber-dark", "glass-panel"]
  },
  {
    fileName: "useChatStore.ts",
    path: "src/store/useChatStore.ts",
    language: "typescript",
    similarity: 0.79,
    snippet: `import { create } from "zustand";

interface ChatState {
  viewMode: "chat" | "library";
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setViewMode: (mode: "chat" | "library") => void;
}

export const useChatStore = create<ChatState>((set) => ({
  viewMode: "chat",
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setViewMode: (viewMode) => set({ viewMode })
}));`,
    imports: ["create", "zustand"],
    exports: ["useChatStore"]
  },
  {
    fileName: "App.tsx",
    path: "src/App.tsx",
    language: "typescript",
    similarity: 0.74,
    snippet: `import { useChatStore } from "./store/useChatStore.js";
import { ChatWorkspace } from "./components/chat/ChatWorkspace.js";
import { ComponentLibrary } from "./components/library/ComponentLibrary.js";

export default function App() {
  const { viewMode } = useChatStore();
  return (
    <div className="w-screen h-screen bg-cyber-dark">
      {viewMode === "chat" ? <ChatWorkspace /> : <ComponentLibrary />}
    </div>
  );
}`,
    imports: ["useChatStore", "ChatWorkspace", "ComponentLibrary"],
    exports: ["default"]
  }
];

export const SemanticSearchExplorer: React.FC = () => {
  const [query, setQuery] = useState("");
  const [threshold, setThreshold] = useState(0.75);
  const [fileFilter, setFileFilter] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [searchStep, setSearchStep] = useState(0);
  const [results, setResults] = useState<MockFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<MockFile | null>(null);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [pinnedFiles, setPinnedFiles] = useState<Record<string, boolean>>({});

  const searchSteps = [
    "Tokenizing input query...",
    "Generating vector embeddings via LLM model API...",
    "Executing local cosine similarity scan on indexing table...",
    "Ranking files by similarity score...",
    "Applying similarity threshold and tag filters..."
  ];

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchStep(0);
    setResults([]);
    setSelectedFile(null);

    // Simulate search progress step-by-step
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < searchSteps.length - 1) {
        currentStep++;
        setSearchStep(currentStep);
      } else {
        clearInterval(interval);
        setIsSearching(false);

        // Perform mock semantic matching logic
        const queryLower = query.toLowerCase();

        const calculated = mockCodebase.map(file => {
          let score = file.similarity;
          
          // Boost based on query terms matching content or file name
          if (queryLower.includes("ipc") || queryLower.includes("bridge") || queryLower.includes("tauri")) {
            if (file.fileName === "TauriBridge.ts") score = 0.98;
            if (file.fileName === "App.tsx") score = 0.81;
          } else if (queryLower.includes("db") || queryLower.includes("sqlite") || queryLower.includes("sql")) {
            if (file.fileName === "SQLiteDatabase.rs") score = 0.97;
          } else if (queryLower.includes("style") || queryLower.includes("css") || queryLower.includes("theme")) {
            if (file.fileName === "index.css") score = 0.94;
          } else {
            // Random variation to make it feel organic
            score = Math.max(0.4, Math.min(0.99, score + (Math.random() * 0.1 - 0.05)));
          }

          return { ...file, similarity: parseFloat(score.toFixed(2)) };
        });

        // Filter and Sort results
        const filtered = calculated
          .filter(file => {
            const matchesThreshold = file.similarity >= threshold;
            const matchesFilter = fileFilter === "all" || 
              (fileFilter === "ts" && (file.fileName.endsWith(".ts") || file.fileName.endsWith(".tsx"))) ||
              (fileFilter === "rs" && file.fileName.endsWith(".rs")) ||
              (fileFilter === "css" && file.fileName.endsWith(".css"));
            return matchesThreshold && matchesFilter;
          })
          .sort((a, b) => b.similarity - a.similarity);

        setResults(filtered);
        if (filtered.length > 0) {
          setSelectedFile(filtered[0]);
        }
      }
    }, 600);
  };

  // Truncate query templates helper
  const handleTemplateClick = (text: string) => {
    setQuery(text);
  };

  const handleCopy = (fileName: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const togglePin = (path: string) => {
    setPinnedFiles(prev => ({ ...prev, [path]: !prev[path] }));
  };

  // Trigger search on mount to populate initial state
  useEffect(() => {
    setQuery("Tauri IPC channels and SQLite cache table connections");
    // Initial silent load without long delays
    const calculated = mockCodebase.map(f => ({ ...f }));
    setResults(calculated);
    setSelectedFile(calculated[0]);
  }, []);

  return (
    <div className="flex flex-col border border-white/[0.05] bg-[#0c0d10] p-4 rounded-2xl w-full max-w-4xl text-left gap-4">
      {/* Header section with diagnostics status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.04] pb-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <Search className="w-4 h-4 text-gray-400" />
            <span className="text-[11px] font-bold text-white uppercase tracking-widest">Semantic Codebase Search Explorer</span>
          </div>
          <span className="text-[8px] text-gray-500 font-mono">Vector search indexing with cosine similarity thresholds</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-gray-500 px-2 py-0.5 border border-white/5 bg-white/[0.01] rounded-full">
            Index: Active (5 files cached)
          </span>
        </div>
      </div>

      {/* Query Forms & Sliders */}
      <form onSubmit={handleSearch} className="flex flex-col gap-3 p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-600" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Find where we handle Tauri IPC invoke calls..."
              className="w-full pl-8 pr-3 py-2 bg-black/40 border border-white/[0.04] rounded-lg text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/10 transition-colors"
            />
          </div>
          <GlassButton
            type="submit"
            disabled={isSearching || !query.trim()}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider min-w-[120px] sm:min-w-[120px] w-full sm:w-auto justify-center"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" /> Matching...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" /> Find Code
              </>
            )}
          </GlassButton>
        </div>

        {/* Quick query templates */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[8.5px] text-gray-650 font-mono">Suggested:</span>
          {[
            "Tauri window invoke",
            "Monochrome styling and backgrounds",
            "Zustand client store",
            "SQLite table connection"
          ].map((template) => (
            <button
              key={template}
              type="button"
              onClick={() => handleTemplateClick(template)}
              className="px-2 py-0.5 text-[8.5px] font-mono text-gray-400 border border-white/[0.04] bg-white/[0.01] rounded hover:border-white/10 hover:text-white transition-colors"
            >
              "{template}"
            </button>
          ))}
        </div>

        {/* Advanced Filters & Cosine Threshold Slider */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/[0.03] pt-3 mt-1">
          {/* Threshold slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-[9px] font-mono">
              <span className="text-gray-500 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-gray-600" /> Cosine Similarity Threshold
              </span>
              <span className="text-gray-350 font-bold">{(threshold * 100).toFixed(0)}% Match</span>
            </div>
            <input
              type="range"
              min="0.40"
              max="0.99"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-white bg-white/5 h-1 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Extension selector */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono text-gray-500">File Type filter</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "All Files", value: "all" },
                { label: "Typescript (.ts/tsx)", value: "ts" },
                { label: "Rust (.rs)", value: "rs" },
                { label: "CSS (.css)", value: "css" }
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFileFilter(opt.value)}
                  className={`flex-1 py-1 text-[8.5px] font-mono border rounded transition-colors ${
                    fileFilter === opt.value
                      ? "border-white/15 bg-white/5 text-white"
                      : "border-white/[0.04] bg-transparent text-gray-500 hover:text-gray-400 hover:border-white/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </form>

      {/* Live Search Progression Indicator */}
      {isSearching && (
        <div className="flex flex-col gap-2 p-3 bg-black/40 border border-white/[0.03] rounded-xl text-left font-mono">
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin text-gray-400" /> Vector Matching Progress
            </span>
            <span className="text-[8px] text-gray-650">Step {searchStep + 1} of {searchSteps.length}</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-300"
              style={{ width: `${((searchStep + 1) / searchSteps.length) * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-300 mt-1">{searchSteps[searchStep]}</span>
        </div>
      )}

      {/* Main Split Content: Search Results & Code Relation Map */}
      {!isSearching && (
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Left panel: Search Results list */}
          <div className="flex-1 flex flex-col gap-2.5">
            <div className="flex justify-between items-center px-1">
              <span className="text-[9px] font-mono uppercase text-gray-500">
                Matches Found ({results.length})
              </span>
              <span className="text-[8px] text-gray-650 font-mono">
                Threshold filter applied: &gt;={(threshold * 100).toFixed(0)}%
              </span>
            </div>

            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-black/20 border border-white/[0.03] rounded-xl text-center gap-2">
                <FileCode className="w-6 h-6 text-gray-700" />
                <span className="text-xs text-gray-500">No matching files found</span>
                <span className="text-[9px] text-gray-600 font-mono max-w-[240px]">
                  Try lowering the similarity threshold or broadening the search query terms.
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 overflow-y-auto max-h-[360px] scrollbar-thin">
                {results.map((file) => {
                  const isSelected = selectedFile?.fileName === file.fileName;
                  const isExpanded = expandedFile === file.fileName;
                  const isPinned = pinnedFiles[file.path] || false;

                  return (
                    <div
                      key={file.fileName}
                      onClick={() => setSelectedFile(file)}
                      className={`flex flex-col p-3 border rounded-xl transition-all cursor-pointer text-left ${
                        isSelected 
                          ? "border-white/10 bg-white/[0.02]" 
                          : "border-white/[0.03] bg-black/20 hover:bg-black/30 hover:border-white/[0.05]"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <FileCode className={`w-4 h-4 ${isSelected ? "text-white" : "text-gray-600"}`} />
                          <div className="flex flex-col">
                            <span className={`text-[11px] font-mono font-bold ${isSelected ? "text-white" : "text-gray-300"}`}>
                              {file.fileName}
                            </span>
                            <span className="text-[8px] text-gray-600 font-mono leading-tight">{file.path}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Similarity Badge */}
                          <span className={`text-[8.5px] font-mono px-2 py-0.5 rounded-md font-bold ${
                            file.similarity >= 0.90 
                              ? "bg-white/10 text-white border border-white/10" 
                              : "bg-white/5 text-gray-400 border border-white/5"
                          }`}>
                            {(file.similarity * 100).toFixed(0)}% Sim
                          </span>
                          
                          {/* Action Buttons */}
                          <button
                            onClick={() => togglePin(file.path)}
                            title={isPinned ? "Unpin from active context" : "Pin to active context"}
                            className={`p-1 border rounded transition-colors ${
                              isPinned 
                                ? "border-white/20 bg-white/10 text-white" 
                                : "border-white/5 bg-transparent text-gray-600 hover:text-gray-400"
                            }`}
                          >
                            <Pin className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>

                      {/* Expandable Code Snippet */}
                      <div className="mt-2 border-t border-white/[0.02] pt-2 flex flex-col gap-1.5">
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedFile(isExpanded ? null : file.fileName);
                          }}
                          className="flex justify-between items-center text-[8.5px] font-mono text-gray-500 hover:text-gray-400 cursor-pointer py-0.5 select-none"
                        >
                          <span className="flex items-center gap-1">
                            <Code className="w-3 h-3" /> {isExpanded ? "Collapse code snippet" : "Expand matched snippet"}
                          </span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </div>

                        {isExpanded && (
                          <div className="relative border border-white/[0.04] bg-[#050608] rounded-lg p-2.5 font-mono text-[9.5px] text-gray-400 leading-normal select-text">
                            <div className="absolute right-2 top-2 flex items-center gap-1">
                              <button
                                onClick={() => handleCopy(file.fileName, file.snippet)}
                                className="p-1 border border-white/5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded transition-all"
                                title="Copy snippet"
                              >
                                {copiedFile === file.fileName ? (
                                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-2.5 h-2.5" />
                                )}
                              </button>
                            </div>
                            <pre className="overflow-x-auto scrollbar-thin max-h-[140px] pt-1">
                              {file.snippet.split("\n").map((line, idx) => (
                                <div key={idx} className="flex hover:bg-white/[0.02]">
                                  <span className="w-6 text-gray-700 text-right select-none pr-2 border-r border-white/5">{idx + 1}</span>
                                  <span className="pl-2.5 text-gray-305">{line}</span>
                                </div>
                              ))}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right panel: File Code Relation Map */}
          <div className="w-full lg:w-[320px] flex flex-col p-4 border border-white/[0.04] bg-black/40 rounded-2xl gap-3 text-left">
            <div className="flex flex-col gap-0.5 border-b border-white/[0.04] pb-2">
              <div className="flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">File Import Relations</span>
              </div>
              <span className="text-[8px] text-gray-600 font-mono">Imports & exports dependencies mapping</span>
            </div>

            {selectedFile ? (
              <div className="flex flex-col gap-4">
                {/* Current node card display */}
                <div className="flex flex-col items-center p-3 border border-white/[0.05] bg-white/[0.01] rounded-xl text-center relative overflow-hidden">
                  <div className="absolute top-1 left-2 text-[7px] text-gray-600 font-mono">SELECTED CENTER</div>
                  <FileCode className="w-7 h-7 text-white/70 mb-1" />
                  <span className="text-[11px] font-mono font-bold text-white">{selectedFile.fileName}</span>
                  <span className="text-[8px] text-gray-600 font-mono max-w-[200px] truncate">{selectedFile.path}</span>
                </div>

                {/* Simulated connection network layout */}
                <div className="flex flex-col gap-3 font-mono text-[9px] relative">
                  
                  {/* Incoming dependencies (Imports) */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[7.5px] uppercase tracking-wider text-gray-500 font-bold pl-1">Imports (Incoming)</span>
                    <div className="flex flex-col gap-1 pl-1">
                      {selectedFile.imports.length === 0 ? (
                        <span className="text-gray-700 italic pl-1">No imports resolved</span>
                      ) : (
                        selectedFile.imports.map(imp => (
                          <div 
                            key={imp} 
                            className="flex items-center gap-2 px-2 py-1 border border-white/5 bg-[#08090d] rounded-md text-gray-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                            <span className="flex-1 truncate">{imp}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-gray-600" />
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Divider connecting path lines */}
                  <div className="flex justify-center my-0.5">
                    <div className="w-[1px] h-3 bg-white/10 border-dashed" />
                  </div>

                  {/* Outgoing dependencies (Exports) */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[7.5px] uppercase tracking-wider text-gray-500 font-bold pl-1">Exports (Outgoing)</span>
                    <div className="flex flex-col gap-1 pl-1">
                      {selectedFile.exports.map(exp => (
                        <div 
                          key={exp} 
                          className="flex items-center gap-2 px-2 py-1 border border-white/5 bg-[#08090d] rounded-md text-gray-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                          <span className="flex-1 truncate font-bold">{exp}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-gray-650" />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="border border-white/[0.04] bg-black/40 p-2.5 rounded-lg text-[8.5px] text-gray-500 font-mono leading-relaxed mt-1">
                  💡 Clicking imports or exports traces connections back to target files, modifying context filters dynamically.
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-xs text-gray-600">Select a file to trace connections</span>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
