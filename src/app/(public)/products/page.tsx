"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, FlaskConical, Filter, MessageCircle, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PublicEnquiryForm } from "@/components/public-site/PublicEnquiryForm";
import { EmptyState } from "@/components/ui/EmptyState";

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
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "ALL";

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory);

  // Quote Modal
  const [rfqModalOpen, setRfqModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  useEffect(() => {
    setLoading(true);
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

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === "ALL" || p.category.slug === activeCategory;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(q) ||
      (p.casNumber && p.casNumber.toLowerCase().includes(q)) ||
      (p.therapeuticCategory && p.therapeuticCategory.toLowerCase().includes(q)) ||
      p.sku.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const handleOpenRfq = (productName: string) => {
    setSelectedProduct(productName);
    setRfqModalOpen(true);
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#00488F] uppercase tracking-wider">
            Approved Product Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Pharmaceutical APIs, Intermediates & Standards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Browse our commercial inventory. All products are backed by verified COA specifications, authentic manufacturer provenance, and compliance documentation.
          </p>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="relative max-w-xl mx-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name, CAS number, or therapeutic class..."
              className="pl-10 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setActiveCategory("ALL")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === "ALL"
                  ? "bg-[#00488F] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Products ({products.length})
            </button>
            {categories.map((c) => {
              const count = products.filter((p) => p.category.slug === c.slug).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.slug)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    activeCategory === c.slug
                      ? "bg-[#00488F] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {c.name} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-mono text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {p.sku}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">{p.category.name}</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 leading-snug">{p.name}</h3>
                  {p.therapeuticCategory && (
                    <p className="text-xs text-emerald-700 font-semibold mt-1">{p.therapeuticCategory}</p>
                  )}

                  {p.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">CAS Registry No.</span>
                      <span className="font-mono font-medium">{p.casNumber || "-"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Standard / Grade</span>
                      <span className="font-medium">{p.grade || "IP / BP / USP"}</span>
                    </div>
                  </div>

                  {p.ihDmf && (
                    <div className="mt-2 text-[11px] text-slate-500">
                      <span className="text-slate-400">Documentation:</span> {p.ihDmf}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => handleOpenRfq(p.name)}
                  >
                    <span>Request Quotation</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 bg-white rounded-2xl border border-slate-200">
            <EmptyState
              title="No matching products found"
              description="Try adjusting your keyword search or category filter."
            />
          </div>
        )}
      </div>

      {/* RFQ Modal */}
      <Modal
        isOpen={rfqModalOpen}
        onClose={() => setRfqModalOpen(false)}
        title="Commercial Product Enquiry"
        description="Fast quotation and COA request directly to our sales desk in Hyderabad."
        maxWidth="lg"
      >
        <PublicEnquiryForm
          categories={categories}
          defaultProduct={selectedProduct}
          asCard={false}
        />
      </Modal>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
