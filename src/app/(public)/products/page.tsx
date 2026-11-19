"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ArrowRight, Pill, Atom, Layers, Beaker, ScanSearch, Package, X, MessageSquareText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { PublicEnquiryForm } from "@/components/public-site/PublicEnquiryForm";
import { PageHero } from "@/components/public-site/PageHero";

interface Product {
  id: string;
  sku: string;
  name: string;
  grade: string | null;
  therapeuticCategory: string | null;
  casNumber: string | null;
  ihDmf: string | null;
  description: string | null;
  unitOfMeasurement: string;
  category: { id: string; name: string; slug: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

const CATEGORY_ICON: Record<string, React.ElementType> = {
  apis: Pill,
  "intermediates-raw-materials": Atom,
  excipients: Layers,
  "chemicals-solvents": Beaker,
  "impurity-standards": ScanSearch,
};

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "ALL");
  const [rfqModalOpen, setRfqModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");

  useEffect(() => {
    fetch("/api/products?public=true")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setProducts(json.products);
          setCategories(json.categories);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const countBySlug = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of products) m[p.category.slug] = (m[p.category.slug] || 0) + 1;
    return m;
  }, [products]);

  const q = search.trim().toLowerCase();
  const matches = (p: Product) =>
    !q ||
    p.name.toLowerCase().includes(q) ||
    (p.casNumber ?? "").toLowerCase().includes(q) ||
    (p.therapeuticCategory ?? "").toLowerCase().includes(q) ||
    p.sku.toLowerCase().includes(q);

  // Category-wise groups, in catalogue order
  const groups = categories
    .filter((c) => activeCategory === "ALL" || c.slug === activeCategory)
    .map((c) => ({ category: c, items: products.filter((p) => p.category.slug === c.slug && matches(p)) }))
    .filter((g) => !q || g.items.length > 0);

  const openRfq = (name: string) => {
    setSelectedProduct(name);
    setRfqModalOpen(true);
  };

  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Product catalogue"
        title="Pharmaceutical APIs, intermediates"
        accent="& standards"
        lead="Browse our portfolio category by category. Every product is supplied with batch COA, MSDS and full documentation."
        image="/images/category-apis.webp"
      />

