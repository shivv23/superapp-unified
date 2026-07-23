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
} from "lucide-react";
import { AssistantMessage } from "./assistant-message";
import { formatCurrency, formatPercent } from "@/lib/utils";

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

interface Holding {
  id: string;
  symbol: string;
  name: string;
  type: string;
  quantity: number;
  avg_price: number;
  ltp: number;
  invested_value: number;
  current_value: number;
  pnl: number;
  returns_pct: number;
  day_change_pct: number;
}

interface PortfolioSummary {
  total_invested: number;
  current_value: number;
  overall_pnl: number;
  day_change: number;
  day_change_pct: number;
  total_returns_pct: number;
}

const quickActions = [
  { label: "Analyze my portfolio", icon: "📊", action: "portfolio" },
  { label: "Tax saving tips", icon: "🧾", action: "tax" },
  { label: "What to invest in?", icon: "💰", action: "invest" },
  { label: "Risk analysis", icon: "🛡️", action: "risk" },
  { label: "About REITs", icon: "🏢", action: "reit" },
  { label: "US stocks?", icon: "🌍", action: "us" },
];

const welcomeMessage: Message = {
  id: "welcome",
  content:
    "Hello! I'm your **AI Investment Assistant** powered by SuperApp Intelligence.\n\nI can analyze your portfolio in real-time and help with:\n• 📊 Portfolio analysis & performance tracking\n• 🧾 Tax-loss harvesting & LTCG optimization\n• 💰 Personalized investment recommendations\n• 🛡️ Risk assessment & rebalancing suggestions\n• 🌍 US stocks & fractional investing\n\n**Tip:** I have access to your live portfolio data. Try asking \"How's my portfolio?\" to get started!",
  isUser: false,
  timestamp: new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }),
};

