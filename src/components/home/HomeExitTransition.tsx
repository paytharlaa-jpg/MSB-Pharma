"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Phone, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getWhatsAppClickToChatUrl } from "@/lib/whatsapp-service";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function HomeExitTransition() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      gsap.from(container, {
        scrollTrigger: {
          trigger: container,
          start: "top 85%",
          once: true,
        },
        y: 20,
        duration: 0.5,
        ease: "power2.out",
      });
    }, container);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      ref={containerRef}
      className="relative bg-[#071827] text-white py-12 sm:py-14 border-t border-slate-800 overflow-clip"
      aria-label="Homepage Conclusion & Direct Connect"
    >
      <div className="absolute inset-0 scientific-grid-dense opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        <div className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white p-0.5 shadow-lg flex items-center justify-center">
            <Image
              src="/images/logo-msb-pharmachem.png"
              alt="MSB PHARMACHEM"
              width={46}
              height={46}
              className="rounded-full"
            />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-xl tracking-tight text-white block font-heading">
              MSB PHARMACHEM
            </span>
            <span className="text-xs text-teal-400 font-mono tracking-widest uppercase block">
              Quality • Reliability • Trust
            </span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-heading max-w-2xl mx-auto leading-tight">
          Partner with Hyderabad&apos;s Dedicated Pharmaceutical Sourcing Specialist.
        </h2>

        <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          From R&D sample quantities to commercial metric tonnes, we coordinate certified raw materials and active pharmaceutical ingredients with complete regulatory assurance.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a href="#rfq-section">
            <Button variant="brand-teal" size="lg" className="shadow-lg shadow-teal-900/30">
              <span>Submit Sourcing Requirement</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </a>

          <a
            href={getWhatsAppClickToChatUrl({})}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp (+91 8008335333)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
