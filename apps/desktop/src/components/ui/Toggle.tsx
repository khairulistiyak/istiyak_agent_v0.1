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
      className={`relative inline-flex h-3.5 w-7 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
        active ? "bg-[#10b981]/30" : "bg-[#1c1e24]"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-2.5 w-2.5 transform rounded-full transition duration-200 ease-in-out mt-[2px] ml-[2px] ${
          active ? "bg-[#10b981] translate-x-[14px]" : "bg-[#44444a] translate-x-0"
        }`}
      />
    </button>
  );
});

Toggle.displayName = "Toggle";