function generateResponse(userMessage: string, holdings: Holding[], summary: PortfolioSummary | null): string {
  const msg = userMessage.toLowerCase();

  if (msg.includes("portfolio") || msg.includes("holdings") || msg.includes("invested") || msg.includes("how") && msg.includes("my")) {
    if (!summary || holdings.length === 0) {
      return "I couldn't fetch your portfolio data. Make sure the portfolio service is running on port 8002. Once connected, I'll provide real-time analysis!";
    }
    const topGainers = [...holdings].sort((a, b) => b.returns_pct - a.returns_pct).slice(0, 3);
    const topLosers = [...holdings].sort((a, b) => a.returns_pct - b.returns_pct).slice(0, 3);
    const losers = topLosers.filter(h => h.pnl < 0);

    let response = `📊 **Your Portfolio Summary**\n\n`;
    response += `**Total Invested:** ${formatCurrency(summary.total_invested)}\n`;
    response += `**Current Value:** ${formatCurrency(summary.current_value)}\n`;
    response += `**Overall P&L:** ${summary.overall_pnl >= 0 ? "+" : ""}${formatCurrency(summary.overall_pnl)} (${formatPercent(summary.total_returns_pct)})\n`;
    response += `**Day Change:** ${summary.day_change >= 0 ? "+" : ""}${formatCurrency(summary.day_change)}\n\n`;
    response += `**Top Gainers:**\n`;
    topGainers.forEach(h => {
      response += `• ${h.name}: ${formatCurrency(h.pnl)} (${formatPercent(h.returns_pct)})\n`;
    });
    if (losers.length > 0) {
      response += `\n**Needs Attention:**\n`;
      losers.forEach(h => {
        response += `• ${h.name}: ${formatCurrency(h.pnl)} (${formatPercent(h.returns_pct)})\n`;
      });
    } else {
      response += `\n✅ **All positions are in profit!** Great portfolio management.\n`;
    }
    response += `\n💡 **Tip:** Your portfolio is diversified across ${new Set(holdings.map(h => h.type)).size} asset classes. Consider adding international exposure for better risk-adjusted returns.`;
    return response;
  }

  if (msg.includes("tax") || msg.includes("ltcg") || msg.includes("stcg") || msg.includes("harvest")) {
    let response = `🧾 **Tax-Saving Opportunities**\n\n`;
    response += `**LTCG Exemption:** ₹46,600 remaining (out of ₹1,25,000 annual limit)\n→ You can book ₹46,600 in long-term gains tax-free this year\n\n`;
    response += `**Harvestable Losses:** Checking your holdings...\n`;
    const losers = holdings.filter(h => h.pnl < 0);
    if (losers.length > 0) {
      response += `Found ${losers.length} positions in loss:\n`;
      losers.forEach(h => {
        response += `• ${h.name}: Book loss of ${formatCurrency(Math.abs(h.pnl))} → Save ~${formatCurrency(Math.abs(h.pnl) * 0.1)} in tax\n`;
      });
    } else {
      response += `No positions currently in loss — all holdings are profitable! 🎉\n`;
    }
    response += `\n**Smart Moves:**\n`;
    response += `1. Your SGB 2028 qualifies for tax exemption if held till maturity\n`;
    response += `2. Consider SIP in ELSS for 80C deduction (up to ₹1.5L)\n`;
    response += `3. Switch regular MF plans to direct to save 0.5-1% in expense ratios`;
    return response;
  }

  if (msg.includes("invest") || msg.includes("buy") || msg.includes("recommend") || msg.includes("suggest")) {
    const types = [...new Set(holdings.map(h => h.type))];
    let response = `💰 **Investment Recommendations**\n\n`;
    response += `Based on your current portfolio (${types.join(", ")}):\n\n`;

    const hasIntl = holdings.some(h => h.symbol.includes("US") || h.type === "us_stock");
    if (!hasIntl) {
      response += `🌍 **Missing International Exposure**\nConsider: Motilal Oswal S&P 500 ETF or Nasdaq 100 ETF (3-5% of portfolio)\n\n`;
    }

    const equityVal = holdings.filter(h => h.type === "equity").reduce((s, h) => s + h.current_value, 0);
    const totalVal = holdings.reduce((s, h) => s + h.current_value, 0);
    const equityPct = totalVal > 0 ? (equityVal / totalVal) * 100 : 0;

    if (equityPct > 60) {
      response += `⚖️ **Rebalancing Suggestion**\nEquity exposure is ${equityPct.toFixed(1)}%. Consider booking some profits and moving to debt/bonds for stability.\n\n`;
    }

    response += `**Top Opportunities:**\n`;
    response += `1. **Nifty Next 50 Index Fund** — Low-cost diversification into emerging large-caps\n`;
    response += `2. **PPF** — ₹1.5L annual lock-in with 7.1% tax-free returns\n`;
    response += `3. **US Stocks** — Try fractional shares starting from just ₹100`;

    return response;
  }

  if (msg.includes("risk") || msg.includes("safe") || msg.includes("volatile") || msg.includes("conservative")) {
    const equityVal = holdings.filter(h => h.type === "equity" || h.type === "mf").reduce((s, h) => s + h.current_value, 0);
    const debtVal = holdings.filter(h => h.type === "bond").reduce((s, h) => s + h.current_value, 0);
    const altVal = holdings.filter(h => !["equity", "mf", "bond"].includes(h.type)).reduce((s, h) => s + h.current_value, 0);
    const total = equityVal + debtVal + altVal;

    let response = `🛡️ **Portfolio Risk Analysis**\n\n`;
    response += `**Risk Score:** 52/100 (Moderate)\n`;
    response += `**Risk Level:** Balanced Growth\n\n`;
    response += `**Asset Mix:**\n`;
    if (total > 0) {
      response += `• Equity + MF: ${((equityVal / total) * 100).toFixed(1)}% → Growth engine (higher volatility)\n`;
      response += `• Debt: ${((debtVal / total) * 100).toFixed(1)}% → Stability anchor\n`;
      response += `• Alternatives: ${((altVal / total) * 100).toFixed(1)}% → Inflation hedge & income\n`;
    }
    response += `\n**Diversification:** ${Math.min(holdings.length * 0.7, 9).toFixed(0)}/10 — Spread across ${new Set(holdings.map(h => h.type)).size} asset classes\n`;
    response += `**Concentration:** Low — No single holding dominates\n\n`;
    response += `💡 Your portfolio is well-balanced for a moderate investor. As you age, consider gradually increasing debt allocation.`;
    return response;
  }

  if (msg.includes("reit") || msg.includes("invit") || msg.includes("real estate") || msg.includes("rent")) {
    const reits = holdings.filter(h => h.type === "reit" || h.type === "invit");
    let response = `🏢 **REITs & InvITs Explained**\n\n`;
    response += `**REITs** (Real Estate Investment Trusts) let you invest in commercial real estate without buying property. You earn returns through:\n`;
    response += `• 🏢 Rental income distributions (typically 90% of income)\n`;
    response += `• 📈 Capital appreciation as property values rise\n\n`;
    response += `**Your REIT/InvIT Holdings:**\n`;
    if (reits.length > 0) {
      reits.forEach(h => {
        response += `• ${h.name}: ${formatCurrency(h.current_value)} (${formatPercent(h.returns_pct)})\n`;
      });
    } else {
      response += `You don't hold any REITs/InvITs yet. Consider adding Embassy Office Parks or Brookfield India REIT for steady rental income.\n`;
    }
    response += `\n**Benefits:**\n• Monthly/quarterly distributions\n• Portfolio diversification away from stocks\n• Inflation hedge (rents increase with inflation)\n• SEBI regulated with minimum 80% in income-generating assets`;
    return response;
  }

  if (msg.includes("market") || msg.includes("nifty") || msg.includes("sensex") || msg.includes("crash") || msg.includes("rally")) {
    return `📈 **Market Overview**\n\n**NIFTY 50:** ₹24,650.50 (+0.64%)\n**SENSEX:** ₹81,245.30 (+0.58%)\n**India VIX:** 13.42 (Low volatility)\n\n**Key Themes Today:**\n• IT sector leading with +1.2% on strong TCS results\n• Banking stocks steady ahead of RBI policy meet\n• Global cues positive as US markets closed higher\n• FII inflows continue for 5th consecutive session\n\n💡 **Historical Insight:** When NIFTY drops >5% in a month, it has recovered 100% of the time within 6 months. Stay invested through volatility.`;
  }

  if (msg.includes("us") || msg.includes("america") || msg.includes("apple") || msg.includes("nvidia") || msg.includes("fractional")) {
    return `🌍 **US Stocks & Fractional Investing**\n\nYou can invest in US stocks starting from just ₹100 through fractional shares!\n\n**Popular Picks:**\n• 🍎 **Apple (AAPL)** — $189.84 — The world's most valuable company\n• 🤖 **NVIDIA (NVDA)** — $131.29 — AI chip leader, +170% YTD\n• 💻 **Microsoft (MSFT)** — $422.86 — Cloud + AI powerhouse\n• 🛒 **Amazon (AMZN)** — $186.27 — E-commerce + AWS cloud\n\n**Benefits:**\n• Diversify beyond Indian markets\n• hedge against INR depreciation\n• Access to global innovation leaders\n• Start with as little as ₹100\n\n**Tax Note:** US stock gains are taxed as per your income slab. DTAA treaty prevents double taxation.\n\nVisit the **US Stocks** section in the sidebar to start investing!`;
  }

  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg.includes("help")) {
    return `Hey! 👋 I'm here to help with your investments.\n\nTry asking me:\n• \"How's my portfolio doing?\"\n• \"What are my tax-saving options?\"\n• \"Should I invest in US stocks?\"\n• \"Analyze my portfolio risk\"\n• \"What are REITs?\"`;
  }

  return `I can help you with portfolio analysis, investment recommendations, tax planning, risk assessment, and more.\n\n**Try asking about:**\n• 📊 Your portfolio performance\n• 🧾 Tax-saving strategies\n• 💰 What to invest in next\n• 🛡️ Portfolio risk analysis\n• 🏢 REITs and alternative investments\n• 🌍 US stocks and fractional investing`;
}

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
      <div className="bg-white/5 border border-white/[0.08] rounded-2xl rounded-tl-sm px-4 py-3">
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
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [hRes, sRes] = await Promise.allSettled([
          fetch("http://localhost:8002/api/v1/portfolio/holdings").then(r => r.json()),
          fetch("http://localhost:8002/api/v1/portfolio/summary").then(r => r.json()),
        ]);
        if (hRes.status === "fulfilled" && hRes.value?.data) setHoldings(hRes.value.data);
        if (sRes.status === "fulfilled" && sRes.value?.data) setSummary(sRes.value.data);
      } catch {}
    }
    if (isOpen) loadData();
  }, [isOpen]);

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

  const simulateAIResponse = (userMessage: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const response = generateResponse(userMessage, holdings, summary);
      addMessage(response, false);
    }, 800 + Math.random() * 700);
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
    simulateAIResponse(label);
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
          />

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
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
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
                  <p className="text-[11px] text-emerald-400/80">Online{holdings.length > 0 ? ` • ${holdings.length} holdings loaded` : ""}</p>
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

            <div className="px-4 pb-2">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {quickActions.map((qa) => (
                  <button
                    key={qa.action}
                    onClick={() => handleQuickAction(qa.action, qa.label)}
                    disabled={isTyping}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/10 hover:border-blue-500/30 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    <span className="mr-1.5">{qa.icon}</span>
                    {qa.label}
                  </button>
                ))}
              </div>
            </div>

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
