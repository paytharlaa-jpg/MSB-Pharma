"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process request");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
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
          <div className="w-14 h-14 rounded-full bg-white p-1 mx-auto mb-3 shadow-lg flex items-center justify-center">
            <Image
              src="/images/logo-msb-pharmachem.png"
              alt="MSB PHARMACHEM"
              width={48}
              height={48}
              className="rounded-full"
            />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Staff Password Recovery</h2>
          <p className="text-xs text-emerald-400 font-medium tracking-wide uppercase mt-0.5">
            Security & Authentication Portal
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-5">
          {submitted ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Instructions Dispatched</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                If an operational account is associated with <strong className="text-slate-800">{email}</strong>, a secure password reset link has been dispatched to your inbox.
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 text-left">
                <p className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Security Notice:
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Reset links expire in 30 minutes.</li>
                  <li>Each link can only be used once.</li>
                  <li>Check your spam folder if the email does not arrive shortly.</li>
                </ul>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div>
                <p className="text-xs text-slate-600">
                  Enter your registered corporate email address below. We will send you a single-use link to choose a new password.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Registered Staff Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. yourname@msbpharmachem.com"
                      className="pl-9"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading}>
                  <span>Send Reset Instructions</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>

              <div className="pt-4 border-t border-slate-100 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center text-[11px] text-slate-500 flex items-center justify-between">
          <Link href="/" className="text-blue-600 hover:underline">
            &larr; Public Website
          </Link>
          <span>MSB PHARMACHEM</span>
        </div>
      </div>
    </div>
  );
}
