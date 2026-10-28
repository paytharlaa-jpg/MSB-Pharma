"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Zap,
  FileCheck,
  ShieldCheck,
  MessageCircle,
  Clock,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PublicEnquiryForm } from "@/components/public-site/PublicEnquiryForm";
import { getWhatsAppClickToChatUrl } from "@/lib/whatsapp-service";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ProductItem {
  id: string;
  sku: string;
  name: string;
  grade: string | null;
  casNumber: string | null;
  therapeuticCategory: string | null;
  ihDmf: string | null;
  description: string | null;
  category: { id: string; name: string; slug: string };
}

interface CategoryItem {
  id: string;
  name: string;
}

interface FeaturedProductsSectionProps {
  products?: ProductItem[];
  categories?: CategoryItem[];
}

// Fallback high-demand catalog items to guarantee zero empty slots
const FALLBACK_PRODUCTS: ProductItem[] = [
  {
    id: "fb-1",
    sku: "MSB-API-001",
    name: "Atorvastatin Calcium Trihydrate",
    grade: "IP / BP / USP / EP",
    casNumber: "134523-03-8",
    therapeuticCategory: "Cardiovascular · Lipid Lowering",
    ihDmf: "Open-part DMF, CEP available",
    description: "HMG-CoA reductase inhibitor for statin formulation batches with verifiable polymorphic form stability.",
    category: { id: "c1", name: "Active APIs", slug: "apis" },
  },
  {
    id: "fb-2",
    sku: "MSB-INT-002",
    name: "2-[(5-Bromo-2-methylphenyl)methyl]-5-(4-fluorophenyl)thiophene",
    grade: "Commercial Grade (≥99.2%)",
    casNumber: "898566-17-1",
    therapeuticCategory: "Canagliflozin Intermediate",
    ihDmf: "Complete Route of Synthesis dossier",
    description: "Key penultimate organic intermediate for antidiabetic SGLT2 generic synthesis pipelines.",
    category: { id: "c2", name: "Intermediates", slug: "intermediates-raw-materials" },
  },
  {
    id: "fb-3",
    sku: "MSB-API-003",
    name: "Azithromycin Dihydrate",
    grade: "IP / BP / USP",
    casNumber: "117772-70-0",
    therapeuticCategory: "Macrolide Antibiotic",
    ihDmf: "WHO-GMP batch release documentation",
    description: "Broad-spectrum azalide antibiotic active powder tested for chromatographic assay purity and moisture limits.",
    category: { id: "c1", name: "Active APIs", slug: "apis" },
  },
  {
    id: "fb-4",
    sku: "MSB-INT-004",
    name: "(3S)-3-[4-[(2-Chloro-5-iodophenyl)methyl]phenoxy]tetrahydrofuran",
    grade: "High Purity (≥99.0%)",
    casNumber: "461432-26-8",
    therapeuticCategory: "Dapagliflozin Intermediate",
    ihDmf: "NMR, MS, HPLC batch release data",
    description: "Chiral tetrahydrofuran intermediate synthesized with controlled enantiomeric excess for SGLT2 formulation.",
    category: { id: "c2", name: "Intermediates", slug: "intermediates-raw-materials" },
  },
  {
    id: "fb-5",
    sku: "MSB-API-005",
    name: "Citicoline Sodium",
    grade: "IP / USP",
    casNumber: "33818-15-4",
    therapeuticCategory: "Neuroprotective / Nootropic",
    ihDmf: "Authentic manufacturer COA included",
    description: "High-grade psychostimulant and neuroprotective active ingredient for injectable and solid oral dosage.",
    category: { id: "c1", name: "Active APIs", slug: "apis" },
  },
  {
    id: "fb-6",
    sku: "MSB-INT-006",
    name: "8-Bromo-7-(but-2-yn-1-yl)-3-methyl-1H-purine-2,6(3H,7H)-dione",
    grade: "Analytical Grade (≥99.5%)",
    casNumber: "847253-10-8",
    therapeuticCategory: "Linagliptin Intermediate",
    ihDmf: "Audit-ready batch impurity records",
    description: "Purine-dione synthetic block for antidiabetic DPP-4 inhibitor manufacturing with sub-ppm residue control.",
    category: { id: "c2", name: "Intermediates", slug: "intermediates-raw-materials" },
  },
];

