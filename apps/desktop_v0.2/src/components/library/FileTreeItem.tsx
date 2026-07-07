import React from "react";
import { Folder, FileText } from "lucide-react";

interface FileTreeItemProps {
  name: string;
  type: "file" | "dir";
  depth?: number;
  isOpen?: boolean;
  onClick?: () => void;
}

export const FileTreeItem: React.FC<FileTreeItemProps> = ({ name, type, depth = 0, isOpen = false, onClick }) => {
  const Icon = type === "dir" ? Folder : FileText;
  return (
    <div 
      onClick={onClick}
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
      className="flex items-center gap-2 py-1 hover:bg-white/5 rounded cursor-pointer transition-colors text-left"
    >
      <Icon className={`w-3.5 h-3.5 ${type === "dir" ? "text-gray-400" : "text-gray-550"}`} />
      <span className="text-[10px] font-mono text-gray-400 truncate">{name}</span>
      {type === "dir" && (
        <span className="text-[8px] text-gray-600 font-bold ml-auto pr-2">{isOpen ? "CLOSE" : "OPEN"}</span>
      )}
    </div>
  );
};
