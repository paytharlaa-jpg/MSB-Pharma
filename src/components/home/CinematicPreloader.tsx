"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface PreloaderProps {
  onComplete?: () => void;
}

export function CinematicPreloader({ onComplete }: PreloaderProps) {
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1);
  const [hidden, setHidden] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setHidden(true);
      onComplete?.();
      return;
    }

    try {
      const alreadyViewed = sessionStorage.getItem("msb_preloader_seen");
      if (alreadyViewed) {
        setHidden(true);
        onComplete?.();
        return;
      }
      sessionStorage.setItem("msb_preloader_seen", "true");
    } catch {
      // Ignore sessionStorage errors
    }

    const t1 = setTimeout(() => setPhase(2), 250);
    const t2 = setTimeout(() => setPhase(3), 750);
    const t3 = setTimeout(() => {
      setPhase(4);
      setHidden(true);
      onComplete?.();
    }, 1100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [prefersReducedMotion, onComplete]);

  if (hidden) return null;

  return (
    <aside
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white text-slate-900 transition-opacity duration-600 ease-in-out ${
        phase === 3 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-label="MSB PHARMACHEM introductory loading sequence"
    >
      {/* Background scientific grid pattern */}
      <div className="absolute inset-0 scientific-grid-dense opacity-30 pointer-events-none" />

      {/* Ambient background soft glow */}
      <div
        className={`absolute w-[450px] h-[450px] rounded-full bg-[#1b4db3]/8 blur-[120px] transition-all duration-1000 ease-out pointer-events-none ${
          phase >= 2 ? "scale-125 opacity-50" : "scale-75 opacity-15"
        }`}
      />
      <div
        className={`absolute w-[400px] h-[400px] rounded-full bg-[#3a991d]/8 blur-[120px] transition-all duration-1000 ease-out pointer-events-none ${
          phase >= 2 ? "scale-110 opacity-50" : "scale-75 opacity-15"
        }`}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-md">
        {/* Phase 1: Molecular emerging indicator */}
        <div className="relative mb-6">
          <div
            className={`w-20 h-20 rounded-full border border-[#1b4db3]/30 flex items-center justify-center transition-all duration-700 ${
              phase >= 2 ? "scale-100 opacity-100" : "scale-90 opacity-40"
            }`}
          >
            <div className="w-16 h-16 rounded-full border-2 border-[#1b4db3]/30 border-t-[#3a991d] animate-spin" />
            <div className="absolute w-3 h-3 rounded-full bg-[#3a991d] shadow-[0_0_10px_#3a991d] animate-ping" />
          </div>

          {/* Logo container (Phase 2) */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
              phase >= 2 ? "scale-100 opacity-100" : "scale-75 opacity-0"
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-white p-1 shadow-md border border-slate-200">
              <Image
                src="/images/logo-msb-pharmachem.png"
                alt="MSB PHARMACHEM"
                width={56}
                height={56}
                className="w-full h-full object-contain rounded-full"
                priority
              />
            </div>
          </div>
        </div>

        {/* Phase 2: Brand Name and Tagline */}
        <div
          className={`space-y-2 transition-all duration-700 transform ${
            phase >= 2 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="text-xl sm:text-2xl font-black tracking-tight text-[#1b4db3] font-heading">
            MSB PHARMACHEM
          </div>
          <div className="text-xs uppercase tracking-[0.25em] text-[#3a991d] font-bold flex items-center justify-center gap-2">
            <span>Quality</span>
            <span className="text-slate-300">•</span>
            <span>Reliability</span>
            <span className="text-slate-300">•</span>
            <span>Trust</span>
          </div>
        </div>

        {/* Phase status indicator */}
        <div
          className={`mt-6 text-[11px] text-slate-500 tracking-wider uppercase font-mono transition-opacity duration-500 ${
            phase === 1 ? "opacity-80" : phase === 2 ? "opacity-70" : "opacity-0"
          }`}
        >
          {phase === 1 ? "Initializing Pharmaceutical Environment..." : "Precision in Every Molecule"}
        </div>
      </div>
    </aside>
  );
}
