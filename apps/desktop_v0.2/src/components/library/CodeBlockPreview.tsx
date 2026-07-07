import React, { useState } from "react";
import { Copy, Check, Download, FileCode, ChevronDown, ChevronUp } from "lucide-react";

interface CodeBlockPreviewProps {
  code: string;
  language: string;
  fileName: string;
  fileSize?: string;
  maxCollapsedLines?: number;
}

export const CodeBlockPreview: React.FC<CodeBlockPreviewProps> = ({
  code,
  language,
  fileName,
  fileSize = "2.4 KB",
  maxCollapsedLines = 15
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const lines = code.split("\n");
  const isCollapsible = lines.length > maxCollapsedLines;
  const displayedLines = isCollapsible && !isExpanded ? lines.slice(0, maxCollapsedLines) : lines;

  // One-click Copy to Clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code to clipboard: ", err);
    }
  };

  // One-click Download Code File
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([code], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Minimal Syntax Highlighting Helper
  const renderHighlightedLine = (lineContent: string) => {
    if (lineContent.trim() === "") {
      return <span>&nbsp;</span>;
    }

    // Split line into tokens using a basic regex to highlight key types
    // Keywords, strings, comments, numbers, brackets, function calls
    const keywordRegex = /\b(const|let|var|function|return|import|from|export|default|class|interface|type|extends|implements|if|else|for|while|try|catch|async|await|as|from)\b/g;
    const stringRegex = /(["'`])(.*?)\1/g;
    const commentRegex = /(\/\/.*|\/\*.*?\*\/)/g;
    const numberRegex = /\b(\d+)\b/g;
    const bracketRegex = /([{}[\]()])/g;

    let html = lineContent
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // We do simple token highlighting using CSS class wraps
    // String literals (amber)
    html = html.replace(stringRegex, '<span class="text-amber-300">$1$2$1</span>');
    
    // Comments (gray-500/italic)
    html = html.replace(commentRegex, '<span class="text-gray-500 italic">$1</span>');

    // Keywords (sky-400/bold)
    html = html.replace(keywordRegex, '<span class="text-sky-400 font-semibold">$1</span>');

    // Numbers (purple-400)
    html = html.replace(numberRegex, '<span class="text-purple-400">$1</span>');

    // Brackets (amber-450)
    html = html.replace(bracketRegex, '<span class="text-amber-500/80">$1</span>');

    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="flex flex-col border border-white/[0.05] bg-[#07080c] rounded-xl overflow-hidden w-full max-w-4xl text-left shadow-lg select-text font-mono relative">
      
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#090a0f] border-b border-white/[0.04] select-none">
        
        {/* Left Side: File Info */}
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-250 font-bold uppercase tracking-wider">
              {fileName}
            </span>
            <span className="text-[8px] px-1.5 py-0.2 bg-white/5 border border-white/10 text-gray-400 rounded">
              {language.toUpperCase()}
            </span>
            {fileSize && (
              <span className="text-[8.5px] text-gray-500 hidden sm:inline">
                ({fileSize})
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Copy & Download Actions */}
        <div className="flex items-center gap-2">
          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-lg border border-white/5 bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer flex items-center gap-1 text-[8.5px] font-bold uppercase tracking-wide active:scale-95"
            title="Download Code File"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`p-1.5 rounded-lg border text-[8.5px] font-bold uppercase tracking-wide transition-all cursor-pointer flex items-center gap-1 active:scale-95 ${
              copied
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-white/5 bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/10"
            }`}
            title="Copy to Clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body & Editor Panel */}
      <div className="flex bg-[#050608]/90 overflow-x-auto p-4 select-text relative max-h-[500px] overflow-y-auto scrollbar-thin">
        
        {/* Line Numbers column */}
        <div className="flex flex-col text-right text-gray-600 select-none pr-4 border-r border-white/5 text-[9px] font-mono leading-relaxed min-w-[28px]">
          {displayedLines.map((_, index) => (
            <span key={index} className="block">
              {index + 1}
            </span>
          ))}
        </div>

        {/* Code Content display */}
        <div className="flex-1 pl-4 text-gray-300 text-[9px] font-mono leading-relaxed whitespace-pre font-medium overflow-visible">
          {displayedLines.map((line, index) => (
            <div key={index} className="block hover:bg-white/[0.02] px-1 rounded transition-colors">
              {renderHighlightedLine(line)}
            </div>
          ))}
        </div>

        {/* Fade gradient overlay for collapsible block */}
        {isCollapsible && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#050608] to-transparent pointer-events-none" />
        )}
      </div>

      {/* Show More / Show Less Toggle Button */}
      {isCollapsible && (
        <div className="flex justify-center bg-[#07080c] border-t border-white/[0.04] p-1.5 select-none z-10">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 rounded-md border border-white/5 bg-white/[0.01] hover:bg-white/5 hover:border-white/10 text-gray-400 hover:text-white text-[8px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3 text-sky-400" />
                Show Less Lines
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3 text-sky-400" />
                Show More Lines ({lines.length - maxCollapsedLines} hidden)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
