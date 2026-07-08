import React from "react";

interface InlineNotificationProps {
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
}

export const InlineNotification: React.FC<InlineNotificationProps> = ({ type, title, message }) => {
  const styles = {
    info: {
      border: "border-sky-500/10",
      bg: "bg-sky-500/[0.02]",
      dot: "bg-sky-400",
      text: "text-sky-400"
    },
    warning: {
      border: "border-amber-500/10",
      bg: "bg-amber-500/[0.02]",
      dot: "bg-amber-405",
      text: "text-amber-400"
    },
    error: {
      border: "border-red-500/10",
      bg: "bg-red-500/[0.02]",
      dot: "bg-red-400",
      text: "text-red-400"
    },
    success: {
      border: "border-emerald-500/10",
      bg: "bg-emerald-500/[0.02]",
      dot: "bg-emerald-400",
      text: "text-emerald-400"
    }
  };

  const style = styles[type];

  return (
    <div className={`flex flex-col gap-1 p-3 border ${style.border} ${style.bg} rounded-lg w-full max-w-sm text-left`}>
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
        <span className={`text-[9px] font-bold uppercase tracking-wide ${style.text}`}>{title}</span>
      </div>
      <p className="text-[9px] text-gray-550 leading-normal font-medium">{message}</p>
    </div>
  );
};
