"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, ShieldAlert, KeyRound, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [targetName, setTargetName] = useState("");
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setTokenValid(false);
      setTokenError("No password reset token was provided in the link.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (res.ok && data.valid) {
          setTokenValid(true);
          setTargetEmail(data.email || "");
          setTargetName(data.name || "");
        } else {
          setTokenValid(false);
          setTokenError(data.error || "The reset link is invalid or has expired.");
        }
      } catch (err) {
        setTokenValid(false);
        setTokenError("Failed to verify reset token. Please check your connection.");
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (password.length < 8) {
      setSubmitError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setSubmitError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Failed to reset password.");
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
          <h2 className="text-xl font-bold tracking-tight">Set New Password</h2>
          <p className="text-xs text-emerald-400 font-medium tracking-wide uppercase mt-0.5">
            MSB PHARMACHEM Security Portal
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-5">
          {verifying ? (
            <div className="py-12 text-center text-slate-500 space-y-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-medium">Validating cryptographic reset token...</p>
            </div>
          ) : !tokenValid ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto text-red-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Invalid or Expired Link</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                {tokenError || "This password reset token has expired or has already been used."}
              </p>
              <div className="pt-2">
                <Link
                  href="/forgot-password"
                  className="inline-flex items-center justify-center w-full px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                  <span>Request a New Reset Link</span>
                </Link>
              </div>
              <div>
                <Link href="/login" className="text-xs text-slate-500 hover:underline">
                  &larr; Back to Sign In
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Password Updated Successfully</h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Your credentials have been securely updated. Any prior sessions have been invalidated. Please sign in with your new password.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full px-4 py-2.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  <span>Sign In to Operations Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div>
                <p className="text-xs text-slate-600">
                  Setting new password for account: <strong className="text-slate-800">{targetEmail}</strong>
                </p>
              </div>

              {submitError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="pl-9 pr-10"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00488F]/20"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="pl-9 pr-10"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00488F]/20"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500">
                  <p className="font-semibold text-slate-700 mb-0.5">Password Policy:</p>
                  <p className={password.length >= 8 ? "text-emerald-600 font-medium" : ""}>
                    • Minimum 8 characters {password.length >= 8 ? "✓" : `(${password.length}/8)`}
                  </p>
                </div>

                <Button type="submit" variant="primary" className="w-full mt-2" isLoading={loading}>
                  <span>Update Password</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>

              <div className="pt-4 border-t border-slate-100 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel and Return to Sign In</span>
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#071827] flex items-center justify-center p-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
