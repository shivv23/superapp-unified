"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Star, X, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiGetProducts, type MarketProduct } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

const categories = ["All", "equity", "mutual_fund", "reit", "invit", "bond", "gold"] as const;
const riskColors: Record<string, string> = { low: "success", moderate: "warning", high: "danger" };

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const stagger = { animate: { transition: { staggerChildren: 0.06 } } };

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const params: Record<string, string> = { limit: "50" };
      if (activeCategory !== "All") params.type = activeCategory;
      if (searchQuery) params.search = searchQuery;
      try {
        const res = await apiGetProducts(params);
        setProducts(res.data);
      } catch {
        setProducts([]);
      }
      setLoading(false);
    }
    load();
  }, [activeCategory, searchQuery]);

  return (
    <DashboardLayout>
      <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-6">
        <motion.div variants={fadeIn}>
          <h1 className="text-2xl font-bold text-white">Marketplace</h1>
          <p className="text-sm text-white/50 mt-1">Discover and invest across multiple asset classes</p>
        </motion.div>

        <motion.div variants={fadeIn} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search stocks, funds, bonds..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all" />
            {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 cursor-pointer"><X size={14} /></button>}
          </div>
        </motion.div>

        <motion.div variants={fadeIn} className="flex gap-1 p-1 bg-white/5 rounded-xl overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer capitalize ${activeCategory === cat ? "bg-blue-600 text-white shadow-glow" : "text-white/50 hover:text-white hover:bg-white/5"}`}>{cat === "All" ? "All Assets" : cat.replace("_", " ")}</button>
          ))}
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-blue-400" /></div>
        ) : (
          <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <motion.div key={product.id} variants={fadeIn}>
                <Card variant="glass-hover" padding="lg" className="h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-white">{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-white/40">{product.ticker}</span>
                        <Badge variant="default" size="sm">{product.type.replace("_", " ")}</Badge>
                      </div>
                    </div>
                    {product.rating > 0 && <div className="flex items-center gap-1"><Star size={12} className="fill-gold-400 text-gold-400" /><span className="text-xs text-white/70">{product.rating}</span></div>}
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed mb-4 line-clamp-2">{product.description}</p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div><p className="text-[10px] text-white/30 mb-0.5">Price</p><p className="text-sm font-semibold text-white">{formatCurrency(product.current_price)}</p></div>
                    <div><p className="text-[10px] text-white/30 mb-0.5">Expected Returns</p><p className="text-sm font-semibold text-emerald-400">{product.expected_returns || "N/A"}</p></div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant={(riskColors[product.risk_level] as "success" | "warning" | "danger") || "default"}>{product.risk_level} Risk</Badge>
                    <span className="text-xs text-white/30">•</span>
                    <span className="text-xs text-white/50">Min: {formatCurrency(product.min_investment)}</span>
                  </div>
                  <div className="mt-auto flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">Details</Button>
                    <Button size="sm" className="flex-1">Invest</Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && products.length === 0 && (
          <Card variant="glass" padding="lg"><div className="text-center py-12"><Search size={32} className="text-white/20 mx-auto mb-3" /><p className="text-sm text-white/40">No products found. Start the marketplace service to browse assets.</p></div></Card>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
