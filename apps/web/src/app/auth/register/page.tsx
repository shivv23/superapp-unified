"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, ArrowRight, ArrowLeft, Check, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, authLoading, router]);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validatePhone = (p: string) => /^\+?[6-9]\d{9,12}$/.test(p.replace(/\s/g, ""));

  const handleStep0Continue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) { setError("Full name is required."); return; }
    if (formData.name.trim().split(" ").length < 2) { setError("Please enter your full name (first and last)."); return; }
    if (!formData.email.trim()) { setError("Email is required."); return; }
    if (!validateEmail(formData.email)) { setError("Please enter a valid email address."); return; }
    if (!formData.phone.trim()) { setError("Phone number is required."); return; }
    if (!validatePhone(formData.phone)) { setError("Please enter a valid 10-digit Indian mobile number."); return; }
    if (!formData.password) { setError("Password is required."); return; }
    if (formData.password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    const result = await register(formData.email.trim(), formData.password, formData.name.trim(), formData.phone.trim());
    setLoading(false);

    if (result.success) {
      setCurrentStep(1);
    } else {
      setError(result.error || "Registration failed.");
    }
  };

  const handleFinalComplete = () => {
    router.push("/dashboard");
  };

  const steps = [
    { id: 0, label: "Personal Info" },
    { id: 1, label: "PAN Verification" },
    { id: 2, label: "Bank Details" },
    { id: 3, label: "eKYC" },
  ];

  const progress = (currentStep / (steps.length - 1)) * 100;

  if (authLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-gradient flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-gold-400/10 rounded-full blur-[128px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-gradient flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl text-white">SuperApp Unified</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-sm text-white/50">Start your investment journey in minutes</p>
        </div>

        {currentStep > 0 && (
          <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50">Account Setup</span>
              <span className="text-xs text-blue-400 font-medium">Step {currentStep + 1} of {steps.length}</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} className="h-full bg-blue-gradient rounded-full" />
            </div>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${i < currentStep ? "bg-emerald-500 text-white" : i === currentStep ? "bg-blue-600 text-white" : "bg-white/10 text-white/30"}`}>
                    {i < currentStep ? <Check size={12} /> : step.id + 1}
                  </div>
                  <span className={`text-xs transition-colors ${i <= currentStep ? "text-white/80" : "text-white/30"}`}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8">
          {currentStep === 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <form onSubmit={handleStep0Continue} className="space-y-4">
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                    <span className="text-xs text-red-400">{error}</span>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-sm text-white/70 font-medium">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="text" value={formData.name} onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setError(""); }} placeholder="Your full name" autoComplete="name" className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/70 font-medium">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="email" value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setError(""); }} placeholder="you@email.com" autoComplete="email" className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/70 font-medium">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="tel" value={formData.phone} onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setError(""); }} placeholder="+91 98765 43210" autoComplete="tel" className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/70 font-medium">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="password" value={formData.password} onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setError(""); }} placeholder="Min 8 characters" autoComplete="new-password" className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all" />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-gold-400 hover:bg-gold-300 disabled:opacity-50 disabled:cursor-not-allowed text-navy-900 font-semibold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-glow-gold hover:shadow-[0_0_30px_rgba(245,166,35,0.4)] active:scale-[0.98] mt-2">
                  {loading ? (<><Loader2 size={16} className="animate-spin" /> Creating account...</>) : (<>Continue <ArrowRight size={16} /></>)}
                </button>
              </form>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-white">PAN Verification</h3>
                <p className="text-xs text-white/50 mt-1">Required for tax compliance and identity verification</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70 font-medium">PAN Number</label>
                <input type="text" placeholder="ABCDE1234F" maxLength={10} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all uppercase tracking-wider" />
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setCurrentStep(0)} className="flex-1 border border-white/10 text-white/60 hover:text-white py-3 rounded-xl text-sm font-medium transition-all cursor-pointer">Back</button>
                <button onClick={() => setCurrentStep(2)} className="flex-1 bg-gold-400 hover:bg-gold-300 text-navy-900 font-semibold py-3 rounded-xl transition-all cursor-pointer">Verify PAN</button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-white">Bank Details</h3>
                <p className="text-xs text-white/50 mt-1">Link your bank account for seamless transactions</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70 font-medium">Account Number</label>
                <input type="text" placeholder="Enter account number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70 font-medium">IFSC Code</label>
                <input type="text" placeholder="HDFC0001234" maxLength={11} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all uppercase" />
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setCurrentStep(1)} className="flex-1 border border-white/10 text-white/60 hover:text-white py-3 rounded-xl text-sm font-medium transition-all cursor-pointer"><ArrowLeft size={14} className="inline mr-1" /> Back</button>
                <button onClick={() => setCurrentStep(3)} className="flex-1 bg-gold-400 hover:bg-gold-300 text-navy-900 font-semibold py-3 rounded-xl transition-all cursor-pointer">Link Bank</button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-white">eKYC Verification</h3>
                <p className="text-xs text-white/50 mt-1">Verify your identity using Aadhaar-based eKYC</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70 font-medium">Aadhaar Number</label>
                <input type="text" placeholder="XXXX XXXX XXXX" maxLength={14} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all" />
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setCurrentStep(2)} className="flex-1 border border-white/10 text-white/60 hover:text-white py-3 rounded-xl text-sm font-medium transition-all cursor-pointer"><ArrowLeft size={14} className="inline mr-1" /> Back</button>
                <button onClick={handleFinalComplete} className="flex-1 bg-gold-400 hover:bg-gold-300 text-navy-900 font-semibold py-3 rounded-xl transition-all cursor-pointer">Complete</button>
              </div>
            </motion.div>
          )}

          <p className="text-center text-xs text-white/40 mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
