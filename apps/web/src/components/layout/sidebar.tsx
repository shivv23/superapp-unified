"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  ShoppingBag,
  BrainCircuit,
  Trophy,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Receipt,
  Rocket,
  LogOut,
  Globe,
  TrendingDown,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { label: "Portfolio", href: "/dashboard/portfolio", icon: <Briefcase size={20} /> },
  { label: "US Stocks", href: "/dashboard/us-stocks", icon: <Globe size={20} /> },
  { label: "Analytics", href: "/dashboard/analytics", icon: <BarChart3 size={20} /> },
  { label: "IPO Tracker", href: "/dashboard/ipos", icon: <Rocket size={20} /> },
  { label: "F&O Trading", href: "/dashboard/fo-trading", icon: <TrendingDown size={20} /> },
  { label: "Advisory", href: "/dashboard/advisory", icon: <BrainCircuit size={20} />, badge: 3 },
  { label: "Tax Optimizer", href: "/dashboard/tax-optimizer", icon: <Receipt size={20} /> },
  { label: "Linked Accounts", href: "/dashboard/linked-accounts", icon: <Link2 size={20} /> },
  { label: "Gamification", href: "/dashboard/gamification", icon: <Trophy size={20} /> },
  { label: "Literacy", href: "/dashboard/literacy", icon: <BookOpen size={20} /> },
  { label: "Settings", href: "/dashboard/settings", icon: <Settings size={20} /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-full bg-navy-500/80 backdrop-blur-xl border-r border-white/5 z-40 flex flex-col"
    >
      <div className="flex items-center h-16 px-4 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-blue-gradient flex items-center justify-center flex-shrink-0">
            <TrendingUp size={18} className="text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-base text-white whitespace-nowrap overflow-hidden"
              >
                SuperApp
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group",
                isActive
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-blue-500 rounded-r-full"
                  transition={{ duration: 0.2 }}
                />
              )}
              <div className="flex-shrink-0">{item.icon}</div>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && item.badge && (
                <span className="ml-auto bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full cursor-pointer"
        >
          <LogOut size={18} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-white/5 text-white/30 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </motion.aside>
  );
}
