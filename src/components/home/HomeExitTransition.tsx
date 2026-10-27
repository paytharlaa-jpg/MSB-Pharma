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
      className="relative bg-white text-slate-900 py-14 sm:py-16 border-t border-slate-200 overflow-clip"
      aria-label="Homepage Conclusion & Direct Connect"
    >
      <div className="absolute inset-0 scientific-grid-dense opacity-30 pointer-events-none" />

      {/* Ambient Moving Gradient Elements */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[350px] rounded-full bg-[#1b4db3]/6 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[450px] h-[350px] rounded-full bg-[#3a991d]/6 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-7">
        <div className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white p-0.5 shadow-md border border-slate-200 flex items-center justify-center">
            <Image
              src="/images/logo-msb-pharmachem.png"
              alt="MSB PHARMACHEM"
              width={46}
              height={46}
              className="rounded-full"
            />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-xl tracking-tight text-[#1b4db3] block font-heading">
              MSB PHARMACHEM
            </span>
            <span className="text-xs text-[#3a991d] font-bold tracking-widest uppercase block">
              Quality • Reliability • Trust
            </span>
          </div>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-heading max-w-2xl mx-auto leading-tight">
          Partner with Hyderabad&apos;s Dedicated Pharmaceutical Sourcing Specialist.
        </h2>

        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          From R&D sample quantities to commercial metric tonnes, we coordinate certified raw materials and active pharmaceutical ingredients with complete regulatory assurance.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a href="#rfq-section">
            <Button
              variant="primary"
              size="lg"
              className="bg-[#1b4db3] hover:bg-[#153e94] text-white shadow-lg shadow-[#1b4db3]/25"
            >
              <span>Submit Sourcing Requirement</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </a>

          <a
            href={getWhatsAppClickToChatUrl({})}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-[#3a991d] hover:bg-[#2e7b17] text-white shadow-lg shadow-[#3a991d]/25 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp (+91 8008335333)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
