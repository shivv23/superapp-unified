"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  Bell,
  Palette,
  Globe,
  Link,
  ChevronRight,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const settingsSections = [
  {
    icon: <User size={18} />,
    title: "Personal Information",
    description: "Manage your name, email, phone number",
    color: "blue",
  },
  {
    icon: <Shield size={18} />,
    title: "Security & Privacy",
    description: "Password, 2FA, login history",
    color: "emerald",
  },
  {
    icon: <Bell size={18} />,
    title: "Notifications",
    description: "Email, push, SMS preferences",
    color: "amber",
  },
  {
    icon: <Palette size={18} />,
    title: "Appearance",
    description: "Theme, layout, display settings",
    color: "purple",
  },
  {
    icon: <Globe size={18} />,
    title: "Language & Region",
    description: "Language, currency, date format",
    color: "cyan",
  },
  {
    icon: <Link size={18} />,
    title: "Connected Accounts",
    description: "Broker, bank, D-Mat linked accounts",
    color: "pink",
  },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-600/20 text-blue-400",
  emerald: "bg-emerald-500/20 text-emerald-400",
  amber: "bg-amber-500/20 text-amber-400",
  purple: "bg-purple-500/20 text-purple-400",
  cyan: "bg-cyan-500/20 text-cyan-400",
  pink: "bg-pink-500/20 text-pink-400",
};

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6 max-w-3xl">
        <motion.div variants={fadeIn}>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-white/50 mt-1">Manage your account preferences</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div variants={fadeIn}>
          <Card variant="glass" padding="lg">
            <div className="flex items-center gap-4">
              <Avatar fallback={user?.full_name?.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "?"} size="lg" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{user?.full_name || "User"}</h3>
                <p className="text-sm text-white/50">{user?.email || ""}</p>
                <div className="flex items-center gap-2 mt-2">
                  {user?.is_verified && <Badge variant="success" size="sm">Email Verified</Badge>}
                  <Badge variant="info" size="sm">{user?.phone || "No phone"}</Badge>
                </div>
              </div>
              <Button variant="outline" size="sm">Edit Profile</Button>
            </div>
          </Card>
        </motion.div>

        {/* Settings Sections */}
        <motion.div variants={stagger} className="space-y-3">
          {settingsSections.map((section) => (
            <motion.div key={section.title} variants={fadeIn}>
              <Card variant="glass-hover" padding="md" className="cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[section.color]}`}>
                    {section.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{section.title}</p>
                    <p className="text-xs text-white/40">{section.description}</p>
                  </div>
                  <ChevronRight size={16} className="text-white/30" />
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={fadeIn}>
          <Card variant="glass" padding="lg" className="border-red-500/20">
            <CardTitle className="text-red-400">Danger Zone</CardTitle>
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="text-sm text-white/70">Delete Account</p>
                <p className="text-xs text-white/40">Permanently delete your account and data</p>
              </div>
              <Button variant="danger" size="sm">Delete Account</Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
