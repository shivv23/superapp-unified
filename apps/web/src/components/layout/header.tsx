"use client";

import React, { useState } from "react";
import { Search, Bell, Menu } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Dropdown } from "@/components/ui/dropdown";
import { useAuth } from "@/lib/auth-context";

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-16 bg-navy-500/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <div
          className={`relative transition-all duration-300 ${
            searchFocused ? "w-80" : "w-64"
          }`}
        >
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            type="text"
            placeholder="Search assets, funds, articles..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold-400 rounded-full" />
        </button>

        <Dropdown
          trigger={<Avatar fallback={user?.full_name?.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "?"} size="md" />}
          items={[
            { label: "Profile", value: "profile" },
            { label: "Account Settings", value: "settings" },
            { label: "Transaction History", value: "transactions" },
            { label: "Help & Support", value: "help" },
            { label: "Sign Out", value: "signout", onClick: logout },
          ]}
        />
      </div>
    </header>
  );
}
