"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  FileSpreadsheet,
  Plus,
  Download,
  Trash2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";

interface POItem {
  id: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
  product: { name: string; sku: string };
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  orderDate: string;
  expectedDeliveryDate: string | null;
  status: string;
  totalAmount: number;
  paymentTerms: string | null;
  supplier: { id: string; name: string };
  items: POItem[];
}

export default function PurchasingPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30 days upon receipt of material and COA");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<
    Array<{ productId: string; quantity: number; unitPrice: number; unit: string }>
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/purchasing");
      const json = await res.json();
      if (json.success) setOrders(json.orders);

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
    fetchOrders();
  }, [fetchOrders]);

  const handleAddItem = () => {
    if (products.length === 0) return;
    setItems([
      ...items,
      {
        productId: products[0].id,
        quantity: 25,
        unitPrice: 2000,
        unit: "KG",
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

  const totalAmount = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg("Please add at least one product to the purchase order");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/purchasing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId,
          expectedDeliveryDate: expectedDate || null,
          paymentTerms,
          notes,
          items,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create purchase order");

      setModalOpen(false);
      setItems([]);
      fetchOrders();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error creating purchase order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Purchase Orders (PO)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Supplier purchasing records, expected delivery dates, and branded purchase order PDFs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchOrders} isLoading={loading}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>

          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>Create Purchase Order</span>
          </Button>
        </div>
      </div>

      {/* PO Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {orders.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Total Amount (INR)</th>
                  <th className="py-3 px-4">Expected Delivery</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-blue-700">{po.poNumber}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(po.orderDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{po.supplier.name}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{Number(po.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString("en-IN") : "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={po.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`/api/purchasing/${po.id}/pdf`}
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
              <EmptyState title="No purchase orders created yet" />
            </div>
          )}
        </div>
      </div>

      {/* Create PO Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Purchase Order"
        description="Issue formal PO to approved bulk drug or chemical supplier."
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
              label="Expected Delivery Date"
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 uppercase">Product Line Items</span>
              <Button type="button" size="sm" variant="outline" onClick={handleAddItem}>
                <Plus className="w-3 h-3" /> Add Item Line
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">Click &apos;Add Item Line&apos; to add materials to PO.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex-1">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                        className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))}
                        className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                      />
                    </div>

                    <div className="w-28">
                      <input
                        type="number"
                        placeholder="Price (₹)"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, "unitPrice", Number(e.target.value))}
                        className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white"
                      />
                    </div>

                    <div className="w-28 text-right font-bold text-xs text-slate-800">
                      ₹{(Number(item.quantity) * Number(item.unitPrice)).toLocaleString("en-IN")}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="p-3 rounded-lg bg-slate-100 flex justify-end text-xs font-bold text-[#00488F]">
              Total PO Value: ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          )}

          <Input
            label="Payment Terms"
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
              Issue Purchase Order
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
