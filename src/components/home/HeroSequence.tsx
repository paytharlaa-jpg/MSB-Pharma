"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  Send,
  Activity,
  MapPin,
  ShieldCheck,
  Globe2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RotatingGlobeScene } from "./RotatingGlobeScene";
import gsap from "gsap";

export function HeroSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rightGraphicsRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const introTl = gsap.timeline({ delay: 0.1 });

      introTl
        .from(".hero-pill-badge", {
          opacity: 0,
          y: -20,
          scale: 0.9,
          duration: 0.7,
          ease: "back.out(1.5)",
        })
        .from(
          ".hero-title-main",
          {
            opacity: 0,
            y: 30,
            duration: 0.9,
            ease: "power3.out",
          },
          "-=0.4"
        )
        .from(
          ".hero-desc-text",
          {
            opacity: 0,
            y: 20,
            duration: 0.7,
            ease: "power2.out",
          },
          "-=0.5"
        )
        .from(
          ".hero-trust-badge",
          {
            opacity: 0,
            y: 15,
            stagger: 0.1,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.4"
        )
        .from(
          ".hero-cta-btn",
          {
            opacity: 0,
            scale: 0.92,
            stagger: 0.12,
            duration: 0.6,
            ease: "back.out(1.4)",
          },
          "-=0.3"
        )
        .from(
          rightGraphicsRef.current,
          {
            opacity: 0,
            scale: 0.9,
            duration: 1.1,
            ease: "power3.out",
          },
          "-=0.7"
        );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative bg-white text-slate-900 overflow-clip min-h-[90vh] lg:min-h-[calc(100vh-4.5rem)] flex flex-col justify-between py-12 lg:py-6 border-b border-slate-200/90"
      aria-label="MSB PHARMACHEM Cinematic Hero"
    >
      {/* Dynamic Animated Moving Gradient Elements in Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Crisp High-Tech Scientific Grid */}
        <div className="absolute inset-0 scientific-grid-bg opacity-75" />

        {/* Luminous Animated Drifting Gradient Orbs in #1b4db3 and #3a991d */}
        <div className="absolute -top-24 left-1/4 w-[540px] h-[540px] rounded-full bg-[#1b4db3]/10 blur-[120px] animate-drift-1" />
        <div className="absolute top-1/3 right-10 w-[580px] h-[580px] rounded-full bg-[#3a991d]/12 blur-[130px] animate-drift-2" />
        <div className="absolute -bottom-20 left-10 w-[460px] h-[460px] rounded-full bg-[#2563eb]/8 blur-[110px]" />

        {/* Floating Geometric Orbital Guides */}
        <div className="absolute top-12 right-1/4 w-[600px] h-[600px] rounded-full border border-dashed border-[#1b4db3]/15 animate-spin-orbital pointer-events-none" />
        <div className="absolute top-24 right-[28%] w-[420px] h-[420px] rounded-full border border-[#3a991d]/15 animate-spin-orbital-reverse pointer-events-none" />
      </div>

      {/* Main Dual-Column Hero Composition */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto py-6 lg:py-8">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* LEFT COLUMN: Editorial Text & High-Converting CTAs (6.5 Cols) */}
          <div ref={leftContentRef} className="lg:col-span-6 space-y-6">
            
            {/* Precision Pill Badge */}
            <div className="hero-pill-badge inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#edf3fd] to-[#edf8eb] border border-[#1b4db3]/25 text-[#1b4db3] text-xs font-bold shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3a991d] animate-pulse shadow-[0_0_8px_#3a991d]" />
              <span className="tracking-wide font-mono text-[11px] uppercase">
                GLOBAL PHARMACEUTICAL SOURCING · HYDERABAD HUB
              </span>
            </div>

            {/* Main Headline with Kinetic Shimmer */}
            <h1 className="hero-title-main text-4xl sm:text-6xl lg:text-[64px] font-black tracking-tight text-slate-900 leading-[1.08] font-heading">
              World-Class APIs. <br />
              <span className="text-gradient-shimmer inline-block">
                Precision in Every Molecule.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="hero-desc-text text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-xl">
              Reliable pharmaceutical active ingredients (APIs), excipients, intermediates, and verified supply-chain coordination. Sourced from accredited manufacturers, verified by COA monographs, and distributed worldwide.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-slate-700 pt-1">
              <span className="hero-trust-badge flex items-center gap-1.5 bg-slate-50 hover:bg-[#edf3fd] transition-colors px-3 py-1.5 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#3a991d] shrink-0" />
                <span>COA & MSDS Authenticated</span>
              </span>
              <span className="hero-trust-badge flex items-center gap-1.5 bg-slate-50 hover:bg-[#edf3fd] transition-colors px-3 py-1.5 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#1b4db3] shrink-0" />
                <span>Hyderabad Central Hub</span>
              </span>
              <span className="hero-trust-badge flex items-center gap-1.5 bg-slate-50 hover:bg-[#edf8eb] transition-colors px-3 py-1.5 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-[#3a991d] shrink-0" />
                <span>18+ Years Industry Heritage</span>
              </span>
            </div>

            {/* Primary Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/products" className="hero-cta-btn">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-[#1b4db3] hover:bg-[#153e94] text-white shadow-lg shadow-[#1b4db3]/25 text-sm font-bold tracking-wide"
                >
                  <span>Explore Product Catalog</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              <Link href="/contact" className="hero-cta-btn">
                <Button
                  variant="brand-green"
                  size="lg"
                  className="bg-[#3a991d] hover:bg-[#2e7b17] text-white shadow-lg shadow-[#3a991d]/25 text-sm font-bold tracking-wide"
                >
                  <Send className="w-4 h-4 mr-2" />
                  <span>Request Instant RFQ</span>
                </Button>
              </Link>
            </div>

            {/* Quick Metrics Ribbon */}
            <div className="pt-4 border-t border-slate-200/80 flex items-center gap-6 sm:gap-8 text-xs font-mono">
              <div>
                <span className="block text-xl sm:text-2xl font-black text-[#1b4db3] font-heading">
                  18+
                </span>
                <span className="text-slate-500 uppercase text-[10px]">Active APIs & Chemicals</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <span className="block text-xl sm:text-2xl font-black text-[#3a991d] font-heading">
                  ≥ 99.8%
                </span>
                <span className="text-slate-500 uppercase text-[10px]">Assay Purity Standard</span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <span className="block text-xl sm:text-2xl font-black text-slate-800 font-heading">
                  24–48h
                </span>
                <span className="text-slate-500 uppercase text-[10px]">Hyderabad Dispatch</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: 3D Rotating World / Globe Motion Scene (5.5 Cols) */}
          <div
            ref={rightGraphicsRef}
            className="lg:col-span-6 relative flex items-center justify-center min-h-[420px] sm:min-h-[480px] lg:min-h-[540px]"
          >
            {/* Background Multi-Ring Orbital Circles */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[380px] h-[380px] sm:w-[480px] sm:h-[480px] rounded-full border border-dashed border-[#1b4db3]/20 flex items-center justify-center animate-spin-orbital" />
              <div className="absolute w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] rounded-full border border-[#3a991d]/20 animate-spin-orbital-reverse" />
              <div className="absolute w-[180px] h-[180px] rounded-full bg-gradient-to-tr from-[#1b4db3]/10 to-[#3a991d]/10 blur-xl" />
            </div>

            {/* 3D Rotating Interactive World/Globe Scene */}
            <div className="relative z-10 w-full h-[360px] sm:h-[440px] lg:h-[500px] flex items-center justify-center">
              <RotatingGlobeScene scrollProgress={0} />
            </div>

            {/* HUD CARD 1: Top-Right Chromatography & Purity Readout */}
            <div className="absolute -top-3 right-0 sm:right-2 z-20 glass-panel-light p-3.5 rounded-2xl shadow-xl border border-slate-200/90 max-w-[210px] sm:max-w-[240px]">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#1b4db3] pb-1.5 border-b border-slate-100">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[#1b4db3]" />
                  <span>HPLC ASSAY PURITY</span>
                </span>
                <span className="text-[#3a991d] font-bold">99.9%</span>
              </div>

              <div className="py-2 flex items-center justify-between gap-1 h-7">
                <span className="waveform-bar" style={{ animationDelay: "0.1s" }} />
                <span className="waveform-bar" style={{ animationDelay: "0.4s" }} />
                <span className="waveform-bar" style={{ animationDelay: "0.2s" }} />
                <span className="waveform-bar" style={{ animationDelay: "0.6s" }} />
                <span className="waveform-bar" style={{ animationDelay: "0.3s" }} />
                <span className="waveform-bar" style={{ animationDelay: "0.5s" }} />
                <span className="waveform-bar" style={{ animationDelay: "0.25s" }} />
                <span className="waveform-bar" style={{ animationDelay: "0.7s" }} />
                <span className="waveform-bar" style={{ animationDelay: "0.35s" }} />
                <span className="waveform-bar" style={{ animationDelay: "0.15s" }} />
              </div>

              <div className="text-[10px] text-slate-600 font-mono flex items-center justify-between">
                <span>Monographs:</span>
                <span className="text-[#1b4db3] font-bold">IP / BP / USP / EP</span>
              </div>
            </div>

            {/* HUD CARD 2: Bottom-Right Hyderabad Logistics Node */}
            <div className="absolute -bottom-3 right-1 sm:right-4 z-20 glass-panel-light p-3.5 rounded-2xl shadow-xl border border-slate-200/90 max-w-[220px] sm:max-w-[260px]">
              <div className="flex items-center gap-1.5 text-[#1b4db3] text-[10px] font-mono font-bold">
                <MapPin className="w-3.5 h-3.5 text-[#1b4db3]" />
                <span>HYDERABAD CENTRAL DEPOT</span>
              </div>
              <div className="text-xs font-bold text-slate-800 mt-1">
                Kukatpally Life Sciences Corridor
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1 pt-1.5 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3a991d] animate-ping" />
                  <span>Buffer Stock:</span>
                </span>
                <span className="text-[#3a991d] font-bold">Active & Ready</span>
              </div>
            </div>

            {/* HUD CARD 3: Left Regulatory Badge */}
            <div className="hidden sm:flex absolute top-1/2 -left-4 -translate-y-1/2 z-20 glass-panel-light px-3.5 py-2.5 rounded-2xl shadow-xl border border-slate-200/90 items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#edf8eb] border border-[#3a991d]/30 flex items-center justify-center text-[#3a991d]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-900 font-heading">
                  WHO-GMP Vetted
                </div>
                <div className="text-[9px] font-mono text-[#3a991d] font-bold">
                  Full Batch COA / DMF Support
                </div>
              </div>
            </div>

            {/* HUD CARD 4: Floating Global Connections Pill */}
            <div className="hidden md:flex absolute bottom-24 -left-2 z-20 glass-panel-light px-3 py-1.5 rounded-full shadow-lg border border-slate-200/80 items-center gap-2">
              <Globe2 className="w-3.5 h-3.5 text-[#1b4db3] animate-pulse" />
              <span className="text-[10px] font-mono font-semibold text-slate-700">
                50+ Global Supply Gateways
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Scroll Down Indicator at Bottom */}
      <div className="relative z-20 pb-2 text-center pointer-events-none">
        <a
          href="#product-categories"
          className="inline-flex flex-col items-center text-slate-400 hover:text-[#1b4db3] text-xs gap-1 font-mono tracking-wider pointer-events-auto transition-colors"
        >
          <span>SCROLL TO EXPLORE</span>
          <ChevronDown className="w-4 h-4 text-[#1b4db3] animate-bounce" />
        </a>
      </div>
    </section>
  );
}
