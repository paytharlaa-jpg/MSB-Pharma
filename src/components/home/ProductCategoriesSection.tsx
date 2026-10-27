"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FlaskConical, Boxes, ShieldCheck, Truck, Award, Sparkles } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface ProductCategoriesProps {
  categories?: CategoryData[];
}

export function ProductCategoriesSection({ categories = [] }: ProductCategoriesProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Curated category metadata mapping to approved imagery and highlights
  const categoryMeta: Record<string, { image: string; icon: typeof FlaskConical; tag: string }> = {
    api: {
      image: "/images/api-materials.webp",
      icon: FlaskConical,
      tag: "IP / BP / USP Grades",
    },
    raw_materials: {
      image: "/images/pharmaceutical-raw-materials.webp",
      icon: Boxes,
      tag: "Synthesis Intermediates",
    },
    excipients: {
      image: "/images/excipients-materials.webp",
      icon: Award,
      tag: "Bioavailability Enhancers",
    },
    chemicals: {
      image: "/images/chemicals-solvents.webp",
      icon: Truck,
      tag: "HPLC & Electronic Grade",
    },
    impurities: {
      image: "/images/impurity-standards.webp",
      icon: ShieldCheck,
      tag: "Analytical Standards",
    },
    bulk_drugs: {
      image: "/images/about-company.webp",
      icon: Sparkles,
      tag: "Commercial Tonnage",
    },
  };

  useEffect(() => {
    if (prefersReducedMotion) return;
    const section = sectionRef.current;
    const header = headerRef.current;
    const grid = gridRef.current;
    if (!section || !grid) return;

    const ctx = gsap.context(() => {
      if (header) {
        gsap.from(header.children, {
          scrollTrigger: {
            trigger: header,
            start: "top 85%",
            once: true,
          },
          y: 20,
          stagger: 0.08,
          duration: 0.6,
          ease: "power2.out",
        });
      }

      gsap.from(grid.children, {
        scrollTrigger: {
          trigger: grid,
          start: "top 85%",
          once: true,
        },
        y: 25,
        stagger: 0.06,
        duration: 0.6,
        ease: "power2.out",
      });
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  // Use database categories or fallback to the 6 core approved categories
  const displayCategories = categories.length > 0 ? categories : [
    { id: "1", name: "Active Pharmaceutical Ingredients (APIs)", slug: "api", description: "Potent active substances for cardiovascular, antibiotic, antidiabetic, and central nervous formulations." },
    { id: "2", name: "Pharmaceutical Raw Materials & Intermediates", slug: "raw_materials", description: "Advanced synthetic building blocks and organic chemical intermediates for generic drug manufacturing." },
    { id: "3", name: "Excipients", slug: "excipients", description: "High-purity binders, lubricants, coating polymers, and disintegrants to optimize drug formulation stability." },
    { id: "4", name: "Chemicals & Solvents", slug: "chemicals", description: "Spectroscopic, analytical, and bulk grade solvents engineered for extraction and chemical synthesis." },
    { id: "5", name: "Impurity Standards", slug: "impurities", description: "Certified analytical reference standards with comprehensive NMR, HPLC, and MS batch characterization." },
    { id: "6", name: "Bulk Drugs", slug: "bulk_drugs", description: "Large-scale commercial volume pharmaceutical actives manufactured under strict cGMP conditions." },
  ];

  return (
    <section
      ref={sectionRef}
      id="product-categories"
      className="py-14 sm:py-16 bg-[#f8fafc] text-slate-900 border-t border-slate-200/80 relative overflow-clip"
      aria-label="Product Categories Section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Ref */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono font-bold text-[#1b4db3] uppercase tracking-widest bg-[#edf3fd] px-3 py-1 rounded-md border border-[#1b4db3]/20">
              CORE PORTFOLIO
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-heading leading-tight">
              Materials That Move Science Forward.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              High-purity pharmaceutical compounds, certified excipients, and analytical standards sourced from vetted WHO-GMP manufacturing sites.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center text-sm font-bold text-[#1b4db3] hover:text-[#153e94] group shrink-0"
          >
            <span>Explore Complete Master Catalog</span>
            <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {displayCategories.map((cat, idx) => {
            const meta = categoryMeta[cat.slug] || {
              image: "/images/api-materials.webp",
              icon: FlaskConical,
              tag: "Certified Sourcing",
            };
            const Icon = meta.icon;

            return (
              <Link
                key={cat.id || idx}
                href={`/products?category=${cat.slug}`}
                className="group relative bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#1b4db3]/40 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Visual Header */}
                <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                  <Image
                    src={meta.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

                  <div className="absolute top-3 left-3 z-10">
                    <span className="px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-md text-[10px] font-mono font-bold text-[#1b4db3] shadow-xs">
                      {meta.tag}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between text-white">
                    <div className="w-8 h-8 rounded-lg bg-[#1b4db3]/80 border border-white/20 backdrop-blur-md flex items-center justify-center text-white">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#1b4db3] transition-colors font-heading leading-snug">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {cat.description || "High-purity raw materials verified with complete regulatory and analytical documentation."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#1b4db3] group-hover:text-[#3a991d] transition-colors">
                    <span>View Specifications & Inquire</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
