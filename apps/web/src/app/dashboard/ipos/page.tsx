"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  Rocket,
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  IndianRupee,
  Star,
  AlertTriangle,
  Info,
  ArrowUpRight,
  Sparkles,
  Bell,
  ExternalLink,
  Users,
  Building2,
} from "lucide-react";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

type TabKey = "upcoming" | "live" | "closed" | "applications";

interface IPOData {
  id: string;
  company: string;
  sector: string;
  priceLow: number;
  priceHigh: number;
  lotSize: number;
  minInvestment: number;
  startDate: string;
  endDate: string;
  gmp: number;
  gmpPercent: number;
  subscription: number;
  subscriptionRetail: number;
  subscriptionQIB: number;
  subscriptionNII: number;
  risk: "Low" | "Medium" | "High";
  status: "live" | "upcoming" | "closed";
  aiScore: number;
  aiVerdict: "Buy" | "Hold" | "Avoid";
  logoColor: string;
  applied?: boolean;
  lotsApplied?: number;
  lotsAllotted?: number;
  listingChange?: number;
}

const ipos: IPOData[] = [
  {
    id: "1",
    company: "NovaTech Solutions Ltd",
    sector: "Technology",
    priceLow: 380,
    priceHigh: 400,
    lotSize: 37,
    minInvestment: 14800,
    startDate: "Jul 21",
    endDate: "Jul 23, 2026",
    gmp: 65,
    gmpPercent: 16,
    subscription: 4.7,
    subscriptionRetail: 6.2,
    subscriptionQIB: 3.8,
    subscriptionNII: 4.1,
    risk: "Medium",
    status: "live",
    aiScore: 8.2,
    aiVerdict: "Buy",
    logoColor: "#3b82f6",
  },
  {
    id: "2",
    company: "GreenEnergy India Ltd",
    sector: "Energy",
    priceLow: 145,
    priceHigh: 155,
    lotSize: 95,
    minInvestment: 14725,
    startDate: "Jul 22",
    endDate: "Jul 24, 2026",
    gmp: 22,
    gmpPercent: 14,
    subscription: 2.8,
    subscriptionRetail: 3.5,
    subscriptionQIB: 2.1,
    subscriptionNII: 2.9,
    risk: "High",
    status: "live",
    aiScore: 6.5,
    aiVerdict: "Hold",
    logoColor: "#22c55e",
  },
  {
    id: "3",
    company: "Bharat Fintech Corp",
    sector: "Fintech",
    priceLow: 520,
    priceHigh: 550,
    lotSize: 27,
    minInvestment: 14850,
    startDate: "Aug 5",
    endDate: "Aug 7, 2026",
    gmp: 80,
    gmpPercent: 15,
    subscription: 0,
    subscriptionRetail: 0,
    subscriptionQIB: 0,
    subscriptionNII: 0,
    risk: "Medium",
    status: "upcoming",
    aiScore: 7.8,
    aiVerdict: "Buy",
    logoColor: "#8b5cf6",
  },
  {
    id: "4",
    company: "Precision Machines Ltd",
    sector: "Manufacturing",
    priceLow: 210,
    priceHigh: 225,
    lotSize: 65,
    minInvestment: 14625,
    startDate: "Aug 12",
    endDate: "Aug 14, 2026",
    gmp: 30,
    gmpPercent: 13,
    subscription: 0,
    subscriptionRetail: 0,
    subscriptionQIB: 0,
    subscriptionNII: 0,
    risk: "Low",
    status: "upcoming",
    aiScore: 7.1,
    aiVerdict: "Buy",
    logoColor: "#f59e0b",
  },
  {
    id: "5",
    company: "CloudScale Technologies",
    sector: "Cloud/SaaS",
    priceLow: 680,
    priceHigh: 720,
    lotSize: 20,
    minInvestment: 14400,
    startDate: "Aug 18",
    endDate: "Aug 20, 2026",
    gmp: 110,
    gmpPercent: 15,
    subscription: 0,
    subscriptionRetail: 0,
    subscriptionQIB: 0,
    subscriptionNII: 0,
    risk: "Medium",
    status: "upcoming",
    aiScore: 8.5,
    aiVerdict: "Buy",
    logoColor: "#06b6d4",
  },
  {
    id: "6",
    company: "Metro Infra Developers",
    sector: "Infrastructure",
    priceLow: 95,
    priceHigh: 105,
    lotSize: 140,
    minInvestment: 14700,
    startDate: "Aug 25",
    endDate: "Aug 27, 2026",
    gmp: -8,
    gmpPercent: -8,
    subscription: 0,
    subscriptionRetail: 0,
    subscriptionQIB: 0,
    subscriptionNII: 0,
    risk: "High",
    status: "upcoming",
    aiScore: 4.2,
    aiVerdict: "Avoid",
    logoColor: "#ef4444",
  },
  {
    id: "7",
    company: "MediCare Pharma",
    sector: "Healthcare",
    priceLow: 310,
    priceHigh: 325,
    lotSize: 46,
    minInvestment: 14950,
    startDate: "Jun 10",
    endDate: "Jun 12, 2026",
    gmp: 0,
    gmpPercent: 0,
    subscription: 5.1,
    subscriptionRetail: 7.3,
    subscriptionQIB: 4.2,
    subscriptionNII: 5.8,
    risk: "Medium",
    status: "closed",
    aiScore: 7.5,
    aiVerdict: "Buy",
    logoColor: "#ec4899",
    applied: true,
    lotsApplied: 2,
    lotsAllotted: 1,
    listingChange: 18,
  },
  {
    id: "8",
    company: "SolarWave Energy",
    sector: "Energy",
    priceLow: 180,
    priceHigh: 190,
    lotSize: 78,
    minInvestment: 14820,
    startDate: "May 28",
    endDate: "May 30, 2026",
    gmp: 0,
    gmpPercent: 0,
    subscription: 6.8,
    subscriptionRetail: 9.1,
    subscriptionQIB: 5.4,
    subscriptionNII: 6.2,
    risk: "Medium",
    status: "closed",
    aiScore: 7.9,
    aiVerdict: "Buy",
    logoColor: "#f97316",
    applied: true,
    lotsApplied: 3,
    lotsAllotted: 0,
    listingChange: 32,
  },
  {
    id: "9",
    company: "DataNet Systems",
    sector: "Technology",
    priceLow: 445,
    priceHigh: 465,
    lotSize: 32,
    minInvestment: 14880,
    startDate: "Apr 15",
    endDate: "Apr 17, 2026",
    gmp: 0,
    gmpPercent: 0,
    subscription: 1.4,
    subscriptionRetail: 2.0,
    subscriptionQIB: 1.1,
    subscriptionNII: 1.3,
    risk: "High",
    status: "closed",
    aiScore: 5.1,
    aiVerdict: "Avoid",
    logoColor: "#6366f1",
    applied: true,
    lotsApplied: 1,
    lotsAllotted: 1,
    listingChange: -5,
  },
];

