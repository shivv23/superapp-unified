import React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  fallback: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles: Record<string, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

export function Avatar({ fallback, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full bg-blue-gradient flex items-center justify-center font-semibold text-white",
        sizeStyles[size],
        className
      )}
    >
      {fallback}
    </div>
  );
}
