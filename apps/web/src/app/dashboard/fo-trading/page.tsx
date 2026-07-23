"use client";
import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog } from "@/components/ui/dialog";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  TrendingDown,
  Shield,
  ShieldOff,
  Zap,
  Target,
  AlertTriangle,
  Clock,
  Lock,
  Unlock,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Settings,
  Activity,
} from "lucide-react";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

type Tab = "options-chain" | "trailing-sl" | "kill-switch";

interface OptionRow {
  strike: number;
  callOI: string;
  callChgOI: string;
  callIV: string;
  callLTP: number;
  putLTP: number;
  putIV: string;
  putChgOI: string;
  putOI: string;
}

interface Position {
  symbol: string;
  type: string;
  qty: number;
  entry: number;
  ltp: number;
  pnl: number;
  stopLoss: number | null;
  trailActive: boolean;
  trailDelta: number;
}

interface Strategy {
  name: string;
  legs: string;
  maxProfit: string;
  maxLoss: string;
  breakeven?: string;
}

const optionsChain: OptionRow[] = [
  { strike: 24200, callOI: "12,45,600", callChgOI: "+32,100", callIV: "14.2%", callLTP: 512.30, putLTP: 68.40, putIV: "15.8%", putChgOI: "-18,200", putOI: "8,92,300" },
  { strike: 24400, callOI: "10,82,400", callChgOI: "+28,500", callIV: "13.8%", callLTP: 345.75, putLTP: 102.60, putIV: "14.5%", putChgOI: "-22,400", putOI: "11,24,500" },
  { strike: 24600, callOI: "9,15,200", callChgOI: "+45,800", callIV: "13.2%", callLTP: 198.40, putLTP: 178.25, putIV: "13.9%", putChgOI: "+15,600", putOI: "13,56,800" },
  { strike: 24800, callOI: "7,82,600", callChgOI: "-12,300", callIV: "14.1%", callLTP: 95.60, putLTP: 312.80, putIV: "14.8%", putChgOI: "+28,900", putOI: "10,45,200" },
  { strike: 25000, callOI: "6,24,800", callChgOI: "-8,600", callIV: "15.3%", callLTP: 42.25, putLTP: 498.50, putIV: "16.2%", putChgOI: "+35,200", putOI: "8,72,400" },
  { strike: 25200, callOI: "4,98,300", callChgOI: "-5,200", callIV: "16.8%", callLTP: 18.90, putLTP: 715.20, putIV: "17.5%", putChgOI: "+22,100", putOI: "6,34,800" },
];

const strategies: Strategy[] = [
  { name: "Bull Call Spread", legs: "Buy 24600 CE + Sell 24800 CE", maxProfit: "₹14,735", maxLoss: "₹7,365", breakeven: "24,673" },
  { name: "Iron Condor", legs: "Sell 24400 CE + Buy 24200 CE + Sell 24800 PE + Buy 25000 PE", maxProfit: "₹8,420", maxLoss: "₹11,580" },
  { name: "Straddle", legs: "Buy 24600 CE + Buy 24600 PE", maxProfit: "Unlimited", maxLoss: "₹25,185", breakeven: "24,348 / 24,852" },
];

const initialPositions: Position[] = [
  { symbol: "NIFTY", type: "24600CE", qty: 50, entry: 185.40, ltp: 198.25, pnl: 6425, stopLoss: 165.0, trailActive: true, trailDelta: 12.5 },
  { symbol: "BANKNIFTY", type: "51200PE", qty: 25, entry: 312.80, ltp: 287.5, pnl: -6325, stopLoss: 345.0, trailActive: true, trailDelta: -32.2 },
  { symbol: "NIFTY", type: "25000CE", qty: 75, entry: 45.2, ltp: 42.8, pnl: -1800, stopLoss: null, trailActive: false, trailDelta: 0 },
  { symbol: "RELIANCE", type: "FUT", qty: 100, entry: 2498.0, ltp: 2512.35, pnl: 1435, stopLoss: 2450.0, trailActive: true, trailDelta: 62.35 },
  { symbol: "INFY", type: "1500CE", qty: 200, entry: 28.5, ltp: 35.2, pnl: 13400, stopLoss: 25.0, trailActive: true, trailDelta: 10.2 },
];

