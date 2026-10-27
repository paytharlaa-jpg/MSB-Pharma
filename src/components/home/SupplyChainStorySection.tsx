"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, MapPin, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function SupplyChainStorySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textColRef = useRef<HTMLDivElement>(null);
  const imageColRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const section = sectionRef.current;
    const textCol = textColRef.current;
    const imageCol = imageColRef.current;
    if (!section || !textCol || !imageCol) return;

    const ctx = gsap.context(() => {
      gsap.from(textCol, {
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          once: true,
        },
        x: -25,
        duration: 0.6,
        ease: "power2.out",
      });

      gsap.from(imageCol, {
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          once: true,
        },
        x: 25,
        duration: 0.6,
        ease: "power2.out",
      });
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="py-14 sm:py-16 bg-[#FFFFFF] text-slate-900 border-t border-slate-200 overflow-clip relative"
      aria-label="Company and Supply-Chain Story"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Text Column */}
          <div ref={textColRef} className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#edf3fd] border border-[#1b4db3]/20 text-[#1b4db3] text-xs font-mono font-bold tracking-wider uppercase">
              <span>HYDERABAD PHARMACEUTICAL HUB</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-heading leading-tight">
              Beyond Supply. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1b4db3] to-[#3a991d]">
                Built Around Reliability.
              </span>
            </h2>

            <p className="text-base text-slate-600 leading-relaxed">
              Hyderabad is globally recognized as the &ldquo;Bulk Drug Capital of India,&rdquo; producing over a third of the world&apos;s vaccines and driving immense formulation capacity. This is where MSB PHARMACHEM was founded, rooted in deep local relationships and rigorous international standards.
            </p>

            <p className="text-sm text-slate-600 leading-relaxed">
              Our core team brings more than 18 years of specialized experience in raw material procurement, vendor compliance verification, and proactive inventory buffer management. We eliminate production standstills by keeping critical active ingredients and excipients available on demand.
            </p>

            {/* Key Capability Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2 text-[#1b4db3] font-bold text-sm">
                  <Clock className="w-4 h-4 text-[#1b4db3]" />
                  <span>18+ Years Experience</span>
                </div>
                <p className="text-xs text-slate-500">
                  Decades of specialized expertise in active raw material logistics and vendor auditing.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2 text-[#3a991d] font-bold text-sm">
                  <MapPin className="w-4 h-4 text-[#3a991d]" />
                  <span>Kukatpally, Hyderabad</span>
                </div>
                <p className="text-xs text-slate-500">
                  Direct physical presence in Telangana&apos;s prime pharmaceutical manufacturing corridor.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2 text-[#1b4db3] font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-[#1b4db3]" />
                  <span>Verified COA Support</span>
                </div>
                <p className="text-xs text-slate-500">
                  Every batch verified with manufacturer certificate of analysis, MSDS, and HPLC reports.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex items-center gap-2 text-[#3a991d] font-bold text-sm">
                  <Award className="w-4 h-4 text-[#3a991d]" />
                  <span>WHO-GMP Audited</span>
                </div>
                <p className="text-xs text-slate-500">
                  Exclusive partnerships with certified, inspected, and compliant manufacturing sites.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <Link href="/about">
                <Button variant="primary" size="md" className="bg-[#1b4db3] hover:bg-[#153e94]">
                  <span>Read Full Company Profile</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Image Composition */}
          <div ref={imageColRef} className="lg:col-span-6 relative">
            {/* Primary Main Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900 aspect-[4/3]">
              <Image
                src="/images/supply-chain-editorial.webp"
                alt="Pharmaceutical climate-controlled logistics facility"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[11px] font-mono text-teal-400 font-bold uppercase tracking-wider block">
                  INFRASTRUCTURE ASSURANCE
                </span>
                <span className="text-lg font-bold font-heading text-white block mt-0.5">
                  Climate-Controlled Staging & Audited Warehousing
                </span>
              </div>
            </div>

            {/* Secondary Floating Laboratory Inset Card */}
            <div className="hidden sm:block absolute -bottom-8 -left-8 w-64 bg-white rounded-2xl p-4 shadow-2xl border border-slate-200/90 backdrop-blur-md">
              <div className="relative h-28 rounded-xl overflow-hidden mb-3 bg-slate-100">
                <Image
                  src="/images/about-company.webp"
                  alt="Quality Control Testing"
                  fill
                  className="object-cover"
                  sizes="256px"
                />
              </div>
              <div className="text-xs font-bold text-slate-900">
                Analytical Verification Desk
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Purity assays, chromatography, and batch release checks conducted prior to client dispatch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
