import React, { useState } from "react";

export function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-[10px] text-white/80 rounded border border-white/10 whitespace-nowrap shadow-lg">
          {text}
        </div>
      )}
    </div>
  );
}
