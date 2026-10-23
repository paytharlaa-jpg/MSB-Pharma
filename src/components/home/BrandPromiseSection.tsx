"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Truck,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
  Award,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface PillarData {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  tagline: string;
  icon: typeof ShieldCheck;
  metricLabel: string;
  metricValue: string;
  metricUnit: string;
  accentColor: string;
  accentBorder: string;
  accentBadge: string;
  image: string;
  alt: string;
  description: string;
  specs: { label: string; detail: string }[];
  points: string[];
}

export function BrandPromiseSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Active highlighted pillar (default to first)
  const [activePillar, setActivePillar] = useState<string>("quality");

  // Spotlight mouse tracking per card
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const section = sectionRef.current;
    const header = headerRef.current;
    const cards = cardsContainerRef.current;
    if (!section || !cards) return;

    const ctx = gsap.context(() => {
      if (header) {
        gsap.from(header.children, {
          scrollTrigger: {
            trigger: header,
            start: "top 85%",
            once: true,
          },
          y: 20,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out",
        });
      }

      // Gentle entrance without hiding initial opacity to guarantee cards are always visible
      gsap.from(cards.children, {
        scrollTrigger: {
          trigger: cards,
          start: "top 85%",
          once: true,
        },
        y: 25,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
      });
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const pillars: PillarData[] = [
    {
      id: "quality",
      number: "01",
      title: "Quality",
      subtitle: "PHARMACOPEIAL PURITY",
      tagline: "Verifiable Molecular Integrity",
      icon: ShieldCheck,
      metricLabel: "ASSAY PURITY",
      metricValue: "≥ 99.0%",
      metricUnit: "HPLC CONFIRMED",
      accentColor: "from-teal-500/15 via-teal-500/5 to-transparent",
      accentBorder: "border-teal-500/40 hover:border-teal-500",
      accentBadge: "text-teal-800 bg-teal-50 border-teal-200",
      image: "/images/quality-science-visual.webp",
      alt: "Quality Control Laboratory HPLC Assay",
      description:
        "Every batch is rigorously validated against official pharmacopeial monographs (IP, BP, USP, EP). We mandate authentic manufacturer Certificates of Analysis (COA) and cross-verify chromatograms before dispatch.",
      specs: [
        { label: "Monograph Standards", detail: "IP / BP / USP / EP" },
        { label: "Impurity Profiling", detail: "Sub-ppm Resolution" },
        { label: "Manufacturer Audit", detail: "WHO-GMP & ISO 9001" },
      ],
      points: [
        "Manufacturer-backed batch analytical assays",
        "Chiral purity & enantiomeric excess testing",
        "Stringent limits on residual solvents & heavy metals",
      ],
    },
    {
      id: "reliability",
      number: "02",
      title: "Reliability",
      subtitle: "SUPPLY-CHAIN RESILIENCE",
      tagline: "Uninterrupted Formulation Timelines",
      icon: Truck,
      metricLabel: "DISPATCH READY",
      metricValue: "24–48h",
      metricUnit: "HYDERABAD HUB",
      accentColor: "from-blue-500/15 via-blue-500/5 to-transparent",
      accentBorder: "border-blue-500/40 hover:border-blue-500",
      accentBadge: "text-blue-800 bg-blue-50 border-blue-200",
      image: "/images/reliability-logistics-visual.webp",
      alt: "Climate-Controlled Pharmaceutical Distribution",
      description:
        "Headquartered in Hyderabad's premier life sciences corridor, our team maintains strategic buffer inventories and cold-chain staging to safeguard formulation partners from raw material market shocks.",
      specs: [
        { label: "Heritage in Logistics", detail: "18+ Years Specialized" },
        { label: "Buffer Stocks", detail: "Critical APIs & Actives" },
        { label: "Transit Calibration", detail: "Temperature Controlled" },
      ],
      points: [
        "Decades of specialized active procurement",
        "Strategic buffer stocks for critical APIs",
        "Predictable domestic & global export delivery",
      ],
    },
    {
      id: "trust",
      number: "03",
      title: "Trust",
      subtitle: "REGULATORY ASSURANCE",
      tagline: "Complete Regulatory Transparency",
      icon: FileCheck,
      metricLabel: "AUDIT DOSSIERS",
      metricValue: "100%",
      metricUnit: "AUTHENTICATED",
      accentColor: "from-emerald-500/15 via-emerald-500/5 to-transparent",
      accentBorder: "border-emerald-500/40 hover:border-emerald-500",
      accentBadge: "text-emerald-800 bg-emerald-50 border-emerald-200",
      image: "/images/trust-documentation-visual.webp",
      alt: "Pharmaceutical Regulatory Dossier and Audit Records",
      description:
        "Transparent documentation is non-negotiable in pharmaceutical manufacturing. We assemble the complete batch release dossier: manufacturer COAs, batch analytical sheets, MSDS, and open-part DMF documentation.",
      specs: [
        { label: "COA Authentication", detail: "100% Batches Verified" },
        { label: "Regulatory Support", detail: "Open-Part DMF & MSDS" },
        { label: "Audit Traceability", detail: "Direct Manufacturer Provenance" },
      ],
      points: [
        "Authentic manufacturer-signed COA records",
        "Open-part DMF & TSE/BSE declarations",
        "Fast analytical sample support for R&D trials",
      ],
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="brand-promise"
      className="relative py-14 sm:py-16 bg-[#F8FAFC] text-slate-900 overflow-clip border-t border-slate-200"
      aria-label="Core Philosophy: Quality, Reliability, Trust"
    >
      {/* Precision millimeter laboratory grid background */}
      <div className="absolute inset-0 scientific-grid-dense opacity-30 pointer-events-none" />

      {/* Ambient soft glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-teal-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold tracking-wider uppercase font-mono shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>CORE PHILOSOPHY · TRI-CORE STANDARD</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-heading leading-tight">
            Quality. Reliability. Trust.
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Three unshakeable pillars governing every gram of API, every analytical chromatogram, and every delivery coordinated from Hyderabad to global formulation leaders.
          </p>

          {/* Interactive Pillar Selector Tabs */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
            {pillars.map((p) => {
              const Icon = p.icon;
              const isActive = activePillar === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePillar(p.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md scale-105"
                      : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                  <span>
                    {p.number} · {p.title}
                  </span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Pillar Cards with Spotlight Effect & Interactive Focus */}
        <div
          ref={cardsContainerRef}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch mb-10"
        >
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            const isFocused = activePillar === pillar.id;

            return (
              <div
                key={pillar.id}
                id={`pillar-${pillar.id}`}
                onMouseEnter={() => setActivePillar(pillar.id)}
                onMouseMove={handleMouseMove}
                className={`pillar-card group relative bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer ${
                  isFocused
                    ? `border-teal-500 shadow-xl ring-2 ring-teal-500/20 translate-y-[-4px]`
                    : `border-slate-200/90 shadow-xs hover:border-slate-400 hover:shadow-md`
                }`}
                style={{
                  background:
                    "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(20, 184, 166, 0.06), transparent 80%), #FFFFFF",
                }}
              >
                {/* Visual Image Header */}
                <div className="relative h-60 w-full bg-slate-900 overflow-hidden">
                  <Image
                    src={pillar.image}
                    alt={pillar.alt}
                    fill
                    className="object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                  {/* Subtle technical gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                  {/* Corner Scientific Reticle Brackets */}
                  <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-teal-400/70" />
                  <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-teal-400/70" />
                  <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-teal-400/70" />
                  <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-teal-400/70" />

                  {/* Top Header Tag */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-slate-900/90 text-white text-[10px] font-mono font-bold tracking-wider border border-white/20 backdrop-blur-md">
                      PILLAR {pillar.number} // {pillar.subtitle}
                    </span>
                  </div>

                  {/* Live Benchmark Metric Pill */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="px-2.5 py-1 rounded-md bg-teal-950/90 border border-teal-400/40 text-teal-300 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                      <Activity className="w-3 h-3 text-teal-400 animate-pulse" />
                      <span>{pillar.metricValue}</span>
                    </div>
                  </div>

                  {/* Bottom Image Overlay Content */}
                  <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between text-white">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/30 border border-teal-400/50 backdrop-blur-md flex items-center justify-center text-teal-200">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-teal-300">
                          {pillar.tagline}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold font-heading text-white">
                        {pillar.title}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-mono text-slate-400 uppercase block">
                        {pillar.metricLabel}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-teal-300">
                        {pillar.metricUnit}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {pillar.description}
                  </p>

                  {/* Key Specifications Grid */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                    {pillar.specs.map((sp, idx) => (
                      <div key={idx} className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                        <span className="text-[9px] text-slate-400 font-mono uppercase block truncate">
                          {sp.label}
                        </span>
                        <span className="text-[10px] font-bold text-slate-800 font-mono block mt-0.5 truncate">
                          {sp.detail}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 3 Checkmark Verification Points */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    {pillar.points.map((pt, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span className="leading-tight">{pt}</span>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Card Action Link */}
                  <div className="pt-3 border-t border-slate-100">
                    <a
                      href="#rfq-section"
                      className="inline-flex items-center justify-between w-full py-2.5 px-3.5 rounded-xl text-xs font-bold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors group/btn"
                    >
                      <span>Inquire About {pillar.title} Verification</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Technical Tri-Core Convergence Banner — New interactive footer */}
        <div className="tri-core-banner rounded-2xl bg-gradient-to-r from-slate-900 via-[#0B1F33] to-slate-900 text-white p-5 sm:p-6 border border-slate-800 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0">
              <Zap className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800">
                  MSB CONVERGENCE SLA
                </span>
                <span className="text-xs font-mono text-slate-400">Zero Formulation Disruption</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 font-semibold mt-0.5">
                [ Quality Assay ] + [ Buffer Supply ] + [ Audit Dossier ] = Guaranteed Commercial Release
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#rfq-section"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors shadow-sm"
            >
              <span>Request Dossier & Quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
