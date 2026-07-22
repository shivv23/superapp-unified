import React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  color?: "blue" | "gold" | "green" | "red" | "purple";
  showLabel?: boolean;
  className?: string;
}

const colorStyles: Record<string, string> = {
  blue: "bg-blue-500",
  gold: "bg-gold-400",
  green: "bg-emerald-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
};

const sizeStyles: Record<string, string> = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

export function Progress({
  value,
  max = 100,
  size = "md",
  color = "blue",
  showLabel = false,
  className,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-white/50">Progress</span>
          <span className="text-xs text-white/70 font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn("w-full bg-white/10 rounded-full overflow-hidden", sizeStyles[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", colorStyles[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
