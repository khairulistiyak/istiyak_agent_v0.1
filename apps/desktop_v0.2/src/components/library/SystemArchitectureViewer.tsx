import React, { useState, useRef, useEffect } from "react";
import { Layers, GitMerge, Cpu, Brain, ZoomIn, ZoomOut, Maximize2, Move, FileCode, Play, Pause } from "lucide-react";

interface ArchitectureNode {
  id: string;
  name: string;
  iconType: "ui" | "ipc" | "rust" | "ai";
  responsibility: string;
  files: string[];
  interfaces: string[];
}

interface NodePosition {
  x: number;
  y: number;
}

interface SysFlow {
  id: string;
  name: string;
  source: string;
  target: string;
  color: string;
  dotColor: string;
  strokeColor: string;
  description: string;
}

export const SystemArchitectureViewer: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Infinite Canvas Pan & Zoom States
  const [scale, setScale] = useState<number>(0.9);
  const [pan, setPan] = useState<NodePosition>({ x: 30, y: 30 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<NodePosition>({ x: 0, y: 0 });

  // Table positions in pixels relative to canvas
  const [positions, setPositions] = useState<Record<string, NodePosition>>({
    ui: { x: 50, y: 40 },
    ipc: { x: 340, y: 40 },
    rust: { x: 340, y: 250 },
    ai: { x: 50, y: 250 }
  });

  const [activeDragNode, setActiveDragNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<NodePosition>({ x: 0, y: 0 });
  
  const [activeNodeId, setActiveNodeId] = useState<string>("ui");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (canvasRef.current) {
      const width = canvasRef.current.clientWidth;
      if (width < 600) {
        setScale(width / 650);
        setPan({ x: 10, y: 20 });
      }
    }
  }, []);

  const nodes: ArchitectureNode[] = [
    {
      id: "ui",
      name: "React UI & Zustand",
      iconType: "ui",
      responsibility: "Renders the frontend chat windows, library components, settings tables, and local state management.",
      files: ["/src/components/chat/*", "/src/store/useChatStore.ts", "/src/components/library/*"],
      interfaces: ["IPC Invoke Triggers", "Global Zustand state subscriptions"]
    },
    {
      id: "ipc",
      name: "Tauri Bridge (IPC)",
      iconType: "ipc",
      responsibility: "Marshals serializable payloads across boundary layers, emitting events and invoking async Rust commands.",
      files: ["Tauri window.__TAURI__ API", "src-tauri/src/main.rs (Commands)"],
      interfaces: ["window.emit()", "invoke('run_tool_command')"]
    },
    {
      id: "rust",
      name: "Tauri Rust Core",
      iconType: "rust",
      responsibility: "Controls native OS features, spawns background command processes, handles file read/write, and runs SQLite engines.",
      files: ["/src-tauri/src/main.rs", "/src-tauri/Cargo.toml"],
      interfaces: ["std::process::Command", "std::fs::File read/write streams"]
    },
    {
      id: "ai",
      name: "Vertex AI / LLM Engine",
      iconType: "ai",
      responsibility: "Resolves system goals, generates implementation plans, designs structural code changes, and parses tool logs.",
      files: ["GCP Authentication Credentials", "Google Antigravity SDK Contexts"],
      interfaces: ["HTTPS Rest API calls", "Streaming token completions"]
    }
  ];

  const systemFlows: SysFlow[] = [
    {
      id: "flow-ui-ipc",
      name: "IPC Invocation",
      source: "ui",
      target: "ipc",
      color: "stroke-sky-500",
      dotColor: "bg-sky-400 shadow-[0_0_8px_#38bdf8]",
      strokeColor: "#38bdf8",
      description: "Triggers Rust backend commands from frontend mouse click events."
    },
    {
      id: "flow-ipc-rust",
      name: "Kernel Execution",
      source: "ipc",
      target: "rust",
      color: "stroke-purple-500",
      dotColor: "bg-purple-400 shadow-[0_0_8px_#a855f7]",
      strokeColor: "#a855f7",
      description: "Rust marshals command parameters and triggers local terminal processes."
    },
    {
      id: "flow-rust-ai",
      name: "Context Ingestion",
      source: "rust",
      target: "ai",
      color: "stroke-amber-500",
      dotColor: "bg-amber-405 shadow-[0_0_8px_#f59e0b]",
      strokeColor: "#f59e0b",
      description: "Rust feeds active terminal files and outputs into Google Claude API prompts."
    },
    {
      id: "flow-ai-ui",
      name: "Interface Feedback Loop",
      source: "ai",
      target: "ui",
      color: "stroke-emerald-500",
      dotColor: "bg-emerald-400 shadow-[0_0_8px_#34d399]",
      strokeColor: "#34d399",
      description: "Vertex AI outputs final response streams directly into React Chat Bubble UI."
    }
  ];

  const activeNode = nodes.find(n => n.id === activeNodeId) || nodes[0];

  const handleZoomIn = () => setScale(s => Math.min(2, s + 0.1));
  const handleZoomOut = () => setScale(s => Math.max(0.5, s - 0.1));
  const handleZoomReset = () => {
    setScale(0.9);
    setPan({ x: 30, y: 30 });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === "svg" || (e.target as HTMLElement).id === "sys-grid-rect") {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (activeDragNode) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setPositions(prev => ({
        ...prev,
        [activeDragNode]: { x: newX, y: newY }
      }));
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setActiveDragNode(null);
  };

  const handleStartDrag = (e: React.MouseEvent, nodeName: string) => {
    setActiveDragNode(nodeName);
    const pos = positions[nodeName];
    setDragOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    });
    e.stopPropagation();
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsPanning(false);
      setActiveDragNode(null);
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "ui": return <Layers className="w-4 h-4 text-sky-400" />;
      case "ipc": return <GitMerge className="w-4 h-4 text-purple-400" />;
      case "rust": return <Cpu className="w-4 h-4 text-emerald-400" />;
      case "ai": return <Brain className="w-4 h-4 text-amber-400" />;
      default: return <FileCode className="w-4 h-4 text-gray-400" />;
    }
  };

  const getCurvePath = (source: string, target: string) => {
    const s = positions[source];
    const t = positions[target];
    if (!s || !t) return "";

    const startX = s.x + 65;
    const startY = s.y + 40;
    const endX = t.x + 65;
    const endY = t.y + 40;

    const cpX1 = startX + (endX - startX) * 0.5;
    const cpY1 = startY;
    const cpX2 = startX + (endX - startX) * 0.5;
    const cpY2 = endY;

    return `M ${startX},${startY} C ${cpX1},${cpY1} ${cpX2},${cpY2} ${endX},${endY}`;
  };

  const isNodeConnected = (nodeId: string) => {
    if (nodeId === activeNodeId) return true;
    const isDirectConnection = systemFlows.some(
      f => (f.source === activeNodeId && f.target === nodeId) || (f.target === activeNodeId && f.source === nodeId)
    );
    return isDirectConnection;
  };

  const isFade = (nodeId: string) => {
    if (hoveredNodeId) {
      return hoveredNodeId !== nodeId && !systemFlows.some(
        f => (f.source === hoveredNodeId && f.target === nodeId) || (f.target === hoveredNodeId && f.source === nodeId)
      );
    }
    return false;
  };

  return (
    <div className="flex flex-col border border-white/[0.05] bg-[#090a0f] p-4 rounded-2xl w-full max-w-4xl text-left gap-4 relative overflow-hidden">
      
      {/* High-performance CSS keyframe for dynamic system packets */}
      <style>{`
        @keyframes packetFlow {
          0% { offset-distance: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        .animate-sys-packet {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: packetFlow 3s linear infinite;
        }
        .sys-path-ui-ipc { offset-path: path('${getCurvePath("ui", "ipc")}'); }
        .sys-path-ipc-rust { offset-path: path('${getCurvePath("ipc", "rust")}'); }
        .sys-path-rust-ai { offset-path: path('${getCurvePath("rust", "ai")}'); }
        .sys-path-ai-ui { offset-path: path('${getCurvePath("ai", "ui")}'); }
      `}</style>

      {/* Decorative Blur Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.04] pb-4 z-10">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-sky-500/10 border border-sky-500/20">
              <Layers className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
                System Architecture Visualizer
                <span className="text-[7.5px] font-bold px-1.5 py-0.2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full">Interactive Topology</span>
              </span>
              <p className="text-[8.5px] text-gray-500 font-mono mt-0.5">Drag layers & observe circular boundary streams</p>
            </div>
          </div>
        </div>

        {/* View mode controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className="px-2 py-1 rounded border border-white/5 bg-white/5 text-gray-400 hover:text-white text-[8px] font-mono flex items-center gap-1 cursor-pointer transition-all active:scale-95"
          >
            {isAnimating ? <Pause className="w-2.5 h-2.5 text-sky-400" /> : <Play className="w-2.5 h-2.5 text-gray-500" />}
            {isAnimating ? "Pause Stream" : "Start Stream"}
          </button>
        </div>
      </div>

      {/* Top HUD Controls bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/35 border border-white/5 p-3 rounded-xl text-[9px] font-mono z-10 relative">
        <div className="flex flex-col">
          <span className="text-gray-550 text-[7px] uppercase font-bold tracking-wider">Canvas Status</span>
          <span className="text-sky-400 font-bold text-[11px] mt-0.5 flex items-center gap-1">
            <Move className="w-3.5 h-3.5" /> Zoom: {(scale * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex flex-col border-l border-white/5 pl-3">
          <span className="text-gray-550 text-[7px] uppercase font-bold tracking-wider">Interface State</span>
          <span className="text-white font-bold text-[11px] mt-0.5">IPC Bridge Connected</span>
        </div>
        <div className="flex flex-col border-l border-white/5 pl-3">
          <span className="text-gray-555 text-[7px] uppercase font-bold tracking-wider">Active Modules</span>
          <span className="text-purple-400 font-bold text-[11px] mt-0.5">4 Core Systems</span>
        </div>
        <div className="flex flex-col border-l border-white/5 pl-3">
          <span className="text-gray-555 text-[7px] uppercase font-bold tracking-wider">Audit Flow Speed</span>
          <span className="text-emerald-400 font-bold text-[11px] mt-0.5">60 FPS Real-time</span>
        </div>
      </div>

      {/* Main Board view */}
      <div className="flex flex-col lg:flex-row gap-4 z-10">
        
        {/* Infinite Grid Mind Map Canvas */}
        <div 
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          className="flex-1 bg-[#06070a] border border-white/[0.03] rounded-xl relative overflow-hidden h-[390px] select-none cursor-grab active:cursor-grabbing"
        >
          {/* SVG Dot grid background */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <svg className="w-full h-full">
              <defs>
                <pattern 
                  id="sys-grid-dots" 
                  width={20 * scale} 
                  height={20 * scale} 
                  patternUnits="userSpaceOnUse"
                  patternTransform={`translate(${pan.x}, ${pan.y})`}
                >
                  <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.12)" />
                </pattern>
              </defs>
              <rect id="sys-grid-rect" width="100%" height="100%" fill="url(#sys-grid-dots)" />
            </svg>
          </div>

          {/* Scaled/Panned wrapper layer */}
          <div 
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: "0 0",
              width: "100%",
              height: "100%",
              position: "absolute"
            }}
          >
            {/* SVG Dynamic curve path overlay */}
            <svg className="absolute inset-0 w-[800px] h-[600px] pointer-events-none">
              <path d="M 235,185 C 185,185 65,150 65,90" stroke="#1c1f26" strokeWidth="1.5" fill="none" />
              <path d="M 235,185 C 285,185 395,150 395,90" stroke="#1c1f26" strokeWidth="1.5" fill="none" />
              <path d="M 235,185 C 285,185 395,240 395,300" stroke="#1c1f26" strokeWidth="1.5" fill="none" />
              <path d="M 235,185 C 185,185 65,240 65,300" stroke="#1c1f26" strokeWidth="1.5" fill="none" />

              {/* Dynamic Flow Paths */}
              {systemFlows.map(flow => {
                const pathString = getCurvePath(flow.source, flow.target);
                const isSelectedRelation = activeNodeId === flow.source || activeNodeId === flow.target;

                return (
                  <path 
                    key={flow.id}
                    d={pathString} 
                    stroke={isSelectedRelation ? "#a855f7" : "#2d3139"} 
                    strokeWidth={isSelectedRelation ? "2" : "1.2"} 
                    strokeDasharray={isSelectedRelation ? "0" : "5 5"}
                    fill="none" 
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>

            {/* Glowing flowing particles along the curve paths */}
            {isAnimating && systemFlows.map(flow => {
              const pathClass = flow.id === "flow-ui-ipc" 
                ? "sys-path-ui-ipc" 
                : flow.id === "flow-ipc-rust" 
                ? "sys-path-ipc-rust" 
                : flow.id === "flow-rust-ai" 
                ? "sys-path-rust-ai" 
                : "sys-path-ai-ui";

              return Array.from({ length: 2 }).map((_, idx) => {
                const delay = `${idx * 1.5}s`;
                return (
                  <div 
                    key={`${flow.id}-particle-${idx}`}
                    className={`animate-sys-packet ${pathClass} ${flow.dotColor}`}
                    style={{
                      animationDelay: delay
                    }}
                  />
                );
              });
            })}

            {/* Central Kernel Core node */}
            <div 
              className="absolute left-[235px] top-[185px] -translate-x-1/2 -translate-y-1/2 p-3 bg-gradient-to-br from-[#0c0d12] to-[#12131b] border border-white/10 rounded-2xl shadow-[0_0_24px_rgba(0,0,0,0.85)] z-30 flex flex-col items-center justify-center gap-1.5 w-24 h-24 hover:border-sky-500/30 transition-colors select-none"
            >
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 relative">
                <GitMerge className="w-5 h-5 text-purple-400 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-black animate-ping" />
              </div>
              <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest leading-none">IDE Kernel</span>
              <span className="text-[6px] font-mono text-gray-500 leading-none">Process Hub</span>
            </div>

            {/* Render Architecture Node Cards */}
            {nodes.map((node) => {
              const isActive = node.id === activeNodeId;
              const isConnected = isNodeConnected(node.id);
              const isFadedNode = isFade(node.id);

              let borderStyle = "border-white/5 bg-[#08090d]/90 text-gray-555 scale-95";
              let glow = "";
              
              if (isActive) {
                borderStyle = "border-sky-500/30 bg-[#0a0c12]/95 text-white scale-100 ring-1 ring-sky-500/10";
                glow = "shadow-[0_0_20px_rgba(56,189,248,0.08)]";
              } else if (isConnected) {
                borderStyle = "border-purple-500/20 bg-[#08090d]/90 text-gray-300 scale-98";
              }

              const pos = positions[node.id] || { x: 50, y: 50 };

              return (
                <div
                  key={node.id}
                  onClick={() => setActiveNodeId(node.id)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    position: "absolute"
                  }}
                  className={`w-[130px] border rounded-xl overflow-hidden cursor-pointer transition-all duration-100 z-20 ${borderStyle} ${glow} ${
                    isFadedNode ? "opacity-20 blur-[0.3px] scale-90 saturate-50" : "opacity-100"
                  }`}
                >
                  {/* Card Draggable Header */}
                  <div 
                    onMouseDown={(e) => handleStartDrag(e, node.id)}
                    className={`px-2 py-1.5 border-b flex items-center justify-between cursor-grab active:cursor-grabbing select-none ${
                      isActive ? "bg-sky-500/10 border-sky-500/20 text-sky-400" : "bg-white/[0.01] border-white/5 text-gray-400"
                    }`}
                  >
                    <span className="text-[8px] font-mono font-bold uppercase tracking-wider truncate mr-1">{node.name}</span>
                    <div className="flex-shrink-0">{getIcon(node.iconType)}</div>
                  </div>

                  {/* Node files list summary */}
                  <div className="p-2 flex flex-col gap-1 bg-[#090a0e]/40 select-none">
                    <span className="text-[6.5px] text-gray-500 font-bold uppercase tracking-wider">Associated Files</span>
                    {node.files.map((file, fIdx) => (
                      <span key={fIdx} className="text-[7px] font-mono text-gray-450 truncate" title={file}>
                        {file.split("/").pop()}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Zoom Controls panel in corner */}
          <div className="absolute bottom-3 left-3 flex items-center bg-black/85 border border-white/10 rounded-lg p-0.5 shadow-xl z-30 select-none gap-0.5">
            <button 
              onClick={handleZoomIn}
              className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/5 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={handleZoomOut}
              className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/5 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={handleZoomReset}
              className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-white/5 transition-colors cursor-pointer"
              title="Reset View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Selected Layer Details Inspector Panel */}
        <div className="w-full lg:w-72 flex flex-col border border-white/5 bg-[#0b0c10]/60 p-4 rounded-xl gap-3.5 relative overflow-hidden h-[390px] select-text">
          <div className="flex items-center gap-2 border-b border-white/[0.04] pb-2.5">
            {getIcon(activeNode.iconType)}
            <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider truncate">Layer: {activeNode.id}</span>
          </div>

          <div className="flex flex-col gap-1 text-[9.5px]">
            <span className="text-[7.5px] text-gray-500 font-bold uppercase tracking-wider">Responsibility</span>
            <p className="text-gray-350 leading-relaxed font-sans">{activeNode.responsibility}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[7.5px] text-gray-500 font-bold uppercase tracking-wider">Key Files / Paths</span>
            <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[90px] scrollbar-thin">
              {activeNode.files.map((file) => (
                <div key={file} className="bg-black/45 border border-white/5 p-1.5 rounded-lg font-mono text-[7.5px] text-sky-400/80 truncate" title={file}>
                  {file}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[7.5px] text-gray-500 font-bold uppercase tracking-wider">Boundary Interfaces</span>
            <div className="flex flex-wrap gap-1.5">
              {activeNode.interfaces.map((intf) => (
                <span key={intf} className="text-[7.5px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-lg font-bold">
                  {intf}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-auto pt-2.5 border-t border-white/[0.04]">
            <button
              onClick={() => alert(`Mermaid Schema:\ngraph TD\n  ${activeNode.id}-->${activeNode.name.replace(/\s+/g, "")}`)}
              className="flex-1 py-1.5 text-[8px] font-bold uppercase tracking-wider text-gray-400 hover:text-white border border-white/5 bg-white/5 hover:bg-white/10 rounded-lg transition-all cursor-pointer text-center"
            >
              Copy Mermaid Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
