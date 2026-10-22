"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  FileText,
  Plus,
  Download,
  Trash2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";

interface QuotationItem {
  id: string;
  description: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
  product: { name: string; sku: string };
}

interface Quotation {
  id: string;
  quotationNumber: string;
  quotationDate: string;
  validUntilDate: string | null;
  status: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  customer: { id: string; name: string };
  items: QuotationItem[];
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string; sku: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [validDays, setValidDays] = useState(15);
  const [taxRate, setTaxRate] = useState(18);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState(
    "1. Prices valid for 15 days from date of issue.\n2. GST applicable at prevailing statutory rate (18%).\n3. Delivery subject to stock availability and prior sale."
  );
  const [items, setItems] = useState<
    Array<{ productId: string; description: string; quantity: number; unitPrice: number; unit: string }>
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quotations");
      const json = await res.json();
      if (json.success) setQuotations(json.quotations);

      const custRes = await fetch("/api/customers");
      const custJson = await custRes.json();
      if (custJson.success) {
        setCustomers(custJson.customers);
        if (!customerId && custJson.customers.length > 0) setCustomerId(custJson.customers[0].id);
      }

      const prodRes = await fetch("/api/products");
      const prodJson = await prodRes.json();
      if (prodJson.success) setProducts(prodJson.products);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const handleAddItem = () => {
    if (products.length === 0) return;
    setItems([
      ...items,
      {
        productId: products[0].id,
        description: products[0].name,
        quantity: 10,
        unitPrice: 1000,
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
      const prod = products.find((p) => p.id === value);
      if (prod) updated[index].description = prod.name;
    }
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice), 0);
  const taxAmount = (subtotal * Number(taxRate)) / 100;
  const grandTotal = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg("Please add at least one product line item");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          validDays,
          taxRate,
          notes,
          terms,
          items,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create quotation");

      setModalOpen(false);
      setItems([]);
      fetchQuotations();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error creating quotation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quotations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Formal commercial quotes with branded PDF generation, line item breakdowns, and terms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchQuotations} isLoading={loading}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>

          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>Create Formal Quotation</span>
          </Button>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {quotations.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Quotation No</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items Count</th>
                  <th className="py-3 px-4">Grand Total (INR)</th>
                  <th className="py-3 px-4">Valid Until</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">PDF Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-blue-700">{q.quotationNumber}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(q.quotationDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{q.customer.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{q.items.length} Line(s)</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{Number(q.grandTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {q.validUntilDate ? new Date(q.validUntilDate).toLocaleDateString("en-IN") : "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`/api/quotations/${q.id}/pdf`}
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
              <EmptyState title="No quotations created yet" />
            </div>
          )}
        </div>
      </div>

      {/* Create Quotation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Prepare Formal Commercial Quotation"
        description="Select customer, add product lines, specify prices, and generate branded quotation."
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
              onChange={(e) => setCustomerId(e.target.value)}
              options={customers.map((c) => ({ label: c.name, value: c.id }))}
              required
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Validity (Days)"
                type="number"
                value={validDays}
                onChange={(e) => setValidDays(Number(e.target.value))}
              />
              <Input
                label="GST Rate (%)"
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 uppercase">Product Line Items</span>
              <Button type="button" size="sm" variant="outline" onClick={handleAddItem}>
                <Plus className="w-3 h-3" /> Add Item Line
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">Click &apos;Add Item Line&apos; to add products to quote.</p>
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
                            {p.name} ({p.sku})
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

          {/* Pricing Totals Box */}
          {items.length > 0 && (
            <div className="p-3 rounded-lg bg-slate-100 flex flex-col items-end text-xs space-y-1">
              <div>Subtotal: ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
              <div>GST ({taxRate}%): ₹{taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
              <div className="text-sm font-bold text-[#00488F]">
                Grand Total: ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>
          )}

          <Textarea
            label="Terms & Conditions"
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            rows={2}
          />

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
              Issue & Save Quotation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
