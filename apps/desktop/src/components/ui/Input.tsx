import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className = "", ...props }) => {
  return (
    <input
      className={`w-full bg-[var(--cyber-dark)] border border-[var(--cyber-card-border)] rounded-md px-3 py-2 text-sm text-[var(--cyber-text-primary)] focus:outline-none focus:border-[var(--cyber-primary)] transition-colors placeholder-[var(--cyber-text-muted)] ${className}`}
      {...props}
    />
  );
};
export default Input;
