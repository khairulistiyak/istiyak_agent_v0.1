import React from "react";

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "xs" | "sm" | "md" | "lg";
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  active = false,
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}) => {
  const sizeClasses = {
    xs: "p-1 text-[9px] rounded-md",
    sm: "px-2 py-1 text-[10px] rounded-lg",
    md: "px-3 py-1.5 text-xs rounded-xl",
    lg: "px-4 py-2 text-sm rounded-2xl"
  };

  const getVariantClasses = () => {
    if (active) {
      return "bg-white/10 border-white/15 text-white shadow-sm";
    }

    switch (variant) {
      case "primary":
        return "bg-white border-white text-black hover:bg-white/90";
      case "danger":
        return "bg-black/10 border-white/5 hover:border-white/10 text-gray-400 hover:text-white hover:bg-white/5";
      case "ghost":
        return "bg-transparent border-transparent text-gray-500 hover:text-gray-200 hover:bg-white/5";
      case "secondary":
      default:
        return "bg-white/5 border-white/10 hover:bg-white/10 text-gray-300 hover:text-white";
    }
  };

  return (
    <button
      className={`border transition-all duration-200 ease-in-out cursor-pointer active:scale-95 font-medium flex items-center justify-center gap-1.5 ${sizeClasses[size]} ${getVariantClasses()} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
