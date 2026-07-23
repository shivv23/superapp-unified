"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiGetHealthScore, type PortfolioHealth } from "@/lib/api";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  ChevronRight,
  Loader2,
  RefreshCw,
  Shield,
  Star,
  Target,
  TrendingUp,
  Zap,
  AlertCircle,
  Info,
} from "lucide-react";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Returns: TrendingUp,
  "Risk Management": Shield,
  Diversification: Target,
  "Tax Efficiency": Zap,
};

const CATEGORY_COLORS: Record<string, string> = {
  Returns: "blue",
  "Risk Management": "gold",
  Diversification: "green",
  "Tax Efficiency": "purple",
};

const SEVERITY_ICON: Record<string, React.ElementType> = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const SEVERITY_COLOR: Record<string, string> = {
  critical: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-400",
};

const PRIORITY_VARIANT: Record<string, string> = {
  High: "danger",
  Medium: "warning",
  Low: "info",
};

function getScoreColor(score: number) {
  if (score >= 70) return "text-green-500";
  if (score >= 40) return "text-gold-400";
  return "text-red-500";
}

function getGaugeColor(score: number) {
  if (score >= 70) return "green";
  if (score >= 40) return "gold";
  return "red";
}

function getCategoryBadgeVariant(color: string): string {
  switch (color) {
    case "blue": return "info";
    case "green": return "success";
    case "gold": return "warning";
    case "purple": return "default";
    default: return "default";
  }
}

export default function AnalyticsPage() {
  const [health, setHealth] = useState<PortfolioHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setError(null);
      const res = await apiGetHealthScore();
      if (res.status === "success") {
        setHealth(res.data);
      } else {
        setError("Failed to load portfolio health data");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load portfolio health data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setLoading(true);
    fetchData();
  };

  if (loading && !health) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Analyzing your portfolio...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !health) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-muted-foreground text-sm">{error}</p>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!health) return null;

  const gaugeRotation = (health.overall_score / 100) * 180 - 90;
  const gaugeColor = getGaugeColor(health.overall_score);
  const gaugeGradientId = `gauge-${gaugeColor}`;

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
                  <path d="M 5 45 A 45 45 0 0 1 95 45" fill="none" stroke="url(#healthGrad)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${health.overall_score * 1.41} 141`} />
                  <circle cx="50" cy="45" r="3" fill="white" transform={`rotate(${gaugeRotation} 50 45)`} style={{ transformOrigin: "50px 45px" }} />
                </svg>
              </div>
              <div className="mt-4">
                <p className="text-6xl font-bold">{health.overall_score}<span className="text-2xl text-muted-foreground">/100</span></p>
                <Badge variant={health.overall_score >= 70 ? "success" : health.overall_score >= 40 ? "warning" : "danger"} className="mt-3 text-base px-4 py-1">
                  <Star className="h-4 w-4 mr-1" />
                  {health.grade}
                </Badge>
                <p className="text-muted-foreground mt-3 max-w-md">{health.grade_description}</p>
              </div>
            </div>

            {health.summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border/50">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Invested</p>
                  <p className="text-lg font-bold">{formatCurrency(health.summary.total_invested)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Current Value</p>
                  <p className="text-lg font-bold">{formatCurrency(health.summary.current_value)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Overall P&L</p>
                  <p className={`text-lg font-bold ${health.summary.overall_pnl >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatCurrency(health.summary.overall_pnl)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Returns</p>
                  <p className={`text-lg font-bold ${health.summary.total_returns_pct >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatPercent(health.summary.total_returns_pct)}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {health.categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.name] || Brain;
            const color = CATEGORY_COLORS[cat.name] || "blue";
            return (
              <motion.div key={cat.name} variants={fadeIn}>
                <Card variant="glass" className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{cat.name}</p>
                      <p className={`text-2xl font-bold ${getScoreColor(cat.score)}`}>{cat.score}<span className="text-sm text-muted-foreground">/100</span></p>
                    </div>
                  </div>
                  <Progress value={cat.score} max={100} size="md" color={color as any} showLabel={false} />
                  <p className="text-xs text-muted-foreground mt-3">{cat.description}</p>
                </Card>
              </motion.div>
            );
          })}
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
              <Badge variant="danger">{health.issues.length}</Badge>
            </div>
            <div className="space-y-3">
              {health.issues.map((issue, i) => {
                const SeverityIcon = SEVERITY_ICON[issue.severity] || AlertTriangle;
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border hover:bg-card/80 transition-colors">
                    <SeverityIcon className={`h-4 w-4 mt-0.5 shrink-0 ${SEVERITY_COLOR[issue.severity] || "text-muted-foreground"}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{issue.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{issue.description}</p>
                      <Badge variant="default" className="mt-1.5 text-[10px]">{issue.category}</Badge>
                    </div>
                  </div>
                );
              })}
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
              <Badge variant="success">{health.recommendations.length}</Badge>
            </div>
            <div className="space-y-3">
              {health.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border hover:bg-card/80 transition-colors group">
                  <ChevronRight className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{rec.title}</p>
                      <Badge variant={PRIORITY_VARIANT[rec.priority] as any || "default"}>{rec.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                    <Badge variant="default" className="mt-1.5 text-[10px]">{rec.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card variant="glass" className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Brain className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Historical Health Trend</CardTitle>
                <p className="text-sm text-muted-foreground">Score trend over time</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Health score trend requires historical data. Check back after a few analysis runs.</p>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