const greeksData = [
  { name: "Delta", value: "0.52", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { name: "Gamma", value: "0.00034", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { name: "Theta", value: "-12.85", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  { name: "Vega", value: "8.42", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { name: "Rho", value: "3.21", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
];

const lockDurations = [
  { label: "End of Day", duration: "Until 3:30 PM", icon: Clock, hours: 5 },
  { label: "24 Hours", duration: "24 hours", icon: Clock, hours: 24 },
  { label: "48 Hours", duration: "48 hours", icon: Clock, hours: 48 },
  { label: "1 Week", duration: "7 days", icon: Clock, hours: 168 },
];

const Spot = 24650.5;

function getCallBg(strike: number): string {
  if (strike < Spot) return "bg-blue-500/5";
  if (strike === 24600) return "bg-blue-500/10 border-x border-blue-500/20";
  return "";
}

function getPutBg(strike: number): string {
  if (strike > Spot) return "bg-blue-500/5";
  if (strike === 24600) return "bg-blue-500/10 border-x border-blue-500/20";
  return "";
}

function getStrikeBg(strike: number): string {
  if (strike === 24600) return "bg-blue-500/10 border-x-2 border-blue-500/30 text-blue-400 font-bold";
  return "bg-white/5 font-semibold";
}

function getChgColor(val: string): string {
  return val.startsWith("+") ? "text-emerald-400" : "text-red-400";
}

function getPnlColor(val: number): string {
  return val >= 0 ? "text-emerald-400" : "text-red-400";
}

export default function FOTradingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("options-chain");
  const [selectedStrike, setSelectedStrike] = useState<number>(24600);
  const [selectedSide, setSelectedSide] = useState<"CE" | "PE">("CE");
  const [killSwitchOn, setKillSwitchOn] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [positions, setPositions] = useState<Position[]>(initialPositions);
  const [lockStartTime] = useState("Jul 23, 2026 10:45 AM");
  const [lockEndTime] = useState("Jul 23, 2026 3:30 PM");
  const [timeRemaining] = useState("6h 15m");
  const [lockProgress] = useState(55);
  const [lockCount] = useState(3);
  const [avgDuration] = useState("4.2 hours");
  const [lossPrevented] = useState("₹45,000");

  const toggleTrail = useCallback((index: number) => {
    setPositions((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, trailActive: !p.trailActive } : p
      )
    );
  }, []);

  const handleKillSwitchConfirm = useCallback(() => {
    setKillSwitchOn(true);
    setShowConfirmDialog(false);
  }, []);

  const handleKillSwitchDisable = useCallback(() => {
    setKillSwitchOn(false);
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "options-chain", label: "Options Chain", icon: <Activity className="h-4 w-4" /> },
    { id: "trailing-sl", label: "Trailing Stop Loss", icon: <Target className="h-4 w-4" /> },
    { id: "kill-switch", label: "Kill Switch", icon: <Shield className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
        {/* Header */}
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">F&amp;O Trading Terminal</h1>
            <p className="text-white/50 text-sm mt-1">Advanced derivatives trading with risk management</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="success" className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Market Open
            </Badge>
            <Badge variant={killSwitchOn ? "danger" : "default"} className="flex items-center gap-1.5">
              {killSwitchOn ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              Kill Switch: {killSwitchOn ? "ON" : "OFF"}
            </Badge>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div variants={fadeIn}>
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* TAB 1: Options Chain + Greeks */}
          {activeTab === "options-chain" && (
            <motion.div
              key="options-chain"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Underlying Info Bar */}
              <Card variant="glass" className="p-4">
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-400" />
                    <span className="text-lg font-bold text-white">NIFTY 50</span>
                  </div>
                  <div className="h-6 w-px bg-white/10 hidden sm:block" />
                  <div>
                    <span className="text-white/50 text-xs">Spot</span>
                    <p className="text-white font-semibold">₹24,650.50</p>
                  </div>
                  <div>
                    <span className="text-white/50 text-xs">Change</span>
                    <p className="text-emerald-400 font-semibold flex items-center gap-1">
                      <ArrowUp className="h-3 w-3" />
                      +156.30 (+0.64%)
                    </p>
                  </div>
                  <div className="h-6 w-px bg-white/10 hidden sm:block" />
                  <div>
                    <span className="text-white/50 text-xs">Expiry</span>
                    <p className="text-white font-semibold">Jul 31, 2026</p>
                  </div>
                </div>
              </Card>

              {/* Options Chain Table */}
              <Card variant="glass" className="p-0 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5">
                  <CardTitle className="text-base">Options Chain</CardTitle>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-3 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider" colSpan={4}>
                          <span className="text-blue-400">CALLS</span>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-white/40 uppercase tracking-wider min-w-[90px]">
                          Strike
                        </th>
                        <th className="px-3 py-3 text-right text-xs font-semibold text-white/40 uppercase tracking-wider" colSpan={4}>
                          <span className="text-amber-400">PUTS</span>
                        </th>
                      </tr>
                      <tr className="border-b border-white/5">
                        <th className="px-3 py-2 text-right text-[11px] font-medium text-white/30">OI</th>
                        <th className="px-3 py-2 text-right text-[11px] font-medium text-white/30">Chg OI</th>
                        <th className="px-3 py-2 text-right text-[11px] font-medium text-white/30">IV</th>
                        <th className="px-3 py-2 text-right text-[11px] font-medium text-white/30">LTP</th>
                        <th className="px-4 py-2 text-center text-[11px] font-medium text-white/30" />
                        <th className="px-3 py-2 text-left text-[11px] font-medium text-white/30">LTP</th>
                        <th className="px-3 py-2 text-left text-[11px] font-medium text-white/30">IV</th>
                        <th className="px-3 py-2 text-left text-[11px] font-medium text-white/30">Chg OI</th>
                        <th className="px-3 py-2 text-left text-[11px] font-medium text-white/30">OI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionsChain.map((row) => {
                        const isSelected = row.strike === selectedStrike;
                        const callBg = getCallBg(row.strike);
                        const putBg = getPutBg(row.strike);
                        const strikeBg = getStrikeBg(row.strike);

                        return (
                          <tr
                            key={row.strike}
                            className={`border-b border-white/5 transition-colors hover:bg-white/[0.02] ${
                              isSelected ? "ring-1 ring-blue-500/30" : ""
                            }`}
                          >
                            <td className={`px-3 py-2.5 text-right font-mono text-white/70 ${callBg}`}>{row.callOI}</td>
                            <td className={`px-3 py-2.5 text-right font-mono text-xs ${callBg} ${getChgColor(row.callChgOI)}`}>{row.callChgOI}</td>
                            <td className={`px-3 py-2.5 text-right font-mono text-white/60 text-xs ${callBg}`}>{row.callIV}</td>
                            <td className={`px-3 py-2.5 text-right font-mono font-semibold text-white ${callBg}`}>
                              <button
                                onClick={() => { setSelectedStrike(row.strike); setSelectedSide("CE"); }}
                                className={`hover:text-blue-400 transition-colors ${isSelected && selectedSide === "CE" ? "text-blue-400" : ""}`}
                              >
                                {formatCurrency(row.callLTP)}
                              </button>
                            </td>
                            <td className={`px-4 py-2.5 text-center ${strikeBg}`}>
                              <button
                                onClick={() => setSelectedStrike(row.strike)}
                                className="hover:text-blue-300 transition-colors"
                              >
                                {row.strike.toLocaleString("en-IN")}
                              </button>
                            </td>
                            <td className={`px-3 py-2.5 text-left font-mono font-semibold text-white ${putBg}`}>
                              <button
                                onClick={() => { setSelectedStrike(row.strike); setSelectedSide("PE"); }}
                                className={`hover:text-amber-400 transition-colors ${isSelected && selectedSide === "PE" ? "text-amber-400" : ""}`}
                              >
                                {formatCurrency(row.putLTP)}
                              </button>
                            </td>
                            <td className={`px-3 py-2.5 text-left font-mono text-white/60 text-xs ${putBg}`}>{row.putIV}</td>
                            <td className={`px-3 py-2.5 text-left font-mono text-xs ${putBg} ${getChgColor(row.putChgOI)}`}>{row.putChgOI}</td>
                            <td className={`px-3 py-2.5 text-left font-mono text-white/70 ${putBg}`}>{row.putOI}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Greeks Display */}
              <Card variant="glass" className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-base">Selected Option Greeks</CardTitle>
                  <Badge variant="info">{selectedStrike} {selectedSide}</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {greeksData.map((greek) => (
                    <div key={greek.name} className={`${greek.bg} border ${greek.border} rounded-xl p-3 text-center`}>
                      <p className="text-white/40 text-xs mb-1">{greek.name}</p>
                      <p className={`${greek.color} font-mono font-bold text-lg`}>{greek.value}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Strategy Builder */}
              <Card variant="glass" className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="h-5 w-5 text-blue-400" />
                  <CardTitle className="text-base">Strategy Builder</CardTitle>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {strategies.map((strategy) => (
                    <div key={strategy.name} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
                      <h4 className="text-white font-semibold mb-2">{strategy.name}</h4>
                      <p className="text-white/40 text-xs mb-3 leading-relaxed">{strategy.legs}</p>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-white/40">Max Profit</span>
                          <span className="text-emerald-400 font-semibold">{strategy.maxProfit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40">Max Loss</span>
                          <span className="text-red-400 font-semibold">{strategy.maxLoss}</span>
                        </div>
                        {strategy.breakeven && (
                          <div className="flex justify-between">
                            <span className="text-white/40">Breakeven</span>
                            <span className="text-white/70 font-medium">{strategy.breakeven}</span>
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" className="w-full mt-3 text-xs" size="sm">
                        Place Order
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* TAB 2: Trailing Stop Loss */}
          {activeTab === "trailing-sl" && (
            <motion.div
              key="trailing-sl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Positions Table */}
              <Card variant="glass" className="p-0 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5">
                  <CardTitle className="text-base">F&amp;O Positions</CardTitle>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Symbol</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">Entry</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">LTP</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">P&L</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">Stop Loss</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-white/40 uppercase tracking-wider">Trail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((pos, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 text-white font-semibold">{pos.symbol}</td>
                          <td className="px-4 py-3">
                            <Badge variant={pos.type.includes("CE") ? "info" : pos.type === "FUT" ? "gold" : "warning"} className="text-xs">
                              {pos.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-white/70">{pos.qty}</td>
                          <td className="px-4 py-3 text-right font-mono text-white/60">{formatCurrency(pos.entry)}</td>
                          <td className="px-4 py-3 text-right font-mono text-white font-medium">{formatCurrency(pos.ltp)}</td>
                          <td className={`px-4 py-3 text-right font-mono font-semibold ${getPnlColor(pos.pnl)}`}>
                            {pos.pnl >= 0 ? "+" : ""}{formatCurrency(pos.pnl)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-white/60">
                            {pos.stopLoss !== null ? formatCurrency(pos.stopLoss) : <span className="text-white/30">Not Set</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {pos.stopLoss !== null ? (
                              <button
                                onClick={() => toggleTrail(idx)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                  pos.trailActive
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                    : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10"
                                }`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${pos.trailActive ? "bg-emerald-400 animate-pulse" : "bg-white/20"}`} />
                                {pos.trailActive ? `Active (${pos.trailDelta >= 0 ? "+" : ""}₹${Math.abs(pos.trailDelta).toFixed(1)})` : "Enable"}
                              </button>
                            ) : (
                              <span className="text-white/20 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Trailing SL Configuration */}
              <Card variant="glass" className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="h-5 w-5 text-blue-400" />
                  <CardTitle className="text-base">Trailing SL Configuration</CardTitle>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {positions.filter((p) => p.stopLoss !== null).map((pos, idx) => (
                    <div key={idx} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-white font-semibold">{pos.symbol}</span>
                          <span className="text-white/40 ml-2 text-sm">{pos.type}</span>
                        </div>
                        <Badge variant={pos.trailActive ? "success" : "default"}>
                          {pos.trailActive ? "Trailing" : "Static"}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-white/40">Current SL</span>
                          <span className="text-white font-mono">{formatCurrency(pos.stopLoss!)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40">Trail by</span>
                          <span className="text-white/60 font-mono">₹5 or 2%</span>
                        </div>
                        {pos.trailActive && (
                          <div className="mt-2 p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                            <p className="text-emerald-400/80 text-[11px]">
                              Trail by ₹5 from highest price. Current trail: ₹{Math.abs(pos.trailDelta).toFixed(1)} {pos.trailDelta >= 0 ? "above" : "below"} SL
                            </p>
                          </div>
                        )}
                      </div>
                      <Button
                        variant={pos.trailActive ? "danger" : "secondary"}
                        className="w-full mt-3"
                        size="sm"
                        onClick={() => toggleTrail(idx)}
                      >
                        {pos.trailActive ? "Disable Trail" : "Enable Trail"}
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* How It Works */}
              <Card variant="glass" className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  <CardTitle className="text-base">How Trailing Stop Loss Works</CardTitle>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <ArrowUp className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-sm">Price Rising</h4>
                        <p className="text-white/40 text-xs">Stop loss follows the price up</p>
                      </div>
                    </div>
                    <div className="space-y-2 font-mono text-xs">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <ArrowUp className="h-3 w-3" />
                        <span>Price: ₹185 → ₹195 → ₹205</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-400">
                        <ArrowUp className="h-3 w-3" />
                        <span>SL: ₹165 → ₹175 → ₹185</span>
                      </div>
                      <div className="text-white/30 mt-1">As price rises, your stop loss rises with it.</div>
                    </div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <ArrowDown className="h-5 w-5 text-red-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-sm">Price Falling</h4>
                        <p className="text-white/40 text-xs">Stop loss stays at last highest point</p>
                      </div>
                    </div>
                    <div className="space-y-2 font-mono text-xs">
                      <div className="flex items-center gap-2 text-red-400">
                        <ArrowDown className="h-3 w-3" />
                        <span>Price: ₹205 → ₹198 → ₹190</span>
                      </div>
                      <div className="flex items-center gap-2 text-amber-400">
                        <span className="h-3 w-3 flex items-center justify-center">—</span>
                        <span>SL: ₹185 → ₹185 → ₹185 (locked)</span>
                      </div>
                      <div className="text-white/30 mt-1">If price drops, stop loss stays at the last highest point.</div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* TAB 3: Kill Switch */}
          {activeTab === "kill-switch" && (
            <motion.div
              key="kill-switch"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Kill Switch Control */}
              <Card
                variant="gradient"
                className={`p-6 border-2 transition-all duration-300 ${
                  killSwitchOn
                    ? "border-red-500/40 shadow-lg shadow-red-500/10"
                    : "border-white/5"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        killSwitchOn
                          ? "bg-red-500/20 border border-red-500/30"
                          : "bg-white/10 border border-white/10"
                      }`}
                    >
                      {killSwitchOn ? (
                        <Lock className="h-7 w-7 text-red-400" />
                      ) : (
                        <Unlock className="h-7 w-7 text-white/60" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">F&amp;O Trading</h3>
                      <p className={`text-sm mt-0.5 ${killSwitchOn ? "text-red-400" : "text-emerald-400"}`}>
                        {killSwitchOn ? "Trading is LOCKED" : "Trading is currently ACTIVE"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (killSwitchOn) {
                        handleKillSwitchDisable();
                      } else {
                        setShowConfirmDialog(true);
                      }
                    }}
                    className={`relative inline-flex h-12 w-24 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ${
                      killSwitchOn
                        ? "bg-red-500 focus:ring-red-500"
                        : "bg-white/10 focus:ring-white/30"
                    }`}
                  >
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg transition-all duration-300 ${
                        killSwitchOn ? "translate-x-13" : "translate-x-2"
                      }`}
                    >
                      {killSwitchOn ? (
                        <Lock className="h-4 w-4 text-red-500" />
                      ) : (
                        <Unlock className="h-4 w-4 text-white/60" />
                      )}
                    </span>
                  </button>
                </div>
                {killSwitchOn && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                  >
                    <p className="text-red-400 text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Trading is locked for selected duration. You cannot place new F&amp;O orders.
                    </p>
                  </motion.div>
                )}
              </Card>

              {/* Self-Exclusion Options */}
              {!killSwitchOn && (
                <Card variant="glass" className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-blue-400" />
                    <CardTitle className="text-base">Self-Exclusion Duration</CardTitle>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {lockDurations.map((dur) => {
                      const Icon = dur.icon;
                      const isSelected = selectedDuration === dur.label;
                      return (
                        <button
                          key={dur.label}
                          onClick={() => setSelectedDuration(dur.label)}
                          className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                            isSelected
                              ? "bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20"
                              : "bg-white/[0.03] border-white/5 hover:border-white/10 hover:bg-white/[0.05]"
                          }`}
                        >
                          <Icon className={`h-5 w-5 mb-2 ${isSelected ? "text-blue-400" : "text-white/40"}`} />
                          <h4 className={`font-semibold text-sm ${isSelected ? "text-blue-400" : "text-white"}`}>{dur.label}</h4>
                          <p className="text-white/40 text-xs mt-0.5">{dur.duration}</p>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              )}

              {/* Why This Matters */}
              <Card variant="glass" className="p-5">
                <CardTitle className="text-base mb-4">Why Kill Switch Matters</CardTitle>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Shield className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">Prevents Revenge Trading</h4>
                      <p className="text-white/40 text-xs mt-1 leading-relaxed">Blocks impulsive trades after losses to protect your capital.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-4">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">Cooling-Off Period</h4>
                      <p className="text-white/40 text-xs mt-1 leading-relaxed">Forces a pause for better, more rational trading decisions.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <TrendingDown className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm">Trusted by Traders</h4>
                      <p className="text-white/40 text-xs mt-1 leading-relaxed">Used by 12,000+ traders on SuperApp to manage risk.</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Active Lock Status */}
              {killSwitchOn && (
                <>
                  <Card variant="glass" className="p-5 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-4">
                      <Lock className="h-5 w-5 text-red-400" />
                      <CardTitle className="text-base">Active Lock Status</CardTitle>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                          <p className="text-white/40 text-xs mb-1">Trading Locked Since</p>
                          <p className="text-white font-semibold text-sm">{lockStartTime}</p>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                          <p className="text-white/40 text-xs mb-1">Unlocks At</p>
                          <p className="text-white font-semibold text-sm">{lockEndTime}</p>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                          <p className="text-white/40 text-xs mb-1">Time Remaining</p>
                          <p className="text-red-400 font-bold text-sm">{timeRemaining}</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/40 text-xs">Lock Progress</span>
                          <span className="text-white/60 text-xs font-mono">{lockProgress}%</span>
                        </div>
                        <Progress value={lockProgress} max={100} color="red" showLabel={false} />
                      </div>
                      <Button
                        variant="danger"
                        className="w-full sm:w-auto"
                        onClick={handleKillSwitchDisable}
                      >
                        <Unlock className="h-4 w-4 mr-2" />
                        Unlock Early
                      </Button>
                    </div>
                  </Card>

                  {/* Cooling Period Stats */}
                  <Card variant="glass" className="p-5">
                    <CardTitle className="text-base mb-4">Cooling Period Stats</CardTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-blue-400">{lockCount}</p>
                        <p className="text-white/40 text-xs mt-1">Locks activated this month</p>
                      </div>
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-amber-400">{avgDuration}</p>
                        <p className="text-white/40 text-xs mt-1">Average lock duration</p>
                      </div>
                      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-emerald-400">{lossPrevented}</p>
                        <p className="text-white/40 text-xs mt-1">Estimated loss prevented</p>
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
          <div className="p-6 max-w-md mx-auto">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Confirm F&amp;O Trading Lock</h3>
              <p className="text-white/50 text-sm mt-2 leading-relaxed">
                You are about to lock F&amp;O trading
                {selectedDuration ? ` for ${selectedDuration.toLowerCase()}` : ""}. This action helps prevent impulsive trading decisions.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="danger" className="w-full" onClick={handleKillSwitchConfirm}>
                <Lock className="h-4 w-4 mr-2" />
                I understand, lock trading
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
}
