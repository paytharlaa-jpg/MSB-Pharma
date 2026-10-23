"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  FlaskConical,
  Microscope,
  FileCheck,
  Truck,
  ChevronDown,
  Info,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function TimelineMotionSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Accordion active open states (default open first card)
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true,
  });

  const toggleItem = (idx: number) => {
    setOpenItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  useEffect(() => {
    if (prefersReducedMotion) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Animate left cards from origin-right
      gsap.utils.toArray<HTMLElement>(".timeline.left .tl-card").forEach((card) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            once: true,
          },
          scale: 0.95,
          duration: 0.5,
          ease: "power2.out",
        });
      });

      // Animate right cards from origin-left
      gsap.utils.toArray<HTMLElement>(".timeline.right .tl-card").forEach((card) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            once: true,
          },
          scale: 0.95,
          duration: 0.5,
          ease: "power2.out",
        });
      });
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const timelineSteps = [
    {
      step: "01",
      title: "Raw Synthesis & Manufacturer Vetting",
      icon: FlaskConical,
      side: "left",
      origin: "origin-right",
      image: "/images/pharmaceutical-raw-materials.webp",
      alt: "Pharmaceutical raw chemical synthesis",
      tag: "STAGE 01 · PROCUREMENT RIGOR",
      lead: "Complete synthesis route transparency and WHO-GMP site audit verification.",
      body: "Before any material enters our sourcing portfolio, our technical team audits the manufacturing partner. We verify cGMP compliance, inspect synthetic pathway controls, evaluate raw precursor suppliers, and ensure production consistency across batches.",
      bullets: [
        "Vetted manufacturing facilities (WHO-GMP, ISO 9001)",
        "Defined synthetic route & starting material provenance",
        "Environmental & safety compliance verification",
      ],
      specBadge: "Step Duration: 24–48h Verification",
    },
    {
      step: "02",
      title: "Analytical Testing & Impurity Profiling",
      icon: Microscope,
      side: "right",
      origin: "origin-left",
      image: "/images/impurity-standards.webp",
      alt: "Analytical laboratory HPLC testing",
      tag: "STAGE 02 · QUALITY ASSURANCE",
      lead: "HPLC assays, NMR spectral profiling, and chromatographic peak resolution.",
      body: "Every consignment undergoes rigorous laboratory verification. We cross-check chemical purity, moisture content, loss on drying, residual solvents, and sub-ppm genotoxic impurity limits against official IP / BP / USP monographs to guarantee uncompromised quality.",
      bullets: [
        "High-performance liquid chromatography (HPLC) purity assays",
        "Chiral purity & enantiomeric excess testing",
        "Heavy metals & residual solvent limits under ICH Q3C",
      ],
      specBadge: "Purity Threshold: ≥ 99.0% Assay",
    },
    {
      step: "03",
      title: "Regulatory Dossier & Batch Release",
      icon: FileCheck,
      side: "left",
      origin: "origin-right",
      image: "/images/trust-documentation-visual.webp",
      alt: "Certificate of Analysis folder and documentation",
      tag: "STAGE 03 · REGULATORY COMPLIANCE",
      lead: "100% authenticated batch records, manufacturer COA, and DMF support.",
      body: "Transparent documentation is non-negotiable in pharmaceutical manufacturing. We assemble the complete batch release dossier: authentic manufacturer COAs, batch analytical sheets, Material Safety Data Sheets (MSDS), and open-part Drug Master File (DMF) documentation.",
      bullets: [
        "Authentic manufacturer-signed Certificate of Analysis (COA)",
        "Comprehensive Material Safety Data Sheets (MSDS)",
        "Open-part DMF & TSE/BSE non-contamination statements",
      ],
      specBadge: "Dossier Status: Audit Ready",
    },
    {
      step: "04",
      title: "Climate-Controlled Packaging & Global Dispatch",
      icon: Truck,
      side: "right",
      origin: "origin-left",
      image: "/images/supply-chain-editorial.webp",
      alt: "Climate-controlled pharmaceutical warehouse",
      tag: "STAGE 04 · LOGISTICS EXECUTION",
      lead: "Tamper-evident sealing, cold-chain integrity, and rapid delivery coordination.",
      body: "Dispatched directly from our Kukatpally warehouse corridor in Hyderabad, materials are packed with secondary tamper-evident seals and temperature-calibrated protection. Real-time transit coordination protects API molecular integrity until delivery at your formulation site.",
      bullets: [
        "Tamper-evident packaging with primary inert lining",
        "Temperature-calibrated logistics for thermolabile actives",
        "Same-day domestic dispatch & export container staging",
      ],
      specBadge: "Location: Kukatpally, Hyderabad",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-14 sm:py-16 bg-[#0B1F33] text-white border-t border-slate-800 relative overflow-clip"
      aria-label="How MSB PHARMACHEM Delivers Molecular Excellence Timeline"
    >
      {/* Background scientific grid */}
      <div className="absolute inset-0 scientific-grid-dense opacity-20 pointer-events-none" />

      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-teal-500/10 blur-[170px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-300 text-xs font-mono font-bold tracking-widest uppercase shadow-md">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>INTERACTIVE TIMELINE · VERIFIED LIFECYCLE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-heading leading-tight">
            How We Deliver Molecular Excellence
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            A step-by-step verified workflow from raw synthesis validation to commercial delivery, engineered for zero formulation disruption.
          </p>

          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent mx-auto mt-6" />
        </div>

        {/* The Timeline Container (Exact Pattern requested by User) */}
        <div className="tl-container px-2 sm:px-4">
          <div className="main-timeline">
            {timelineSteps.map((step, idx) => {
              const Icon = step.icon;
              const isOpen = openItems[idx];

              return (
                <div
                  key={step.step}
                  className={`timeline ${step.side}`}
                >
                  <div
                    className={`tl-card ${step.origin} bg-[#071827] rounded-3xl border border-teal-500/25 shadow-2xl overflow-hidden`}
                  >
                    {/* Timeline Image Header with Hover Scale */}
                    <div className="relative h-48 sm:h-56 w-full bg-slate-900 overflow-hidden">
                      <Image
                        src={step.image}
                        alt={step.alt}
                        fill
                        className="tl-img-scale object-cover transition-transform duration-700 ease-out"
                        sizes="(max-width: 768px) 100vw, 500px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#071827] via-transparent to-transparent opacity-90" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-[#0B1F33]/90 text-[10px] font-mono font-bold text-teal-300 border border-teal-500/30 backdrop-blur-md">
                          {step.tag}
                        </span>
                      </div>

                      <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-white">
                        <span className="text-xs font-mono font-bold text-teal-400">
                          {step.specBadge}
                        </span>
                        <span className="text-xl font-extrabold font-mono text-white/30">
                          {step.step}
                        </span>
                      </div>
                    </div>

                    {/* Card Content & Interactive Accordion */}
                    <div className="p-0">
                      {/* Accordion Header / Button */}
                      <button
                        type="button"
                        onClick={() => toggleItem(idx)}
                        className={`w-full p-5 sm:p-6 text-left flex items-center justify-between transition-colors border-b border-slate-800 ${
                          isOpen
                            ? "bg-teal-950/40 text-teal-300"
                            : "bg-[#071827] text-white hover:bg-slate-900"
                        }`}
                        aria-expanded={isOpen}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-base sm:text-lg font-heading leading-snug">
                            {step.title}
                          </span>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-teal-400 transition-transform duration-300 shrink-0 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Accordion Body */}
                      <div
                        className={`transition-all duration-300 overflow-hidden ${
                          isOpen ? "max-h-[500px] opacity-100 p-6" : "max-h-0 opacity-0 p-0"
                        }`}
                      >
                        <p className="text-xs sm:text-sm font-semibold text-teal-200 mb-2 leading-relaxed">
                          {step.lead}
                        </p>
                        <p className="text-xs text-slate-300 leading-relaxed mb-4">
                          {step.body}
                        </p>

                        <div className="space-y-2 pt-2 border-t border-slate-800">
                          {step.bullets.map((b, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                              <span>{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-6 py-3.5 bg-[#0B1F33]/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-mono">MSB PHARMA PROTOCOL {step.step}</span>
                        <a
                          href="#rfq-section"
                          className="text-teal-400 hover:text-teal-300 font-bold inline-flex items-center gap-1 transition-colors"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>Technical Details</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
