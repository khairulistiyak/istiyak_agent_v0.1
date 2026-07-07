import React from "react";
import { Check, AlertTriangle, X, Bell } from "lucide-react";

interface ToastItem {
  id: string;
  type: "success" | "warning" | "error" | "info";
  message: string;
}

interface SystemToastAlertStackProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export const SystemToastAlertStack: React.FC<SystemToastAlertStackProps> = ({ toasts, onRemove }) => {
  const icons = {
    success: <Check className="w-3.5 h-3.5 text-emerald-400" />,
    warning: <AlertTriangle className="w-3.5 h-3.5 text-amber-405" />,
    error: <X className="w-3.5 h-3.5 text-red-400" />,
    info: <Bell className="w-3.5 h-3.5 text-sky-400" />
  };

  const borders = {
    success: "border-emerald-500/20 bg-[#090b0e]/95",
    warning: "border-amber-500/20 bg-[#0a0a0d]/95",
    error: "border-red-500/20 bg-[#0b090a]/95",
    info: "border-sky-500/20 bg-[#090a0f]/95"
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center justify-between gap-3 p-3 border rounded-xl shadow-lg transition-all duration-300 ${borders[toast.type]}`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex-shrink-0">{icons[toast.type]}</div>
            <span className="text-[9.5px] font-sans text-gray-300 leading-normal truncate">{toast.message}</span>
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className="text-gray-600 hover:text-gray-400 p-0.5 rounded cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