export function FeaturedProductsSection({
  products = [],
  categories = [],
}: FeaturedProductsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const prefersReducedMotion = useReducedMotion();

  // Combine products with guaranteed fallbacks if database has fewer items
  const catalogList = useMemo(() => {
    if (products.length >= 6) return products;
    const existingIds = new Set(products.map((p) => p.name.toLowerCase()));
    const supplement = FALLBACK_PRODUCTS.filter(
      (fb) => !existingIds.has(fb.name.toLowerCase())
    );
    return [...products, ...supplement].slice(0, 6);
  }, [products]);

  // Filtered list based on active tab
  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") return catalogList;
    return catalogList.filter((p) => {
      const catSlug = p.category?.slug?.toLowerCase() || "";
      const catName = p.category?.name?.toLowerCase() || "";
      if (activeFilter === "apis") {
        return catSlug.includes("api") || catName.includes("api");
      }
      if (activeFilter === "intermediates") {
        return (
          catSlug.includes("intermediate") ||
          catSlug.includes("raw") ||
          catName.includes("intermediate") ||
          catName.includes("raw")
        );
      }
      return true;
    });
  }, [catalogList, activeFilter]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const section = sectionRef.current;
    if (!section) return;

    // Use once: true to unhook scroll triggers after entrance for maximum frame rate
    const ctx = gsap.context(() => {
      gsap.from(".product-header-reveal", {
        scrollTrigger: {
          trigger: ".product-header-reveal",
          start: "top 85%",
          once: true,
        },
        y: 15,
        duration: 0.5,
        ease: "power2.out",
      });

      gsap.from(".product-card-reveal", {
        scrollTrigger: {
          trigger: ".product-card-reveal",
          start: "top 85%",
          once: true,
        },
        y: 20,
        stagger: 0.06,
        duration: 0.5,
        ease: "power2.out",
      });

      gsap.from(".rfq-container-reveal", {
        scrollTrigger: {
          trigger: ".rfq-container-reveal",
          start: "top 85%",
          once: true,
        },
        y: 20,
        duration: 0.5,
        ease: "power2.out",
      });
    }, section);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const handleSelectProduct = (productName: string) => {
    setSelectedProduct(productName);
    const rfqElement = document.getElementById("rfq-section");
    if (rfqElement) {
      rfqElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="rfq-section"
      className="py-14 sm:py-16 bg-[#FFFFFF] text-slate-900 border-t border-slate-200 relative overflow-clip"
      aria-label="Featured Products and Commercial Enquiry"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Product Showcase Header */}
        <div className="product-header-reveal flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 border-b border-slate-100 pb-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-teal-800 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-md border border-teal-200">
                COMMERCIAL CATALOGUE
              </span>
              <span className="text-xs font-mono text-slate-500 font-semibold">
                ● Ready for Commercial Dispatch
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading leading-tight">
              Featured Pharmaceutical Materials & APIs
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              High-purity active pharmaceutical ingredients, synthesis intermediates, and critical excipients verified for commercial formulation.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/products">
              <Button variant="outline" size="sm" className="border-slate-300 text-xs font-semibold">
                <span>View Full 18+ Master Catalog</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Category Quick Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-teal-600" />
            <span>Filter:</span>
          </span>
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Featured ({catalogList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("apis")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === "apis"
                ? "bg-teal-700 text-white shadow-xs"
                : "bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200"
            }`}
          >
            Active APIs
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("intermediates")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === "intermediates"
                ? "bg-teal-700 text-white shadow-xs"
                : "bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200"
            }`}
          >
            Synthesis Intermediates
          </button>
        </div>

        {/* Featured Products Grid — Rich, dense, informative */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="product-card-reveal bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-lg hover:border-teal-500/50 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Status & Category Bar */}
                <div className="flex items-center justify-between text-xs mb-3 pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-mono text-emerald-700 font-bold">
                      In Stock • Hyd Hub
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {p.sku}
                  </span>
                </div>

                {/* Product Name */}
                <h3 className="font-bold text-base sm:text-lg text-slate-900 font-heading leading-snug">
                  {p.name}
                </h3>

                {/* Therapeutic Tag */}
                {p.therapeuticCategory && (
                  <p className="text-xs text-teal-700 font-medium mt-1">
                    {p.therapeuticCategory}
                  </p>
                )}

                {/* Description summary */}
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {p.description || "High-purity pharmaceutical material ready for commercial supply with full regulatory dossier."}
                </p>

                {/* Technical Specifications Matrix */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">
                      CAS NUMBER
                    </span>
                    <span className="font-mono font-bold text-slate-800 text-[11px] truncate block">
                      {p.casNumber || "Available"}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">
                      STANDARD
                    </span>
                    <span className="font-semibold text-slate-800 text-[11px] truncate block">
                      {p.grade || "IP / BP / USP"}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">
                      DISPATCH
                    </span>
                    <span className="font-semibold text-emerald-700 text-[11px] truncate block">
                      24–48h
                    </span>
                  </div>
                </div>

                {/* Documentation Tag */}
                <div className="mt-3 text-[11px] text-slate-600 bg-teal-50/60 px-2.5 py-1.5 rounded-lg border border-teal-100 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="truncate">{p.ihDmf || "Manufacturer COA & MSDS Included"}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleSelectProduct(p.name)}
                  className="w-full py-2.5 px-3.5 rounded-xl text-xs font-bold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span>Request Quotation & COA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Commercial RFQ Container — Dense, balanced, bright & high trust */}
        <div className="rfq-container-reveal rounded-3xl bg-gradient-to-br from-[#edf3fd]/90 via-white to-[#edf8eb]/90 text-slate-900 p-6 sm:p-10 lg:p-12 shadow-xl border-2 border-slate-200/90 relative overflow-hidden">
          {/* Subtle background grid */}
          <div className="absolute inset-0 scientific-grid-bg opacity-35 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start relative z-10">
            {/* Left Column: Full context and assurance cards that match the height of the right form */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#edf3fd] border border-[#1b4db3]/30 text-[#1b4db3] text-xs font-mono font-bold tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#1b4db3]" />
                <span>FAST COMMERCIAL RESPONSE</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight font-heading">
                Looking for a Specific Pharmaceutical Material?
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Tell us your target molecule, grade, and delivery volume. Our commercial team in Hyderabad immediately verifies batch availability, confirms COA specifications, and returns competitive B2B quotation terms.
              </p>

              {/* 3 Value Assurance Highlights — Fills empty space with high-value technical context */}
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#edf3fd] border border-[#1b4db3]/25 flex items-center justify-center text-[#1b4db3] shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-heading">
                      24-Hour Commercial Dispatch
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                      Stocked in Hyderabad warehouse corridor for immediate domestic transit & air cargo staging.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#edf8eb] border border-[#3a991d]/25 flex items-center justify-center text-[#3a991d] shrink-0 mt-0.5">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-heading">
                      Audit-Ready Dossiers
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                      Batch-specific manufacturer COA, analytical method, MSDS, and open-part DMF documentation provided.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#edf3fd] border border-[#1b4db3]/25 flex items-center justify-center text-[#1b4db3] shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-heading">
                      WHO-GMP Vetted Manufacturers
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                      Audited manufacturing sites meeting stringent IP, BP, USP, and EP compendial monographs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Verified Contact Details Box */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#1b4db3] shrink-0" />
                    <span>Headquarters:</span>
                  </span>
                  <span className="text-slate-900 font-medium text-right truncate">Kukatpally, Hyderabad</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#3a991d] shrink-0" />
                    <span>Commercial Desk:</span>
                  </span>
                  <a href="tel:+918008335333" className="text-[#1b4db3] font-mono font-bold hover:underline">
                    +91 8008335333
                  </a>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#1b4db3] shrink-0" />
                    <span>Procurement Mail:</span>
                  </span>
                  <a href="mailto:mohank9@gmail.com" className="text-[#1b4db3] font-mono font-medium hover:underline">
                    mohank9@gmail.com
                  </a>
                </div>

                <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#3a991d] shrink-0" />
                    <span>Working Hours:</span>
                  </span>
                  <span className="text-slate-700 font-mono text-[11px]">Mon–Sat: 9 AM–6:30 PM IST</span>
                </div>
              </div>

              {/* Fast WhatsApp Chat Button */}
              <a
                href={getWhatsAppClickToChatUrl({
                  customText: selectedProduct
                    ? `Hello MSB PHARMACHEM, I would like to request commercial availability and quote for ${selectedProduct}.`
                    : "Hello MSB PHARMACHEM, I would like to inquire about pharmaceutical material procurement.",
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#3a991d] hover:bg-[#2e7b17] text-white transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#3a991d]/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Quick WhatsApp Quote (+91 8008335333)</span>
              </a>
            </div>

            {/* Right Column: PublicEnquiryForm Template Card */}
            <div className="lg:col-span-7">
              <PublicEnquiryForm
                categories={categories}
                defaultProduct={selectedProduct}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
