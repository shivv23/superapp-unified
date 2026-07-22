"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Shield,
  Brain,
  BookOpen,
  Globe,
  Users,
  BarChart3,
  Clock,
  ChevronRight,
  Zap,
  PieChart,
  ArrowRight,
  Star,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const features = [
  {
    icon: <PieChart className="text-blue-400" size={28} />,
    title: "Portfolio Aggregation",
    description:
      "Consolidate all your investments — stocks, MFs, bonds, gold — into one unified view. Real-time tracking across every asset class.",
  },
  {
    icon: <Globe className="text-gold-400" size={28} />,
    title: "Multi-Asset Access",
    description:
      "Access 15+ asset classes from a single platform. Stocks, mutual funds, REITs, InvITs, bonds, ETFs, gold, and more.",
  },
  {
    icon: <Brain className="text-purple-400" size={28} />,
    title: "AI Advisory",
    description:
      "Personalized, AI-driven investment recommendations based on your risk profile, goals, and market conditions. Always evolving.",
  },
  {
    icon: <BookOpen className="text-emerald-400" size={28} />,
    title: "Financial Literacy",
    description:
      "Interactive courses, bite-sized lessons, and personalized learning paths to make you a smarter investor. 12+ languages supported.",
  },
];

const stats = [
  { value: "15+", label: "Asset Classes", icon: <BarChart3 size={20} /> },
  { value: "AI", label: "Powered Advisory", icon: <Brain size={20} /> },
  { value: "12+", label: "Languages", icon: <Globe size={20} /> },
  { value: "24/7", label: "Market Tracking", icon: <Clock size={20} /> },
];

const steps = [
  {
    step: "01",
    title: "Create Your Account",
    description: "Quick eKYC in under 5 minutes. PAN verification, bank linking, and you're set.",
    icon: <Zap size={24} />,
  },
  {
    step: "02",
    title: "Link Your Investments",
    description: "Connect existing portfolios, import CAS statements, or add holdings manually.",
    icon: <PieChart size={24} />,
  },
  {
    step: "03",
    title: "Get AI Recommendations",
    description: "Our AI analyzes your portfolio, risk profile, and goals to suggest optimal allocations.",
    icon: <Brain size={24} />,
  },
  {
    step: "04",
    title: "Invest & Grow",
    description: "Execute trades, set up SIPs, and track performance — all from one dashboard.",
    icon: <TrendingUp size={24} />,
  },
];

const testimonials: { name: string; role: string; text: string; rating: number }[] = [];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-gradient overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-navy-500/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-gradient flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white">SuperApp Unified</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#testimonials" className="text-sm text-white/60 hover:text-white transition-colors">
              Testimonials
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="gold" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-400/10 rounded-full blur-[128px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8"
            >
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-white/70 font-medium">AI-Powered Investment Platform</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              <span className="text-white">One Platform. </span>
              <span className="gradient-text">Every Asset.</span>
              <br />
              <span className="text-white">Smart Investing for Every </span>
              <span className="gradient-text">Indian.</span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
              Consolidate your portfolio, access 15+ asset classes, get personalized AI advisory,
              and build financial literacy — all from a single, powerful platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button variant="gold" size="lg" className="text-base min-w-[200px]">
                  Start Investing Free
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary" size="lg" className="text-base min-w-[200px]">
                  Explore Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Floating mock dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 relative max-w-5xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="glass-card p-1 rounded-2xl overflow-hidden border border-white/10">
              <div className="bg-navy-500/80 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  <span className="text-xs text-white/30 ml-2">superapp.unified/dashboard</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="glass-card-light p-4 rounded-xl">
                    <p className="text-xs text-white/40 mb-1">Net Worth</p>
                    <p className="text-xl font-bold text-white">₹15,87,340</p>
                    <p className="text-xs text-emerald-400 mt-1">↑ 27.49%</p>
                  </div>
                  <div className="glass-card-light p-4 rounded-xl">
                    <p className="text-xs text-white/40 mb-1">Day Change</p>
                    <p className="text-xl font-bold text-emerald-400">+₹12,450</p>
                    <p className="text-xs text-emerald-400 mt-1">↑ 0.79%</p>
                  </div>
                  <div className="glass-card-light p-4 rounded-xl">
                    <p className="text-xs text-white/40 mb-1">AI Score</p>
                    <p className="text-xl font-bold text-gold-400">87/100</p>
                    <p className="text-xs text-white/40 mt-1">Well Diversified</p>
                  </div>
                </div>
                <div className="h-32 bg-white/5 rounded-xl flex items-end p-4 gap-1">
                  {[40, 55, 45, 65, 50, 70, 60, 75, 55, 80, 65, 85, 70, 90, 75, 95, 80, 88, 92, 97].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-blue-500/60 rounded-t"
                        style={{ height: `${h}%` }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <ChevronDown size={24} className="text-white/30" />
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 bg-white/5 rounded-xl mb-3 text-blue-400">
                  {stat.icon}
                </div>
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-white/40">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Platform Features
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-3 mb-4">
              Everything you need to{" "}
              <span className="gradient-text">invest smarter</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              From portfolio tracking to AI-powered advice, we&apos;ve built every tool
              you need to grow your wealth confidently.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div key={feature.title} variants={fadeInUp}>
                <Card variant="glass-hover" padding="lg" className="h-full">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-5">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/50 leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold text-gold-400 uppercase tracking-wider">
              Getting Started
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-3">
              Start investing in{" "}
              <span className="gradient-text">4 simple steps</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-4 gap-6"
          >
            {steps.map((step, i) => (
              <motion.div key={step.step} variants={fadeInUp} className="relative">
                <Card variant="glass" padding="lg" className="h-full">
                  <div className="text-5xl font-bold text-white/5 mb-4">{step.step}</div>
                  <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{step.description}</p>
                </Card>
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 z-10 text-white/20">
                    <ChevronRight size={20} />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-3">
              Built for <span className="gradient-text">every investor</span>
            </h2>
          </motion.div>

          {testimonials.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6"
            >
              {testimonials.map((t) => (
                <motion.div key={t.name} variants={fadeInUp}>
                  <Card variant="glass" padding="lg" className="h-full">
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} size={14} className="fill-gold-400 text-gold-400" />
                      ))}
                    </div>
                    <p className="text-white/60 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-gradient flex items-center justify-center text-white text-sm font-semibold">
                        {t.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{t.name}</p>
                        <p className="text-xs text-white/40">{t.role}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-white/30">Testimonials coming soon</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 md:p-16 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-gold-400/10 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Ready to transform your <span className="gradient-text">investing journey</span>?
              </h2>
              <p className="text-white/50 max-w-xl mx-auto mb-8">
                Join 100M+ Indians who are already building wealth smarter. It takes just 5 minutes to get started.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/register">
                  <Button variant="gold" size="lg" className="text-base min-w-[220px]">
                    Create Free Account
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-white/30 mt-6">
                No hidden fees. No commissions. Free forever for basic features.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-gradient flex items-center justify-center">
                <TrendingUp size={14} className="text-white" />
              </div>
              <span className="font-bold text-white">SuperApp Unified</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-xs text-white/40 hover:text-white/60 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-xs text-white/40 hover:text-white/60 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-xs text-white/40 hover:text-white/60 transition-colors">
                Investor Charter
              </a>
              <a href="#" className="text-xs text-white/40 hover:text-white/60 transition-colors">
                Grievance Redressal
              </a>
            </div>
            <p className="text-xs text-white/30">
              &copy; 2026 SuperApp Unified. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
