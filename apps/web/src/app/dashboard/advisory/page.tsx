"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Target, TrendingUp, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiGetRecommendations, apiGetRiskProfileAdvisory, apiGetMarketInsights, type Recommendation, type MarketTrend, type SectorPerformance } from "@/lib/api";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

export default function AdvisoryPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [trends, setTrends] = useState<MarketTrend[]>([]);
  const [sectors, setSectors] = useState<SectorPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [recRes, insightRes] = await Promise.allSettled([
          apiGetRecommendations("moderate", 100000),
          apiGetMarketInsights(),
        ]);
        if (recRes.status === "fulfilled") setRecommendations(recRes.value.data.recommendations);
        if (insightRes.status === "fulfilled") {
          setTrends(insightRes.value.data.market_trends);
          setSectors(insightRes.value.data.sector_performance);
        }
      } catch {
        setError("Failed to load advisory data. Is the advisory service running?");
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={fadeIn} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">AI Advisory</h1>
            <p className="text-sm text-white/50 mt-1">Personalized insights powered by AI</p>
          </div>
          <Button variant="outline" size="sm"><Sparkles size={14} className="mr-2" />Refresh Insights</Button>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-blue-400" /></div>
        ) : error ? (
          <Card variant="glass" padding="lg"><div className="flex items-center gap-3 py-8"><AlertCircle size={20} className="text-amber-400" /><p className="text-sm text-white/70">{error}</p></div></Card>
        ) : (
          <>
            <motion.div variants={fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card variant="glass" padding="lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center"><Sparkles size={20} className="text-blue-400" /></div>
                  <div><CardTitle>Recommendations</CardTitle><p className="text-xs text-white/40">Based on your risk profile</p></div>
                </div>
                {recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {recommendations.map((rec) => (
                      <div key={rec.symbol} className="glass-card-light p-4 rounded-xl hover:bg-white/[0.08] transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-sm font-semibold text-white">{rec.name}</h4>
                            <p className="text-xs text-white/40">{rec.symbol} • {rec.asset_class}</p>
                          </div>
                          <Badge variant="info">{rec.expected_annual_return}</Badge>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed">{rec.reason}</p>
                      </div>
                    ))}
                  </div>
                ) : <div className="text-center py-8"><p className="text-sm text-white/30">No recommendations available</p></div>}
              </Card>

              <Card variant="glass" padding="lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center"><Brain size={20} className="text-purple-400" /></div>
                  <div><CardTitle>Market Trends</CardTitle><p className="text-xs text-white/40">Current market themes</p></div>
                </div>
                {trends.length > 0 ? (
                  <div className="space-y-3">
                    {trends.map((t) => (
                      <div key={t.theme} className="glass-card-light p-4 rounded-xl">
                        <h4 className="text-sm font-medium text-white mb-1">{t.theme}</h4>
                        <Badge variant={t.outlook === "positive" ? "success" : t.outlook === "negative" ? "danger" : "warning"} size="sm">{t.outlook}</Badge>
                        <p className="text-xs text-white/50 mt-2">{t.detail}</p>
                      </div>
                    ))}
                  </div>
                ) : <div className="text-center py-8"><p className="text-sm text-white/30">No market trends available</p></div>}
              </Card>
            </motion.div>

            {sectors.length > 0 && (
              <motion.div variants={fadeIn}>
                <Card variant="glass" padding="lg">
                  <CardTitle>Sector Performance (YTD)</CardTitle>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
                    {sectors.map((s) => (
                      <div key={s.sector} className="glass-card-light p-3 rounded-xl text-center">
                        <p className="text-xs text-white/50 mb-1">{s.sector}</p>
                        <p className={`text-lg font-bold ${s.ytd_return_pct >= 0 ? "text-emerald-400" : "text-red-400"}`}>{s.ytd_return_pct >= 0 ? "+" : ""}{s.ytd_return_pct}%</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
