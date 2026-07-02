import { memo, useState, useCallback, type ReactNode } from "react";

interface MarkdownRendererProps {
  text: string;
  messageId: string;
}

function highlightSyntax(code: string, language: string): ReactNode {
  if (!language || !["ts", "tsx", "js", "jsx", "typescript", "javascript", "json"].includes(language)) {
    return <pre className="text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap font-mono">{code}</pre>;
  }

  const lines = code.split("\n");
  return (
    <pre className="text-[11px] leading-relaxed whitespace-pre-wrap font-mono">
      {lines.map((line, li) => (
        <div key={li} className="flex">
          <span className="w-8 shrink-0 text-right text-[9px] text-slate-700 select-none mr-3">{li + 1}</span>
          <span className="text-slate-300">{line}</span>
        </div>
      ))}
    </pre>
  );
}

const CopyButton = memo(({ code, btnId }: { code: string; btnId: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <button
      id={btnId}
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[8.5px] font-bold transition-all duration-200 cursor-pointer rounded-md border ${
        copied
          ? "bg-[#10b981]/10 border-[#10b981]/50 text-[#34d399]"
          : "glass-pill-button border-[#1e2533]/60 text-[#a3a3a3] hover:text-white"
      }`}
    >
      {copied ? (
        <>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4 7L8 3" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <rect x="2.5" y="2.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="0.8"/>
            <path d="M1.5 7.5V1.5H7.5" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round"/>
          </svg>
          Copy Code
        </>
      )}
    </button>
  );
});
CopyButton.displayName = "CopyButton";

export const MarkdownRenderer = memo(({ text, messageId }: MarkdownRendererProps) => {
  const codeBlocks = text.split("```");
  
  return (
    <>
      {codeBlocks.map((block, index) => {
        if (index % 2 === 1) {
          const lines = block.trim().split("\n");
          const language = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : "";
          const code = language ? lines.slice(1).join("\n") : lines.join("\n");
          const btnId = `copy-btn-${messageId}-${index}`;

          // Language label config
          const langLabel = language || "code";
          const langColor = language === "typescript" || language === "ts" ? "#00f3ff" :
                            language === "javascript" || language === "js" ? "#eab308" :
                            language === "tsx" ? "#0ea5e9" :
                            language === "python" || language === "py" ? "#3572A5" :
                            language === "json" ? "#cd7f32" :
                            language === "css" ? "#1572b6" :
                            language === "html" ? "#e34f26" : "#9ca3af";
          
          return (
            <div key={index} className="my-3 overflow-hidden rounded-xl border border-[#1e2533] bg-[#080a10] select-text">
              {/* Header bar */}
              <div className="flex items-center justify-between bg-[#11131e]/50 px-3.5 py-1.5 border-b border-[#1e2533]/80">
                <span className="glass-capsule px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 text-[9px] font-mono font-bold text-[#cbd5e1] leading-none">
                  <span
                    className="h-1.5 w-1.5 rounded-full animate-zenglow"
                    style={{ backgroundColor: langColor }}
                  />
                  <span>{langLabel.toLowerCase()}</span>
                </span>
                <CopyButton code={code} btnId={btnId} />
              </div>
              {/* Code body */}
              <div className="overflow-x-auto p-3">
                {highlightSyntax(code, language)}
              </div>
            </div>
          );
        } else {
          // Rich text: headings, bold, inline code, lists, links, linebreaks
          const lines = block.split("\n");
          return lines.map((line, lIdx) => {
            const trimmedLine = line.trim();

            const h3Match = trimmedLine.match(/^###\s+(.+)$/);
            if (h3Match) {
              return <div key={lIdx} className="text-sm font-bold text-white mt-3 mb-1">{h3Match[1]}</div>;
            }
            const h2Match = trimmedLine.match(/^##\s+(.+)$/);
            if (h2Match) {
              return <div key={lIdx} className="text-base font-bold text-white mt-4 mb-1.5">{h2Match[1]}</div>;
            }
            const h1Match = trimmedLine.match(/^#\s+(.+)$/);
            if (h1Match) {
              return <div key={lIdx} className="text-lg font-extrabold text-white mt-4 mb-2">{h1Match[1]}</div>;
            }

            if (trimmedLine === "---" || trimmedLine === "***" || trimmedLine === "___") {
              return <hr key={lIdx} className="border-slate-800 my-3" />;
            }

            const isBullet = trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ");
            const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);

            const cleanLine = isBullet
              ? trimmedLine.substring(2)
              : numberedMatch
              ? numberedMatch[2]
              : line;

            const formatInline = (t: string): React.ReactNode[] => {
              return t.split("`").map((chunk, cIdx) => {
                if (cIdx % 2 === 1) {
                  return (
                    <code key={`c${cIdx}`} className="bg-slate-800/80 text-cyan-300 px-1.5 py-0.5 rounded font-mono text-xs select-text">
                      {chunk}
                    </code>
                  );
                }
                return chunk.split("**").map((part, bIdx) => {
                  if (bIdx % 2 === 1) {
                    return (
                      <strong key={`b${bIdx}`} className="text-cyan-300 font-semibold">
                        {part}
                      </strong>
                    );
                  }
                  const linkParts = part.split(/\[([^\]]+)\]\(([^)]+)\)/);
                  if (linkParts.length > 1) {
                    return linkParts.map((lp, lpIdx) => {
                      if (lpIdx % 3 === 1) {
                        const url = linkParts[lpIdx + 1];
                        return (
                          <a key={`l${lpIdx}`} href={url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline cursor-pointer">
                            {lp}
                          </a>
                        );
                      }
                      if (lpIdx % 3 === 2) return null;
                      return lp;
                    });
                  }
                  return part;
                });
              });
            };

            const formattedLine = formatInline(cleanLine);

            if (isBullet) {
              return (
                <div key={lIdx} className="flex items-start space-x-2 my-1 ml-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span className="flex-1">{formattedLine}</span>
                </div>
              );
            }
            if (numberedMatch) {
              return (
                <div key={lIdx} className="flex items-start space-x-2 my-1 ml-2">
                  <span className="text-cyan-400 font-bold mt-0.5 min-w-[1.2em] text-right">{numberedMatch[1]}.</span>
                  <span className="flex-1">{formattedLine}</span>
                </div>
              );
            }
            return (
              <div key={lIdx} className="min-h-[1.25em]">
                {formattedLine}
              </div>
            );
          });
        }
      })}
    </>
  );
});

MarkdownRenderer.displayName = "MarkdownRenderer";
