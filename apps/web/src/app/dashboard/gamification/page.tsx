"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Target, Star, Zap, Calendar } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

export default function GamificationPage() {
  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={fadeIn}>
          <h1 className="text-2xl font-bold text-white">Gamification</h1>
          <p className="text-sm text-white/50 mt-1">Track your investment journey and earn rewards</p>
        </motion.div>

        <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="glass-hover" padding="md"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gold-400/20 rounded-xl flex items-center justify-center"><Trophy size={20} className="text-gold-400" /></div><div><p className="text-2xl font-bold text-white">0</p><p className="text-xs text-white/40">Investment Score</p></div></div></Card>
          <Card variant="glass-hover" padding="md"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center"><Flame size={20} className="text-orange-400" /></div><div><p className="text-2xl font-bold text-white">0</p><p className="text-xs text-white/40">Day Streak</p></div></div></Card>
          <Card variant="glass-hover" padding="md"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center"><Star size={20} className="text-purple-400" /></div><div><p className="text-2xl font-bold text-white">0</p><p className="text-xs text-white/40">Badges Earned</p></div></div></Card>
          <Card variant="glass-hover" padding="md"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center"><Zap size={20} className="text-blue-400" /></div><div><p className="text-2xl font-bold text-white">0</p><p className="text-xs text-white/40">XP Points</p></div></div></Card>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card variant="glass" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gold-400/20 rounded-xl flex items-center justify-center"><Trophy size={20} className="text-gold-400" /></div>
              <div><CardTitle>Your Score</CardTitle><p className="text-xs text-white/40">Earn points by investing and learning</p></div>
            </div>
            <div className="text-center py-12">
              <div className="relative inline-flex items-center justify-center w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-white">0</span>
                  <span className="text-xs text-white/40">/100</span>
                </div>
              </div>
              <p className="text-sm text-white/50 mt-4">Start investing to build your score</p>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card variant="glass" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center"><Star size={20} className="text-purple-400" /></div>
              <div><CardTitle>Badges</CardTitle><p className="text-xs text-white/40">Achievements unlocked through your journey</p></div>
            </div>
            <div className="text-center py-12">
              <Star size={48} className="text-white/10 mx-auto mb-4" />
              <p className="text-sm text-white/40">No badges earned yet</p>
              <p className="text-xs text-white/30 mt-1">Complete milestones to unlock badges</p>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
