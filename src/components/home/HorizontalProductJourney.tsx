"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, CheckCircle2, FlaskConical, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function HorizontalProductJourney() {
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
      const getScrollAmount = () => -(track.scrollWidth - window.innerWidth + 60);

      const tween = gsap.to(track, {
        x: getScrollAmount,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: () => `+=${Math.round((track.scrollWidth - window.innerWidth + 60) * 0.55)}`,
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

  const panels = [
    {
      id: "panel-1",
      number: "01",
      category: "RAW SYNTHESIS",
      title: "Pharmaceutical Materials & Intermediates",
      image: "/images/pharmaceutical-raw-materials.webp",
      alt: "Pharmaceutical chemical intermediate synthesis",
      tagline: "The Bedrock of Active Synthesis",
      description:
        "High-purity organic chemical building blocks engineered for multistep organic synthesis. Vetted manufacturers with complete synthesis route transparency.",
      specs: ["High Assay Purity (>99%)", "Defined Isomeric Ratio", "Strict Moisture & Loss on Drying Limits"],
      ctaText: "Explore Raw Materials",
      ctaHref: "/products?category=raw_materials",
    },
    {
      id: "panel-2",
      number: "02",
      category: "ACTIVE SUBSTANCES",
      title: "Commercial APIs & Bulk Drugs",
      image: "/images/api-materials.webp",
      alt: "Active Pharmaceutical Ingredients crystalline powder",
      tagline: "Potent, Regulatory-Compliant Actives",
      description:
        "Commercial-scale active ingredients including Atorvastatin Calcium, Montelukast Sodium, and essential therapeutics manufactured in WHO-GMP compliant facilities.",
      specs: ["Complete COA with Every Batch", "IP / BP / USP Pharmacopeial Standards", "DMF & Open-Part Dossier Support"],
      ctaText: "Explore Active APIs",
      ctaHref: "/products?category=api",
    },
    {
      id: "panel-3",
      number: "03",
      category: "FORMULATION MATRIX",
      title: "Functional Excipients",
      image: "/images/excipients-materials.webp",
      alt: "Pharmaceutical excipients pellets and binders",
      tagline: "Optimizing Bioavailability & Stability",
      description:
        "Specialty binders, disintegrants, lubricants, and polymer coatings designed to ensure rapid dissolution profiles, shelf-life integrity, and tablet compressibility.",
      specs: ["Controlled Particle Size Distribution", "Consistent Bulk & Tapped Density", "Microbiological Purity Testing"],
      ctaText: "Explore Excipients",
      ctaHref: "/products?category=excipients",
    },
    {
      id: "panel-4",
      number: "04",
      category: "CRITICAL REAGENTS",
      title: "High-Purity Chemicals & Solvents",
      image: "/images/chemicals-solvents.webp",
      alt: "HPLC grade solvents in amber bottles",
      tagline: "Uncompromised Analytical & Process Purity",
      description:
        "Spectroscopic and HPLC-grade organic solvents, chromatography mobile phase reagents, and process acids with negligible non-volatile residue.",
      specs: ["Minimal UV Absorbance Cutoff", "Sub-ppm Trace Heavy Metals", "Sealed Inert Amber Packaging"],
      ctaText: "Explore Solvents",
      ctaHref: "/products?category=chemicals",
    },
    {
      id: "panel-5",
      number: "05",
      category: "ANALYTICAL RIGOR",
      title: "Certified Impurity Standards",
      image: "/images/impurity-standards.webp",
      alt: "Analytical impurity standards autosampler",
      tagline: "Pharmacopeial Reference Integrity",
      description:
        "Critical reference standards for identification and quantification of process impurities, degradation products, and enantiomers during stability studies.",
      specs: ["Fully Characterized (NMR, MS, HPLC)", "High Chemical & Chromatographic Purity", "Rapid Cold-Chain Sample Dispatch"],
      ctaText: "Request Analytical Quotation",
      ctaHref: "#rfq-section",
    },
  ];

  return (
    <section
      ref={containerRef}
      className="relative bg-[#071827] text-white overflow-hidden border-t border-slate-800"
      aria-label="Horizontal Product Journey: Left to Right"
    >
      {/* Background scientific grid */}
      <div className="absolute inset-0 scientific-grid-bg opacity-30 pointer-events-none" />

      {/* Main Track Wrapper */}
      <div className="h-[100svh] min-h-[640px] flex flex-col justify-center">
        {/* Top Header Label */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-teal-400">
              SIGNATURE INTERACTION · HORIZONTAL SOURCING JOURNEY (LEFT TO RIGHT)
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono text-slate-300">
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <span>SCROLL DOWN TO PROGRESS</span>
              <ChevronRight className="w-4 h-4 text-teal-400 animate-pulse" />
            </div>

            <div className="w-24 sm:w-36 h-2 bg-slate-900 rounded-full overflow-hidden border border-teal-500/30">
              <div
                ref={progressBarRef}
                className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400"
                style={{ width: "8%" }}
              />
            </div>
            <span ref={progressTextRef} className="text-teal-400 font-bold min-w-[34px] text-right">
              0%
            </span>
          </div>
        </div>

        {/* Horizontal Track (Scrolled via GSAP scrub) */}
        <div
          ref={trackRef}
          className="horizontal-track px-4 sm:px-6 lg:px-12 py-4 gap-6 sm:gap-8 overflow-visible no-scrollbar"
        >
          {panels.map((panel) => (
            <div
              key={panel.id}
              className="w-[85vw] sm:w-[480px] lg:w-[560px] shrink-0 bg-[#0B1F33] rounded-3xl border border-teal-500/20 p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-transparent pointer-events-none" />

              <div>
                {/* Panel Top Meta */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-teal-400 bg-teal-950/80 px-2.5 py-1 rounded-md border border-teal-800">
                      {panel.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {panel.tagline}
                    </span>
                  </div>
                  <span className="text-2xl font-extrabold font-mono text-teal-400/40">
                    {panel.number}
                  </span>
                </div>

                {/* Panel Image */}
                <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden mb-6 bg-slate-900 border border-slate-800">
                  <Image
                    src={panel.image}
                    alt={panel.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="560px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F33] via-transparent to-transparent opacity-60" />
                </div>

                {/* Title and Description */}
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-white mb-2 leading-snug">
                  {panel.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-normal">
                  {panel.description}
                </p>

                {/* Technical Specs List */}
                <div className="space-y-2 mb-6">
                  {panel.specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-800/80">
                <Link href={panel.ctaHref} className="w-full">
                  <Button variant="brand-teal" size="md" className="w-full text-xs font-semibold justify-between">
                    <span>{panel.ctaText}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
