const FILE_TYPE_CONFIG: Record<string, { color: string; label: string }> = {
  ts: { color: "#3178c6", label: "ts" },
  tsx: { color: "#0ea5e9", label: "tsx" },
  js: { color: "#eab308", label: "js" },
  jsx: { color: "#00d8ff", label: "jsx" },
  mjs: { color: "#eab308", label: "mjs" },
  cjs: { color: "#eab308", label: "cjs" },
  json: { color: "#cd7f32", label: "json" },
  html: { color: "#e34f26", label: "html" },
  css: { color: "#1572b6", label: "css" },
  scss: { color: "#1572b6", label: "scss" },
  md: { color: "#9ca3af", label: "md" },
  mdx: { color: "#9ca3af", label: "mdx" },
  svg: { color: "#ec4899", label: "svg" },
  txt: { color: "#475569", label: "txt" },
  py: { color: "#3572A5", label: "py" },
  rs: { color: "#dea584", label: "rs" },
  toml: { color: "#8bc34a", label: "toml" },
  yml: { color: "#8bc34a", label: "yml" },
  yaml: { color: "#8bc34a", label: "yaml" },
  prisma: { color: "#2d3748", label: "prisma" },
  graphql: { color: "#e535ab", label: "gql" },
  gql: { color: "#e535ab", label: "gql" },
  sql: { color: "#e38c00", label: "sql" },
  sh: { color: "#4eaa25", label: "sh" },
  bash: { color: "#4eaa25", label: "bash" },
  zsh: { color: "#4eaa25", label: "zsh" },
  dockerfile: { color: "#2496ed", label: "docker" },
  lock: { color: "#7c3aed", label: "lock" },
};

function getFileConfig(filePath: string): { color: string; label: string } {
  const name = filePath.split("/").pop() || filePath;
  if (name === "Dockerfile" || name.startsWith("Dockerfile."))
    return { color: "#2496ed", label: "Docker" };
  if (name === ".gitignore") return { color: "#f05032", label: "git" };
  const ext = name.includes(".") ? name.split(".").pop()?.toLowerCase() || "" : "";
  return FILE_TYPE_CONFIG[ext] || { color: "#475569", label: ext || "file" };
}

interface FileCapsuleProps {
  filePath: string;
  size?: string;
  className?: string;
}

export function FileCapsule({ filePath, size, className = "" }: FileCapsuleProps) {
  const config = getFileConfig(filePath);
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono ${className}`}
      title={size ? `${filePath} • ${size}` : filePath}
    >
      <span
        className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none"
        style={{
          backgroundColor: `${config.color}15`,
          borderColor: `${config.color}50`,
          borderWidth: "0.5px",
          borderStyle: "solid",
        }}
      >
        <span
          className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: config.color }}
        />
        <span style={{ color: "#cbd5e1" }}>{config.label}</span>
      </span>
      {filePath && (
        <span className="text-[11px] text-slate-300 truncate max-w-[240px]">
          {filePath}
        </span>
      )}
    </span>
  );
}