      {/* Category portfolio: live counts, also the filter */}
      <section className="relative -mt-10 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="premium-card rounded-3xl p-4 sm:p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <button
              onClick={() => setActiveCategory("ALL")}
              className={`rounded-2xl px-4 py-3.5 text-left transition-colors ${
                activeCategory === "ALL" ? "bg-[#0f2d6b] text-white" : "bg-slate-50 hover:bg-slate-100 text-[#0f2d6b]"
              }`}
            >
              <span className="block font-heading text-2xl font-bold tabular-nums">{products.length}</span>
              <span className={`block text-xs font-semibold mt-0.5 ${activeCategory === "ALL" ? "text-white/70" : "text-slate-500"}`}>All products</span>
            </button>
            {categories.map((c) => {
              const Icon = CATEGORY_ICON[c.slug] ?? Package;
              const active = activeCategory === c.slug;
              const n = countBySlug[c.slug] || 0;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.slug)}
                  className={`rounded-2xl px-4 py-3.5 text-left transition-colors ${active ? "bg-[#0f2d6b] text-white" : "bg-slate-50 hover:bg-slate-100 text-[#0f2d6b]"}`}
                >
                  <span className="flex items-center justify-between">
                    <span className="font-heading text-2xl font-bold tabular-nums">{n}</span>
                    <Icon className={`w-5 h-5 ${active ? "text-[#9be07e]" : "text-[#1b4db3]"}`} />
                  </span>
                  <span className={`block text-xs font-semibold mt-0.5 leading-snug ${active ? "text-white/70" : "text-slate-500"}`}>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, CAS number or therapeutic class"
              className="w-full rounded-full border border-slate-200 bg-white pl-11 pr-10 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-[#1b4db3]/10 focus:border-[#1b4db3]"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" aria-label="Clear search">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {loading ? (
            <p className="mt-12 text-sm text-slate-500">Loading catalogue…</p>
          ) : groups.length === 0 ? (
            <div className="mt-12 rounded-3xl border border-dashed border-slate-300 p-10 text-center">
              <p className="font-heading text-lg font-bold text-[#0f2d6b]">No products match “{search}”</p>
              <p className="mt-2 text-sm text-slate-500">We may still be able to source it.</p>
              <button onClick={() => openRfq(search)} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0f2d6b] px-5 py-2.5 text-sm font-semibold text-white">
                Send a sourcing request <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="mt-12 space-y-14">
              {groups.map(({ category, items }) => {
                const Icon = CATEGORY_ICON[category.slug] ?? Package;
                return (
                  <div key={category.id} id={category.slug} className="scroll-mt-28">
                    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
                      <div className="flex items-center gap-4">
                        <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1b4db3] to-[#2a62d1] text-white flex items-center justify-center shadow-[0_12px_24px_-12px_rgba(27,77,179,0.8)]">
                          <Icon className="w-6 h-6" />
                        </span>
                        <div>
                          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#0f2d6b]">{category.name}</h2>
                          {category.description && <p className="mt-1 text-sm text-slate-500 max-w-2xl">{category.description}</p>}
                        </div>
                      </div>
                      <span className="rounded-full bg-[#edf8eb] px-3.5 py-1.5 text-xs font-bold text-[#2e7b17]">
                        {(countBySlug[category.slug] || 0)} {(countBySlug[category.slug] || 0) === 1 ? "product" : "products"}
                      </span>
                    </div>

                    {items.length === 0 ? (
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-50 px-6 py-5">
                        <p className="text-sm text-slate-600">Products in this category are sourced on request. Tell us the molecule, grade and quantity you need.</p>
                        <button onClick={() => openRfq(category.name)} className="inline-flex items-center gap-2 rounded-full bg-white ring-1 ring-slate-200 px-4 py-2 text-sm font-semibold text-[#0f2d6b] hover:ring-[#1b4db3]/40">
                          <MessageSquareText className="w-4 h-4 text-[#1b4db3]" /> Enquire
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Desktop: list table */}
                        <div className="mt-5 hidden md:block overflow-hidden rounded-2xl border border-slate-200">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                              <tr>
                                <th className="py-3 pl-5 pr-3 w-12">#</th>
                                <th className="py-3 px-3">Product</th>
                                <th className="py-3 px-3">CAS No.</th>
                                <th className="py-3 px-3">Grade</th>
                                <th className="py-3 px-3">Documentation</th>
                                <th className="py-3 pl-3 pr-5 text-right">Enquiry</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {items.map((p, i) => (
                                <tr key={p.id} className="group hover:bg-[#f6f8fc] transition-colors">
                                  <td className="py-4 pl-5 pr-3 text-xs font-semibold text-slate-400 tabular-nums">{String(i + 1).padStart(2, "0")}</td>
                                  <td className="py-4 px-3">
                                    <p className="font-semibold text-[#0f2d6b] leading-snug">{p.name}</p>
                                    {p.therapeuticCategory && <p className="text-xs text-[#3a991d] font-medium mt-0.5">{p.therapeuticCategory}</p>}
                                  </td>
                                  <td className="py-4 px-3 font-mono text-xs text-slate-600 whitespace-nowrap">{p.casNumber || "-"}</td>
                                  <td className="py-4 px-3 text-xs text-slate-600 whitespace-nowrap">{p.grade || "IP / BP / USP"}</td>
                                  <td className="py-4 px-3 text-xs text-slate-500">{p.ihDmf || "COA · MSDS"}</td>
                                  <td className="py-4 pl-3 pr-5 text-right">
                                    <button
                                      onClick={() => openRfq(p.name)}
                                      className="inline-flex items-center gap-1.5 rounded-full bg-[#0f2d6b] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1b4db3] transition-colors whitespace-nowrap"
                                    >
                                      Request quote <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {/* Mobile: compact cards */}
                        <div className="mt-5 md:hidden space-y-3">
                          {items.map((p) => (
                            <div key={p.id} className="rounded-2xl border border-slate-200 p-4">
                              <p className="font-semibold text-[#0f2d6b]">{p.name}</p>
                              {p.therapeuticCategory && <p className="text-xs text-[#3a991d] font-medium mt-0.5">{p.therapeuticCategory}</p>}
                              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                <span>
                                  <span className="block text-[10px] text-slate-400">CAS No.</span>
                                  <span className="font-mono text-slate-700">{p.casNumber || "-"}</span>
                                </span>
                                <span>
                                  <span className="block text-[10px] text-slate-400">Grade</span>
                                  <span className="text-slate-700">{p.grade || "IP / BP / USP"}</span>
                                </span>
                              </div>
                              <button onClick={() => openRfq(p.name)} className="mt-4 w-full inline-flex justify-center items-center gap-1.5 rounded-full bg-[#0f2d6b] py-2.5 text-xs font-semibold text-white">
                                Request quote <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Modal
        isOpen={rfqModalOpen}
        onClose={() => setRfqModalOpen(false)}
        title="Commercial Product Enquiry"
        description="Quotation and COA request directly to our sales desk in Hyderabad."
        maxWidth="lg"
      >
        <PublicEnquiryForm categories={categories} defaultProduct={selectedProduct} asCard={false} />
      </Modal>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading catalogue…</div>}>
      <ProductsContent />
    </Suspense>
  );
}
