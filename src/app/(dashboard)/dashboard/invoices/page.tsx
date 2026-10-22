"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Receipt,
  Plus,
  Download,
  CreditCard,
  RefreshCw,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";

interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string | null;
  notes: string | null;
  recordedBy: { name: string };
}

interface InvoiceItem {
  id: string;
  description: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
  product: { name: string; sku: string };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  status: string;
  paymentStatus: string;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  customer: { id: string; name: string };
  items: InvoiceItem[];
  payments: Payment[];
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Record Payment Modal
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("NEFT/RTGS");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  // Create Invoice Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [dueDays, setDueDays] = useState(30);
  const [taxRate, setTaxRate] = useState(18);
  const [items, setItems] = useState<
    Array<{ productId: string; description: string; quantity: number; unitPrice: number; unit: string }>
  >([]);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invoices");
      const json = await res.json();
      if (json.success) setInvoices(json.invoices);

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
    fetchInvoices();
  }, [fetchInvoices]);

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPaymentAmount(inv.balanceAmount);
    setReferenceNumber("");
    setPaymentNotes("");
    setPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setPaymentSubmitting(true);
    try {
      const res = await fetch(`/api/invoices/${selectedInvoice.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: paymentAmount,
          paymentMethod,
          referenceNumber,
          notes: paymentNotes,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Payment recording failed");

      setPaymentModalOpen(false);
      fetchInvoices();
    } catch (err) {
      console.error(err);
    } finally {
      setPaymentSubmitting(false);
    }
  };

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

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg("Please add at least one line item");
      return;
    }
    setCreateSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          dueDays,
          taxRate,
          items,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create invoice");

      setCreateModalOpen(false);
      setItems([]);
      fetchInvoices();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error creating invoice");
    } finally {
      setCreateSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Invoices & Receivables</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tax invoices, balance calculation, payment tracking logs, and branded PDF generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchInvoices} isLoading={loading}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>

          <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>Issue Tax Invoice</span>
          </Button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {invoices.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Total (INR)</th>
                  <th className="py-3 px-4">Paid (INR)</th>
                  <th className="py-3 px-4">Balance Due</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-blue-700">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(inv.invoiceDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{inv.customer.name}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{Number(inv.grandTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600">
                      ₹{Number(inv.paidAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <span className={inv.balanceAmount > 0 ? "text-rose-600" : "text-slate-400"}>
                        ₹{Number(inv.balanceAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inv.paymentStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {inv.balanceAmount > 0 && (
                        <button
                          onClick={() => handleOpenPayment(inv)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Record Pay</span>
                        </button>
                      )}

                      <a
                        href={`/api/invoices/${inv.id}/pdf`}
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
              <EmptyState title="No invoices recorded yet" />
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          title={`Record Payment for ${selectedInvoice.invoiceNumber}`}
          description={`Customer: ${selectedInvoice.customer.name} | Total: ₹${selectedInvoice.grandTotal.toLocaleString("en-IN")}`}
          maxWidth="md"
        >
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="p-3 rounded-lg bg-amber-50 text-amber-900 text-xs">
              Current Outstanding Balance: <strong>₹{selectedInvoice.balanceAmount.toLocaleString("en-IN")}</strong>
            </div>

            <Input
              label="Payment Amount (INR) *"
              type="number"
              step="any"
              max={selectedInvoice.balanceAmount}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              required
            />

            <Select
              label="Payment Mode *"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
                { label: "NEFT / RTGS Bank Transfer", value: "NEFT/RTGS" },
                { label: "Cheque Clearance", value: "CHEQUE" },
                { label: "Direct Bank Transfer", value: "BANK_TRANSFER" },
                { label: "UPI Payment", value: "UPI" },
              ]}
              required
            />

            <Input
              label="Bank Reference / UTR Number"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. UTR-HDFC-88991122"
            />

            <Input
              label="Remarks / Payment Notes"
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="e.g. Part payment received via RTGS into HDFC current account"
            />

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setPaymentModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={paymentSubmitting}>
                Record Payment Event
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Invoice Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Issue Tax Invoice"
        description="Create verified tax invoice for pharmaceutical shipments."
        maxWidth="xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
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
                label="Payment Terms (Days)"
                type="number"
                value={dueDays}
                onChange={(e) => setDueDays(Number(e.target.value))}
              />
              <Input
                label="GST Rate (%)"
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 uppercase">Product Line Items</span>
              <Button type="button" size="sm" variant="outline" onClick={handleAddItem}>
                <Plus className="w-3 h-3" /> Add Item Line
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">Click &apos;Add Item Line&apos; to add products to invoice.</p>
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
            <div className="p-3 rounded-lg bg-slate-100 flex flex-col items-end text-xs space-y-1">
              <div>Subtotal: ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
              <div>GST ({taxRate}%): ₹{taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
              <div className="text-sm font-bold text-[#00488F]">
                Grand Total: ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={createSubmitting}>
              Issue Tax Invoice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
