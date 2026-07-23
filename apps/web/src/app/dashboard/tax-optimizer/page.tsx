"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { apiGetTaxAnalysis, type TaxAnalysis, type TaxHolding } from "@/lib/api";
import {
  Receipt,
  TrendingDown,
  ShieldCheck,
  Calendar,
  Lightbulb,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Clock,
  IndianRupee,
  Landmark,
  PiggyBank,
  ArrowDownRight,
  ArrowUpRight,
  Info,
  Loader2,
} from "lucide-react";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

interface Strategy {
  icon: React.ReactNode;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

const taxCalendar = [
  { date: "Jan 15", event: "Advance Tax Q3", status: "upcoming", icon: <Clock className="h-4 w-4" /> },
  { date: "Mar 31", event: "FY End / Harvesting Deadline", status: "critical", icon: <AlertTriangle className="h-4 w-4" /> },
  { date: "Jul 31", event: "ITR Filing", status: "future", icon: <Landmark className="h-4 w-4" /> },
  { date: "Sep 15", event: "Advance Tax Q2 (FY 26-27)", status: "future", icon: <Calendar className="h-4 w-4" /> },
];

function useStrategies(data: TaxAnalysis | null): Strategy[] {
  if (!data) return [];

  const strategies: Strategy[] = [];

  if (data.harvestable_losses.length > 0) {
    strategies.push({
      icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
      title: `Book ₹${formatCurrency(data.total_harvestable_loss)} in losses before March 31`,
      description: `You have ${data.harvestable_losses.length} position(s) in loss. Book them before FY end to offset against your taxable capital gains and save up to ₹${formatCurrency(data.estimated_tax_saving)} in taxes.`,
      priority: "high",
    });
  }

  if (data.ltcg_exemption_remaining > 0) {
    const remaining = Math.min(data.ltcg_exemption_remaining, 125000);
    strategies.push({
      icon: <PiggyBank className="h-5 w-5 text-purple-400" />,
      title: "Utilize remaining LTCG exemption",
      description: `You have ₹${formatCurrency(remaining)} of the ₹1,25,000 LTCG exemption remaining this FY. Plan equity sales to maximize this benefit before April 1.`,
      priority: remaining > 50000 ? "medium" : "high",
    });
  }

  if (data.stcg_tax_rate > 0) {
    strategies.push({
      icon: <Lightbulb className="h-5 w-5 text-blue-400" />,
      title: "Switch underperforming funds within same AMC",
      description: `Consider switching from underperforming mutual funds to better-performing ones within the same AMC to avoid triggering STCG tax events at ${data.stcg_tax_rate * 100}%.`,
      priority: "medium",
    });
  }

  if (data.ltcg_exemption_used === 0) {
    strategies.push({
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
      title: "Full LTCG exemption available",
      description: `You haven't utilized any of your ₹1,25,000 LTCG exemption yet. Plan long-term equity exits to make full use of this tax benefit.`,
      priority: "low",
    });
  } else {
    strategies.push({
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
      title: "LTCG exemption utilization on track",
      description: `You've utilized ₹${formatCurrency(data.ltcg_exemption_used)} of your ₹1,25,000 LTCG exemption. Keep optimizing equity exits to maximize savings.`,
      priority: "low",
    });
  }

  return strategies;
}

export default function TaxOptimizerPage() {
  const [data, setData] = useState<TaxAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [harvestedSymbols, setHarvestedSymbols] = useState<Set<string>>(new Set());

  useEffect(() => {
    apiGetTaxAnalysis()
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || "Failed to load tax data");
        setLoading(false);
      });
  }, []);

  const strategies = useStrategies(data);
  const ltcgExemptionUsedPct = data ? Math.round((data.ltcg_exemption_used / data.ltcg_exempted) * 100) : 0;
  const ltcgExemptionRemaining = data ? Math.max(data.ltcg_exempted - data.ltcg_exemption_used, 0) : 0;

  const handleHarvest = (symbol: string) => {
    setHarvestedSymbols((prev) => new Set(prev).add(symbol));
  };

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
        {/* Header */}
        <motion.div variants={fadeIn} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">Tax-Loss Harvesting Engine</h1>
              <Badge variant="gold" className="text-xs">FY 2025-26</Badge>
            </div>
            <p className="mt-1 text-muted-foreground">Minimize your tax liability with smart strategies</p>
          </div>
          <Button variant="primary" className="flex items-center gap-2 self-start">
            <IndianRupee className="h-4 w-4" />
            Run Tax Optimizer
          </Button>
        </motion.div>

        {/* Loading */}
        {loading && (
          <motion.div variants={fadeIn} className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">Loading tax analysis...</p>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div variants={fadeIn} className="flex flex-col items-center justify-center py-24">
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
              <AlertTriangle className="mx-auto h-8 w-8 text-red-400" />
              <p className="mt-3 text-sm text-red-400">{error}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </motion.div>
        )}

        {/* Content */}
        {!loading && !error && data && (
          <>
            {/* Summary Cards */}
            <motion.div variants={fadeIn} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card variant="glass" className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Tax Liability</p>
                    <p className="mt-1 text-2xl font-bold">₹{formatCurrency(data.estimated_tax_liability)}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                      <ArrowUpRight className="h-3 w-3" />
                      Before harvesting
                    </p>
                  </div>
                  <div className="rounded-xl bg-red-500/10 p-2.5">
                    <Receipt className="h-5 w-5 text-red-400" />
                  </div>
                </div>
              </Card>

              <Card variant="glass" className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Harvestable Losses</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-400">₹{formatCurrency(data.total_harvestable_loss)}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
                      <ArrowDownRight className="h-3 w-3" />
                      {data.harvestable_losses.length} position{data.harvestable_losses.length !== 1 ? "s" : ""} available
                    </p>
                  </div>
                  <div className="rounded-xl bg-emerald-500/10 p-2.5">
                    <TrendingDown className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>
              </Card>

              <Card variant="glass" className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tax Saved This Year</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-400">₹{formatCurrency(data.tax_saved_this_year)}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Via previous harvesting
                    </p>
                  </div>
                  <div className="rounded-xl bg-emerald-500/10 p-2.5">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>
              </Card>

              <Card variant="glass" className="p-5">
                <div>
                  <p className="text-sm text-muted-foreground">LTCG Exemption Used</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-2xl font-bold">₹{formatCurrency(data.ltcg_exemption_used)}</p>
                    <p className="text-sm text-muted-foreground">/ ₹{formatCurrency(data.ltcg_exempted)}</p>
                  </div>
                  <div className="mt-3">
                    <Progress value={ltcgExemptionUsedPct} max={100} size="sm" color="gold" showLabel />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {100 - ltcgExemptionUsedPct}% remaining (₹{formatCurrency(ltcgExemptionRemaining)})
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Tax Summary */}
            <motion.div variants={fadeIn}>
              <Card variant="glass" className="p-6">
                <CardTitle className="mb-5 flex items-center gap-2 text-lg">
                  <Landmark className="h-5 w-5 text-blue-400" />
                  Tax Summary — FY 2025-26
                </CardTitle>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  {/* Left: LTCG vs STCG Breakdown */}
                  <div className="space-y-5">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Long-Term Capital Gains</p>
                          <p className="mt-1 text-lg font-semibold">₹{formatCurrency(data.total_ltcg)}</p>
                        </div>
                        <Badge variant="info">LTCG</Badge>
                      </div>
                      <div className="mt-3 space-y-1.5 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Total Gains</span>
                          <span className="text-white">₹{formatCurrency(data.total_ltcg)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-400">
                          <span>Less: Exemption</span>
                          <span>-₹{formatCurrency(Math.min(data.ltcg_exemption_used, data.total_ltcg))}</span>
                        </div>
                        <div className="border-t border-white/5 pt-1.5 flex justify-between font-medium">
                          <span>Taxable LTCG</span>
                          <span>₹{formatCurrency(Math.max(data.total_ltcg - data.ltcg_exempted, 0))}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Tax @ {data.ltcg_tax_rate * 100}%</span>
                          <span className="text-red-400">₹{formatCurrency(Math.max(data.total_ltcg - data.ltcg_exempted, 0) * data.ltcg_tax_rate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Short-Term Capital Gains</p>
                          <p className="mt-1 text-lg font-semibold">₹{formatCurrency(data.total_stcg)}</p>
                        </div>
                        <Badge variant="warning">STCG</Badge>
                      </div>
                      <div className="mt-3 space-y-1.5 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Taxable STCG</span>
                          <span className="text-white">₹{formatCurrency(data.total_stcg)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Tax @ {data.stcg_tax_rate * 100}%</span>
                          <span className="text-red-400">₹{formatCurrency(data.total_stcg * data.stcg_tax_rate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Total Tax (Before Harvesting)</p>
                          <p className="mt-1 text-xl font-bold text-amber-400">
                            ₹{formatCurrency(
                              Math.max(data.total_ltcg - data.ltcg_exempted, 0) * data.ltcg_tax_rate +
                              data.total_stcg * data.stcg_tax_rate
                            )}
                          </p>
                        </div>
                        <div className="rounded-xl bg-amber-500/10 p-2.5">
                          <Receipt className="h-5 w-5 text-amber-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: LTCG Exemption Visual */}
                  <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] p-6">
                    <p className="mb-2 text-sm font-medium text-muted-foreground">LTCG Exemption Utilization</p>
                    <div className="relative h-48 w-48">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          fill="none"
                          stroke="url(#goldGradient)"
                          strokeWidth="12"
                          strokeLinecap="round"
                          strokeDasharray={`${(ltcgExemptionUsedPct / 100) * 326.7} 326.7`}
                        />
                        <defs>
                          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#eab308" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold">{ltcgExemptionUsedPct}%</span>
                        <span className="text-xs text-muted-foreground">Used</span>
                      </div>
                    </div>
                    <div className="mt-4 grid w-full grid-cols-2 gap-3 text-center text-sm">
                      <div className="rounded-lg bg-emerald-500/10 p-2">
                        <p className="text-emerald-400 font-medium">Used: ₹{formatCurrency(data.ltcg_exemption_used)}</p>
                      </div>
                      <div className="rounded-lg bg-blue-500/10 p-2">
                        <p className="text-blue-400 font-medium">Remaining: ₹{formatCurrency(ltcgExemptionRemaining)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Harvesting Opportunities */}
            <motion.div variants={fadeIn}>
              <Card variant="glass" className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingDown className="h-5 w-5 text-emerald-400" />
                    Positions in Loss (Harvestable)
                  </CardTitle>
                  {data.harvestable_losses.length > 0 && (
                    <Badge variant="success">
                      Potential Save: ₹{formatCurrency(data.estimated_tax_saving)}
                    </Badge>
                  )}
                </div>

                {data.harvestable_losses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-xl bg-emerald-500/10 p-4">
                      <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                    </div>
                    <p className="mt-4 text-sm font-medium text-emerald-400">
                      No positions currently in loss — all holdings are profitable!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.harvestable_losses.map((pos) => {
                      const isHarvested = harvestedSymbols.has(pos.id);

                      return (
                        <div
                          key={pos.id}
                          className={`flex flex-col gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between transition-all ${
                            isHarvested ? "border-emerald-500/30 bg-emerald-500/5 opacity-70" : ""
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-sm font-bold">
                              {pos.symbol.slice(0, 3)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{pos.symbol}</p>
                                <span className="text-xs text-muted-foreground">{pos.name}</span>
                              </div>
                              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                                <span>Buy: ₹{formatCurrency(pos.buy_price)}</span>
                                <ChevronRight className="h-3 w-3" />
                                <span className="text-red-400">Now: ₹{formatCurrency(pos.current_price)}</span>
                                <span>× {pos.quantity}</span>
                                {pos.holding_period && (
                                  <span className="text-xs text-muted-foreground">({pos.holding_period})</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-lg font-bold text-red-400">
                                -₹{formatCurrency(Math.abs(pos.loss_amount))}
                              </p>
                              <p className="text-xs text-red-400/70">
                                {formatPercent(((pos.buy_price - pos.current_price) / pos.buy_price) * 100)} loss
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-emerald-400">
                                Save ₹{formatCurrency(pos.tax_saving)}
                              </p>
                              <p className="text-xs text-muted-foreground">Tax benefit</p>
                            </div>
                            <Button
                              variant={isHarvested ? "secondary" : "primary"}
                              size="sm"
                              className="min-w-[90px]"
                              disabled={isHarvested}
                              onClick={() => handleHarvest(pos.id)}
                            >
                              {isHarvested ? (
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Booked
                                </span>
                              ) : (
                                "Harvest"
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Summary footer */}
                {data.harvestable_losses.length > 0 && (
                  <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-emerald-500/10 p-2">
                          <ShieldCheck className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Total Potential Tax Saving</p>
                          <p className="text-xs text-muted-foreground">
                            Book ₹{formatCurrency(data.total_harvestable_loss)} in losses to save{" "}
                            <span className="font-semibold text-emerald-400">
                              ₹{formatCurrency(data.estimated_tax_saving)}
                            </span>{" "}
                            in taxes
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="self-start">
                        Harvest All
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Smart Strategies */}
            <motion.div variants={fadeIn}>
              <Card variant="glass" className="p-6">
                <CardTitle className="mb-5 flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-blue-400" />
                  Smart Tax Strategies
                </CardTitle>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {strategies.map((strategy, idx) => (
                    <div
                      key={idx}
                      className="flex gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
                    >
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                        {strategy.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">{strategy.title}</p>
                          <Badge
                            variant={
                              strategy.priority === "high"
                                ? "danger"
                                : strategy.priority === "medium"
                                ? "warning"
                                : "default"
                            }
                            className="text-[10px]"
                          >
                            {strategy.priority}
                          </Badge>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {strategy.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Tax Calendar */}
            <motion.div variants={fadeIn}>
              <Card variant="glass" className="p-6">
                <CardTitle className="mb-5 flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  Tax Calendar — FY 2025-26
                </CardTitle>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {taxCalendar.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 rounded-xl border p-4 ${
                        item.status === "critical"
                          ? "border-amber-500/30 bg-amber-500/5"
                          : "border-white/5 bg-white/[0.02]"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          item.status === "critical"
                            ? "bg-amber-500/10 text-amber-400"
                            : item.status === "upcoming"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-white/5 text-muted-foreground"
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">{item.date}</p>
                        <p className="mt-0.5 text-sm font-semibold">{item.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </>
        )}

        {/* Bottom disclaimer */}
        <motion.div variants={fadeIn}>
          <div className="flex items-start gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Tax calculations are estimates based on current FY 2025-26 slabs and may vary. Consult a qualified
              tax advisor before making any tax-related decisions. Tax-loss harvesting involves selling securities at
              a loss to offset capital gains taxes. Past performance of harvested positions does not guarantee future
              tax savings.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
