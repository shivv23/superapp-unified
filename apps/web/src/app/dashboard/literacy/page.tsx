"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock, Award, Flame, CheckCircle2, ArrowRight, FileText, Play } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

export default function LiteracyPage() {
  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={fadeIn}>
          <h1 className="text-2xl font-bold text-white">Financial Literacy</h1>
          <p className="text-sm text-white/50 mt-1">Build your investment knowledge with courses and articles</p>
        </motion.div>

        <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="glass-hover" padding="md"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center"><Flame size={20} className="text-orange-400" /></div><div><p className="text-2xl font-bold text-white">0</p><p className="text-xs text-white/40">Day Streak</p></div></div></Card>
          <Card variant="glass-hover" padding="md"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center"><Clock size={20} className="text-blue-400" /></div><div><p className="text-2xl font-bold text-white">0h</p><p className="text-xs text-white/40">Hours Learned</p></div></div></Card>
          <Card variant="glass-hover" padding="md"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center"><CheckCircle2 size={20} className="text-emerald-400" /></div><div><p className="text-2xl font-bold text-white">0</p><p className="text-xs text-white/40">Courses Done</p></div></div></Card>
          <Card variant="glass-hover" padding="md"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gold-400/20 rounded-xl flex items-center justify-center"><Award size={20} className="text-gold-400" /></div><div><p className="text-2xl font-bold text-white">0</p><p className="text-xs text-white/40">Best Streak</p></div></div></Card>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card variant="glass" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center"><BookOpen size={20} className="text-emerald-400" /></div>
              <div><CardTitle>Available Courses</CardTitle><p className="text-xs text-white/40">Start learning to track your progress here</p></div>
            </div>
            <div className="text-center py-16">
              <BookOpen size={48} className="text-white/10 mx-auto mb-4" />
              <p className="text-sm text-white/40 mb-2">No courses started yet</p>
              <p className="text-xs text-white/30">Complete courses to see your streaks, progress, and achievements</p>
              <Button variant="outline" size="sm" className="mt-4"><Play size={14} className="mr-2" />Browse Courses</Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
