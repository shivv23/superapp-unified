import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "SuperApp Unified — AI-Native Multi-Asset Investment Platform",
  description:
    "One platform for every asset class. AI-powered investment advisory, portfolio aggregation, and financial literacy for every Indian.",
  keywords: [
    "investment",
    "portfolio",
    "stocks",
    "mutual funds",
    "bonds",
    "REITs",
    "AI advisory",
    "fintech",
    "India",
  ],
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-navy-500 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
