"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatPercent } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Shield,
  Star,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

const healthScore = 72;

const scoreBreakdown = [
  { label: "Returns Score", score: 78, color: "blue" as const, description: "Your returns outperform 65% of similar portfolios", icon: TrendingUp },
  { label: "Risk Management", score: 65, color: "gold" as const, description: "Moderate risk with room to optimize", icon: Shield },
  { label: "Diversification", score: 82, color: "green" as const, description: "Well spread across 6 asset classes", icon: Target },
  { label: "Tax Efficiency", score: 63, color: "purple" as const, description: "Consider harvesting losses before FY end", icon: Zap },
];

const issues = [
  { text: "High concentration in Indian equity (59.6%) — Consider international diversification", severity: "high" as const },
  { text: "3 holdings overlap significantly in tech sector (TCS + INFY + HDFCBANK tech exposure)", severity: "medium" as const },
  { text: "Expense ratio drag: Average 0.42% across MF holdings — Switch to direct plans", severity: "medium" as const },
  { text: "No emergency fund allocation visible — Maintain 6 months expenses in liquid funds", severity: "high" as const },
  { text: "Gold allocation (20.9%) above recommended 10–15% for your risk profile", severity: "low" as const },
];

const recommendations = [
  { text: "Add international exposure via Motilal Oswal S&P 500 ETF (3–5% of portfolio)", tag: "Diversification", tagVariant: "info" as const },
  { text: "Switch regular MF plans to direct plans to save 0.5–1% annually", tag: "Cost Saving", tagVariant: "success" as const },
  { text: "Book ₹32,800 in tax losses before March 31 to offset LTCG", tag: "Tax", tagVariant: "warning" as const },
  { text: "Consider increasing debt allocation to 25% as you approach 40", tag: "Rebalancing", tagVariant: "gold" as const },
];

const monthlyScores = [
  { month: "Jul", score: 65 },
  { month: "Aug", score: 67 },
  { month: "Sep", score: 68 },
  { month: "Oct", score: 70 },
  { month: "Nov", score: 69 },
  { month: "Dec", score: 71 },
  { month: "Jan", score: 70 },
  { month: "Feb", score: 72 },
  { month: "Mar", score: 71 },
  { month: "Apr", score: 73 },
  { month: "May", score: 72 },
  { month: "Jun", score: 74 },
  { month: "Jul", score: 72 },
];

const overlaps = [
  { funds: "TCS + Infosys", overlap: 42, description: "technology overlap" },
  { funds: "HDFC Flexi Cap + Parag Parikh Flexi Cap", overlap: 28, description: "overlap in top holdings" },
];

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-gold-400";
  return "text-red-500";
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

export default function AnalyticsPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={fadeIn} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Portfolio Health Score</h1>
            <p className="text-muted-foreground mt-1">Comprehensive analysis of your investment portfolio</p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Analysis
          </Button>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card variant="gradient" className="p-8">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <svg viewBox="0 0 100 50" className="w-56 h-28">
                  <defs>
                    <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="50%" stopColor="#F5A623" />
                      <stop offset="100%" stopColor="#22C55E" />
                    </linearGradient>
                  </defs>
                  <path d="M 5 45 A 45 45 0 0 1 95 45" fill="none" stroke="url(#healthGrad)" strokeWidth="8" strokeLinecap="round" opacity="0.2" />
                  <path d="M 5 45 A 45 45 0 0 1 95 45" fill="none" stroke="url(#healthGrad)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${healthScore * 1.41} 141`} />
                  <circle cx="50" cy="45" r="3" fill="white" transform={`rotate(${(healthScore / 100) * 180 - 90} 50 45)`} style={{ transformOrigin: "50px 45px" }} />
                </svg>
              </div>
              <div className="mt-4">
                <p className="text-6xl font-bold">{healthScore}<span className="text-2xl text-muted-foreground">/100</span></p>
                <Badge variant="gold" className="mt-3 text-base px-4 py-1">
                  <Star className="h-4 w-4 mr-1" />
                  {getScoreLabel(healthScore)}
                </Badge>
                <p className="text-muted-foreground mt-3 max-w-md">Your portfolio is well-structured with room for improvement</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scoreBreakdown.map((item) => (
            <motion.div key={item.label} variants={fadeIn}>
              <Card variant="glass" className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className={`text-2xl font-bold ${getScoreColor(item.score)}`}>{item.score}<span className="text-sm text-muted-foreground">/100</span></p>
                  </div>
                </div>
                <Progress value={item.score} max={100} size="md" color={item.color} showLabel={false} />
                <p className="text-xs text-muted-foreground mt-3">{item.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeIn}>
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Issues Found</CardTitle>
                  <p className="text-sm text-muted-foreground">Areas that need your attention</p>
                </div>
              </div>
              <Badge variant="danger">{issues.length}</Badge>
            </div>
            <div className="space-y-3">
              {issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border hover:bg-card/80 transition-colors">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${
                    issue.severity === "high" ? "text-red-500" : issue.severity === "medium" ? "text-amber-500" : "text-yellow-500"
                  }`} />
                  <p className="text-sm">{issue.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Recommendations</CardTitle>
                  <p className="text-sm text-muted-foreground">Actionable steps to improve your score</p>
                </div>
              </div>
              <Badge variant="success">{recommendations.length}</Badge>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border hover:bg-card/80 transition-colors group">
                  <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="flex-1">
                    <p className="text-sm">{rec.text}</p>
                  </div>
                  <Badge variant={rec.tagVariant}>{rec.tag}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={fadeIn}>
            <Card variant="glass" className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Historical Health Trend</CardTitle>
                  <p className="text-sm text-muted-foreground">Your score over the last 13 months</p>
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-40">
                {monthlyScores.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground font-medium">{m.score}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(m.score / 100) * 100}%` }}
                      transition={{ delay: i * 0.05, duration: 0.4 }}
                      className={`w-full rounded-t-sm ${
                        m.score >= 70 ? "bg-green-500" : m.score >= 60 ? "bg-gold-400" : "bg-red-500"
                      }`}
                    />
                    <span className="text-[9px] text-muted-foreground">{m.month}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card variant="glass" className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Portfolio Overlap Analysis</CardTitle>
                  <p className="text-sm text-muted-foreground">Funds with significant holding overlap</p>
                </div>
              </div>
              <div className="space-y-5">
                {overlaps.map((ov, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">{ov.funds}</p>
                      <Badge variant={ov.overlap > 35 ? "danger" : "warning"}>{ov.overlap}%</Badge>
                    </div>
                    <Progress value={ov.overlap} max={100} size="sm" color={ov.overlap > 35 ? "red" : "gold"} showLabel={false} />
                    <p className="text-xs text-muted-foreground mt-1">{ov.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
