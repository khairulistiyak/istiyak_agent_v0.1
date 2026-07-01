import React, { useState } from "react";
import { Folder, FolderOpen, File, Plus } from "lucide-react";
import { buildTree } from "../../utils/fileTree.js";
import { FileNode } from "../../types/chat.js";

interface FileExplorerPanelProps {
  workspacePath: string | null;
  workspaceFiles: string[];
  openedFile: string | null;
  gitBranch: string;
  gitInitialized: boolean;
  isIndexing: boolean;
  indexMessage: string;
  onFileSelect: (relPath: string) => void;
  onRefresh: () => void;
  onSelectWorkspace: () => void;
  onReindex: () => void;
}

export const FileExplorerPanel = React.memo(({
  workspacePath,
  workspaceFiles,
  openedFile,
  gitBranch,
  gitInitialized,
  isIndexing,
  indexMessage,
  onFileSelect,
  onRefresh,
  onSelectWorkspace,
  onReindex
}: FileExplorerPanelProps) => {
  const [openDirs, setOpenDirs] = useState<{ [key: string]: boolean }>({});

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
            onClick={() => onFileSelect(node.path)}
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

  const fileTreeData = buildTree(workspaceFiles);

  return (
    <div className="w-[240px] bg-cyber-dark border-r border-cyber-cardBorder flex flex-col overflow-hidden">
      <div className="p-3 border-b border-cyber-cardBorder/40 flex items-center justify-between select-none">
        <span className="font-semibold text-xs tracking-wider uppercase text-cyber-textPrimary/80">File Explorer</span>
        <button 
          onClick={onRefresh}
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
            renderFileTree(fileTreeData)
          )
        ) : (
          <div className="text-center p-4">
            <p className="text-[10px] text-cyber-textMuted mb-2">No workspace selected.</p>
            <button
              onClick={onSelectWorkspace}
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
              onClick={onReindex}
              className="w-full py-1 bg-cyber-primary/25 border border-cyber-primary/40 hover:border-cyber-primary text-cyber-primary hover:bg-cyber-primary/20 rounded font-semibold transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer text-[9px]"
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
  );
});

FileExplorerPanel.displayName = "FileExplorerPanel";
export { FileExplorerPanel as FileTree }; // Backward compatibility
