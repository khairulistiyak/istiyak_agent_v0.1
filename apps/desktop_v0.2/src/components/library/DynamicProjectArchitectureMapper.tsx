import React, { useState } from "react";
import { Search, Globe, Network, Server, Database, FileCode, Download } from "lucide-react";

interface ProjectModule {
  id: string;
  name: string;
  category: "entry" | "logic" | "services" | "db";
  description: string;
  files: string[];
  dependsOn: string[];
}

export const DynamicProjectArchitectureMapper: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<"tauri" | "ecommerce" | "flutter">("tauri");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("app-view");

  const projectsData: Record<"tauri" | "ecommerce" | "flutter", { title: string; modules: ProjectModule[] }> = {
    tauri: {
      title: "desktop_v0.2 (Desktop Agent IDE)",
      modules: [
        { id: "app-view", name: "React Main View", category: "entry" as const, description: "Serves main interface, chat window shell, and component staging library grid.", files: ["src/App.tsx", "src/index.css"], dependsOn: ["state-store"] },
        { id: "state-store", name: "Zustand Global Store", category: "logic" as const, description: "Holds chat history state, active running timers, and model selectors.", files: ["src/store/useChatStore.ts"], dependsOn: ["tauri-api"] },
        { id: "tauri-api", name: "Tauri Bridge Interface", category: "services" as const, description: "Executes Rust invocation commands, listens to stdout logs and filesystem events.", files: ["src/utils/tauri-ipc.ts"], dependsOn: ["rust-core"] },
        { id: "rust-core", name: "Rust Main Kernel", category: "db" as const, description: "OS native handlers, sqlite db manager, local process spawning controls.", files: ["src-tauri/src/main.rs", "src-tauri/Cargo.toml"], dependsOn: [] }
      ]
    },
    ecommerce: {
      title: "E-Commerce backend (Next.js Suite)",
      modules: [
        { id: "landing", name: "Next.js Pages App", category: "entry" as const, description: "Provides customer-facing client dashboard, shopping cart views, and checkout hooks.", files: ["app/page.tsx", "app/layout.tsx"], dependsOn: ["auth-middleware"] },
        { id: "auth-middleware", name: "JWT Auth Middleware", category: "logic" as const, description: "Decrypts cookies, validates session tokens, and maps route guards.", files: ["middleware.ts", "lib/auth.ts"], dependsOn: ["prisma-client"] },
        { id: "prisma-client", name: "Prisma Service Layer", category: "services" as const, description: "Formulates ORM requests, executes migrations, and buffers query results.", files: ["prisma/schema.prisma", "lib/db.ts"], dependsOn: ["postgres-db"] },
        { id: "postgres-db", name: "PostgreSQL Database", category: "db" as const, description: "Stores customer logs, payment histories, and order invoices safely.", files: ["Docker-compose.yml", "db/migrations.sql"], dependsOn: [] }
      ]
    },
    flutter: {
      title: "Fitness Tracker (Flutter Mobile App)",
      modules: [
        { id: "mobile-ui", name: "Material Widgets View", category: "entry" as const, description: "Renders active workout plans, custom health progress rings, and bottom sheets.", files: ["lib/screens/home.dart", "lib/widgets/rings.dart"], dependsOn: ["bloc-provider"] },
        { id: "bloc-provider", name: "BLoC State Manager", category: "logic" as const, description: "Tracks active workout sessions, sensor inputs, and user settings offline.", files: ["lib/bloc/workout_bloc.dart"], dependsOn: ["http-client"] },
        { id: "http-client", name: "REST API Service", category: "services" as const, description: "Executes JSON queries to health sync servers, checking API status.", files: ["lib/services/api_client.dart"], dependsOn: ["firebase-auth"] },
        { id: "firebase-auth", name: "Firebase Authentication", category: "db" as const, description: "Syncs Google authentication status and encrypts user profile details.", files: ["android/app/google-services.json"], dependsOn: [] }
      ]
    }
  };

  const currentProject = projectsData[selectedProject];
  
  // Filter modules by search query
  const filteredModules = currentProject.modules.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.files.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeModule = currentProject.modules.find(m => m.id === selectedModuleId) || currentProject.modules[0];

  const getColIcon = (cat: string) => {
    switch (cat) {
      case "entry": return <Globe className="w-3 h-3 text-sky-400" />;
      case "logic": return <Network className="w-3 h-3 text-purple-400" />;
      case "services": return <Server className="w-3 h-3 text-emerald-400" />;
      case "db": return <Database className="w-3 h-3 text-amber-400" />;
      default: return <FileCode className="w-3 h-3 text-gray-400" />;
    }
  };

  // Check if a module is a dependency of the selected module
  const isSelectedDependency = (moduleId: string) => {
    return activeModule.dependsOn.includes(moduleId);
  };

  // Check if a module depends on the selected module
  const isSelectedDependent = (moduleId: string) => {
    return currentProject.modules.some(m => m.id === moduleId && m.dependsOn.includes(activeModule.id));
  };

  return (
    <div className="flex flex-col border border-white/[0.05] bg-[#0c0d10] p-4 rounded-2xl w-full max-w-4xl text-left gap-4">
      {/* Header bar controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/[0.04] pb-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Network className="w-4 h-4 text-sky-400" />
            <span className="text-[11px] font-bold text-white uppercase tracking-widest">Workspace Architecture Mapper</span>
          </div>
          <span className="text-[8px] text-gray-550 font-mono">Dynamically rendering: {currentProject.title}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Project selector dropdown */}
          <select
            value={selectedProject}
            onChange={(e) => {
              const proj = e.target.value as "tauri" | "ecommerce" | "flutter";
              setSelectedProject(proj);
              const firstId = projectsData[proj].modules[0].id;
              setSelectedModuleId(firstId);
            }}
            className="bg-black/40 border border-white/5 text-[9px] font-bold uppercase tracking-wider text-gray-300 rounded px-2.5 py-1 outline-none cursor-pointer hover:border-white/10"
          >
            <option value="tauri">desktop_v0.2 IDE</option>
            <option value="ecommerce">E-Commerce Next.js</option>
            <option value="flutter">Flutter Health App</option>
          </select>

          {/* Search box */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-1.5 w-3 h-3 text-gray-555" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-3 py-1 bg-black/30 border border-white/5 text-[9.5px] rounded-lg text-gray-300 w-full sm:w-44 focus:outline-none focus:border-white/10"
            />
          </div>
        </div>
      </div>

      {/* Main Board view */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Visual Map Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3 bg-black/15 border border-white/[0.03] p-3 rounded-xl min-h-[220px]">
          {/* Column 1: Entry */}
          <div className="flex flex-col gap-2 border-r border-white/[0.03] pr-2 last:border-0 last:pr-0">
            <span className="text-[7.5px] text-gray-500 font-bold uppercase tracking-wider pl-1 flex items-center gap-1">
              <Globe className="w-2.5 h-2.5" /> Client Entry
            </span>
            {filteredModules.filter(m => m.category === "entry").map(m => (
              <ModuleCard 
                key={m.id} 
                module={m} 
                isActive={m.id === activeModule.id} 
                isDep={isSelectedDependency(m.id)}
                isDependent={isSelectedDependent(m.id)}
                onClick={() => setSelectedModuleId(m.id)} 
              />
            ))}
          </div>

          {/* Column 2: Logic */}
          <div className="flex flex-col gap-2 border-r border-white/[0.03] pr-2 last:border-0 last:pr-0">
            <span className="text-[7.5px] text-gray-500 font-bold uppercase tracking-wider pl-1 flex items-center gap-1">
              <Network className="w-2.5 h-2.5" /> Controllers
            </span>
            {filteredModules.filter(m => m.category === "logic").map(m => (
              <ModuleCard 
                key={m.id} 
                module={m} 
                isActive={m.id === activeModule.id} 
                isDep={isSelectedDependency(m.id)}
                isDependent={isSelectedDependent(m.id)}
                onClick={() => setSelectedModuleId(m.id)} 
              />
            ))}
          </div>

          {/* Column 3: Services */}
          <div className="flex flex-col gap-2 border-r border-white/[0.03] pr-2 last:border-0 last:pr-0">
            <span className="text-[7.5px] text-gray-500 font-bold uppercase tracking-wider pl-1 flex items-center gap-1">
              <Server className="w-2.5 h-2.5" /> Services Layer
            </span>
            {filteredModules.filter(m => m.category === "services").map(m => (
              <ModuleCard 
                key={m.id} 
                module={m} 
                isActive={m.id === activeModule.id} 
                isDep={isSelectedDependency(m.id)}
                isDependent={isSelectedDependent(m.id)}
                onClick={() => setSelectedModuleId(m.id)} 
              />
            ))}
          </div>

          {/* Column 4: DB */}
          <div className="flex flex-col gap-2">
            <span className="text-[7.5px] text-gray-500 font-bold uppercase tracking-wider pl-1 flex items-center gap-1">
              <Database className="w-2.5 h-2.5" /> Databases
            </span>
            {filteredModules.filter(m => m.category === "db").map(m => (
              <ModuleCard 
                key={m.id} 
                module={m} 
                isActive={m.id === activeModule.id} 
                isDep={isSelectedDependency(m.id)}
                isDependent={isSelectedDependent(m.id)}
                onClick={() => setSelectedModuleId(m.id)} 
              />
            ))}
          </div>
        </div>

        {/* Selected Module Details Inspector */}
        <div className="w-full lg:w-72 flex flex-col border border-white/5 bg-black/25 p-3 rounded-xl gap-3">
          <div className="flex items-center gap-1.5 border-b border-white/[0.04] pb-2">
            {getColIcon(activeModule.category)}
            <span className="text-[10px] font-bold text-white uppercase tracking-wider truncate">{activeModule.name}</span>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[7.5px] text-gray-550 font-bold uppercase">Description</span>
            <p className="text-[9px] text-gray-300 leading-normal">{activeModule.description}</p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[7.5px] text-gray-555 font-bold uppercase">Associated Files</span>
            <div className="flex flex-col gap-1">
              {activeModule.files.map((file) => (
                <div key={file} className="bg-black/30 border border-white/5 px-2 py-1 rounded font-mono text-[8px] text-sky-400/80 truncate">
                  {file}
                </div>
              ))}
            </div>
          </div>

          {activeModule.dependsOn.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[7.5px] text-gray-550 font-bold uppercase">Active Connections</span>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[7.5px] font-mono text-gray-500 uppercase">Depends on:</span>
                {activeModule.dependsOn.map(dep => (
                  <span key={dep} className="text-[7px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.2 rounded">
                    {dep}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-white/[0.04]">
            <button
              onClick={() => alert(`Mermaid Schema:\ngraph TD\n  ${activeModule.id}-->${activeModule.dependsOn.join(",") || "End"}`)}
              className="flex-1 py-1 text-[8px] font-bold uppercase tracking-wider text-gray-400 hover:text-white border border-white/5 bg-white/5 hover:bg-white/10 rounded transition-all cursor-pointer"
            >
              Copy Mermaid
            </button>
            <button
              onClick={() => alert("Downloading visual SVG architecture map...")}
              className="px-2 py-1 text-[8px] font-bold uppercase text-black bg-white hover:bg-gray-200 rounded transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ModuleCardProps {
  module: ProjectModule;
  isActive: boolean;
  isDep: boolean;
  isDependent: boolean;
  onClick: () => void;
}
const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  isActive,
  isDep,
  isDependent,
  onClick
}) => {
  let borderClass = "border-white/5 bg-black/25 text-gray-400 hover:bg-black/35 hover:text-gray-300";
  if (isActive) {
    borderClass = "border-sky-500/30 bg-sky-500/[0.02] text-white shadow-[0_0_10px_rgba(56,189,248,0.05)]";
  } else if (isDep) {
    borderClass = "border-purple-500/30 bg-purple-500/[0.01] text-purple-300";
  } else if (isDependent) {
    borderClass = "border-emerald-500/30 bg-emerald-500/[0.01] text-emerald-300";
  }

  return (
    <div
      onClick={onClick}
      className={`p-2 border rounded-lg cursor-pointer transition-all flex flex-col text-left ${borderClass}`}
    >
      <div className="flex items-center justify-between gap-1 overflow-hidden">
        <span className="text-[9px] font-bold truncate leading-tight">{module.name}</span>
        {isDep && (
          <span className="text-[6.5px] font-mono text-purple-400 uppercase font-bold flex-shrink-0">Dep</span>
        )}
        {isDependent && (
          <span className="text-[6.5px] font-mono text-emerald-400 uppercase font-bold flex-shrink-0">Parent</span>
        )}
      </div>
      <p className="text-[7.5px] text-gray-500 mt-1 line-clamp-2 leading-snug">{module.description}</p>
    </div>
  );
};
