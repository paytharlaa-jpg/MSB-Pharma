"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  const fillEmail = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#071827]">
      {/* Background Cinematic Visual */}
      <div className="absolute inset-0 z-0 opacity-25">
        <Image
          src="/images/hero-scientific-background.webp"
          alt="Molecular Lattice"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071827] via-[#071827]/80 to-[#071827]/60" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0B1F33] p-6 text-center text-white border-b border-slate-800">
          <div className="w-16 h-16 rounded-full bg-white p-1 mx-auto mb-3 shadow-lg flex items-center justify-center">
            <Image
              src="/images/logo-msb-pharmachem.png"
              alt="MSB PHARMACHEM"
              width={58}
              height={58}
              className="rounded-full"
            />
          </div>
          <h2 className="text-xl font-bold tracking-tight">MSB PHARMACHEM</h2>
          <p className="text-xs text-emerald-400 font-medium tracking-wide uppercase mt-0.5">
            Internal Business Portal
          </p>
        </div>

        {/* Login Form */}
        <div className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Staff Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@msbpharmachem.com"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-9"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading}>
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick Staff Account Selector */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Select email address (enter your password above):</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => fillEmail("paytharlaa@gmail.com")}
                className="col-span-2 px-2.5 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-[11px] font-semibold text-left flex items-center justify-between transition-colors"
              >
                <span>👑 Super Admin (Abhiram)</span>
                <span className="text-[10px] text-blue-600 font-mono">paytharlaa@gmail.com</span>
              </button>
              <button
                type="button"
                onClick={() => fillEmail("admin@msbpharmachem.com")}
                className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-medium text-left truncate transition-colors"
              >
                👑 Admin (Mohan K)
              </button>
              <button
                type="button"
                onClick={() => fillEmail("sales@msbpharmachem.com")}
                className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-medium text-left truncate transition-colors"
              >
                💼 Sales Lead
              </button>
              <button
                type="button"
                onClick={() => fillEmail("accounts@msbpharmachem.com")}
                className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-medium text-left truncate transition-colors"
              >
                📊 Accounts Dept
              </button>
              <button
                type="button"
                onClick={() => fillEmail("inventory@msbpharmachem.com")}
                className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-medium text-left truncate transition-colors"
              >
                📦 Inventory Officer
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center text-[11px] text-slate-500 flex items-center justify-between">
          <Link href="/" className="text-blue-600 hover:underline">
            &larr; Back to Public Website
          </Link>
          <span>MSB PHARMACHEM</span>
        </div>
      </div>
    </div>
  );
}
