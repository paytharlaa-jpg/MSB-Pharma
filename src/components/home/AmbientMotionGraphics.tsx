"use client";

import React from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function AmbientMotionGraphics() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-[2]"
      aria-hidden="true"
    >
      {/* 1. Large Top-Right Rotating Orbital Ring with Glowing Planets */}
      <div className="absolute -top-16 -right-16 sm:top-6 sm:right-12 w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] rounded-full border border-dashed border-[#1b4db3]/20 animate-spin-orbital opacity-60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#1b4db3] shadow-[0_0_12px_#1b4db3]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#3a991d] shadow-[0_0_10px_#3a991d]" />
      </div>

      {/* 2. Top-Right Counter-Rotating Concentric Ring */}
      <div className="absolute top-4 right-8 sm:top-20 sm:right-24 w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] rounded-full border border-[#3a991d]/20 animate-spin-orbital-reverse opacity-50">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#2563eb] shadow-[0_0_8px_#2563eb]" />
      </div>

      {/* 3. Floating Benzene Ring Hexagon 1 (Top Left) */}
      <div className="absolute top-[18%] left-[4%] sm:left-[6%] animate-float-slow opacity-30">
        <svg width="90" height="104" viewBox="0 0 100 115" fill="none" className="text-[#1b4db3]">
          <polygon
            points="50,5 95,30 95,85 50,110 5,85 5,30"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <circle cx="50" cy="57.5" r="26" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.7" />
        </svg>
      </div>

      {/* 4. Floating Benzene Ring Hexagon 2 (Bottom Right) */}
      <div className="absolute bottom-[16%] right-[5%] animate-float-reverse opacity-25">
        <svg width="75" height="86" viewBox="0 0 100 115" fill="none" className="text-[#3a991d]">
          <polygon
            points="50,5 95,30 95,85 50,110 5,85 5,30"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="50" cy="57.5" r="22" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      </div>

      {/* 5. Floating Chemical Formula Badges */}
      <div className="hidden xl:block absolute top-[36%] left-[3%] animate-float-slow">
        <div className="glass-panel-light px-3 py-1.5 rounded-full text-[10px] font-mono text-[#1b4db3] border border-[#1b4db3]/20 flex items-center gap-1.5 shadow-md backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3a991d] animate-ping" />
          <span className="font-semibold">C₃₃H₃₅FN₂O₅ • Atorvastatin</span>
        </div>
      </div>

      <div className="hidden xl:block absolute bottom-[28%] left-[4%] animate-float-reverse">
        <div className="glass-panel-light px-3 py-1.5 rounded-full text-[10px] font-mono text-[#3a991d] border border-[#3a991d]/20 flex items-center gap-1.5 shadow-md backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1b4db3]" />
          <span className="font-semibold">HPLC Assay: 99.85%</span>
        </div>
      </div>

      <div className="hidden xl:block absolute top-[52%] right-[3%] animate-float-slow">
        <div className="glass-panel-light px-3 py-1.5 rounded-full text-[10px] font-mono text-[#1b4db3] border border-[#1b4db3]/20 flex items-center gap-1.5 shadow-md backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3a991d]" />
          <span className="font-semibold">DMF Type-II • Active Dossier</span>
        </div>
      </div>

      {/* 6. Lower Left Ambient Orbital Graphic */}
      <div className="absolute -bottom-24 -left-24 w-[360px] h-[360px] rounded-full border border-dashed border-[#1b4db3]/15 animate-spin-orbital opacity-30">
        <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#1b4db3] shadow-[0_0_12px_#1b4db3]" />
      </div>
    </div>
  );
}
