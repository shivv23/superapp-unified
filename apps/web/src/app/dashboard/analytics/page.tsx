"use client";

import React from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={fadeIn}>
          <h1 className="text-2xl font-bold text-white">Advanced Analytics</h1>
          <p className="text-sm text-white/50 mt-1">Deep insights into your portfolio performance and risk</p>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card variant="glass" padding="lg">
            <div className="text-center py-16">
              <BarChart3 size={48} className="text-white/10 mx-auto mb-4" />
              <p className="text-sm text-white/40 mb-2">No analytics data available</p>
              <p className="text-xs text-white/30">Advanced analytics will be generated once your portfolio has sufficient history</p>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
