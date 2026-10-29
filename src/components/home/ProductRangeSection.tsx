"use client";

import React from "react";
import Link from "next/link";
import {
  FlaskConical,
  GitBranch,
  Pill,
  Award,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PharmaMoleculeScene } from "./PharmaMoleculeScene";

export function ProductRangeSection() {
  const metrics = [
    {
      count: "90+",
      label: "Domestic Chemicals",
      detail: "Solvents, High-Purity Acids & Reagents",
      icon: FlaskConical,
      color: "text-[#1b4db3]",
      bg: "bg-[#edf3fd]",
      border: "border-[#1b4db3]/25",
      badgeColor: "bg-[#1b4db3]",
      href: "/products?category=chemicals",
    },
    {
      count: "30+",
      label: "Intermediates",
      detail: "Advanced Synthesis & Key Starting Materials",
      icon: GitBranch,
      color: "text-[#3a991d]",
      bg: "bg-[#edf8eb]",
      border: "border-[#3a991d]/25",
      badgeColor: "bg-[#3a991d]",
      href: "/products?category=intermediates",
    },
    {
      count: "20+",
      label: "Human & Vet APIs",
      detail: "High-Assay Active Ingredients with Full COA",
      icon: Pill,
      color: "text-[#1b4db3]",
      bg: "bg-[#edf3fd]",
      border: "border-[#1b4db3]/25",
      badgeColor: "bg-[#1b4db3]",
      href: "/products?category=apis",
    },
    {
      count: "400+",
      label: "Impurities",
      detail: "Pharmacopeial & Working Reference Standards",
      icon: Award,
      color: "text-[#3a991d]",
      bg: "bg-[#edf8eb]",
      border: "border-[#3a991d]/25",
      badgeColor: "bg-[#3a991d]",
      href: "/products?category=impurities",
    },
  ];

  return (
    <section
      id="product-range"
      className="relative py-16 sm:py-20 bg-gradient-to-b from-white via-slate-50/50 to-white text-slate-900 overflow-clip border-b border-slate-200/90"
      aria-label="MSB PHARMACHEM Product Range & Molecular Capabilities"
    >
      {/* Background Precision Grid & Ambient Glowing Orbs */}
      <div className="absolute inset-0 scientific-grid-bg opacity-50 pointer-events-none" />
      <div className="absolute -top-32 left-10 w-[500px] h-[500px] rounded-full bg-[#1b4db3]/8 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[550px] h-[550px] rounded-full bg-[#3a991d]/9 blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT COLUMN: 3D Pharma / Medical Motion Graphics Scene */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
            
            {/* Top Indicator Tag */}
            <div className="w-full flex items-center justify-between mb-2 px-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#edf3fd] border border-[#1b4db3]/20 text-[#143e94] text-xs font-mono font-bold tracking-wider uppercase shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#3a991d] animate-ping" />
                <span>3D STEREOCHEMISTRY · MOLECULAR VISUALIZATION</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 hidden sm:inline-block">
                Drag to Rotate 3D Molecule
              </span>
            </div>

            {/* Graphics Container with Multi-Ring Orbitals & Scientific Corners */}
            <div className="relative w-full rounded-3xl bg-gradient-to-b from-white to-slate-50/80 border border-slate-200/90 shadow-xl overflow-hidden p-3 sm:p-5 flex items-center justify-center">
              
              {/* Corner Scientific Reticle Brackets */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#1b4db3]/40 z-20 pointer-events-none" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#1b4db3]/40 z-20 pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#3a991d]/40 z-20 pointer-events-none" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#3a991d]/40 z-20 pointer-events-none" />

              {/* Background Multi-Ring Rotating Guides */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] rounded-full border border-dashed border-[#1b4db3]/15 animate-spin-orbital" />
                <div className="absolute w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] rounded-full border border-[#3a991d]/15 animate-spin-orbital-reverse" />
              </div>

              {/* The Interactive Three.js 3D Pharma Molecule Scene */}
              <PharmaMoleculeScene />

              {/* Bottom Floating Chemistry Badge */}
              <div className="absolute bottom-4 left-4 right-4 z-20 glass-panel-light px-4 py-2 rounded-xl shadow-md border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#3a991d]" />
                  <span className="font-semibold text-slate-800">
                    Validated Chiral Purity & Pharmacopeial Monographs
                  </span>
                </div>
                <span className="font-mono text-[#143e94] font-bold text-[11px] hidden sm:inline-block">
                  IP / BP / USP / EP
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Glowing Gradient Moving Box with Product Range Metrics */}
          <div className="lg:col-span-6">
            <div className="glowing-gradient-box-container">
              {/* Continuously Moving & Rotating Conic Gradient Elements */}
              <div className="glowing-gradient-box-bg" />
              <div className="glowing-gradient-box-blur" />

              {/* Inner High-Density Premium Panel */}
              <div className="glowing-gradient-box-inner space-y-6">
                
                {/* Header Badge & Title */}
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#edf3fd] to-[#edf8eb] border border-[#1b4db3]/25 text-[#143e94] text-xs font-mono font-bold tracking-wider uppercase mb-3 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#3a991d]" />
                    <span>CENTRAL INVENTORY · KUKATPALLY DEPOT</span>
                  </div>

                  <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-heading leading-tight text-[#143e94]">
                    Product Range
                  </h2>

                  <p className="text-base text-slate-700 mt-2 leading-relaxed font-normal">
                    Direct access to immediate Hyderabad stock for fast commercial dispatch, formulation trials, and continuous manufacturing batches.
                  </p>
                </div>

                {/* 4 Highlighted Product Range Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {metrics.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={idx}
                        href={item.href}
                        className="group relative bg-white/95 rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-[#1b4db3]/40 transition-all duration-200 flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between">
                          <div className={`w-10 h-10 rounded-xl ${item.bg} border ${item.border} flex items-center justify-center ${item.color} shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-mono text-slate-400 group-hover:text-[#143e94] flex items-center gap-1 transition-colors">
                            <span>Inspect</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                          </span>
                        </div>

                        <div className="mt-4">
                          <span className={`block text-3xl sm:text-4xl font-black ${item.color} font-heading leading-tight`}>
                            {item.count}
                          </span>
                          <h4 className="text-base font-bold text-slate-900 group-hover:text-[#143e94] transition-colors mt-0.5 font-heading">
                            {item.label}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 leading-snug">
                            {item.detail}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Trust Bullet Strip */}
                <div className="pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-[#3a991d]" />
                    <span>WHO-GMP Accredited Sites</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-[#1b4db3]" />
                    <span>Batch Analytical COA Monograph</span>
                  </div>
                </div>

                {/* Action CTAs */}
                <div className="pt-2 flex flex-wrap items-center gap-3.5">
                  <Link href="/products" className="flex-1 min-w-[200px]">
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full bg-[#1b4db3] hover:bg-[#153e94] text-white font-bold text-sm shadow-md shadow-[#1b4db3]/20"
                    >
                      <span>Explore Catalog</span>
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </Link>

                  <a href="#rfq-section" className="flex-1 min-w-[200px]">
                    <Button
                      variant="brand-green"
                      size="md"
                      className="w-full bg-[#3a991d] hover:bg-[#2e7b17] text-white font-bold text-sm shadow-md shadow-[#3a991d]/20"
                    >
                      <span>Request Instant RFQ</span>
                    </Button>
                  </a>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
