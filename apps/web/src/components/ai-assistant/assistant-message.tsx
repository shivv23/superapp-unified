"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

interface AssistantMessageProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
  index?: number;
}

function formatMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    if (line.trim() === "") {
      elements.push(<br key={`br-${lineIndex}`} />);
      return;
    }

    function formatInline(text: string): React.ReactNode[] {
      const parts: React.ReactNode[] = [];
      let remaining = text;
      let partIndex = 0;

      while (remaining.length > 0) {
        const boldMatch = remaining.match(/\*\*(.*?)\*\*/);

        if (boldMatch && boldMatch.index !== undefined) {
          if (boldMatch.index > 0) {
            parts.push(
              <span key={`text-${lineIndex}-${partIndex}`}>
                {remaining.slice(0, boldMatch.index)}
              </span>
            );
            partIndex++;
          }
          parts.push(
            <strong key={`bold-${lineIndex}-${partIndex}`} className="font-semibold text-white">
              {boldMatch[1]}
            </strong>
          );
          remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
          partIndex++;
        } else {
          parts.push(
            <span key={`rest-${lineIndex}-${partIndex}`}>{remaining}</span>
          );
          break;
        }
      }

      return parts.length > 0 ? parts : [<span key={`plain-${lineIndex}`}>{text}</span>];
    }

    if (line.startsWith("- ")) {
      elements.push(
        <div key={lineIndex} className="flex items-start gap-2 ml-1">
          <span className="text-gold-400 mt-0.5 text-xs">●</span>
          <span>{formatInline(line.slice(2))}</span>
        </div>
      );
    } else if (line.match(/^\d+\.\s/)) {
      const num = line.match(/^(\d+)\.\s/)?.[1];
      elements.push(
        <div key={lineIndex} className="flex items-start gap-2 ml-1">
          <span className="text-blue-400 font-medium text-xs mt-0.5 min-w-[14px]">
            {num}.
          </span>
          <span>{formatInline(line.replace(/^\d+\.\s/, ""))}</span>
        </div>
      );
    } else {
      elements.push(
        <div key={lineIndex} className="leading-relaxed">
          {formatInline(line)}
        </div>
      );
    }
  });

  return elements;
}

export function AssistantMessage({
  content,
  isUser,
  timestamp,
  index = 0,
}: AssistantMessageProps) {
  const time = timestamp || new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.35,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-blue-600/30 border border-blue-500/30"
            : "bg-gold-400/20 border border-gold-400/30"
        }`}
      >
        {isUser ? (
          <User size={14} className="text-blue-400" />
        ) : (
          <Bot size={14} className="text-gold-400" />
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-blue-600/20 border border-blue-500/20 rounded-tr-sm"
            : "bg-white/5 border border-white/8 rounded-tl-sm"
        }`}
      >
        <div className={`text-sm leading-relaxed ${isUser ? "text-white" : "text-white/85"}`}>
          {isUser ? <span>{content}</span> : <div className="space-y-1">{formatMarkdown(content)}</div>}
        </div>
        <div className={`text-[10px] mt-2 ${isUser ? "text-blue-300/40 text-right" : "text-white/20"}`}>
          {time}
        </div>
      </div>
    </motion.div>
  );
}
