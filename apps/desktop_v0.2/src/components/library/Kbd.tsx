import React from "react";

export const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="px-1.5 py-0.5 text-[9px] font-mono font-bold text-gray-405 bg-white/5 border border-white/10 rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
    {children}
  </kbd>
);
