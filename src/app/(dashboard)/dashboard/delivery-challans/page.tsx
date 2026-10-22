"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Truck,
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

interface ChallanItem {
  id: string;
  quantity: number;
  unit: string;
  product: { name: string; sku: string };
  batch: { batchNumber: string } | null;
}

interface DeliveryChallan {
  id: string;
  challanNumber: string;
  deliveryDate: string;
  deliveryAddress: string | null;
  vehicleNumber: string | null;
  dispatchDetails: string | null;
  status: string;
  customer: { id: string; name: string };
  items: ChallanItem[];
}

export default function DeliveryChallansPage() {
  const [challans, setChallans] = useState<DeliveryChallan[]>([]);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; address: string | null }>>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [batches, setBatches] = useState<Array<{ id: string; productId: string; batchNumber: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [dispatchDetails, setDispatchDetails] = useState("Dispatched via SafeX Logistics with tamper-evident seals");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<
    Array<{ productId: string; batchId: string; quantity: number; unit: string }>
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchChallans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/delivery-challans");
      const json = await res.json();
      if (json.success) setChallans(json.challans);

      const custRes = await fetch("/api/customers");
      const custJson = await custRes.json();
      if (custJson.success) {
        setCustomers(custJson.customers);
        if (!customerId && custJson.customers.length > 0) {
          setCustomerId(custJson.customers[0].id);
          setDeliveryAddress(custJson.customers[0].address || "");
        }
      }

      const prodRes = await fetch("/api/products");
      const prodJson = await prodRes.json();
      if (prodJson.success) setProducts(prodJson.products);

      const invRes = await fetch("/api/inventory");
      const invJson = await invRes.json();
      if (invJson.success) setBatches(invJson.batches);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchChallans();
  }, [fetchChallans]);

  const handleCustomerChange = (id: string) => {
    setCustomerId(id);
    const selected = customers.find((c) => c.id === id);
    if (selected && selected.address) {
      setDeliveryAddress(selected.address);
    }
  };

  const handleAddItem = () => {
    if (products.length === 0) return;
    const prodId = products[0].id;
    const matchingBatch = batches.find((b) => b.productId === prodId);
    setItems([
      ...items,
      {
        productId: prodId,
        batchId: matchingBatch ? matchingBatch.id : "",
        quantity: 20,
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
    if (field === "productId") {
      const matchingBatch = batches.find((b) => b.productId === value);
      updated[index].batchId = matchingBatch ? matchingBatch.id : "";
    }
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg("Please add at least one dispatch line item");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/delivery-challans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          deliveryAddress,
          vehicleNumber,
          dispatchDetails,
          notes,
          items,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create delivery challan");

      setModalOpen(false);
      setItems([]);
      fetchChallans();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error creating challan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Delivery Challans</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch documents, logistics tracking, transporter vehicle records, and print-ready challan PDFs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchChallans} isLoading={loading}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>

          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>Issue Delivery Challan</span>
          </Button>
        </div>
      </div>

      {/* Stock Notice */}
      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
        <Warehouse className="w-4 h-4 text-blue-700 shrink-0" />
        <span>
          <strong>Inventory Protocol:</strong> Generating a delivery challan records transport documentation. It does NOT automatically deduct inventory; physical stock decreases must be registered under Manual Inventory.
        </span>
      </div>

      {/* Challan Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {challans.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Challan No</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Vehicle No</th>
                  <th className="py-3 px-4">Dispatched Items</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {challans.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-blue-700">{c.challanNumber}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(c.deliveryDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{c.customer.name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{c.vehicleNumber || "-"}</td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {c.items.map((it) => `${it.product.name} (${it.quantity} ${it.unit})`).join(", ")}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`/api/delivery-challans/${c.id}/pdf`}
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
              <EmptyState title="No delivery challans recorded yet" />
            </div>
          )}
        </div>
      </div>

      {/* Create Challan Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Issue Delivery Challan"
        description="Prepare transport dispatch documentation for material release."
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
              label="Select Customer *"
              value={customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              options={customers.map((c) => ({ label: c.name, value: c.id }))}
              required
            />

            <Input
              label="Vehicle / Transporter Reg No."
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              placeholder="e.g. TS 09 UB 4545"
            />
          </div>

          <Input
            label="Destination / Delivery Address *"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Factory Plant or Warehouse Delivery Address"
            required
          />

          <Input
            label="Logistics & Dispatch Mode"
            value={dispatchDetails}
            onChange={(e) => setDispatchDetails(e.target.value)}
            placeholder="e.g. Air Cargo / Cold Chain / Surface Transport"
          />

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 uppercase">Dispatched Line Items</span>
              <Button type="button" size="sm" variant="outline" onClick={handleAddItem}>
                <Plus className="w-3 h-3" /> Add Item Line
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">Click &apos;Add Item Line&apos; to add materials to challan.</p>
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

                    <div className="w-36">
                      <select
                        value={item.batchId}
                        onChange={(e) => handleItemChange(idx, "batchId", e.target.value)}
                        className="w-full text-xs rounded border border-slate-300 p-1.5 bg-white font-mono"
                      >
                        <option value="">No Batch Assigned</option>
                        {batches
                          .filter((b) => b.productId === item.productId)
                          .map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.batchNumber}
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

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
              Issue Delivery Challan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
