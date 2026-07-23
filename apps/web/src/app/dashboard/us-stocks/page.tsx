"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatUSD, formatPercent } from "@/lib/utils";
import {
  Globe,
  ArrowUpRight,
  ArrowUp,
  ArrowDown,
  Briefcase,
  Wallet,
  RefreshCw,
  Search,
  TrendingUp,
  Minus,
  ShoppingCart,
  X,
  Info,
  ChevronDown,
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};
const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const USD_INR_RATE = 83.42;

type Sector = "All" | "Technology" | "Finance" | "Healthcare" | "Consumer";
const SECTORS: Sector[] = ["All", "Technology", "Finance", "Healthcare", "Consumer"];

interface Stock {
  ticker: string;
  name: string;
  sector: Sector;
  priceUSD: number;
  qty: number;
  investedUSD: number;
  color: string;
}

const STOCKS: Stock[] = [
  { ticker: "AAPL", name: "Apple Inc", sector: "Technology", priceUSD: 189.84, qty: 15.0, investedUSD: 2550.0, color: "#6366f1" },
  { ticker: "MSFT", name: "Microsoft Corp", sector: "Technology", priceUSD: 422.86, qty: 8.0, investedUSD: 3100.0, color: "#3b82f6" },
  { ticker: "GOOGL", name: "Alphabet Inc", sector: "Technology", priceUSD: 176.33, qty: 12.0, investedUSD: 1800.0, color: "#22c55e" },
  { ticker: "AMZN", name: "Amazon.com Inc", sector: "Consumer", priceUSD: 186.27, qty: 10.0, investedUSD: 1650.0, color: "#f59e0b" },
  { ticker: "NVDA", name: "NVIDIA Corp", sector: "Technology", priceUSD: 131.29, qty: 20.0, investedUSD: 1900.0, color: "#10b981" },
  { ticker: "TSLA", name: "Tesla Inc", sector: "Consumer", priceUSD: 248.42, qty: 5.0, investedUSD: 1100.0, color: "#ef4444" },
  { ticker: "META", name: "Meta Platforms Inc", sector: "Technology", priceUSD: 503.28, qty: 4.0, investedUSD: 1850.0, color: "#8b5cf6" },
  { ticker: "JPM", name: "JPMorgan Chase", sector: "Finance", priceUSD: 200.0, qty: 6.0, investedUSD: 1100.0, color: "#ec4899" },
];

