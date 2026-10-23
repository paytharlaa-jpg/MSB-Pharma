"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, Layers, Microscope, ShieldAlert, Cpu } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function ReverseScientificGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 640px)", () => {
      const getTotalShift = () => track.scrollWidth - window.innerWidth + 60;

      // Start shifted to the right (-getTotalShift) and tween to 0 as user scrolls
      gsap.set(track, { x: () => -getTotalShift() });

      const tween = gsap.to(track, {
        x: 0,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${Math.round(getTotalShift() * 0.55)}`,
          pin: true,
          scrub: 0.1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const pct = Math.round(self.progress * 100);
            if (progressBarRef.current) {
              progressBarRef.current.style.width = `${Math.max(8, pct)}%`;
            }
            if (progressTextRef.current) {
              progressTextRef.current.textContent = `${pct}%`;
            }
          },
        },
      });

      return () => {
        tween.kill();
      };
    });

    return () => mm.revert();
  }, [prefersReducedMotion]);

  const slides = [
    {
      id: "slide-1",
      tag: "PHASE 01 · MOLECULAR LEVEL",
      title: "Molecular Architecture",
      subtitle: "Precision at the Angstrom Scale",
      image: "/images/molecular-closeup.webp",
      alt: "Molecular close-up render with glowing teal bonds",
      description:
        "Every Active Pharmaceutical Ingredient is verified at the molecular and crystallographic level, guaranteeing target receptor affinity and metabolic predictability.",
    },
    {
      id: "slide-2",
      tag: "PHASE 02 · POLYMORPHIC FORM",
      title: "Crystalline Integrity",
      subtitle: "Thermodynamic & Chemical Stability",
      image: "/images/api-materials.webp",
      alt: "Pharmaceutical crystalline powder purity",
      description:
        "Stable polymorphic form control prevents phase transitions during tableting, preserving formulation shelf-life and drug release kinetics.",
    },
    {
      id: "slide-3",
      tag: "PHASE 03 · SEPARATION METRICS",
      title: "Analytical HPLC Assays",
      subtitle: "Chromatographic Peak Resolution",
      image: "/images/impurity-standards.webp",
      alt: "HPLC chromatography testing autosampler",
      description:
        "Sub-ppm chromatographic purity profiling confirms absence of genotoxic impurities, residual heavy metals, and degradation byproducts.",
    },
    {
      id: "slide-4",
      tag: "PHASE 04 · REGULATORY DOSSIER",
      title: "Traceable Batch Records",
      subtitle: "Audited Quality Provenance",
      image: "/images/trust-documentation-visual.webp",
      alt: "Certificate of Analysis folder and documentation",
      description:
        "Complete analytical dossiers including manufacturer Certificates of Analysis (COA), safety data sheets (MSDS), and open-part DMF compliance.",
    },
    {
      id: "slide-5",
      tag: "PHASE 05 · COLD-CHAIN INTEGRITY",
      title: "Logistics Stewardship",
      subtitle: "Monitored Global Dispatch",
      image: "/images/supply-chain-editorial.webp",
      alt: "Pharmaceutical warehouse and pallet handling",
      description:
        "Tamper-evident primary packaging, temperature logging, and calibrated warehousing safeguard high-potency molecules until delivery.",
    },
  ];

  return (
    <section
      ref={containerRef}
      className="relative bg-[#071827] text-white overflow-hidden border-t border-slate-800"
      aria-label="Reverse Horizontal Scientific Gallery: Right to Left"
    >
      {/* Background dense grid */}
      <div className="absolute inset-0 scientific-grid-dense opacity-25 pointer-events-none" />

      {/* Radial accent glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-900/20 blur-[180px] pointer-events-none" />

      <div className="h-[100svh] min-h-[640px] flex flex-col justify-center">
        {/* Section Top Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
              REVERSE SCIENTIFIC GALLERY · RIGHT TO LEFT SEQUENCE
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono text-slate-300">
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <ChevronLeft className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>REVERSE FLOW DISCOVERY</span>
            </div>

            <div className="w-24 sm:w-36 h-2 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30">
              <div
                ref={progressBarRef}
                className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400"
                style={{ width: "8%" }}
              />
            </div>
            <span ref={progressTextRef} className="text-cyan-400 font-bold min-w-[34px] text-right">
              0%
            </span>
          </div>
        </div>

        {/* Reverse Track Container (Scrolled via GSAP scrub) */}
        <div
          ref={trackRef}
          className="horizontal-track px-4 sm:px-6 lg:px-12 py-4 gap-6 sm:gap-8 overflow-visible no-scrollbar"
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="w-[85vw] sm:w-[500px] lg:w-[620px] shrink-0 bg-[#0B1F33] rounded-3xl border border-cyan-500/20 p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group"
            >
              <div>
                {/* Visual Header */}
                <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden mb-6 bg-slate-900 border border-slate-800/80">
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    className="object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                    sizes="620px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F33] via-transparent to-transparent opacity-80" />

                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 rounded-full bg-[#071827]/90 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-500/30">
                      {slide.tag}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <h3 className="text-2xl font-bold font-heading text-white">
                      {slide.title}
                    </h3>
                    <p className="text-xs font-mono text-cyan-300 mt-0.5">
                      {slide.subtitle}
                    </p>
                  </div>
                </div>

                {/* Narrative Description */}
                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  {slide.description}
                </p>
              </div>

              {/* Bottom Decorative Indicator */}
              <div className="pt-4 mt-6 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>MSB PHARMACHEM AUDIT TRAIL</span>
                <span className="text-cyan-400 font-bold">100% VERIFIED</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
