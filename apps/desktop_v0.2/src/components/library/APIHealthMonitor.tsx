import React from "react";

interface APIHealthService {
  name: string;
  latencyMs: number;
  status: "online" | "degraded" | "offline";
}

interface APIHealthMonitorProps {
  services: APIHealthService[];
}

export const APIHealthMonitor: React.FC<APIHealthMonitorProps> = ({ services }) => {
  const statusColors = {
    online: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]",
    degraded: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]",
    offline: "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.3)]"
  };

  return (
    <div className="flex flex-wrap gap-2 items-center w-full max-w-sm">
      {services.map((svc) => (
        <div
          key={svc.name}
          className="inline-flex items-center gap-2 px-2.5 py-1 border border-white/[0.04] bg-white/[0.01] rounded-full"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusColors[svc.status]} animate-pulse`} />
          <span className="text-[9px] font-mono font-bold text-gray-300">{svc.name}</span>
          <span className="text-[8px] font-mono text-gray-500">{svc.latencyMs}ms</span>
        </div>
      ))}
    </div>
  );
};
