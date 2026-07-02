import React from "react";

interface FileIconProps {
  filename: string;
}

const getFileDetails = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "ts":
      return { label: "ts", dotColor: "bg-[#3178c6]" };
    case "tsx":
      return { label: "tsx", dotColor: "bg-[#0ea5e9]" };
    case "js":
      return { label: "js", dotColor: "bg-[#f59e0b]" };
    case "jsx":
      return { label: "jsx", dotColor: "bg-[#f97316]" };
    case "json":
      return { label: "json", dotColor: "bg-[#94a3b8]" };
    case "prisma":
      return { label: "db", dotColor: "bg-[#a855f7]" };
    case "svg":
      return { label: "svg", dotColor: "bg-[#ec4899]" };
    default:
      return { label: ext || "file", dotColor: "bg-[#475569]" };
  }
};

export const FileIcon: React.FC<FileIconProps> = ({ filename }) => {
  const { label, dotColor } = getFileDetails(filename);

  return (
    <span className="glass-capsule px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 text-[9px] font-mono font-bold text-[#cbd5e1] select-none h-4 leading-none">
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
};
