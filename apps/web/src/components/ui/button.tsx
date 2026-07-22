import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "gold" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-glow hover:shadow-[0_0_30px_rgba(26,86,219,0.4)]",
  secondary: "bg-white/10 hover:bg-white/15 text-white border border-white/10",
  gold: "bg-gold-400 hover:bg-gold-300 text-navy-900 font-semibold shadow-glow-gold hover:shadow-[0_0_30px_rgba(245,166,35,0.4)]",
  ghost: "text-white/60 hover:text-white hover:bg-white/5",
  danger: "bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/20",
  outline: "bg-transparent hover:bg-white/5 text-white border border-white/20 hover:border-white/30",
};

const sizeStyles: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-8 py-3.5 text-base rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
