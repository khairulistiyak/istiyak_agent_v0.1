import React from "react";

interface ToggleProps {
  active: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export const Toggle = React.memo(({ active, onChange, disabled = false }: ToggleProps) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      className="relative inline-flex h-6 w-[60px] shrink-0 cursor-pointer rounded-full transition-all duration-200 ease-in-out focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed items-center px-1"
      style={{
        backgroundColor: active ? "#064e3b" : "#1c1e24",
        border: active ? "0.5px solid rgba(16, 185, 129, 0.5)" : "0.5px solid rgba(31, 41, 55, 0.5)",
      }}
    >
      <span
        className={`text-[8px] font-bold transition-all duration-200 ${
          active ? "text-emerald-400 ml-1" : "text-slate-600 ml-3.5"
        }`}
      >
        {active ? "ON" : "OFF"}
      </span>
      <span
        className={`absolute top-0.5 h-5 w-5 transform rounded-full transition-all duration-200 ease-in-out ${
          active ? "translate-x-[34px] bg-emerald-400" : "translate-x-0 bg-slate-500"
        }`}
      />
    </button>
  );
});

Toggle.displayName = "Toggle";
