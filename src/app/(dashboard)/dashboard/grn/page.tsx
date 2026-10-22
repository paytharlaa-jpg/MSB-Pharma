"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  FileCheck2,
  Plus,
  Download,
  Trash2,
  RefreshCw,
  AlertCircle,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";

interface GRNItem {
  id: string;
  batchNumber: string;
  expiryDate: string | null;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  unit: string;
  storageLocation: string;
  product: { name: string; sku: string };
}

interface GRN {
  id: string;
  grnNumber: string;
  receiptDate: string;
  status: string;
  notes: string | null;
  supplier: { id: string; name: string };
  purchaseOrder: { poNumber: string } | null;
  items: GRNItem[];
}

export default function GRNPage() {
  const [grns, setGrns] = useState<GRN[]>([]);
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [purchaseOrderId, setPurchaseOrderId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<
    Array<{
      productId: string;
      batchNumber: string;
      expiryDate: string;
      receivedQuantity: number;
      acceptedQuantity: number;
      rejectedQuantity: number;
      unit: string;
      storageLocation: string;
    }>
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchGRNs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/grn");
      const json = await res.json();
      if (json.success) setGrns(json.grns);

      const suppRes = await fetch("/api/suppliers");
      const suppJson = await suppRes.json();
      if (suppJson.success) {
        setSuppliers(suppJson.suppliers);
        if (!supplierId && suppJson.suppliers.length > 0) setSupplierId(suppJson.suppliers[0].id);
      }

      const prodRes = await fetch("/api/products");
      const prodJson = await prodRes.json();
      if (prodJson.success) setProducts(prodJson.products);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    fetchGRNs();
  }, [fetchGRNs]);

  const handleAddItem = () => {
    if (products.length === 0) return;
    setItems([
      ...items,
      {
        productId: products[0].id,
        batchNumber: `BATCH-${Date.now().toString().slice(-4)}`,
        expiryDate: "",
        receivedQuantity: 50,
        acceptedQuantity: 50,
        rejectedQuantity: 0,
        unit: "KG",
        storageLocation: "Warehouse A - Bay 2",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const updated = [...items];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg("Please add at least one material line received");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/grn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId,
          purchaseOrderId: purchaseOrderId || null,
          notes,
          items,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create GRN");

      setModalOpen(false);
      setItems([]);
      fetchGRNs();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error creating GRN");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Goods Receipt Notes (GRN)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Incoming warehouse material inspection records, supplier batch references, and print-ready GRN PDFs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchGRNs} isLoading={loading}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>

          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>Record New GRN</span>
          </Button>
        </div>
      </div>

      {/* Stock Rule Notice */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
        <Warehouse className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          <strong>Stock Rule:</strong> Creating a GRN documents the physical receipt and QC inspection. It does NOT silently increment warehouse stock. Please record verified quantities in the Manual Inventory Register.
        </span>
      </div>

      {/* GRN Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {grns.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">GRN Number</th>
                  <th className="py-3 px-4">Receipt Date</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">PO Ref</th>
                  <th className="py-3 px-4">Items Received</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grns.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-blue-700">{g.grnNumber}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(g.receiptDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{g.supplier.name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {g.purchaseOrder?.poNumber || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {g.items.map((it) => `${it.product.name} (${it.acceptedQuantity} ${it.unit})`).join(", ")}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={g.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`/api/grn/${g.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8">
              <EmptyState title="No Goods Receipt Notes found" />
            </div>
          )}
        </div>
      </div>

      {/* Record GRN Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Goods Receipt Note (GRN)"
        description="Inspect and record inward raw materials, batch numbers, and store placement."
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select Supplier *"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              options={suppliers.map((s) => ({ label: s.name, value: s.id }))}
              required
            />

            <Input
              label="Purchase Order Ref (Optional)"
              value={purchaseOrderId}
              onChange={(e) => setPurchaseOrderId(e.target.value)}
              placeholder="e.g. MSB/PO/26-27/001"
            />
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 uppercase">Received Material Lines</span>
              <Button type="button" size="sm" variant="outline" onClick={handleAddItem}>
                <Plus className="w-3 h-3" /> Add Material Line
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">Click &apos;Add Material Line&apos; to record received items.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-600">Line #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                        className="text-xs rounded border border-slate-300 p-1.5 bg-white"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Batch / Lot Number *"
                        value={item.batchNumber}
                        onChange={(e) => handleItemChange(idx, "batchNumber", e.target.value)}
                        className="text-xs rounded border border-slate-300 p-1.5 bg-white font-mono"
                        required
                      />

                      <input
                        type="date"
                        placeholder="Expiry Date"
                        value={item.expiryDate}
                        onChange={(e) => handleItemChange(idx, "expiryDate", e.target.value)}
                        className="text-xs rounded border border-slate-300 p-1.5 bg-white"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500">Received Qty:</span>
                        <input
                          type="number"
                          value={item.receivedQuantity}
                          onChange={(e) => handleItemChange(idx, "receivedQuantity", Number(e.target.value))}
                          className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500">Accepted Qty:</span>
                        <input
                          type="number"
                          value={item.acceptedQuantity}
                          onChange={(e) => handleItemChange(idx, "acceptedQuantity", Number(e.target.value))}
                          className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white font-bold text-emerald-700"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500">Rejected Qty:</span>
                        <input
                          type="number"
                          value={item.rejectedQuantity}
                          onChange={(e) => handleItemChange(idx, "rejectedQuantity", Number(e.target.value))}
                          className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white text-rose-700"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Input
            label="Inspector / Store Remarks"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Factory seal intact, manufacturer COA verified and attached."
          />

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
              Generate & Record GRN
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