export default function USStocksPage() {
  const [activeTab, setActiveTab] = useState<Sector>("All");
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock>(STOCKS[0]);
  const [amountINR, setAmountINR] = useState<string>("1000");
  const [stockDropdownOpen, setStockDropdownOpen] = useState(false);
  const [exchangeRefreshing, setExchangeRefreshing] = useState(false);

  const filteredStocks =
    activeTab === "All" ? STOCKS : STOCKS.filter((s) => s.sector === activeTab);

  const totalInvested = STOCKS.reduce((acc, s) => acc + s.investedUSD, 0);
  const totalCurrentValue = STOCKS.reduce((acc, s) => acc + s.priceUSD * s.qty, 0);
  const totalChangeUSD = totalCurrentValue - totalInvested;
  const totalChangePct = (totalChangeUSD / totalInvested) * 100;
  const availableBalance = 500.0;

  const parsedAmount = parseFloat(amountINR) || 0;
  const amountUSD = parsedAmount / USD_INR_RATE;
  const sharesPreview = selectedStock ? amountUSD / selectedStock.priceUSD : 0;

  function handleRefresh() {
    setExchangeRefreshing(true);
    setTimeout(() => setExchangeRefreshing(false), 800);
  }

  function getStockPL(stock: Stock) {
    const current = stock.priceUSD * stock.qty;
    return current - stock.investedUSD;
  }

  function getStockReturn(stock: Stock) {
    return ((stock.priceUSD * stock.qty - stock.investedUSD) / stock.investedUSD) * 100;
  }

  return (
    <DashboardLayout>
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeIn} className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Globe className="h-6 w-6 text-blue-400" />
              US Stocks &amp; Fractional Investing
            </h1>
            <p className="text-white/50 text-sm mt-1">
              Invest in global markets with as little as ₹100
            </p>
          </div>
          <Badge variant="info" size="sm" className="mt-2 sm:mt-0 flex items-center gap-1.5 self-start">
            <span>1 USD = ₹{USD_INR_RATE.toFixed(2)}</span>
            <RefreshCw
              className={`h-3 w-3 cursor-pointer ${exchangeRefreshing ? "animate-spin" : ""}`}
              onClick={handleRefresh}
            />
          </Badge>
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={fadeIn} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="glass-hover" className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <Globe className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-white/40">Total US Investment</p>
                <p className="text-lg font-bold text-white">{formatUSD(totalInvested)}</p>
                <p className="text-xs text-white/40">{formatCurrency(totalInvested * USD_INR_RATE)}</p>
              </div>
            </div>
          </Card>

          <Card variant="glass-hover" className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-white/40">Today&apos;s Change</p>
                <p className="text-lg font-bold text-emerald-400">{formatUSD(totalChangeUSD)}</p>
                <p className="text-xs text-emerald-400">{formatPercent(totalChangePct)}</p>
              </div>
            </div>
          </Card>

          <Card variant="glass-hover" className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-white/40">Holdings Count</p>
                <p className="text-lg font-bold text-white">{STOCKS.length} stocks</p>
                <p className="text-xs text-white/40">Across {new Set(STOCKS.map((s) => s.sector)).size} sectors</p>
              </div>
            </div>
          </Card>

          <Card variant="glass-hover" className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-white/40">Available Balance</p>
                <p className="text-lg font-bold text-white">{formatUSD(availableBalance)}</p>
                <p className="text-xs text-white/40">{formatCurrency(availableBalance * USD_INR_RATE)}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tab Filters + Buy Button */}
        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-1.5 bg-white/5 rounded-xl p-1 w-fit">
            {SECTORS.map((sector) => (
              <button
                key={sector}
                onClick={() => setActiveTab(sector)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === sector
                    ? "bg-blue-600 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
          <Button variant="gold" size="md" onClick={() => setBuyDialogOpen(true)} className="flex items-center gap-2 self-start">
            <ShoppingCart className="h-4 w-4" />
            Buy Fractional
          </Button>
        </motion.div>

        {/* Holdings Table */}
        <motion.div variants={fadeIn}>
          <Card variant="glass" className="overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <CardTitle className="text-white text-base">Your Holdings</CardTitle>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-white/40 border-b border-white/5">
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium text-right">Price (USD)</th>
                    <th className="px-4 py-3 font-medium text-right">Price (INR)</th>
                    <th className="px-4 py-3 font-medium text-right">Qty</th>
                    <th className="px-4 py-3 font-medium text-right">Invested</th>
                    <th className="px-4 py-3 font-medium text-right">Current Value</th>
                    <th className="px-4 py-3 font-medium text-right">P&amp;L</th>
                    <th className="px-4 py-3 font-medium text-right">Returns %</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredStocks.map((stock) => {
                      const currentValue = stock.priceUSD * stock.qty;
                      const pl = getStockPL(stock);
                      const ret = getStockReturn(stock);
                      const isPositive = pl >= 0;
                      return (
                        <motion.tr
                          key={stock.ticker}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                                style={{ backgroundColor: stock.color }}
                              >
                                {stock.ticker[0]}
                              </div>
                              <div>
                                <p className="text-white font-medium">{stock.ticker}</p>
                                <p className="text-white/40 text-xs">{stock.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-white font-mono">
                            {formatUSD(stock.priceUSD)}
                          </td>
                          <td className="px-4 py-3 text-right text-white/70 font-mono text-xs">
                            {formatCurrency(stock.priceUSD * USD_INR_RATE)}
                          </td>
                          <td className="px-4 py-3 text-right text-white font-mono">
                            {stock.qty.toFixed(3)}
                          </td>
                          <td className="px-4 py-3 text-right text-white/70 font-mono text-xs">
                            {formatUSD(stock.investedUSD)}
                          </td>
                          <td className="px-4 py-3 text-right text-white font-mono">
                            {formatUSD(currentValue)}
                          </td>
                          <td className={`px-4 py-3 text-right font-mono ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                            {isPositive ? "+" : ""}
                            {formatUSD(pl)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`inline-flex items-center gap-1 font-mono ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                              {isPositive ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowDown className="h-3 w-3" />
                              )}
                              {formatPercent(ret)}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Portfolio Allocation */}
        <motion.div variants={fadeIn}>
          <Card variant="glass" className="p-5">
            <CardTitle className="text-white text-base mb-4">Portfolio Allocation</CardTitle>
            <div className="grid gap-3">
              {STOCKS.map((stock) => {
                const weight = ((stock.priceUSD * stock.qty) / totalCurrentValue) * 100;
                return (
                  <div key={stock.ticker} className="flex items-center gap-3">
                    <div className="w-20 text-xs text-white/60 font-mono">{stock.ticker}</div>
                    <div className="flex-1">
                      <Progress value={weight} max={100} size="sm" color="blue" showLabel />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Buy Fractional Shares Dialog */}
      <AnimatePresence>
        {buyDialogOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setBuyDialogOpen(false);
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b1120]/95 backdrop-blur-xl shadow-2xl"
              >
                {/* Dialog Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-amber-400" />
                    Buy Fractional Shares
                  </h2>
                  <button
                    onClick={() => setBuyDialogOpen(false)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5 space-y-5">
                  {/* Stock Selector */}
                  <div>
                    <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">Select Stock</label>
                    <div className="relative">
                      <button
                        onClick={() => setStockDropdownOpen(!stockDropdownOpen)}
                        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-left hover:border-white/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ backgroundColor: selectedStock.color }}
                          >
                            {selectedStock.ticker[0]}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{selectedStock.ticker}</p>
                            <p className="text-white/40 text-xs">{selectedStock.name}</p>
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4 text-white/40" />
                      </button>

                      <AnimatePresence>
                        {stockDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute z-10 top-full mt-1 w-full rounded-xl bg-[#0f1729] border border-white/10 shadow-xl overflow-hidden"
                          >
                            {STOCKS.map((stock) => (
                              <button
                                key={stock.ticker}
                                onClick={() => {
                                  setSelectedStock(stock);
                                  setStockDropdownOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left ${
                                  selectedStock.ticker === stock.ticker ? "bg-white/5" : ""
                                }`}
                              >
                                <div
                                  className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                  style={{ backgroundColor: stock.color }}
                                >
                                  {stock.ticker[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm font-medium">{stock.ticker}</p>
                                  <p className="text-white/40 text-xs truncate">{stock.name}</p>
                                </div>
                                <span className="text-white/50 text-xs font-mono">{formatUSD(stock.priceUSD)}</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="block text-xs text-white/40 mb-2 uppercase tracking-wider">Investment Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">₹</span>
                      <input
                        type="number"
                        value={amountINR}
                        onChange={(e) => setAmountINR(e.target.value)}
                        min={100}
                        step={100}
                        className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-lg focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all"
                        placeholder="1000"
                      />
                    </div>
                    <p className="text-xs text-white/30 mt-1.5 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Min ₹100 · Available: {formatUSD(availableBalance)}
                    </p>
                  </div>

                  {/* Conversion Display */}
                  <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4">
                    <div className="flex justify-between text-xs text-white/40 mb-1">
                      <span>USD equivalent</span>
                      <span className="text-white/60 font-mono">{formatUSD(amountUSD)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/40 mb-2">
                      <span>You will receive</span>
                      <span className="text-amber-400 font-mono font-bold text-sm">
                        {sharesPreview.toFixed(4)} shares
                      </span>
                    </div>
                    <div className="h-px bg-white/5 my-2" />
                    <div className="flex justify-between text-xs text-white/40">
                      <span>Exchange rate</span>
                      <span className="text-white/60 font-mono">1 USD = ₹{USD_INR_RATE}</span>
                    </div>
                  </div>

                  {/* Preview Order */}
                  <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-4 space-y-2">
                    <p className="text-xs text-blue-400 font-medium uppercase tracking-wider mb-3">Preview Order</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Stock</span>
                      <span className="text-white font-medium">{selectedStock.ticker}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Shares</span>
                      <span className="text-white font-mono">{sharesPreview.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">Price</span>
                      <span className="text-white font-mono">{formatUSD(selectedStock.priceUSD)}</span>
                    </div>
                    <div className="h-px bg-white/5 my-1" />
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-white/70">Total</span>
                      <span className="text-white">{formatCurrency(parsedAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Dialog Footer */}
                <div className="p-5 pt-0 flex gap-3">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setBuyDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      setBuyDialogOpen(false);
                    }}
                    className="flex-1"
                    disabled={parsedAmount < 100}
                  >
                    Confirm Buy
                  </Button>
                </div>
              </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
