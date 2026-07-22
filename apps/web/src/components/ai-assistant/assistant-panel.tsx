"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Mic,
  MicOff,
  Sparkles,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
import { AssistantMessage } from "./assistant-message";

interface AssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

const quickActions = [
  { label: "How's my portfolio?", icon: "📊", action: "portfolio" },
  { label: "What should I invest in?", icon: "💰", action: "invest" },
  { label: "Explain REITs", icon: "🏢", action: "reit" },
  { label: "Tax saving tips", icon: "🧾", action: "tax" },
];

const welcomeMessage: Message = {
  id: "welcome",
  content:
    "Hello! I'm your **AI Investment Assistant**. I can help you with portfolio analysis, investment recommendations, market insights, tax planning, and financial education.\n\nHow can I assist you today?",
  isUser: false,
  timestamp: new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }),
};

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-center gap-3"
    >
      <div className="w-8 h-8 rounded-full bg-gold-400/20 border border-gold-400/30 flex items-center justify-center flex-shrink-0">
        <Sparkles size={14} className="text-gold-400" />
      </div>
      <div className="bg-white/5 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-white/40"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function RecordingIndicator({ onEnd }: { onEnd: () => void }) {
  useEffect(() => {
    const timeout = setTimeout(onEnd, 3000);
    return () => clearTimeout(timeout);
  }, [onEnd]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-center justify-center gap-2 py-3 px-4 bg-red-500/10 border border-red-500/20 rounded-xl mx-auto w-fit"
    >
      <motion.div
        className="w-3 h-3 rounded-full bg-red-500"
        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <span className="text-xs text-red-400 font-medium">Listening...</span>
    </motion.div>
  );
}

export function AssistantPanel({ isOpen, onClose }: AssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setShowScrollDown(!isNearBottom);
  };

  const addMessage = (content: string, isUser: boolean): Message => {
    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      content,
      isUser,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const simulateAIResponse = (_userMessage: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage("The AI advisory service is not currently connected. Once the advisory service is running, I'll be able to provide real-time portfolio analysis, investment recommendations, and market insights.", false);
    }, 1000);
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    addMessage(trimmed, true);
    setInput("");
    simulateAIResponse(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (_action: string, label: string) => {
    if (isTyping) return;

    addMessage(label, true);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      addMessage("The AI advisory service is not currently connected. Once the advisory service is running, I'll be able to provide real-time portfolio analysis, investment recommendations, and market insights.", false);
    }, 1000);
  };

  const handleRecordingEnd = useCallback(() => {
    setIsRecording(false);
    addMessage("[Voice input recorded — transcription not yet connected]", true);
    simulateAIResponse("voice");
  }, []);

  const handleMicToggle = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
    }
  };

  const panelVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      y: 40,
      scale: 0.96,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
          />

          {/* Panel */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-24 right-6 z-50 w-[400px] max-h-[600px] flex flex-col rounded-2xl overflow-hidden"
            style={{
              background:
                "linear-gradient(180deg, rgba(11,29,58,0.97) 0%, rgba(5,13,31,0.98) 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(26,86,219,0.2)",
              boxShadow:
                "0 0 40px rgba(26,86,219,0.15), 0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gold-400/15 border border-gold-400/25 flex items-center justify-center">
                    <Sparkles size={16} className="text-gold-400" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-navy-500" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    AI Investment Assistant
                  </h3>
                  <p className="text-[11px] text-emerald-400/80">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleMicToggle}
                  className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                  aria-label="Toggle voice input"
                >
                  {isRecording ? (
                    <MicOff size={16} className="text-red-400" />
                  ) : (
                    <Mic size={16} />
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                  aria-label="Close panel"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-[200px] max-h-[400px]"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(255,255,255,0.1) transparent",
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  width: 4px;
                }
                div::-webkit-scrollbar-track {
                  background: transparent;
                }
                div::-webkit-scrollbar-thumb {
                  background: rgba(255, 255, 255, 0.1);
                  border-radius: 2px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background: rgba(255, 255, 255, 0.2);
                }
              `}</style>

              {messages.map((msg, idx) => (
                <AssistantMessage
                  key={msg.id}
                  content={msg.content}
                  isUser={msg.isUser}
                  timestamp={msg.timestamp}
                  index={idx}
                />
              ))}

              <AnimatePresence>
                {isTyping && <TypingIndicator />}
                {isRecording && !isTyping && (
                  <RecordingIndicator onEnd={handleRecordingEnd} />
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Scroll to bottom */}
            <AnimatePresence>
              {showScrollDown && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={scrollToBottom}
                  className="absolute bottom-[140px] left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-navy-500/90 border border-white/10 flex items-center justify-center shadow-glass cursor-pointer hover:bg-navy-500 transition-colors z-10"
                >
                  <ChevronDown size={14} className="text-white/60" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Quick Actions */}
            <div className="px-4 pb-2">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {quickActions.map((qa) => (
                  <button
                    key={qa.action}
                    onClick={() => handleQuickAction(qa.action, qa.label)}
                    disabled={isTyping}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/8 text-white/60 hover:text-white hover:bg-white/10 hover:border-blue-500/30 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <span className="mr-1.5">{qa.icon}</span>
                    {qa.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus-within:border-blue-500/40 transition-colors">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your investments..."
                  disabled={isTyping}
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="p-2 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  aria-label="Send message"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
