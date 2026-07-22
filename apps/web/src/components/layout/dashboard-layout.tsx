"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { AssistantButton } from "@/components/ai-assistant/assistant-button";
import { AssistantPanel } from "@/components/ai-assistant/assistant-panel";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-blue-400" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-dark-gradient">
      <Sidebar />
      <div className="lg:ml-64 transition-all duration-300">
        <Header onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="p-6 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>

      <AnimatePresence>
        <AssistantButton
          onClick={() => setAssistantOpen(true)}
          isOpen={assistantOpen}
        />
        <AssistantPanel
          isOpen={assistantOpen}
          onClose={() => setAssistantOpen(false)}
        />
      </AnimatePresence>
    </div>
  );
}
