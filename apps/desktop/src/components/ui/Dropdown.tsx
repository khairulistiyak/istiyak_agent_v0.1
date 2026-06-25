import React from "react";

interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string }>;
}

export const Dropdown: React.FC<DropdownProps> = ({ label, options, className = "", ...props }) => {
  return (
    <div className="flex flex-col space-y-1">
      {label && <label className="text-xs text-[var(--cyber-text-secondary)] font-medium">{label}</label>}
      <select
        className={`bg-[var(--cyber-dark)] border border-[var(--cyber-card-border)] rounded-md px-3 py-1.5 text-xs text-[var(--cyber-text-primary)] focus:outline-none focus:border-[var(--cyber-primary)] transition-colors cursor-pointer ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
export default Dropdown;
