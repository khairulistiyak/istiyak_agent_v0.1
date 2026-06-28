
export interface FileNode {
  name: string;
  isDir: boolean;
  relPath: string;
  children?: FileNode[];
}

export function FileTree({ files, onFileSelect }: { files: FileNode[]; onFileSelect: (relPath: string) => void }) {
  const renderNode = (node: FileNode) => {
    return (
      <div key={node.relPath} className="pl-4">
        <div
          onClick={() => !node.isDir && onFileSelect(node.relPath)}
          className={`flex items-center gap-2 py-1 px-2 rounded hover:bg-white/5 cursor-pointer text-xs ${node.isDir ? "text-cyan-400 font-medium" : "text-white/70"}`}
        >
          <span>{node.isDir ? "📁" : "📄"}</span>
          <span>{node.name}</span>
        </div>
        {node.isDir && node.children && (
          <div className="border-l border-white/5 ml-2 pl-1">
            {node.children.map(renderNode)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-[#0d0e15] border-r border-white/5 p-4 overflow-y-auto select-none">
      <p className="text-xs font-semibold text-white/40 mb-3 uppercase tracking-wider">Repository Files</p>
      <div className="space-y-1">{files.map(renderNode)}</div>
    </div>
  );
}
