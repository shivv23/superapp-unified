"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface AssistantButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export function AssistantButton({ onClick, isOpen }: AssistantButtonProps) {
  if (isOpen) return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-navy-500 border-2 border-blue-500/40 flex items-center justify-center shadow-glow cursor-pointer group"
      aria-label="Open AI Assistant"
    >
      {/* Pulsing glow rings */}
      <span className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping" />
      <span className="absolute inset-[-4px] rounded-full border border-blue-500/20 animate-pulse" />

      {/* Icon */}
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles
          size={22}
          className="text-gold-400 group-hover:text-gold-300 transition-colors relative z-10"
        />
      </motion.div>

      {/* Tooltip */}
      <div className="absolute right-full mr-3 px-3 py-1.5 bg-navy-500/95 backdrop-blur-xl border border-white/10 rounded-lg text-xs text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-glass">
        AI Investment Assistant
        <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-navy-500/95 border-r border-b border-white/10 rotate-45" />
      </div>
    </motion.button>
  );
}
