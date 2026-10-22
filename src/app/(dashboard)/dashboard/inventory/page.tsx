"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Boxes,
  Clock,
  AlertTriangle,
  History,
  Plus,
  RefreshCw,
  Download,
  AlertCircle,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";

interface Batch {
  id: string;
  productId: string;
  batchNumber: string;
  mfgDate: string | null;
  expiryDate: string | null;
  currentQuantity: number;
  unit: string;
  storageLocation: string;
  supplier: { id: string; name: string } | null;
  product: { id: string; name: string; sku: string; unitOfMeasurement: string; minimumStock: number };
  isExpired: boolean;
  isExpiringSoon: boolean;
  isLowStock: boolean;
}

interface Adjustment {
  id: string;
  type: string;
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  reason: string;
  documentRef: string | null;
  createdAt: string;
  product: { name: string; sku: string };
  batch: { batchNumber: string };
  performedBy: { name: string; email: string };
}

export default function InventoryPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "EXPIRING" | "LOW_STOCK" | "HISTORY">("ALL");

  // Adjustment Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [productsList, setProductsList] = useState<Array<{ id: string; name: string; sku: string }>>([]);
  const [form, setForm] = useState({
    productId: "",
    batchNumber: "",
    mfgDate: "",
    expiryDate: "",
    storageLocation: "Warehouse A - Kukatpally",
    type: "INCREASE",
    quantityChange: 10,
    reason: "",
    documentRef: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory");
      const json = await res.json();
      if (json.success) {
        setBatches(json.batches);
        setAdjustments(json.recentAdjustments);
      }

      // Fetch products for dropdown
      const prodRes = await fetch("/api/products");
      const prodJson = await prodRes.json();
      if (prodJson.success) {
        setProductsList(prodJson.products);
        if (!form.productId && prodJson.products.length > 0) {
          setForm((prev) => ({ ...prev, productId: prodJson.products[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [form.productId]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to adjust stock");

      setModalOpen(false);
      setForm({
        productId: productsList[0]?.id || "",
        batchNumber: "",
        mfgDate: "",
        expiryDate: "",
        storageLocation: "Warehouse A - Kukatpally",
        type: "INCREASE",
        quantityChange: 10,
        reason: "",
        documentRef: "",
      });
      fetchInventory();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error saving stock adjustment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = (format: "csv" | "xlsx") => {
    window.open(`/api/reports?type=inventory&format=${format}`, "_blank");
  };

  // Filtered batches
  const displayedBatches = batches.filter((b) => {
    if (activeTab === "EXPIRING") return b.isExpiringSoon || b.isExpired;
    if (activeTab === "LOW_STOCK") return b.isLowStock;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manual Inventory & Batches</h1>
          <p className="text-xs text-slate-500 mt-1">
            Physical stock tracking, batch numbers, storage locations, expiry monitoring, and audit adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
            <Download className="w-3.5 h-3.5" />
            <span>Export Stock CSV</span>
          </Button>

          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>Record Stock Adjustment</span>
          </Button>
        </div>
      </div>

      {/* Warning Alert Banner (Project Stock Policy) */}
      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Warehouse className="w-4 h-4 text-[#00488F] shrink-0" />
          <span>
            <strong>Manual Inventory Enforcement:</strong> Invoices, GRNs, POs, and Delivery Challans do not auto-modify inventory balances. All stock updates must be recorded through this authorized register.
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchInventory} isLoading={loading}>
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${
            activeTab === "ALL"
              ? "border-[#00488F] text-[#00488F]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>All Batches ({batches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("EXPIRING")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${
            activeTab === "EXPIRING"
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>
            Expiry Alerts ({batches.filter((b) => b.isExpiringSoon || b.isExpired).length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab("LOW_STOCK")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${
            activeTab === "LOW_STOCK"
              ? "border-rose-500 text-rose-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Low Stock ({batches.filter((b) => b.isLowStock).length})</span>
        </button>

        <button
          onClick={() => setActiveTab("HISTORY")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${
            activeTab === "HISTORY"
              ? "border-[#00488F] text-[#00488F]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="w-4 h-4" />
          <span>Adjustment Audit History ({adjustments.length})</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === "HISTORY" ? (
        /* Adjustment History Table */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            {adjustments.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Batch No</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Change</th>
                    <th className="py-3 px-4">Before &rarr; After</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                    <th className="py-3 px-4">Audited User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adjustments.map((adj) => (
                    <tr key={adj.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(adj.createdAt).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{adj.product.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{adj.batch.batchNumber}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {adj.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold">
                        <span className={adj.quantityChange >= 0 ? "text-emerald-600" : "text-rose-600"}>
                          {adj.quantityChange > 0 ? `+${adj.quantityChange}` : adj.quantityChange}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {adj.quantityBefore} &rarr; {adj.quantityAfter}
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate" title={adj.reason}>
                        {adj.reason}
                        {adj.documentRef && <span className="block text-[10px] text-slate-400">Ref: {adj.documentRef}</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{adj.performedBy?.name || "System"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8">
                <EmptyState title="No stock adjustments recorded yet" />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Batches Table */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            {displayedBatches.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Batch Number</th>
                    <th className="py-3 px-4">Stock Qty</th>
                    <th className="py-3 px-4">Storage Location</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Status Alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedBatches.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{b.product.name}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{b.product.sku}</td>
                      <td className="py-3.5 px-4 font-mono font-medium text-blue-700">{b.batchNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {b.currentQuantity} {b.unit}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{b.storageLocation}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {b.expiryDate ? (
                          <span className={b.isExpired ? "text-rose-600 font-bold" : b.isExpiringSoon ? "text-amber-600 font-semibold" : ""}>
                            {new Date(b.expiryDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {b.isExpired ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                            EXPIRED
                          </span>
                        ) : b.isExpiringSoon ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            EXPIRING SOON
                          </span>
                        ) : b.isLowStock ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700">
                            LOW STOCK
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">
                            NORMAL
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
                  title="No batches match this filter"
                  description="All batches look healthy or no matching records found."
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Stock Adjustment Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Manual Stock Adjustment"
        description="Physical inventory entry with mandatory reason and immutable audit recording."
        maxWidth="lg"
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select Product *"
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              options={productsList.map((p) => ({ label: `${p.name} (${p.sku})`, value: p.id }))}
              required
            />

            <Input
              label="Batch Number *"
              value={form.batchNumber}
              onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
              placeholder="e.g. ATV-2026-004"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Adjustment Operation *"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              options={[
                { label: "Increase Stock (+)", value: "INCREASE" },
                { label: "Decrease Stock (-)", value: "DECREASE" },
                { label: "Opening Balance Take", value: "OPENING_BALANCE" },
                { label: "Reconciliation / Exact Reset", value: "RECONCILIATION" },
              ]}
              required
            />

            <Input
              label="Quantity (KG) *"
              type="number"
              step="any"
              value={form.quantityChange}
              onChange={(e) => setForm({ ...form, quantityChange: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Manufacturing Date"
              type="date"
              value={form.mfgDate}
              onChange={(e) => setForm({ ...form, mfgDate: e.target.value })}
            />

            <Input
              label="Expiry Date"
              type="date"
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            />

            <Input
              label="Storage Location"
              value={form.storageLocation}
              onChange={(e) => setForm({ ...form, storageLocation: e.target.value })}
              placeholder="Warehouse Bay / Rack"
            />
          </div>

          <Input
            label="Related Document Reference (Optional)"
            value={form.documentRef}
            onChange={(e) => setForm({ ...form, documentRef: e.target.value })}
            placeholder="e.g. GRN Number or Physical Inspection Slip No."
          />

          <Input
            label="Mandatory Reason for Stock Adjustment *"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Explain physical receipt, QC clearance, dispatch, or audit reconciliation..."
            required
          />

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
              Commit Stock Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
