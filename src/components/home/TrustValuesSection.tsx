"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { Check, ShieldCheck, Clock, FileText, ArrowRight } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function TrustValuesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const section = sectionRef.current;
    const path = pathRef.current;
    if (!section || !path) return;

    const ctx = gsap.context(() => {
      // Animate each deep dive row as it enters view
      gsap.utils.toArray<HTMLElement>(".deep-dive-row").forEach((row) => {
        gsap.from(row, {
          scrollTrigger: {
            trigger: row,
            start: "top 85%",
            once: true,
          },
          y: 25,
          duration: 0.5,
          ease: "power2.out",
        });
      });
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const deepDives = [
    {
      step: "01",
      pillar: "Quality Deep Dive",
      title: "Molecular Rigor & Pharmacopeial Precision",
      image: "/images/molecular-closeup.webp",
      alt: "Molecular close-up render",
      icon: ShieldCheck,
      quote: "No material leaves our network without verifiable batch assay confirmation.",
      body: "Our quality assurance model mandates that every active ingredient, raw material, and excipient is validated against pharmacopeial monographs (IP, BP, USP). From chiral purity to HPLC impurity peaks, our technical team confirms chemical identity and safety before commercial release.",
      metrics: [
        { label: "Assay Purity Standard", value: "≥ 99.0%" },
        { label: "Impurity Profiling", value: "Sub-ppm Rigor" },
        { label: "Testing Standard", value: "IP / BP / USP" },
      ],
    },
    {
      step: "02",
      pillar: "Reliability Deep Dive",
      title: "Resilient Sourcing & Strategic Inventory",
      image: "/images/reliability-logistics-visual.webp",
      alt: "Robotic warehouse logistics",
      icon: Clock,
      quote: "Production schedules cannot pause. Sourcing buffers eliminate vulnerability.",
      body: "Pharmaceutical manufacturing cycles operate on tight batch releases. MSB PHARMACHEM establishes proactive buffer stocks in Hyderabad, shielding formulation clients from raw chemical price volatility, seasonal transit delays, and single-source dependency.",
      metrics: [
        { label: "Team Sourcing Heritage", value: "18+ Years" },
        { label: "Dispatch Preparedness", value: "Same-Day / Fast Track" },
        { label: "Strategic Sourcing Hub", value: "Kukatpally, Hyd" },
      ],
    },
    {
      step: "03",
      pillar: "Trust Deep Dive",
      title: "Auditable Dossiers & Complete Transparency",
      image: "/images/trust-documentation-visual.webp",
      alt: "Analytical certification reports and dossiers",
      icon: FileText,
      quote: "Regulatory confidence is built on transparent documentation, not promises.",
      body: "We provide complete regulatory document suites: manufacturer Certificates of Analysis (COA), Material Safety Data Sheets (MSDS), Drug Master File (DMF) open-part documentation, and TSE/BSE certifications required for domestic and export compliance audits.",
      metrics: [
        { label: "Documentation Coverage", value: "100% Batches" },
        { label: "Supplier Compliance", value: "WHO-GMP Audited" },
        { label: "Sample Availability", value: "R&D Bench Support" },
      ],
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-14 sm:py-16 bg-[#F3F6F8] text-slate-900 border-t border-slate-200 relative overflow-clip"
      aria-label="Quality, Reliability, Trust: Deep Dive"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-3">
          <span className="text-xs font-mono font-bold text-teal-800 uppercase tracking-widest bg-teal-100/60 px-3 py-1 rounded-md border border-teal-200">
            TECHNICAL DEEP DIVE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-heading leading-tight">
            How We Execute Our Promise
          </h2>
          <p className="text-base text-slate-600 leading-relaxed font-normal">
            A comprehensive look at our three operational pillars: laboratory-verified quality, supply-chain resilience, and audit-ready documentation.
          </p>
        </div>

        {/* Deep Dive Blocks */}
        <div className="space-y-8 lg:space-y-12">
          {deepDives.map((item, idx) => {
            const isReversed = idx % 2 === 1;
            const Icon = item.icon;

            return (
              <div
                key={item.step}
                className={`deep-dive-row grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center ${
                  isReversed ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Image Visual (6 Cols) */}
                <div
                  className={`lg:col-span-6 relative ${
                    isReversed ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-900 group">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center text-teal-700 shadow-md">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-slate-900/90 text-white text-[11px] font-mono font-bold border border-slate-700">
                        {item.pillar}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
                      <div className="text-xs font-mono text-teal-300 italic">
                        &ldquo;{item.quote}&rdquo;
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text Content (6 Cols) */}
                <div
                  className={`lg:col-span-6 space-y-6 ${
                    isReversed ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-teal-800">
                    <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-bold">
                      {item.step}
                    </span>
                    <span className="uppercase tracking-widest">{item.pillar}</span>
                  </div>

                  <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-heading leading-tight">
                    {item.title}
                  </h3>

                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                    {item.body}
                  </p>

                  {/* Metrics Badges */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {item.metrics.map((m, i) => (
                      <div
                        key={i}
                        className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs text-center"
                      >
                        <div className="text-base sm:text-lg font-extrabold text-teal-700 font-heading">
                          {m.value}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5 uppercase tracking-wider">
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <a
                      href="#rfq-section"
                      className="inline-flex items-center text-xs font-bold text-teal-800 hover:text-teal-900 group/link"
                    >
                      <span>Inquire About Our {item.pillar} Protocols</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover/link:translate-x-1" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
