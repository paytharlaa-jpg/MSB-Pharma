"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  Plus,
  FileSpreadsheet,
  RefreshCw,
  Package,
  Layers,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  category: Category;
  grade: string | null;
  therapeuticCategory: string | null;
  casNumber: string | null;
  ihDmf: string | null;
  description: string | null;
  unitOfMeasurement: string;
  minimumStock: number;
  totalStock: number;
  isLowStock: boolean;
  isApprovedForPublic: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    sku: "",
    name: "",
    categoryId: "",
    grade: "",
    therapeuticCategory: "",
    casNumber: "",
    ihDmf: "",
    description: "",
    unitOfMeasurement: "KG",
    minimumStock: 10,
    isApprovedForPublic: true,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Import Modal
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importRawText, setImportRawText] = useState("");
  const [importUpdateExisting, setImportUpdateExisting] = useState(false);
  const [importResult, setImportResult] = useState<{
    totalRows: number;
    importedCount: number;
    updatedCount: number;
    skippedCount: number;
    errors: Array<{ row: number; reason: string }>;
  } | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);

      const res = await fetch(`/api/products?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.products);
        setCategories(json.categories);
        if (!createForm.categoryId && json.categories.length > 0) {
          setCreateForm((prev) => ({ ...prev, categoryId: json.categories[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, createForm.categoryId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, categoryFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create product");

      setCreateModalOpen(false);
      setCreateForm({
        sku: "",
        name: "",
        categoryId: categories[0]?.id || "",
        grade: "",
        therapeuticCategory: "",
        casNumber: "",
        ihDmf: "",
        description: "",
        unitOfMeasurement: "KG",
        minimumStock: 10,
        isApprovedForPublic: true,
      });
      fetchProducts();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Creation failed");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportLoading(true);
    try {
      let rows = [];
      try {
        rows = JSON.parse(importRawText);
      } catch {
        // Parse CSV format if not JSON
        const lines = importRawText.trim().split("\n");
        rows = lines.map((line, idx) => {
          const parts = line.split(",").map((p) => p.trim());
          return {
            sku: parts[0] || `SKU-${Date.now()}-${idx}`,
            name: parts[1] || parts[0],
            grade: parts[2] || undefined,
            therapeuticCategory: parts[3] || undefined,
            casNumber: parts[4] || undefined,
          };
        });
      }

      const res = await fetch("/api/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows, updateExisting: importUpdateExisting }),
      });
      const json = await res.json();
      if (json.success) {
        setImportResult(json.summary);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Master</h1>
          <p className="text-xs text-slate-500 mt-1">
            Active Pharmaceutical Ingredients (APIs), Intermediates, Excipients, and Impurity Standards catalogue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportModalOpen(true)}>
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Import Spreadsheet</span>
          </Button>

          <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Product</span>
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by Name, SKU, CAS Number, or Therapeutic Class..."
            className="pl-9"
          />
        </div>

        <div className="w-full md:w-64 shrink-0">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { label: "All Product Categories", value: "ALL" },
              ...categories.map((c) => ({ label: c.name, value: c.slug })),
            ]}
          />
        </div>

        <Button variant="ghost" size="sm" onClick={fetchProducts} isLoading={loading}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {products.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">SKU / Code</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">CAS Number</th>
                  <th className="py-3 px-4">Grade / Standard</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Public Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-blue-700">{p.sku}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{p.name}</div>
                      <div className="text-[11px] text-slate-500">{p.therapeuticCategory || "-"}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        <Layers className="w-3 h-3 text-slate-400" />
                        {p.category?.name || "General"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{p.casNumber || "-"}</td>
                    <td className="py-3.5 px-4 text-slate-600">{p.grade || "-"}</td>
                    <td className="py-3.5 px-4">
                      <div className={`font-bold ${p.isLowStock ? "text-rose-600" : "text-slate-900"}`}>
                        {p.totalStock} {p.unitOfMeasurement}
                      </div>
                      {p.isLowStock && (
                        <div className="text-[10px] text-rose-500 font-medium">Below Min ({p.minimumStock})</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.isApprovedForPublic ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Public
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                          Internal Only
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8">
              <EmptyState
                title="No products found"
                description="Try clearing your search or add a new product."
              />
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add New Master Product"
        description="Record verified pharmaceutical API, intermediate, or chemical item."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="SKU / Internal Code *"
              value={createForm.sku}
              onChange={(e) => setCreateForm({ ...createForm, sku: e.target.value })}
              placeholder="e.g. API-ATV-001"
              required
            />

            <Select
              label="Product Category *"
              value={createForm.categoryId}
              onChange={(e) => setCreateForm({ ...createForm, categoryId: e.target.value })}
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
              required
            />
          </div>

          <Input
            label="Product Name *"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            placeholder="e.g. Atorvastatin Calcium"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="CAS Number"
              value={createForm.casNumber}
              onChange={(e) => setCreateForm({ ...createForm, casNumber: e.target.value })}
              placeholder="e.g. 344423-98-9"
            />

            <Input
              label="Grade / Pharmacopoeia"
              value={createForm.grade}
              onChange={(e) => setCreateForm({ ...createForm, grade: e.target.value })}
              placeholder="e.g. IP / BP / USP"
            />

            <Input
              label="Therapeutic Class"
              value={createForm.therapeuticCategory}
              onChange={(e) => setCreateForm({ ...createForm, therapeuticCategory: e.target.value })}
              placeholder="e.g. Cardiovascular"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="DMF / Regulatory Status"
              value={createForm.ihDmf}
              onChange={(e) => setCreateForm({ ...createForm, ihDmf: e.target.value })}
              placeholder="e.g. DMF Available"
            />

            <Input
              label="Unit of Measurement"
              value={createForm.unitOfMeasurement}
              onChange={(e) => setCreateForm({ ...createForm, unitOfMeasurement: e.target.value })}
              placeholder="KG"
            />

            <Input
              label="Min Stock Warning (Threshold)"
              type="number"
              value={createForm.minimumStock}
              onChange={(e) => setCreateForm({ ...createForm, minimumStock: Number(e.target.value) })}
            />
          </div>

          <Textarea
            label="Approved Public Description"
            value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            placeholder="Technical overview for public website catalogue..."
            rows={2}
          />

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={createForm.isApprovedForPublic}
                onChange={(e) => setCreateForm({ ...createForm, isApprovedForPublic: e.target.checked })}
                className="rounded text-[#00488F] focus:ring-[#00488F]"
              />
              <span>Publish in Public Website Catalogue</span>
            </label>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={createLoading}>
                Save Product
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Spreadsheet Import Modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => {
          setImportModalOpen(false);
          setImportResult(null);
        }}
        title="Spreadsheet Bulk Product Import"
        description="Paste JSON array or CSV text with columns: SKU, Name, Grade, TherapeuticCategory, CAS"
        maxWidth="lg"
      >
        <form onSubmit={handleImportSubmit} className="space-y-4">
          <Textarea
            label="Spreadsheet Data (CSV or JSON Array)"
            value={importRawText}
            onChange={(e) => setImportRawText(e.target.value)}
            placeholder={`Example CSV lines:\nAPI-001, Atorvastatin Calcium, IP/USP, Cardiovascular, 344423-98-9\nINT-002, Canagliflozin Intermediate, In-House, Antidiabetic, 1030825-20-7`}
            rows={6}
            required
          />

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={importUpdateExisting}
              onChange={(e) => setImportUpdateExisting(e.target.checked)}
              className="rounded text-[#00488F] focus:ring-[#00488F]"
            />
            <span>Update existing product records if SKU already exists</span>
          </label>

          {importResult && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="font-semibold text-slate-900">Import Process Results:</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-emerald-50 text-emerald-700 font-bold">
                  {importResult.importedCount} Imported
                </div>
                <div className="p-2 rounded bg-blue-50 text-blue-700 font-bold">
                  {importResult.updatedCount} Updated
                </div>
                <div className="p-2 rounded bg-amber-50 text-amber-700 font-bold">
                  {importResult.skippedCount} Skipped
                </div>
              </div>
              {importResult.errors.length > 0 && (
                <div className="mt-2 text-[11px] text-red-600 max-h-24 overflow-y-auto">
                  {importResult.errors.map((err, idx) => (
                    <div key={idx}>Row {err.row}: {err.reason}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setImportModalOpen(false);
                setImportResult(null);
              }}
            >
              Close
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={importLoading}>
              Process & Commit Import
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
