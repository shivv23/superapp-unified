"use client";

import React from "react";
import { motion } from "framer-motion";
import { Receipt, TrendingDown, ShieldCheck, FileDown } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

export default function TaxOptimizerPage() {
  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={fadeIn}>
          <h1 className="text-2xl font-bold text-white">Tax Optimizer</h1>
          <p className="text-sm text-white/50 mt-1">Minimize your tax liability with smart strategies</p>
        </motion.div>

        <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="glass-hover" padding="md"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center"><Receipt size={20} className="text-blue-400" /></div><div><p className="text-2xl font-bold text-white">₹0</p><p className="text-xs text-white/40">Total Tax Liability</p></div></div></Card>
          <Card variant="glass-hover" padding="md"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center"><TrendingDown size={20} className="text-emerald-400" /></div><div><p className="text-2xl font-bold text-white">0</p><p className="text-xs text-white/40">Loss Harvesting Opportunities</p></div></div></Card>
          <Card variant="glass-hover" padding="md"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gold-400/20 rounded-xl flex items-center justify-center"><ShieldCheck size={20} className="text-gold-400" /></div><div><p className="text-2xl font-bold text-white">0</p><p className="text-xs text-white/40">Tax Saving Recommendations</p></div></div></Card>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card variant="glass" padding="lg">
            <div className="text-center py-16">
              <Receipt size={48} className="text-white/10 mx-auto mb-4" />
              <p className="text-sm text-white/40 mb-2">No tax data available</p>
              <p className="text-xs text-white/30">Tax optimization will be available once your transaction history is populated</p>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
