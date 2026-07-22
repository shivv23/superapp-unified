"use client";

import React from "react";
import { motion } from "framer-motion";
import { Rocket, TrendingUp, BarChart3 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

export default function IPOPage() {
  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={fadeIn}>
          <h1 className="text-2xl font-bold text-white">IPO Tracker</h1>
          <p className="text-sm text-white/50 mt-1">Track upcoming, live, and past IPOs with AI predictions</p>
        </motion.div>

        <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="glass-hover" padding="md"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center"><Rocket size={20} className="text-blue-400" /></div><div><p className="text-2xl font-bold text-white">0</p><p className="text-xs text-white/40">Upcoming IPOs</p></div></div></Card>
          <Card variant="glass-hover" padding="md"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center"><TrendingUp size={20} className="text-emerald-400" /></div><div><p className="text-2xl font-bold text-white">0</p><p className="text-xs text-white/40">Live IPOs</p></div></div></Card>
          <Card variant="glass-hover" padding="md"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gold-400/20 rounded-xl flex items-center justify-center"><BarChart3 size={20} className="text-gold-400" /></div><div><p className="text-2xl font-bold text-white">0</p><p className="text-xs text-white/40">Past IPOs Tracked</p></div></div></Card>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card variant="glass" padding="lg">
            <div className="text-center py-16">
              <Rocket size={48} className="text-white/10 mx-auto mb-4" />
              <p className="text-sm text-white/40 mb-2">No IPO data available</p>
              <p className="text-xs text-white/30">IPO tracking will be available when market data feeds are connected</p>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
