"use client";

import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    let ticking = false;

    const updateProgress = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) {
        ticking = false;
        return;
      }
      const currentScroll = window.scrollY;
      const ratio = Math.min(1, Math.max(0, currentScroll / totalScroll));
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${ratio})`;
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateProgress();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[3px] z-[60] bg-slate-900/20 pointer-events-none"
      role="progressbar"
      aria-label="Page scroll progress"
    >
      <div
        ref={barRef}
        className="h-full w-full bg-gradient-to-r from-[#1b4db3] via-[#2563eb] to-[#3a991d] shadow-[0_0_10px_rgba(27,77,179,0.5)] origin-left"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

