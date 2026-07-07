import React from "react";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  status?: "online" | "offline" | "away";
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = "md",
  status
}) => {
  const sizeClasses = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm"
  };

  const getInitials = (n: string) => {
    return n
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="relative inline-block select-none">
      {src ? (
        <img
          src={src}
          alt={name}
          className={`rounded-full object-cover border border-white/10 ${sizeClasses[size]}`}
        />
      ) : (
        <div
          className={`rounded-full border border-white/10 bg-white/5 text-gray-300 font-bold flex items-center justify-center ${sizeClasses[size]}`}
        >
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 block w-2 h-2 rounded-full border border-[#08090a] ${
            status === "online"
              ? "bg-white"
              : status === "away"
              ? "bg-white/50"
              : "bg-white/20"
          }`}
        />
      )}
    </div>
  );
};
