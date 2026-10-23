"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { Globe2, MapPin, Send, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function GlobalReachSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const hubsColRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const section = sectionRef.current;
    const visual = visualRef.current;
    const hubsCol = hubsColRef.current;
    if (!section || !visual) return;

    const ctx = gsap.context(() => {
      gsap.from(visual, {
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          once: true,
        },
        scale: 0.98,
        duration: 0.6,
        ease: "power2.out",
      });

      if (hubsCol) {
        gsap.from(hubsCol.children, {
          scrollTrigger: {
            trigger: hubsCol,
            start: "top 85%",
            once: true,
          },
          x: 20,
          stagger: 0.06,
          duration: 0.6,
          ease: "power2.out",
        });
      }
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const domesticHubs = [
    { city: "Hyderabad (HQ)", desc: "Head Office & Life Sciences Central Distribution", prime: true },
    { city: "Gujarat Pharma Belt", desc: "API Formulation & Chemical Synthesis Clusters", prime: false },
    { city: "Mumbai & Maharashtra", desc: "Formulation Manufacturing & Port Logistics", prime: false },
    { city: "Bangalore & Karnataka", desc: "Biotech & Analytical R&D Centers", prime: false },
    { city: "Chennai & Tamil Nadu", desc: "Finished Formulation & Active Sourcing", prime: false },
    { city: "Delhi NCR Corridor", desc: "Industrial Chemical & Northern Pharma Formulations", prime: false },
  ];

  const internationalMarkets = [
    "Southeast Asia (Vietnam, Philippines, Indonesia)",
    "Middle East Formulation Hubs (UAE, Jordan)",
    "Export-Ready Pharmacopeial Compliance (IP/BP/USP)",
  ];

  return (
    <section
      ref={sectionRef}
      className="py-14 sm:py-16 bg-[#071827] text-white border-t border-slate-800 overflow-clip relative"
      aria-label="Domestic and International Reach"
    >
      {/* Background scientific grid */}
      <div className="absolute inset-0 scientific-grid-bg opacity-30 pointer-events-none" />

      {/* Ambient glow */}
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-teal-600/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3 mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold tracking-widest uppercase">
            <Globe2 className="w-3.5 h-3.5 text-teal-400" />
            <span>GLOBAL SUPPLY FOOTPRINT</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-heading leading-tight">
            Connected to Hyderabad. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-emerald-400">
              Ready to Serve Wider Markets.
            </span>
          </h2>

          <p className="text-base text-slate-300 leading-relaxed font-normal">
            Rooted in Kukatpally, Hyderabad—the heart of Indian pharmaceutical innovation—MSB PHARMACHEM orchestrates procurement and supply across major Indian manufacturing belts and international export destinations.
          </p>
        </div>

        {/* 3D Global Network Visual + Domestic Corridor Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: 3D Network Image (7 Cols) */}
          <div ref={visualRef} className="lg:col-span-7 relative">
            <div className="relative h-[360px] sm:h-[480px] rounded-3xl overflow-hidden shadow-2xl border border-teal-500/30 bg-[#0B1F33]">
              <Image
                src="/images/global-supply-network.webp"
                alt="Global supply chain network connected to Hyderabad"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071827] via-transparent to-transparent opacity-70" />

              {/* Pinpoint Callout on Hyderabad */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl glass-panel-dark border-teal-500/40 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/30 border border-teal-400/50 flex items-center justify-center text-teal-300 shrink-0">
                    <MapPin className="w-5 h-5 text-teal-300 animate-bounce" />
                  </div>
                  <div>
                    <div className="text-sm font-bold font-heading text-white">
                      Kukatpally, Hyderabad (Telangana)
                    </div>
                    <div className="text-xs text-teal-300 font-mono">
                      Central Sourcing & Commercial Headquarters
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block text-right text-xs font-mono text-slate-300">
                  <div>LAT 17.49° N</div>
                  <div>LONG 78.39° E</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Domestic & Global Hub Details (5 Cols) with Ref */}
          <div ref={hubsColRef} className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                <span>Domestic Supply Corridors</span>
              </h3>

              <div className="space-y-2.5">
                {domesticHubs.map((hub, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border transition-all ${
                      hub.prime
                        ? "bg-teal-950/40 border-teal-500/40 text-white"
                        : "bg-[#0B1F33]/80 border-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <MapPin className={`w-3.5 h-3.5 ${hub.prime ? "text-teal-400" : "text-slate-400"}`} />
                        <span>{hub.city}</span>
                      </span>
                      {hub.prime && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/30 text-teal-300 font-bold">
                          PRIMARY HUB
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 pl-5">
                      {hub.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* International Export Readiness */}
            <div className="p-4 rounded-2xl bg-[#0B1F33] border border-cyan-500/30 space-y-2">
              <div className="text-xs font-bold text-cyan-300 font-mono uppercase tracking-wider">
                INTERNATIONAL EXPORT CAPABILITY
              </div>
              <div className="space-y-1.5 pt-1">
                {internationalMarkets.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <a
                href="#rfq-section"
                className="inline-flex items-center text-xs font-bold text-teal-400 hover:text-teal-300 group"
              >
                <span>Request Quotation for Regional or Export Delivery</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
