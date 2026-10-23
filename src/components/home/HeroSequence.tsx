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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MolecularScene } from "./MolecularScene";
import gsap from "gsap";

export function HeroSequence() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rightGraphicsRef = useRef<HTMLDivElement>(null);
  const scene1Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Opening fine-grained kinetic text and element reveal
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
            y: 35,
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
            scale: 0.88,
            duration: 1.2,
            ease: "power3.out",
          },
          "-=0.8"
        );
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative bg-[#071827] text-white overflow-clip min-h-[90vh] lg:min-h-[calc(100vh-4rem)] flex flex-col justify-between py-12 lg:py-0 border-b border-slate-800"
      aria-label="MSB PHARMACHEM Cinematic Hero"
    >
      {/* Background Atmosphere Layers */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Scientific grid */}
        <div className="absolute inset-0 scientific-grid-bg opacity-45" />

        {/* Soft radial depth glow */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[140px]" />
        <div className="absolute top-1/3 right-1/4 w-[550px] h-[550px] rounded-full bg-cyan-600/12 blur-[160px]" />
      </div>

      {/* Main Dual-Column Composition */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto py-8 lg:py-12">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT COLUMN: Editorial Text & CTAs (6.5 Cols) */}
          <div ref={scene1Ref} className="lg:col-span-6 space-y-6">
            {/* Scientific Precision Pill */}
            <div className="hero-pill-badge inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-teal-950/40">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse shadow-[0_0_10px_#16B8A6]" />
              <span className="tracking-wide font-mono text-[11px]">
                PHARMACEUTICAL SOURCING · SCIENTIFIC PRECISION
              </span>
            </div>

            {/* Main Headline with Kinetic Shimmer */}
            <h1 className="hero-title-main text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] font-heading">
              Precision in <br />
              <span className="text-gradient-shimmer inline-block">
                Every Molecule.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="hero-desc-text text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-xl">
              Reliable pharmaceutical materials, active ingredients (APIs), excipients, and supply-chain coordination for businesses that depend on quality. Based in Hyderabad, serving global formulation leaders.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-300 pt-1">
              <span className="hero-trust-badge flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-sm">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>COA & MSDS Verified</span>
              </span>
              <span className="hero-trust-badge flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-sm">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Hyderabad Hub</span>
              </span>
              <span className="hero-trust-badge flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-sm">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span>18+ Years Team Experience</span>
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <a href="#product-categories" className="hero-cta-btn">
                <Button
                  variant="brand-teal"
                  size="lg"
                  className="shadow-xl shadow-teal-900/40 text-sm font-semibold tracking-wide"
                >
                  <span>Explore Our Capabilities</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>

              <a href="#rfq-section" className="hero-cta-btn">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-md text-sm font-semibold"
                >
                  <Send className="w-4 h-4 mr-2 text-teal-400" />
                  <span>Send an Enquiry</span>
                </Button>
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN: 3D Scientific Graphic & Clean HUD Elements (5.5 Cols) */}
          <div
            ref={rightGraphicsRef}
            className="lg:col-span-6 relative flex items-center justify-center min-h-[380px] sm:min-h-[440px] lg:min-h-[500px]"
          >
            {/* Background Concentric Orbital Ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] rounded-full border border-dashed border-teal-500/20 flex items-center justify-center" />
              <div className="absolute w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] rounded-full border border-teal-400/15" />
            </div>

            {/* 3D Molecular WebGL Scene in Center */}
            <div className="relative z-10 w-full h-[320px] sm:h-[400px] lg:h-[460px] flex items-center justify-center">
              <MolecularScene scrollProgress={0} />
            </div>

            {/* HUD CARD 1: Top-Right Chromatography Readout */}
            <div className="absolute -top-2 right-0 sm:right-4 z-20 glass-panel-dark p-3.5 rounded-2xl shadow-2xl border border-teal-500/30 max-w-[210px] sm:max-w-[240px]">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-teal-300 pb-1.5 border-b border-teal-500/20">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-400" />
                  <span>HPLC ASSAY</span>
                </span>
                <span className="text-emerald-400 font-bold">99.9%</span>
              </div>

              <div className="py-2 flex items-center justify-between gap-1 h-7">
                {/* Real-time purity waveform bars */}
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

              <div className="text-[10px] text-slate-300 font-mono flex items-center justify-between">
                <span>Pharmacopeial:</span>
                <span className="text-teal-300 font-bold">IP/BP/USP</span>
              </div>
            </div>

            {/* HUD CARD 2: Bottom-Right Hyderabad Logistics Node */}
            <div className="absolute -bottom-4 right-2 sm:right-6 z-20 glass-panel-dark p-3.5 rounded-2xl shadow-2xl border border-cyan-500/30 max-w-[220px] sm:max-w-[260px]">
              <div className="flex items-center gap-2 text-cyan-300 text-[10px] font-mono font-bold">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>HYDERABAD CENTRAL DEPOT</span>
              </div>
              <div className="text-xs font-bold text-white mt-1">
                Kukatpally Life Sciences Corridor
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1 pt-1.5 border-t border-slate-800">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Buffer Stock:</span>
                </span>
                <span className="text-emerald-300 font-bold">Active</span>
              </div>
            </div>

            {/* HUD CARD 3: Left Regulatory Badge */}
            <div className="hidden sm:flex absolute top-1/2 -left-6 -translate-y-1/2 z-20 glass-panel-dark px-3.5 py-2.5 rounded-2xl shadow-xl border border-emerald-500/30 items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-white font-heading">
                  WHO-GMP Vetted
                </div>
                <div className="text-[9px] font-mono text-emerald-300">
                  Full Batch COA / DMF
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator at bottom */}
      <div className="relative z-20 pb-4 text-center pointer-events-none">
        <div className="inline-flex flex-col items-center text-slate-400 text-xs gap-1 font-mono tracking-wider">
          <span>SCROLL TO EXPLORE</span>
          <ChevronDown className="w-4 h-4 text-teal-400 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
