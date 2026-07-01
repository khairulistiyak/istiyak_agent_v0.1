import React from "react";

interface MarkdownRendererProps {
  text: string;
  messageId: string;
}

export const MarkdownRenderer = React.memo(({ text, messageId }: MarkdownRendererProps) => {
  const codeBlocks = text.split("```");
  
  return (
    <>
      {codeBlocks.map((block, index) => {
        if (index % 2 === 1) {
          // Render Code block with Copy button
          const lines = block.trim().split("\n");
          const language = lines[0].match(/^[a-zA-Z0-9_-]+$/) ? lines[0] : "";
          const code = language ? lines.slice(1).join("\n") : lines.join("\n");
          const btnId = `copy-btn-${messageId}-${index}`;
          
          return (
            <div key={index} className="my-2.5 border border-cyber-cardBorder bg-cyber-dark/90 rounded-xl overflow-hidden font-mono text-xs text-emerald-400 select-text">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#0d0e10] border-b border-cyber-cardBorder/50">
                <span className="text-[10px] text-cyber-textSecondary uppercase font-bold tracking-wider">{language || "code"}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(code).then(() => {
                      const btn = document.getElementById(btnId);
                      if (btn) {
                        btn.textContent = "✓ Copied!";
                        btn.classList.add("text-emerald-400");
                        setTimeout(() => {
                          btn.textContent = "Copy";
                          btn.classList.remove("text-emerald-400");
                        }, 2000);
                      }
                    });
                  }}
                  id={btnId}
                  className="text-[10px] text-cyber-textSecondary hover:text-white bg-[#1a1b1e] hover:bg-[#252629] border border-cyber-cardBorder/60 px-2 py-0.5 rounded transition-all duration-200 cursor-pointer font-sans font-semibold"
                >
                  Copy
                </button>
              </div>
              <div className="p-3 overflow-x-auto">
                <pre><code>{code}</code></pre>
              </div>
            </div>
          );
        } else {
          // Render rich text: headings, bold, inline code, lists, links, linebreaks
          const lines = block.split("\n");
          return lines.map((line, lIdx) => {
            const trimmedLine = line.trim();

            // Heading detection (### Heading, ## Heading, # Heading)
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

            // Horizontal rule
            if (trimmedLine === "---" || trimmedLine === "***" || trimmedLine === "___") {
              return <hr key={lIdx} className="border-cyber-cardBorder my-3" />;
            }

            // Bullet list
            const isBullet = trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ");
            // Numbered list
            const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);

            const cleanLine = isBullet
              ? trimmedLine.substring(2)
              : numberedMatch
              ? numberedMatch[2]
              : line;

            // Format inline elements: `code`, **bold**, [link](url)
            const formatInline = (t: string): React.ReactNode[] => {
              // First handle inline code
              return t.split("`").map((chunk, cIdx) => {
                if (cIdx % 2 === 1) {
                  return (
                    <code key={`c${cIdx}`} className="bg-cyber-dark/80 text-cyber-primary px-1.5 py-0.5 rounded font-mono text-xs select-text">
                      {chunk}
                    </code>
                  );
                }
                // Handle bold and links in non-code parts
                return chunk.split("**").map((part, bIdx) => {
                  if (bIdx % 2 === 1) {
                    return (
                      <strong key={`b${bIdx}`} className="text-cyber-primary font-semibold">
                        {part}
                      </strong>
                    );
                  }
                  // Handle markdown links [text](url)
                  const linkParts = part.split(/\[([^\]]+)\]\(([^)]+)\)/);
                  if (linkParts.length > 1) {
                    return linkParts.map((lp, lpIdx) => {
                      if (lpIdx % 3 === 1) {
                        const url = linkParts[lpIdx + 1];
                        return (
                          <a key={`l${lpIdx}`} href={url} target="_blank" rel="noopener noreferrer" className="text-cyber-primary hover:underline cursor-pointer">
                            {lp}
                          </a>
                        );
                      }
                      if (lpIdx % 3 === 2) return null; // URL part, already consumed
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
                  <span className="text-cyber-primary mt-1">•</span>
                  <span className="flex-1">{formattedLine}</span>
                </div>
              );
            }
            if (numberedMatch) {
              return (
                <div key={lIdx} className="flex items-start space-x-2 my-1 ml-2">
                  <span className="text-cyber-primary font-bold mt-0.5 min-w-[1.2em] text-right">{numberedMatch[1]}.</span>
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
