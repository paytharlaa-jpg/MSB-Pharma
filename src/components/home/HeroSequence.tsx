"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ArrowRight, ArrowUpRight, Atom, Pill, Beaker, ScanSearch, Truck, FileCheck2, Check } from "lucide-react";
import { CREDENTIALS } from "./CredentialIcons";

const PORTFOLIO = [
  { icon: Pill, label: "Human & Veterinary APIs", sub: "Generic formulation coverage", count: 20 },
  { icon: Atom, label: "Intermediates & KSMs", sub: "Building blocks for API synthesis", count: 30 },
  { icon: Beaker, label: "Chemicals & Solvents", sub: "Pharma, lab & industrial grades", count: 90 },
  { icon: ScanSearch, label: "Impurity Standards", sub: "Method development & QC", count: 400 },
];

const GRADES = ["IP", "BP", "USP", "EP"];

export function HeroSequence() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Wait for the first-visit preloader to lift before the intro plays
      const start = document.querySelector("[data-preloader]") ? 1.05 : 0.15;
      const tl = gsap.timeline({ delay: start, defaults: { ease: "power4.out" } });
      tl.from(".hero-eyebrow", { y: 16, opacity: 0, duration: 0.8 })
        .from(".hero-line > span", { yPercent: 110, duration: 1.1, stagger: 0.12 }, "-=0.5")
        .from(".hero-copy", { y: 24, opacity: 0, duration: 0.9 }, "-=0.75")
        .from(".hero-cta", { y: 18, opacity: 0, duration: 0.7, stagger: 0.1 }, "-=0.6")
        .from(".hero-cred", { y: 16, opacity: 0, duration: 0.6, stagger: 0.07 }, "-=0.5")
        .from(".hero-card", { y: 50, opacity: 0, duration: 1.2 }, 0.35)
        .from(".hero-card-row", { x: -16, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.85)
        .from(".hero-chip", { y: 18, opacity: 0, duration: 0.8, stagger: 0.15, ease: "back.out(1.6)" }, 1.15);

      gsap.utils.toArray<HTMLElement>(".hero-count").forEach((n) => {
        const target = Number(n.dataset.to || 0);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          delay: start + 0.9,
          ease: "power2.out",
          onUpdate: () => (n.textContent = `${Math.round(obj.v)}+`),
        });
      });

      // Scroll-out depth: copy drifts faster than the card, glows sink
      const st = { trigger: el, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".hero-left", { yPercent: -14, opacity: 0.25, ease: "none", scrollTrigger: st });
      gsap.to(".hero-right", { yPercent: -6, ease: "none", scrollTrigger: st });
      gsap.to(".hero-orb", { yPercent: 30, ease: "none", scrollTrigger: st });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative overflow-clip bg-[#0a1d45] text-white lg:min-h-[calc(100svh-8rem)] flex items-center"
      aria-label="MSB PHARMACHEM: Trusted Pharma Supply Partner"
    >
      {/* Background: deep navy → brand blue with green light, fine masked grid */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1d45] via-[#0f2d6b] to-[#123f7a]" />
        <div className="hero-orb absolute -top-48 -left-40 w-[620px] h-[620px] rounded-full bg-[#1b4db3]/45 blur-[130px]" />
        <div className="hero-orb absolute bottom-[-200px] right-[-120px] w-[700px] h-[700px] rounded-full bg-[#3a991d]/30 blur-[150px]" />
        <div className="absolute top-1/3 left-1/2 w-[420px] h-[420px] rounded-full bg-[#2a62d1]/25 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 70% 70% at 40% 40%, #000 20%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 40% 40%, #000 20%, transparent 80%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-14 lg:py-12 grid lg:grid-cols-12 gap-12 lg:gap-12 items-center">
        {/* ---------- Left: message ---------- */}
        <div className="hero-left lg:col-span-7">
          <p className="hero-eyebrow eyebrow eyebrow-light">Hyderabad · Pharma B2B Supply</p>

          <h1 className="mt-5 font-heading font-bold text-[42px] leading-[1.03] sm:text-6xl lg:text-[64px] xl:text-[70px] !text-white">
            <span className="hero-line block overflow-hidden pb-1">
              <span className="block">Trusted Pharma</span>
            </span>
            <span className="hero-line block overflow-hidden pb-2">
              <span className="block bg-gradient-to-r from-[#8fb4ff] via-[#7fd1c4] to-[#9be07e] bg-clip-text text-transparent">Supply Partner</span>
            </span>
          </h1>

          <p className="hero-copy mt-5 text-lg sm:text-xl leading-relaxed text-white/75 max-w-xl">
            APIs, intermediates, excipients and reference standards, sourced from verified WHO-GMP manufacturers and delivered
            with batch-wise COA, MSDS and complete regulatory documentation.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="hero-cta btn-shine group inline-flex items-center gap-2.5 rounded-full bg-[#3a991d] px-7 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_-14px_rgba(58,153,29,0.8)] hover:bg-[#2e7b17] transition-colors"
            >
              Request a Quotation
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/products"
              className="hero-cta group inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.06] backdrop-blur px-7 py-4 text-sm font-semibold text-white hover:bg-white/[0.12] transition-colors"
            >
              Explore Products
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Statutory registrations: glass pills */}
          <div className="mt-10">
            <p className="hero-cred text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-3.5">
              Registered &amp; licensed for pharmaceutical trade
            </p>
            <ul className="flex flex-wrap gap-2.5">
              {CREDENTIALS.map(({ key, label, sub }) => (
                <li
                  key={key}
                  title={sub}
                  className="hero-cred inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] backdrop-blur-md px-4 py-2 text-[13px] font-medium text-white/90"
                >
                  <Check className="w-3.5 h-3.5 text-[#9be07e]" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---------- Right: glass Product Portfolio card ---------- */}
        <div className="hero-right lg:col-span-5 relative">
          <div className="hero-card relative mx-auto max-w-[440px]">
            <div className="relative rounded-[26px] border border-white/15 bg-white/[0.08] backdrop-blur-2xl p-5 sm:p-6 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.55)]">
              {/* top light edge */}
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" aria-hidden="true" />

              <div className="flex items-center justify-between">
                <h2 className="font-heading text-lg font-bold !text-white">Product Portfolio</h2>
                <span className="rounded-full border border-[#9be07e]/30 bg-[#3a991d]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b6ef9b]">
                  540+ molecules
                </span>
              </div>

              <ul className="mt-4 space-y-1.5">
                {PORTFOLIO.map(({ icon: Icon, label, sub, count }) => (
                  <li key={label}>
                    <Link
                      href="/products"
                      className="hero-card-row group flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-white/[0.07] transition-colors"
                    >
                      <span className="w-10 h-10 shrink-0 rounded-xl border border-white/15 bg-white/[0.08] text-[#9fc3ff] flex items-center justify-center">
                        <Icon className="w-[18px] h-[18px]" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold text-white">{label}</span>
                        <span className="block text-xs text-white/55 truncate">{sub}</span>
                      </span>
                      <span className="hero-count font-heading text-base font-bold tabular-nums text-[#b6ef9b]" data-to={count}>
                        {count}+
                      </span>
                      <ArrowRight className="w-4 h-4 text-white/30 transition-all group-hover:text-white group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-white/50 mr-1">Grades</span>
                  {GRADES.map((g) => (
                    <span key={g} className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-0.5 text-[11px] font-bold text-white/85">
                      {g}
                    </span>
                  ))}
                </div>
                <Link href="/products" className="group inline-flex items-center gap-1 text-xs font-semibold text-[#9fc3ff] hover:text-white">
                  Catalogue <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>

            {/* Floating glass proof chips */}
            <div className="hero-chip premium-float absolute -top-6 -right-3 sm:-right-8 hidden sm:flex items-center gap-2.5 rounded-2xl border border-white/15 bg-[#0a1d45]/70 backdrop-blur-xl px-4 py-2.5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]">
              <FileCheck2 className="w-5 h-5 text-[#9be07e]" />
              <span>
                <span className="block text-xs font-bold text-white">COA · MSDS · DMF</span>
                <span className="block text-[11px] text-white/55">With every batch</span>
              </span>
            </div>
            <div
              className="hero-chip premium-float absolute -bottom-6 -left-3 sm:-left-10 hidden sm:flex items-center gap-2.5 rounded-2xl border border-white/15 bg-[#0a1d45]/70 backdrop-blur-xl px-4 py-2.5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]"
              style={{ animationDelay: "-3s" }}
            >
              <Truck className="w-5 h-5 text-[#9fc3ff]" />
              <span>
                <span className="block text-xs font-bold text-white">Dispatch in 24 hrs</span>
                <span className="block text-[11px] text-white/55">Pan-India &amp; export</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
