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
    // If reduced motion is requested, dismiss immediately
    if (prefersReducedMotion) {
      setHidden(true);
      onComplete?.();
      return;
    }

    // Check session storage so preloader doesn't annoy user during subsequent navigations
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

    // Sequence timer: Phase 1 -> 2 -> 3 -> Done (fast, sleek 1.2s reveal)
    const t1 = setTimeout(() => setPhase(2), 300);
    const t2 = setTimeout(() => setPhase(3), 850);
    const t3 = setTimeout(() => {
      setPhase(4);
      setHidden(true);
      onComplete?.();
    }, 1250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [prefersReducedMotion, onComplete]);

  if (hidden) return null;

  return (
    <aside
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#071827] text-white transition-opacity duration-700 ease-in-out ${
        phase === 3 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-label="MSB PHARMACHEM introductory loading sequence"
    >
      {/* Background scientific grid pattern */}
      <div className="absolute inset-0 scientific-grid-dense opacity-20 pointer-events-none" />

      {/* Ambient background teal glow */}
      <div
        className={`absolute w-[450px] h-[450px] rounded-full bg-teal-500/10 blur-[120px] transition-all duration-1000 ease-out pointer-events-none ${
          phase >= 2 ? "scale-125 opacity-40" : "scale-75 opacity-10"
        }`}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-md">
        {/* Phase 1: Molecular emerging indicator */}
        <div className="relative mb-6">
          <div
            className={`w-20 h-20 rounded-full border border-teal-500/30 flex items-center justify-center transition-all duration-700 ${
              phase >= 2 ? "scale-100 opacity-100" : "scale-90 opacity-40"
            }`}
          >
            <div className="w-16 h-16 rounded-full border-2 border-teal-400/40 border-t-teal-300 animate-spin" />
            <div className="absolute w-3 h-3 rounded-full bg-teal-400 shadow-[0_0_12px_#16B8A6] animate-ping" />
          </div>

          {/* Logo container (Phase 2) */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
              phase >= 2 ? "scale-100 opacity-100" : "scale-75 opacity-0"
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-white p-1 shadow-lg shadow-teal-500/20">
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
          <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-heading">
            MSB PHARMACHEM
          </div>
          <div className="text-xs uppercase tracking-[0.25em] text-teal-400 font-semibold flex items-center justify-center gap-2">
            <span>Quality</span>
            <span className="text-teal-600">•</span>
            <span>Reliability</span>
            <span className="text-teal-600">•</span>
            <span>Trust</span>
          </div>
        </div>

        {/* Phase 1 & 2 subtitle status */}
        <div
          className={`mt-6 text-[11px] text-slate-400 tracking-wider uppercase font-mono transition-opacity duration-500 ${
            phase === 1 ? "opacity-80" : phase === 2 ? "opacity-60" : "opacity-0"
          }`}
        >
          {phase === 1 ? "Initializing Molecular Environment..." : "Precision in Every Molecule"}
        </div>
      </div>
    </aside>
  );
}