function getGMPColor(gmp: number): string {
  if (gmp > 0) return "text-emerald-400";
  if (gmp < 0) return "text-red-400";
  return "text-muted-foreground";
}

function getGMPBadgeVariant(gmp: number): "success" | "danger" | "default" {
  if (gmp > 0) return "success";
  if (gmp < 0) return "danger";
  return "default";
}

function getRiskVariant(risk: string): "success" | "warning" | "danger" {
  if (risk === "Low") return "success";
  if (risk === "Medium") return "warning";
  return "danger";
}

function getAIBadgeVariant(score: number): "gold" | "warning" | "danger" {
  if (score >= 7) return "gold";
  if (score >= 5) return "warning";
  return "danger";
}

export default function IPOsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("live");
  const [reminders, setReminders] = useState<Set<string>>(new Set());
  const [applications, setApplications] = useState<Set<string>>(new Set());

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "upcoming", label: "Upcoming", count: 4 },
    { key: "live", label: "Live", count: 2 },
    { key: "closed", label: "Closed", count: 3 },
    { key: "applications", label: "My Applications", count: 3 },
  ];

  const filteredIPOs = ipos.filter((ipo) => {
    if (activeTab === "applications") return ipo.applied;
    return ipo.status === activeTab;
  });

  const toggleReminder = (id: string) => {
    setReminders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleApply = (id: string) => {
    setApplications((prev) => new Set(prev).add(id));
  };

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
        {/* Header */}
        <motion.div variants={fadeIn} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">IPO Tracker</h1>
            </div>
            <p className="mt-1 text-muted-foreground">Track upcoming, live, and past IPOs with AI predictions</p>
          </div>
          <Button variant="primary" className="flex items-center gap-2 self-start">
            <Bell className="h-4 w-4" />
            IPO Alerts
          </Button>
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={fadeIn} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card variant="glass" className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming IPOs</p>
                <p className="mt-1 text-2xl font-bold">4</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-blue-400">
                  <ArrowUpRight className="h-3 w-3" />
                  Next: Aug 5, 2026
                </p>
              </div>
              <div className="rounded-xl bg-blue-500/10 p-2.5">
                <Rocket className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </Card>

          <Card variant="glass" className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Live IPOs</p>
                <p className="mt-1 text-2xl font-bold text-emerald-400">2</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  Open for application
                </p>
              </div>
              <div className="rounded-xl bg-emerald-500/10 p-2.5">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
          </Card>

          <Card variant="glass" className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Past IPOs Tracked</p>
                <p className="mt-1 text-2xl font-bold">6</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <BarChart3 className="h-3 w-3" />
                  2 allotted, 1 missed
                </p>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-2.5">
                <BarChart3 className="h-5 w-5 text-amber-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tab Filters */}
        <motion.div variants={fadeIn}>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    activeTab === tab.key ? "bg-white/20" : "bg-white/5"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* IPO Cards */}
        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4">
          {filteredIPOs.length === 0 && (
            <Card variant="glass" className="flex flex-col items-center justify-center p-12 text-center">
              <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-lg font-medium">No IPOs in this category</p>
              <p className="mt-1 text-sm text-muted-foreground">Check other tabs for available IPOs</p>
            </Card>
          )}

          {filteredIPOs.map((ipo) => (
            <motion.div key={ipo.id} variants={fadeIn}>
              <Card variant="glass" className="p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  {/* Left: Company Info */}
                  <div className="flex gap-4">
                    {/* Logo placeholder */}
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white"
                      style={{ backgroundColor: ipo.logoColor }}
                    >
                      {ipo.company.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold">{ipo.company}</h3>
                        <Badge variant="default" className="text-xs">{ipo.sector}</Badge>
                        <Badge variant={getRiskVariant(ipo.risk)} className="text-xs">
                          {ipo.risk} Risk
                        </Badge>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Price Band</p>
                          <p className="font-semibold">
                            ₹{ipo.priceLow} - ₹{ipo.priceHigh}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Lot Size</p>
                          <p className="font-semibold">{ipo.lotSize} shares</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Min Investment</p>
                          <p className="font-semibold">₹{ipo.minInvestment.toLocaleString("en-IN")}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Issue Dates</p>
                          <p className="font-semibold flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {ipo.startDate} - {ipo.endDate}
                          </p>
                        </div>
                      </div>

                      {/* Category badges */}
                      {ipo.status === "live" && ipo.subscription > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                          <Badge variant="info" className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> Retail {ipo.subscriptionRetail}x
                          </Badge>
                          <Badge variant="info" className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" /> QIB {ipo.subscriptionQIB}x
                          </Badge>
                          <Badge variant="info" className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> NII {ipo.subscriptionNII}x
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Metrics + Actions */}
                  <div className="flex flex-col items-start gap-4 lg:items-end lg:min-w-[280px]">
                    {/* GMP */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">GMP</p>
                        <p className={`text-lg font-bold ${getGMPColor(ipo.gmp)}`}>
                          {ipo.gmp >= 0 ? "+" : ""}₹{ipo.gmp} ({ipo.gmpPercent >= 0 ? "+" : ""}
                          {ipo.gmpPercent}%)
                        </p>
                      </div>
                      <Badge variant={getGMPBadgeVariant(ipo.gmp)} className="text-xs">
                        {ipo.gmp > 0 ? "Premium" : ipo.gmp < 0 ? "Discount" : "At Par"}
                      </Badge>
                    </div>

                    {/* Subscription (for live/closed) */}
                    {ipo.subscription > 0 && (
                      <div className="w-full max-w-[240px]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Subscription</span>
                          <span className="font-semibold">{ipo.subscription}x</span>
                        </div>
                        <div className="mt-1.5">
                          <Progress
                            value={Math.min(ipo.subscription * 20, 100)}
                            max={100}
                            size="sm"
                            color={ipo.subscription >= 3 ? "green" : "blue"}
                          />
                        </div>
                      </div>
                    )}

                    {/* AI Score */}
                    <div className="flex items-center gap-2">
                      <Badge variant={getAIBadgeVariant(ipo.aiScore)} className="flex items-center gap-1.5 text-xs">
                        <Sparkles className="h-3 w-3" />
                        AI Score: {ipo.aiScore}/10
                      </Badge>
                      <Badge
                        variant={
                          ipo.aiVerdict === "Buy"
                            ? "success"
                            : ipo.aiVerdict === "Avoid"
                            ? "danger"
                            : "warning"
                        }
                        className="text-xs"
                      >
                        {ipo.aiVerdict}
                      </Badge>
                    </div>

                    {/* Closed IPO results */}
                    {ipo.status === "closed" && ipo.applied && (
                      <div className="flex flex-wrap gap-3 text-sm">
                        <div className="rounded-lg bg-white/5 px-3 py-1.5">
                          <span className="text-xs text-muted-foreground">Applied: </span>
                          <span className="font-medium">{ipo.lotsApplied} lot{ipo.lotsApplied !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="rounded-lg bg-white/5 px-3 py-1.5">
                          {ipo.lotsAllotted !== undefined && ipo.lotsAllotted > 0 ? (
                            <span>
                              <span className="text-xs text-muted-foreground">Allotted: </span>
                              <span className="font-medium text-emerald-400">
                                {ipo.lotsAllotted} lot{ipo.lotsAllotted !== 1 ? "s" : ""}
                              </span>
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              <XCircle className="mr-1 inline h-3 w-3 text-red-400" />
                              Not Allotted
                            </span>
                          )}
                        </div>
                        {ipo.listingChange !== undefined && (
                          <div
                            className={`rounded-lg px-3 py-1.5 ${
                              ipo.listingChange >= 0 ? "bg-emerald-500/10" : "bg-red-500/10"
                            }`}
                          >
                            <span className="text-xs text-muted-foreground">Listing: </span>
                            <span
                              className={`font-bold ${
                                ipo.listingChange >= 0 ? "text-emerald-400" : "text-red-400"
                              }`}
                            >
                              {ipo.listingChange >= 0 ? "+" : ""}
                              {ipo.listingChange}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {ipo.status === "live" && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex items-center gap-1.5"
                            disabled={applications.has(ipo.id)}
                            onClick={() => handleApply(ipo.id)}
                          >
                            {applications.has(ipo.id) ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" /> Applied
                              </>
                            ) : (
                              <>
                                <IndianRupee className="h-3.5 w-3.5" /> Apply via UPI
                              </>
                            )}
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                            <ExternalLink className="h-3.5 w-3.5" /> RHP
                          </Button>
                        </>
                      )}

                      {ipo.status === "upcoming" && (
                        <>
                          <Button
                            variant={reminders.has(ipo.id) ? "secondary" : "outline"}
                            size="sm"
                            className="flex items-center gap-1.5"
                            onClick={() => toggleReminder(ipo.id)}
                          >
                            {reminders.has(ipo.id) ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" /> Reminder Set
                              </>
                            ) : (
                              <>
                                <Bell className="h-3.5 w-3.5" /> Set Reminder
                              </>
                            )}
                          </Button>
                          <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                            <ExternalLink className="h-3.5 w-3.5" /> DRHP
                          </Button>
                        </>
                      )}

                      {ipo.status === "closed" && (
                        <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                          <BarChart3 className="h-3.5 w-3.5" /> View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Disclaimer */}
        <motion.div variants={fadeIn}>
          <div className="flex items-start gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Grey Market Premium (GMP) is indicative and based on market speculation — it does not guarantee listing
              performance. AI scores are generated using historical data, market sentiment, and fundamental analysis;
              they should not be considered as financial advice. Always read the DRHP/RHP before applying for any IPO.
              IPO investments carry market risks.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
