"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Wallet,
  Search,
  Brain,
  BookOpen,
  ArrowUp,
  ArrowDown,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  apiGetPortfolioSummary,
  apiGetPerformance,
  apiGetAssetAllocation,
  apiGetTransactions,
  apiGetHoldings,
  type PortfolioSummary,
  type PerformancePoint,
  type AssetAllocation,
  type Transaction,
  type Holding,
} from "@/lib/api";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const ALLOC_COLORS: Record<string, string> = {
  equity: "#1A56DB",
  mf: "#7C3AED",
  bond: "#22C55E",
  reit: "#F5A623",
  invit: "#EC4899",
  gold: "#EAB308",
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-500/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-glass">
        <p className="text-xs text-white/50 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-medium text-white">
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface DashboardState {
  summary: PortfolioSummary | null;
  performance: PerformancePoint[];
  allocation: AssetAllocation[];
  transactions: Transaction[];
  holdings: Holding[];
  loading: boolean;
  error: string | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [state, setState] = useState<DashboardState>({
    summary: null,
    performance: [],
    allocation: [],
    transactions: [],
    holdings: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function load() {
      try {
        const [summaryRes, perfRes, allocRes, txRes, holdRes] = await Promise.allSettled([
          apiGetPortfolioSummary(),
          apiGetPerformance(),
          apiGetAssetAllocation(),
          apiGetTransactions(),
          apiGetHoldings(),
        ]);

        setState({
          summary: summaryRes.status === "fulfilled" ? summaryRes.value.data : null,
          performance: perfRes.status === "fulfilled" ? perfRes.value.data : [],
          allocation: allocRes.status === "fulfilled" ? allocRes.value.data : [],
          transactions: txRes.status === "fulfilled" ? txRes.value.data : [],
          holdings: holdRes.status === "fulfilled" ? holdRes.value.data.slice(0, 5) : [],
          loading: false,
          error: null,
        });
      } catch {
        setState((s) => ({ ...s, loading: false, error: "Failed to load portfolio data. Is the portfolio service running?" }));
      }
    }
    load();
  }, []);

  const summary = state.summary;

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={fadeIn}>
          <h1 className="text-2xl font-bold text-white">Good morning, {user?.full_name?.split(" ")[0] || "Investor"}</h1>
          <p className="text-sm text-white/50 mt-1">Here&apos;s your portfolio overview for today</p>
        </motion.div>

        {state.loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-blue-400" />
            <span className="ml-3 text-sm text-white/50">Loading portfolio...</span>
          </div>
        )}

        {state.error && !state.loading && (
          <Card variant="glass" padding="lg">
            <div className="flex items-center gap-3 text-center py-8">
              <AlertCircle size={20} className="text-amber-400" />
              <div>
                <p className="text-sm text-white/70">{state.error}</p>
                <p className="text-xs text-white/40 mt-1">Start the backend services to see your data</p>
              </div>
            </div>
          </Card>
        )}

        {!state.loading && !state.error && summary && (
          <>
            <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card variant="glass-hover" padding="md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Net Worth</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(summary.current_value)}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
                    <TrendingUp size={18} className="text-blue-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {summary.total_returns_pct >= 0 ? <ArrowUpRight size={14} className="text-emerald-400" /> : <ArrowDownRight size={14} className="text-red-400" />}
                  <span className={`text-xs font-medium ${summary.total_returns_pct >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatPercent(summary.total_returns_pct)}</span>
                  <span className="text-xs text-white/30 ml-1">all time</span>
                </div>
              </Card>

              <Card variant="glass-hover" padding="md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Total Invested</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(summary.total_invested)}</p>
                  </div>
                  <div className="w-10 h-10 bg-gold-400/20 rounded-xl flex items-center justify-center">
                    <Wallet size={18} className="text-gold-400" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-xs text-white/30">{formatCurrency(summary.overall_pnl)} unrealized P&L</span>
                </div>
              </Card>

              <Card variant="glass-hover" padding="md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Day Change</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(summary.day_change)}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${summary.day_change >= 0 ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                    {summary.day_change >= 0 ? <ArrowUpRight size={18} className="text-emerald-400" /> : <ArrowDownRight size={18} className="text-red-400" />}
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {summary.day_change >= 0 ? <ArrowUpRight size={14} className="text-emerald-400" /> : <ArrowDownRight size={14} className="text-red-400" />}
                  <span className={`text-xs font-medium ${summary.day_change >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatPercent(summary.day_change_pct)}</span>
                  <span className="text-xs text-white/30 ml-1">today</span>
                </div>
              </Card>

              <Card variant="glass-hover" padding="md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Overall P&L</p>
                    <p className={`text-2xl font-bold ${summary.overall_pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{summary.overall_pnl >= 0 ? "+" : ""}{formatCurrency(summary.overall_pnl)}</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp size={18} className="text-emerald-400" />
                  </div>
                </div>
                <div className="mt-3">
                  <Badge variant={summary.overall_pnl >= 0 ? "success" : "danger"}>{summary.overall_pnl >= 0 ? "In Profit" : "In Loss"}</Badge>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card variant="glass" padding="lg" className="lg:col-span-2">
                <CardTitle>Portfolio Performance</CardTitle>
                <p className="text-xs text-white/40 mb-6">Your portfolio value over time</p>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={state.performance}>
                      <defs>
                        <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1A56DB" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#1A56DB" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="invested_value" name="Invested" stroke="#F5A623" strokeWidth={1.5} fill="transparent" dot={false} />
                      <Area type="monotone" dataKey="portfolio_value" name="Portfolio" stroke="#1A56DB" strokeWidth={2} fill="url(#blueGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card variant="glass" padding="lg">
                <CardTitle>Asset Allocation</CardTitle>
                <p className="text-xs text-white/40 mb-4">Across all asset classes</p>
                {state.allocation.length > 0 ? (
                  <>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={state.allocation} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                            {state.allocation.map((entry, index) => (
                              <Cell key={index} fill={ALLOC_COLORS[entry.type] || "#6B7280"} stroke="transparent" />
                            ))}
                          </Pie>
                          <Tooltip content={({ active, payload }) => active && payload && payload.length ? (
                            <div className="bg-navy-500/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-glass">
                              <p className="text-xs text-white/50">{payload[0]?.name}</p>
                              <p className="text-sm font-medium text-white">{formatCurrency(payload[0]?.value as number)}</p>
                            </div>
                          ) : null} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-4">
                      {state.allocation.map((item) => (
                        <div key={item.type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ALLOC_COLORS[item.type] || "#6B7280" }} />
                            <span className="text-xs text-white/60 capitalize">{item.type}</span>
                          </div>
                          <span className="text-xs text-white/80 font-medium">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8"><p className="text-sm text-white/30">No allocation data</p></div>
                )}
              </Card>
            </motion.div>

            <motion.div variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card variant="glass" padding="lg">
                <CardTitle>Quick Actions</CardTitle>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="glass-card-light p-4 rounded-xl cursor-pointer hover:bg-white/10 transition-all text-center group">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform"><Wallet size={18} className="text-blue-400" /></div>
                    <p className="text-xs text-white/70 font-medium">Add Funds</p>
                  </div>
                  <div className="glass-card-light p-4 rounded-xl cursor-pointer hover:bg-white/10 transition-all text-center group">
                    <div className="w-10 h-10 bg-gold-400/20 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform"><Search size={18} className="text-gold-400" /></div>
                    <p className="text-xs text-white/70 font-medium">Explore Assets</p>
                  </div>
                  <div className="glass-card-light p-4 rounded-xl cursor-pointer hover:bg-white/10 transition-all text-center group">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform"><Brain size={18} className="text-purple-400" /></div>
                    <p className="text-xs text-white/70 font-medium">AI Insights</p>
                  </div>
                  <div className="glass-card-light p-4 rounded-xl cursor-pointer hover:bg-white/10 transition-all text-center group">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform"><BookOpen size={18} className="text-emerald-400" /></div>
                    <p className="text-xs text-white/70 font-medium">Learn</p>
                  </div>
                </div>
              </Card>

              <Card variant="glass" padding="lg" className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle>Recent Transactions</CardTitle>
                </div>
                {state.transactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left text-xs font-medium text-white/40 pb-3 pr-4">Asset</th>
                          <th className="text-left text-xs font-medium text-white/40 pb-3 pr-4">Type</th>
                          <th className="text-right text-xs font-medium text-white/40 pb-3 pr-4">Amount</th>
                          <th className="text-right text-xs font-medium text-white/40 pb-3">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.transactions.slice(0, 5).map((t) => (
                          <tr key={t.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                            <td className="py-3 pr-4">
                              <p className="text-sm text-white font-medium">{t.name}</p>
                              <p className="text-xs text-white/30">{t.symbol}</p>
                            </td>
                            <td className="py-3 pr-4"><Badge variant={t.type === "buy" ? "info" : "warning"}>{t.type}</Badge></td>
                            <td className="text-right py-3 pr-4"><p className="text-sm text-white font-medium">{formatCurrency(t.total)}</p></td>
                            <td className="text-right py-3"><p className="text-xs text-white/40">{new Date(t.date).toLocaleDateString()}</p></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8"><p className="text-sm text-white/30">No transactions yet</p></div>
                )}
              </Card>
            </motion.div>

            <motion.div variants={fadeIn}>
              <Card variant="glass" padding="lg">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle>Top Holdings</CardTitle>
                </div>
                {state.holdings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left text-xs font-medium text-white/40 pb-3 pr-4">Asset</th>
                          <th className="text-right text-xs font-medium text-white/40 pb-3 pr-4">Qty</th>
                          <th className="text-right text-xs font-medium text-white/40 pb-3 pr-4">LTP</th>
                          <th className="text-right text-xs font-medium text-white/40 pb-3 pr-4">Current Value</th>
                          <th className="text-right text-xs font-medium text-white/40 pb-3 pr-4">P&L</th>
                          <th className="text-right text-xs font-medium text-white/40 pb-3">Returns</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.holdings.map((h) => (
                          <tr key={h.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                            <td className="py-3 pr-4">
                              <p className="text-sm text-white font-medium">{h.name}</p>
                              <Badge variant="default" size="sm">{h.type}</Badge>
                            </td>
                            <td className="text-right py-3 pr-4 text-sm text-white/70">{h.quantity}</td>
                            <td className="text-right py-3 pr-4 text-sm text-white/70">{formatCurrency(h.ltp)}</td>
                            <td className="text-right py-3 pr-4 text-sm text-white font-medium">{formatCurrency(h.current_value)}</td>
                            <td className="text-right py-3 pr-4">
                              <span className={`text-sm font-medium ${h.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{h.pnl >= 0 ? "+" : ""}{formatCurrency(h.pnl)}</span>
                            </td>
                            <td className="text-right py-3">
                              <div className="flex items-center justify-end gap-1">
                                {h.returns_pct >= 0 ? <ArrowUp size={12} className="text-emerald-400" /> : <ArrowDown size={12} className="text-red-400" />}
                                <span className={`text-sm font-medium ${h.returns_pct >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatPercent(h.returns_pct)}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8"><p className="text-sm text-white/30">No holdings yet</p></div>
                )}
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
