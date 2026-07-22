"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, ArrowUp, ArrowDown, Download, Loader2, AlertCircle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiGetHoldings, apiGetPortfolioSummary, apiGetRiskProfile, type Holding, type PortfolioSummary, type RiskProfile } from "@/lib/api";
import { formatCurrency, formatPercent } from "@/lib/utils";

const assetClassTabs = ["All", "equity", "mf", "bond", "reit", "invit", "gold"] as const;

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

function RiskMeter({ profile }: { profile: RiskProfile | null }) {
  if (!profile) return <Card variant="glass" padding="lg"><CardTitle>Portfolio Risk</CardTitle><div className="text-center py-8"><p className="text-sm text-white/30">Loading risk profile...</p></div></Card>;
  const score = Math.round(profile.risk_score);
  const rotation = (score / 100) * 180 - 90;
  const color = score < 33 ? "text-emerald-400" : score < 66 ? "text-gold-400" : "text-red-400";

  return (
    <Card variant="glass" padding="lg">
      <CardTitle>Portfolio Risk</CardTitle>
      <div className="flex flex-col items-center mt-4">
        <div className="relative w-40 h-20 overflow-hidden">
          <svg viewBox="0 0 100 50" className="w-full h-full">
            <defs><linearGradient id="riskGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#22C55E" /><stop offset="50%" stopColor="#F5A623" /><stop offset="100%" stopColor="#EF4444" /></linearGradient></defs>
            <path d="M 5 45 A 45 45 0 0 1 95 45" fill="none" stroke="url(#riskGrad)" strokeWidth="6" strokeLinecap="round" opacity="0.3" />
            <path d="M 5 45 A 45 45 0 0 1 95 45" fill="none" stroke="url(#riskGrad)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${score * 1.41} 141`} />
            <circle cx="50" cy="45" r="3" fill="white" transform={`rotate(${rotation} 50 45)`} style={{ transformOrigin: "50px 45px" }} />
          </svg>
        </div>
        <p className={`text-lg font-bold ${color}`}>{score}/100</p>
        <p className="text-xs text-white/50 capitalize">{profile.risk_level}</p>
      </div>
    </Card>
  );
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("All");

  useEffect(() => {
    async function load() {
      const [hRes, sRes, rRes] = await Promise.allSettled([apiGetHoldings(), apiGetPortfolioSummary(), apiGetRiskProfile()]);
      if (hRes.status === "fulfilled") setHoldings(hRes.value.data);
      if (sRes.status === "fulfilled") setSummary(sRes.value.data);
      if (rRes.status === "fulfilled") setRiskProfile(rRes.value.data);
      setLoading(false);
    }
    load();
  }, []);

  const filteredHoldings = activeTab === "All" ? holdings : holdings.filter((h) => h.type === activeTab);

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={fadeIn} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Portfolio</h1>
            <p className="text-sm text-white/50 mt-1">Consolidated view of all your investments</p>
          </div>
          <Button variant="outline" size="sm"><Download size={14} className="mr-2" />Export Report</Button>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-blue-400" /><span className="ml-3 text-sm text-white/50">Loading portfolio...</span></div>
        ) : (
          <>
            <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card variant="glass-hover" padding="md"><p className="text-xs text-white/40 mb-1">Total Invested</p><p className="text-xl font-bold text-white">{formatCurrency(summary?.total_invested || 0)}</p></Card>
              <Card variant="glass-hover" padding="md"><p className="text-xs text-white/40 mb-1">Current Value</p><p className="text-xl font-bold text-white">{formatCurrency(summary?.current_value || 0)}</p></Card>
              <Card variant="glass-hover" padding="md"><p className="text-xs text-white/40 mb-1">Overall P&L</p><p className={`text-xl font-bold ${(summary?.overall_pnl || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>{(summary?.overall_pnl || 0) >= 0 ? "+" : ""}{formatCurrency(summary?.overall_pnl || 0)}</p></Card>
              <Card variant="glass-hover" padding="md"><p className="text-xs text-white/40 mb-1">Day Change</p><div className="flex items-center gap-2"><p className={`text-xl font-bold ${(summary?.day_change || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>{(summary?.day_change || 0) >= 0 ? "+" : ""}{formatCurrency(summary?.day_change || 0)}</p></div></Card>
            </motion.div>

            <motion.div variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <RiskMeter profile={riskProfile} />
              <div className="lg:col-span-3">
                <Card variant="glass" padding="lg">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <CardTitle>Holdings</CardTitle>
                    <div className="flex gap-1 p-1 bg-white/5 rounded-xl overflow-x-auto scrollbar-hide w-full md:w-auto">
                      {assetClassTabs.map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer capitalize ${activeTab === tab ? "bg-blue-600 text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}>{tab === "All" ? "All" : tab}</button>
                      ))}
                    </div>
                  </div>
                  {filteredHoldings.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px]">
                        <thead><tr className="border-b border-white/5">{["Asset", "Type", "Qty", "Avg Price", "LTP", "Invested", "Current", "P&L", "Returns"].map((h) => (<th key={h} className={`text-xs font-medium text-white/40 pb-3 ${h === "Asset" ? "text-left" : "text-right"} pr-4 last:pr-0`}>{h}</th>))}</tr></thead>
                        <tbody>
                          {filteredHoldings.map((h) => (
                            <tr key={h.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                              <td className="py-4 pr-4"><p className="text-sm text-white font-medium">{h.name}</p><p className="text-xs text-white/30">{h.symbol}</p></td>
                              <td className="text-right py-4 pr-4"><Badge variant="default" size="sm">{h.type}</Badge></td>
                              <td className="text-right py-4 pr-4 text-sm text-white/70">{h.quantity}</td>
                              <td className="text-right py-4 pr-4 text-sm text-white/70">{formatCurrency(h.avg_price)}</td>
                              <td className="text-right py-4 pr-4 text-sm text-white font-medium">{formatCurrency(h.ltp)}</td>
                              <td className="text-right py-4 pr-4 text-sm text-white/70">{formatCurrency(h.invested_value)}</td>
                              <td className="text-right py-4 pr-4 text-sm text-white font-medium">{formatCurrency(h.current_value)}</td>
                              <td className="text-right py-4 pr-4"><span className={`text-sm font-medium ${h.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{h.pnl >= 0 ? "+" : ""}{formatCurrency(h.pnl)}</span></td>
                              <td className="text-right py-4"><div className="flex items-center justify-end gap-1">{h.returns_pct >= 0 ? <ArrowUp size={12} className="text-emerald-400" /> : <ArrowDown size={12} className="text-red-400" />}<span className={`text-sm font-medium ${h.returns_pct >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatPercent(h.returns_pct)}</span></div></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12"><p className="text-sm text-white/30">No holdings found. Start investing to see your portfolio here.</p></div>
                  )}
                </Card>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
