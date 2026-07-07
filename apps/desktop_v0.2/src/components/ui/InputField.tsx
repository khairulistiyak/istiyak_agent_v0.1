import React from "react";
import { GlassButton } from "./GlassButton.js";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  onBrowse?: () => void; // for browse files button
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  onBrowse,
  className = "",
  type = "text",
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider px-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        <input
          type={type}
          className={`w-full px-3 py-2 text-xs text-gray-200 bg-white/5 border border-white/10 rounded-xl focus:border-white/20 outline-none hover:bg-white/[0.08] hover:border-white/15 focus:bg-white/[0.08] transition-all ${
            onBrowse ? "pr-16" : ""
          } ${className}`}
          {...props}
        />
        {onBrowse && (
          <GlassButton
            type="button"
            onClick={onBrowse}
            variant="secondary"
            size="xs"
            className="absolute right-1.5 !px-2 !py-0.5 !border-white/10 !bg-white/5 hover:!bg-white/10 text-[9px] font-bold"
          >
            Browse
          </GlassButton>
        )}
      </div>
    </div>
  );
};
