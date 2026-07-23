"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  Landmark,
  Shield,
  Link2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Wallet,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

const bankAccounts = [
  { name: "HDFC Bank", type: "Savings", status: "linked", lastSync: "2h ago", detail: "Account ending ****4521", color: "#004C8F", icon: "HD" },
  { name: "ICICI Bank", type: "Savings", status: "linked", lastSync: "5h ago", detail: "Account ending ****7832", color: "#F58220", icon: "IC" },
  { name: "SBI", type: "Current", status: "linked", lastSync: "1d ago", detail: "Account ending ****1298", color: "#1C4587", icon: "SB" },
];

const mfFolios = [
  { name: "CAMS", type: "3 Folios", status: "linked", lastSync: "1d ago", detail: "₹3,82,450 total", color: "#0D6EFD", icon: "CA" },
  { name: "KFintech", type: "2 Folios", status: "linked", lastSync: "3d ago", detail: "₹1,45,200 total", color: "#6F42C1", icon: "KF" },
];

const otherAccounts = [
  { name: "EPF Account", type: "Employee Provident Fund", status: "linked", lastSync: "7d ago", detail: "₹4,85,000 balance", color: "#198754", icon: "EP" },
  { name: "LIC India", type: "2 Policies", status: "pending", lastSync: "Never", detail: "Insurance", color: "#DC3545", icon: "LI" },
  { name: "CVL KRA", type: "KYC Verified", status: "linked", lastSync: "30d ago", detail: "KYC status: Verified", color: "#20C997", icon: "CV" },
];

const brokers = [
  { name: "Zerodha", icon: "Z", desc: "India's largest stock broker", connected: true, holdings: 12, lastSync: "15 minutes ago", portfolioValue: 460951.75, pendingOrders: 0, color: "#E23744" },
  { name: "Upstox", icon: "U", desc: "Fast, affordable trading", connected: false, supports: "Equity, F&O, MCX", color: "#5A3EDB" },
  { name: "Angel One", icon: "A", desc: "Smart trading with AI", connected: false, color: "#E8512D" },
  { name: "Groww", icon: "G", desc: "Invest in stocks & mutual funds", connected: false, color: "#00C853" },
];

const netWorthItems = [
  { label: "Bank Balance", amount: 345200 },
  { label: "Mutual Funds", amount: 527650 },
  { label: "EPF", amount: 485000 },
  { label: "Insurance (Sum Assured)", amount: 5000000 },
];

