import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[var(--cyber-primary)] text-[var(--cyber-dark)] hover:opacity-90 shadow-[0_0_10px_rgba(var(--cyber-primary),0.3)]",
    secondary: "bg-[var(--cyber-card)] text-[var(--cyber-text-primary)] border border-[var(--cyber-card-border)] hover:bg-[var(--cyber-card-border)]",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "bg-transparent text-[var(--cyber-text-secondary)] hover:text-white hover:bg-[var(--cyber-card)]"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
export default Button;