export default function LinkedAccountsPage() {
  const [reSyncing, setReSyncing] = useState<string | null>(null);
  const totalNetWorth = netWorthItems.reduce((sum, item) => sum + item.amount, 0);

  const handleReSync = (name: string) => {
    setReSyncing(name);
    setTimeout(() => setReSyncing(null), 2000);
  };

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={fadeIn} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Linked Accounts & Brokers</h1>
            <p className="text-muted-foreground mt-1">Connect your financial accounts for a unified view</p>
          </div>
          <Button variant="primary">
            <Link2 className="mr-2 h-4 w-4" />
            Link New Account
          </Button>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card variant="glass" className="p-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Landmark className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Account Aggregator (via Sahamati)</CardTitle>
                <p className="text-sm text-muted-foreground">SEBI-registered Account Aggregator framework</p>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Bank Accounts</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {bankAccounts.map((acc) => (
                    <motion.div key={acc.name} variants={fadeIn} className="p-4 rounded-xl border bg-card/50 hover:bg-card/80 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: acc.color }}>
                            {acc.icon}
                          </div>
                          <div>
                            <p className="font-medium">{acc.name}</p>
                            <p className="text-xs text-muted-foreground">{acc.detail}</p>
                          </div>
                        </div>
                        {acc.status === "linked" ? (
                          <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" />Linked</Badge>
                        ) : (
                          <Badge variant="warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Synced {acc.lastSync}
                        </div>
                        <Badge variant="default">{acc.type}</Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => handleReSync(acc.name)} disabled={reSyncing === acc.name}>
                        <RefreshCw className={`h-3 w-3 mr-1 ${reSyncing === acc.name ? "animate-spin" : ""}`} />
                        {reSyncing === acc.name ? "Syncing..." : "Re-sync"}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Mutual Fund Folios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mfFolios.map((acc) => (
                    <motion.div key={acc.name} variants={fadeIn} className="p-4 rounded-xl border bg-card/50 hover:bg-card/80 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: acc.color }}>
                            {acc.icon}
                          </div>
                          <div>
                            <p className="font-medium">{acc.name}</p>
                            <p className="text-xs text-muted-foreground">{acc.detail}</p>
                          </div>
                        </div>
                        <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" />Linked</Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Synced {acc.lastSync}
                        </div>
                        <Badge variant="default">{acc.type}</Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => handleReSync(acc.name)} disabled={reSyncing === acc.name}>
                        <RefreshCw className={`h-3 w-3 mr-1 ${reSyncing === acc.name ? "animate-spin" : ""}`} />
                        {reSyncing === acc.name ? "Syncing..." : "Re-sync"}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Other Accounts</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {otherAccounts.map((acc) => (
                    <motion.div key={acc.name} variants={fadeIn} className="p-4 rounded-xl border bg-card/50 hover:bg-card/80 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: acc.color }}>
                            {acc.icon}
                          </div>
                          <div>
                            <p className="font-medium">{acc.name}</p>
                            <p className="text-xs text-muted-foreground">{acc.detail}</p>
                          </div>
                        </div>
                        {acc.status === "linked" ? (
                          <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" />Linked</Badge>
                        ) : (
                          <Badge variant="warning"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Synced {acc.lastSync}
                        </div>
                        <Badge variant="default">{acc.type}</Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="mt-3 w-full" onClick={() => handleReSync(acc.name)} disabled={reSyncing === acc.name}>
                        <RefreshCw className={`h-3 w-3 mr-1 ${reSyncing === acc.name ? "animate-spin" : ""}`} />
                        {reSyncing === acc.name ? "Syncing..." : "Re-sync"}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card variant="gradient" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gold-500/10 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-gold-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Net Worth Aggregation</CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                    <RefreshCw className="h-3 w-3" />
                    Last synced: 2 hours ago
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {netWorthItems.map((item) => (
                <div key={item.label} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-bold mt-1">{formatCurrency(item.amount)}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-white/10 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Net Worth</p>
                  <p className="text-3xl font-bold text-gold-400">{formatCurrency(totalNetWorth)}</p>
                </div>
                <div className="text-right">
                  <Badge variant="gold" className="text-sm">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.2% this month
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card variant="glass" className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Connect Your Broker</CardTitle>
                <p className="text-sm text-muted-foreground">Integrate your trading accounts for real-time portfolio tracking</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {brokers.map((broker) => (
                <motion.div key={broker.name} variants={fadeIn} className="p-5 rounded-xl border bg-card/50 hover:bg-card/80 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0" style={{ backgroundColor: broker.color }}>
                      {broker.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{broker.name}</h4>
                        {broker.connected ? (
                          <Badge variant="success">Connected</Badge>
                        ) : (
                          <Badge variant="default">Not Connected</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{broker.desc}</p>

                      {broker.connected ? (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Portfolio synced</span>
                            <span className="font-medium">{broker.holdings} holdings</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Last sync</span>
                            <span className="font-medium">{broker.lastSync}</span>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button variant="outline" size="sm">Disconnect</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3">
                          <Button variant="primary" size="sm">
                            <Link2 className="h-3 w-3 mr-1" />
                            Connect via OAuth
                          </Button>
                          {broker.supports && (
                            <p className="text-xs text-muted-foreground mt-2">Supports: {broker.supports}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeIn}>
          <Card variant="glass" className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-lg">Zerodha — Connected Account Details</CardTitle>
                <p className="text-sm text-muted-foreground">Real-time sync active for your trading portfolio</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-card/50 border">
                <p className="text-sm text-muted-foreground">Synced Holdings</p>
                <p className="text-2xl font-bold mt-1">12</p>
              </div>
              <div className="p-4 rounded-xl bg-card/50 border">
                <p className="text-sm text-muted-foreground">Portfolio Value</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(460951.75)}</p>
              </div>
              <div className="p-4 rounded-xl bg-card/50 border">
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold mt-1 text-green-500">0</p>
              </div>
              <div className="p-4 rounded-xl bg-card/50 border">
                <p className="text-sm text-muted-foreground">Day&apos;s P&L</p>
                <p className="text-2xl font-bold mt-1 text-green-500">+₹1,245.30</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="secondary">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </Button>
              <Button variant="ghost">
                View on Zerodha
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
