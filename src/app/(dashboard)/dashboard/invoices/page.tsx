"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Receipt,
  Plus,
  Download,
  Eye,
  Pencil,
  Trash2,
  CreditCard,
  RefreshCw,
  Search,
  X,
  AlertCircle,
  FileSpreadsheet,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  GST_STATES,
  INVOICE_CATEGORIES,
  INVOICE_TYPES,
  UQC_OPTIONS,
  GST_RATES,
  computeInvoiceTotals,
  supplyTypeFor,
} from "@/lib/company";
import { InvoiceProfile, EMPTY_PROFILE, DEFAULT_INVOICE_TERMS } from "@/lib/invoice-profile";

interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string | null;
  notes: string | null;
}

interface InvoiceItem {
  description: string | null;
  hsnCode: string | null;
  batchNumber: string | null;
  mfgDate: string | null;
  expDate: string | null;
  packDetails: string | null;
  unit: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  gstRate: number;
  cess: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  customerName: string;
  customerGstin: string | null;
  customerAddress: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  placeOfSupply: string;
  category: string;
  invoiceType: string;
  reverseCharge: string;
  supplyType: string;
  poReference: string | null;
  vehicleNumber: string | null;
  ewayBillNumber: string | null;
  paymentTerms: string | null;
  shipToSameAsBilling: boolean;
  shipToName: string | null;
  shipToAddress: string | null;
  shipToGstin: string | null;
  shipToState: string | null;
  shipToContact: string | null;
  discountAmount: number;
  freightAmount: number;
  notes: string | null;
  terms: string | null;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: string;
  items: InvoiceItem[];
  payments: Payment[];
}

type Customer = Pick<
  Invoice,
  "customerName" | "customerGstin" | "customerAddress" | "customerPhone" | "customerEmail" | "placeOfSupply" | "category"
>;

interface LineForm {
  description: string;
  hsnCode: string;
  batchNumber: string;
  mfgDate: string;
  expDate: string;
  packDetails: string;
  unit: string;
  quantity: string;
  unitPrice: string;
  gstRate: string;
}

interface InvoiceForm {
  invoiceDate: string;
  dueDate: string;
  customerName: string;
  customerGstin: string;
  customerAddress: string;
  customerPhone: string;
  customerEmail: string;
  placeOfSupply: string;
  category: string;
  invoiceType: string;
  reverseCharge: string;
  poReference: string;
  vehicleNumber: string;
  ewayBillNumber: string;
  paymentTerms: string;
  shipToSameAsBilling: boolean;
  shipToName: string;
  shipToAddress: string;
  shipToGstin: string;
  shipToState: string;
  shipToContact: string;
  discountAmount: string;
  freightAmount: string;
  notes: string;
  terms: string;
  items: LineForm[];
}

const PAYMENT_METHODS = ["NEFT/RTGS", "UPI", "CHEQUE", "BANK_TRANSFER", "CASH"];
const inr = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const today = () => new Date().toISOString().slice(0, 10);
const plusDays = (iso: string, days: number) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};
const blankLine = (): LineForm => ({
  description: "",
  hsnCode: "",
  batchNumber: "",
  mfgDate: "",
  expDate: "",
  packDetails: "",
  unit: "KGS",
  quantity: "",
  unitPrice: "",
  gstRate: "18",
});
const blankForm = (defaultTerms = DEFAULT_INVOICE_TERMS): InvoiceForm => ({
  invoiceDate: today(),
  dueDate: plusDays(today(), 30),
  customerName: "",
  customerGstin: "",
  customerAddress: "",
  customerPhone: "",
  customerEmail: "",
  placeOfSupply: "36-Telangana",
  category: "B2B",
  invoiceType: "Regular",
  reverseCharge: "N",
  poReference: "",
  vehicleNumber: "",
  ewayBillNumber: "",
  paymentTerms: "30 days from invoice date",
  shipToSameAsBilling: true,
  shipToName: "",
  shipToAddress: "",
  shipToGstin: "",
  shipToState: "",
  shipToContact: "",
  discountAmount: "0",
  freightAmount: "0",
  notes: "",
  terms: defaultTerms,
  items: [blankLine()],
});

function toForm(inv: Invoice): InvoiceForm {
  return {
    invoiceDate: inv.invoiceDate.slice(0, 10),
    dueDate: inv.dueDate ? inv.dueDate.slice(0, 10) : "",
    customerName: inv.customerName,
    customerGstin: inv.customerGstin || "",
    customerAddress: inv.customerAddress || "",
    customerPhone: inv.customerPhone || "",
    customerEmail: inv.customerEmail || "",
    placeOfSupply: inv.placeOfSupply,
    category: inv.category,
    invoiceType: inv.invoiceType,
    reverseCharge: inv.reverseCharge,
    poReference: inv.poReference || "",
    vehicleNumber: inv.vehicleNumber || "",
    ewayBillNumber: inv.ewayBillNumber || "",
    paymentTerms: inv.paymentTerms || "",
    shipToSameAsBilling: inv.shipToSameAsBilling,
    shipToName: inv.shipToName || "",
    shipToAddress: inv.shipToAddress || "",
    shipToGstin: inv.shipToGstin || "",
    shipToState: inv.shipToState || "",
    shipToContact: inv.shipToContact || "",
    discountAmount: String(inv.discountAmount || 0),
    freightAmount: String(inv.freightAmount || 0),
    notes: inv.notes || "",
    terms: inv.terms || DEFAULT_INVOICE_TERMS,
    items: inv.items.map((i) => ({
      description: i.description || "",
      hsnCode: i.hsnCode || "",
      batchNumber: i.batchNumber || "",
      mfgDate: i.mfgDate ? i.mfgDate.slice(0, 10) : "",
      expDate: i.expDate ? i.expDate.slice(0, 10) : "",
      packDetails: i.packDetails || "",
      unit: i.unit,
      quantity: String(i.quantity),
      unitPrice: String(i.unitPrice),
      gstRate: String(i.gstRate),
    })),
  };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="bg-[#3A9A1E] text-white text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-md">{children}</div>;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  // Deep links from the dashboard's global search: /dashboard/...?search=<doc no>
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("search");
    if (q) setSearch(q);
  }, []);
  const [statusFilter, setStatusFilter] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InvoiceForm>(blankForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [profile, setProfile] = useState<InvoiceProfile>(EMPTY_PROFILE);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState<InvoiceProfile>(EMPTY_PROFILE);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/invoices/settings")
      .then((r) => r.json())
      .then((j) => j.success && setProfile(j.profile))
      .catch(() => {});
  }, []);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsError(null);
    try {
      const res = await fetch("/api/invoices/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsDraft),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save settings");
      setProfile(json.profile);
      setSettingsOpen(false);
    } catch (err) {
      setSettingsError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSettingsSaving(false);
    }
  };

  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(today());
  const [payMethod, setPayMethod] = useState("NEFT/RTGS");
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [paySaving, setPaySaving] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter) params.set("paymentStatus", statusFilter);
      const res = await fetch(`/api/invoices?${params}`);
      const json = await res.json();
      if (json.success) {
        setInvoices(json.invoices);
        setCustomers(json.customers);
        setPayInvoice((cur) => (cur ? json.invoices.find((i: Invoice) => i.id === cur.id) || null : null));
      }
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchInvoices, 250);
    return () => clearTimeout(t);
  }, [fetchInvoices]);

  useEffect(() => {
    fetch("/api/products?public=true")
      .then((r) => r.json())
      .then((j) => setProducts((j.products || []).map((p: { name: string }) => p.name)))
      .catch(() => {});
  }, []);

  const totals = useMemo(
    () => ({
      billed: invoices.reduce((s, i) => s + i.grandTotal, 0),
      received: invoices.reduce((s, i) => s + i.paidAmount, 0),
      outstanding: invoices.reduce((s, i) => s + i.balanceAmount, 0),
    }),
    [invoices]
  );

  // Live totals: exactly the same calculation the server uses when saving
  const computed = useMemo(
    () =>
      computeInvoiceTotals(
        form.items.map((l) => ({ quantity: Number(l.quantity) || 0, unitPrice: Number(l.unitPrice) || 0, gstRate: Number(l.gstRate) || 0 })),
        Number(form.discountAmount) || 0,
        Number(form.freightAmount) || 0,
        form.placeOfSupply
      ),
    [form.items, form.discountAmount, form.freightAmount, form.placeOfSupply]
  );
  const supplyType = supplyTypeFor(form.placeOfSupply);

  const set = <K extends keyof InvoiceForm>(k: K, v: InvoiceForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setLine = (idx: number, k: keyof LineForm, v: string) =>
    setForm((f) => ({ ...f, items: f.items.map((l, i) => (i === idx ? { ...l, [k]: v } : l)) }));

  const onCustomerName = (name: string) => {
    const match = customers.find((c) => c.customerName.toLowerCase() === name.trim().toLowerCase());
    setForm((f) =>
      match && !editingId
        ? {
            ...f,
            customerName: name,
            customerGstin: match.customerGstin || "",
            customerAddress: match.customerAddress || "",
            customerPhone: match.customerPhone || "",
            customerEmail: match.customerEmail || "",
            placeOfSupply: match.placeOfSupply,
            category: match.category,
          }
        : { ...f, customerName: name }
    );
  };

  const onGstin = (value: string) => {
    const g = value.toUpperCase();
    setForm((f) => {
      const st = GST_STATES.find((s) => s.startsWith(g.slice(0, 2) + "-"));
      return { ...f, customerGstin: g, placeOfSupply: g.length >= 2 && st ? st : f.placeOfSupply };
    });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(blankForm(profile.defaultTerms));
    setFormError(null);
    setFormOpen(true);
  };
  const openEdit = (inv: Invoice) => {
    setEditingId(inv.id);
    setForm(toForm(inv));
    setFormError(null);
    setFormOpen(true);
  };

  const submitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch(editingId ? `/api/invoices/${editingId}` : "/api/invoices", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save invoice");
      setFormOpen(false);
      await fetchInvoices();
      if (!editingId && json.invoice?.id) {
        const a = document.createElement("a");
        a.href = `/api/invoices/${json.invoice.id}/pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  const deleteInvoice = async (inv: Invoice) => {
    if (!window.confirm(`Delete invoice ${inv.invoiceNumber} and its ${inv.payments.length} payment record(s)? This cannot be undone.`)) return;
    await fetch(`/api/invoices/${inv.id}`, { method: "DELETE" });
    fetchInvoices();
  };

  const openPayments = (inv: Invoice) => {
    setPayInvoice(inv);
    setPayAmount(inv.balanceAmount > 0 ? String(inv.balanceAmount) : "");
    setPayDate(today());
    setPayMethod("NEFT/RTGS");
    setPayRef("");
    setPayNotes("");
    setPayError(null);
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payInvoice) return;
    setPaySaving(true);
    setPayError(null);
    try {
      const res = await fetch(`/api/invoices/${payInvoice.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: payAmount, paymentDate: payDate, paymentMethod: payMethod, referenceNumber: payRef, notes: payNotes }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to record payment");
      setPayAmount("");
      setPayRef("");
      setPayNotes("");
      await fetchInvoices();
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setPaySaving(false);
    }
  };

  const deletePayment = async (p: Payment) => {
    if (!payInvoice || !window.confirm(`Remove payment of ${inr(p.amount)}?`)) return;
    await fetch(`/api/invoices/${payInvoice.id}/payment?paymentId=${p.id}`, { method: "DELETE" });
    fetchInvoices();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Invoices &amp; Payments</h1>
          <p className="text-xs text-slate-500 mt-1">GST tax invoices in the Sales Register format, payment tracking, and branded PDFs.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchInvoices} isLoading={loading}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
          <a
            href="/api/reports/sales-register"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Sales Register (.xlsx)
          </a>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSettingsDraft(profile);
              setSettingsError(null);
              setSettingsOpen(true);
            }}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Invoice Settings</span>
          </Button>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="w-3.5 h-3.5" />
            <span>New Tax Invoice</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          ["Total Billed", totals.billed, "text-slate-900"],
          ["Payments Received", totals.received, "text-emerald-600"],
          ["Outstanding", totals.outstanding, "text-rose-600"],
        ].map(([label, value, cls]) => (
          <div key={label as string} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
            <p className={`text-xl font-bold mt-1 ${cls}`}>{inr(value as number)}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice no., customer, GSTIN, product, HSN, payment reference..."
            className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4DB3]/20 focus:border-[#1B4DB3]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" aria-label="Clear search">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-48 py-2 px-3 text-sm rounded-lg border border-slate-200 bg-white">
          <option value="">All payment statuses</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PARTIALLY_PAID">Partially paid</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {invoices.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-2.5">Invoice No.</th>
                  <th className="py-3 px-2.5">Date</th>
                  <th className="py-3 px-2.5">Customer</th>
                  <th className="py-3 px-2.5 text-right">Taxable</th>
                  <th className="py-3 px-2.5 text-right">GST</th>
                  <th className="py-3 px-2.5 text-right">Total</th>
                  <th className="py-3 px-2.5 text-right">Balance</th>
                  <th className="py-3 px-2.5">Status</th>
                  <th className="py-3 px-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-2.5 font-mono font-medium text-blue-700 whitespace-nowrap">{inv.invoiceNumber}</td>
                    <td className="py-3 px-2.5 text-slate-500 whitespace-nowrap">{new Date(inv.invoiceDate).toLocaleDateString("en-IN")}</td>
                    <td className="py-3 px-2.5">
                      <div className="font-semibold text-slate-900">{inv.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {inv.customerGstin || inv.category} · {inv.placeOfSupply}
                      </div>
                    </td>
                    <td className="py-3 px-2.5 text-right whitespace-nowrap">{inr(inv.subtotal)}</td>
                    <td className="py-3 px-2.5 text-right whitespace-nowrap text-slate-500">{inr(inv.taxAmount)}</td>
                    <td className="py-3 px-2.5 text-right whitespace-nowrap font-bold text-slate-900">{inr(inv.grandTotal)}</td>
                    <td className={`py-3 px-2.5 text-right whitespace-nowrap font-bold ${inv.balanceAmount > 0 ? "text-rose-600" : "text-slate-400"}`}>{inr(inv.balanceAmount)}</td>
                    <td className="py-3 px-2.5">
                      <StatusBadge status={inv.paymentStatus} />
                    </td>
                    <td className="py-3 px-2.5">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openPayments(inv)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 whitespace-nowrap"
                        >
                          <CreditCard className="w-3 h-3" />
                          Pay ({inv.payments.length})
                        </button>
                        <a href={`/api/invoices/${inv.id}/pdf?view=1`} target="_blank" rel="noopener noreferrer" title="View PDF" className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100">
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                        <a href={`/api/invoices/${inv.id}/pdf`} title="Download PDF" className="p-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100">
                          <Download className="w-3 h-3" />
                        </a>
                        <button onClick={() => openEdit(inv)} title="Edit" className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteInvoice(inv)} title="Delete" className="p-1.5 rounded-md text-rose-500 hover:bg-rose-50">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8">
              <EmptyState
                icon={<Receipt className="w-6 h-6" />}
                title={search || statusFilter ? "No invoices match your search" : "No invoices yet"}
                description={search || statusFilter ? "Try a different search term or clear the filter." : "Click “New Tax Invoice” to raise one."}
              />
            </div>
          )}
        </div>
      </div>

      {/* Create / edit invoice */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? "Edit Tax Invoice" : "New GST Tax Invoice"}
        description="Fields follow the Sales Register format. Taxable value and GST are calculated automatically."
        maxWidth="2xl"
      >
        <form onSubmit={submitInvoice} className="space-y-5">
          {formError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Invoice Date *" type="date" value={form.invoiceDate} onChange={(e) => set("invoiceDate", e.target.value)} required />
            <Input label="Due Date" type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
            <Input label="Invoice No." value={editingId ? "(unchanged)" : "Auto-generated on save"} disabled />
          </div>

          <SectionTitle>1. Billed To &amp; Supply Details</SectionTitle>
          <datalist id="inv-customers">
            {customers.map((c) => (
              <option key={c.customerName} value={c.customerName} />
            ))}
          </datalist>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Customer Name *" list="inv-customers" value={form.customerName} onChange={(e) => onCustomerName(e.target.value)} required />
            <Input
              label={`Customer GSTIN${form.category === "B2B" ? " *" : ""}`}
              value={form.customerGstin}
              onChange={(e) => onGstin(e.target.value)}
              maxLength={15}
              placeholder="15 characters, e.g. 36AAAAA0000A1Z5"
              helperText={form.customerGstin && form.customerGstin.length !== 15 ? `${form.customerGstin.length}/15 characters` : undefined}
            />
            <Input label="Billing Address" value={form.customerAddress} onChange={(e) => set("customerAddress", e.target.value)} />
            <Select
              label="Place of Supply *"
              value={form.placeOfSupply}
              onChange={(e) => set("placeOfSupply", e.target.value)}
              options={GST_STATES.map((s) => ({ label: s, value: s }))}
              helperText={`${supplyType} supply: ${supplyType === "Intra-State" ? "CGST + SGST" : "IGST"}`}
            />
            <Input label="Phone" value={form.customerPhone} onChange={(e) => set("customerPhone", e.target.value)} />
            <Input label="Email" type="email" value={form.customerEmail} onChange={(e) => set("customerEmail", e.target.value)} />
            <div className="grid grid-cols-3 gap-2 sm:col-span-2">
              <Select label="Category *" value={form.category} onChange={(e) => set("category", e.target.value)} options={INVOICE_CATEGORIES.map((c) => ({ label: c, value: c }))} />
              <Select label="Invoice Type *" value={form.invoiceType} onChange={(e) => set("invoiceType", e.target.value)} options={INVOICE_TYPES.map((c) => ({ label: c, value: c }))} />
              <Select
                label="Reverse Charge *"
                value={form.reverseCharge}
                onChange={(e) => set("reverseCharge", e.target.value)}
                options={[
                  { label: "N", value: "N" },
                  { label: "Y", value: "Y" },
                ]}
              />
            </div>
            <Input label="Buyer's PO No. / Date" placeholder="e.g. PO-7781 / 28-10-2026" value={form.poReference} onChange={(e) => set("poReference", e.target.value)} />
            <Input label="Payment Terms" placeholder="e.g. 30 days from invoice date" value={form.paymentTerms} onChange={(e) => set("paymentTerms", e.target.value)} />
            <Input label="Transport / Vehicle No." value={form.vehicleNumber} onChange={(e) => set("vehicleNumber", e.target.value)} />
            <Input label="E-Way Bill No. / LR No." value={form.ewayBillNumber} onChange={(e) => set("ewayBillNumber", e.target.value)} />
          </div>

          <SectionTitle>Shipped To (Consignee)</SectionTitle>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={form.shipToSameAsBilling}
              onChange={(e) => set("shipToSameAsBilling", e.target.checked)}
              className="w-4 h-4 accent-[#1B4DB3]"
            />
            Same as Billed To
          </label>
          {!form.shipToSameAsBilling && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Consignee Name *" value={form.shipToName} onChange={(e) => set("shipToName", e.target.value)} required />
              <Input label="Consignee GSTIN" maxLength={15} value={form.shipToGstin} onChange={(e) => set("shipToGstin", e.target.value.toUpperCase())} />
              <div className="sm:col-span-2">
                <Input label="Delivery Address" value={form.shipToAddress} onChange={(e) => set("shipToAddress", e.target.value)} />
              </div>
              <Input label="State" placeholder="e.g. Telangana / 36" value={form.shipToState} onChange={(e) => set("shipToState", e.target.value)} />
              <Input label="Contact Person / Phone" value={form.shipToContact} onChange={(e) => set("shipToContact", e.target.value)} />
            </div>
          )}

          <SectionTitle>2. Product Details</SectionTitle>
          <datalist id="inv-products">
            {products.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
          <div className="space-y-3">
            {form.items.map((l, idx) => {
              const c = computed.lines[idx];
              return (
                <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1B4DB3]">Line {idx + 1}</span>
                    {form.items.length > 1 && (
                      <button type="button" onClick={() => set("items", form.items.filter((_, i) => i !== idx))} className="text-rose-500 hover:text-rose-700" aria-label="Remove line">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    <div className="col-span-2 sm:col-span-3">
                      <Input label="Description of Goods (Product / Grade) *" list="inv-products" value={l.description} onChange={(e) => setLine(idx, "description", e.target.value)} required />
                    </div>
                    <Input label="HSN Code *" value={l.hsnCode} onChange={(e) => setLine(idx, "hsnCode", e.target.value)} required />
                    <Input label="Batch No." value={l.batchNumber} onChange={(e) => setLine(idx, "batchNumber", e.target.value)} />
                    <Input label="Pack Details" placeholder="e.g. 20 x 25 kg" value={l.packDetails} onChange={(e) => setLine(idx, "packDetails", e.target.value)} />
                    <Input label="Mfg Date" type="date" value={l.mfgDate} onChange={(e) => setLine(idx, "mfgDate", e.target.value)} />
                    <Input label="Exp Date" type="date" value={l.expDate} onChange={(e) => setLine(idx, "expDate", e.target.value)} />
                    <Input label="Quantity *" type="number" step="any" min="0" value={l.quantity} onChange={(e) => setLine(idx, "quantity", e.target.value)} required />
                    <Select label="UOM" value={l.unit} onChange={(e) => setLine(idx, "unit", e.target.value)} options={UQC_OPTIONS.map((u) => ({ label: u, value: u }))} />
                    <Input label="Rate (₹ per UOM) *" type="number" step="any" min="0" value={l.unitPrice} onChange={(e) => setLine(idx, "unitPrice", e.target.value)} required />
                    <Select label="GST Rate (%)" value={l.gstRate} onChange={(e) => setLine(idx, "gstRate", e.target.value)} options={GST_RATES.map((r) => ({ label: `${r}%`, value: String(r) }))} />
                  </div>
                  {c && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600 pt-1">
                      <span>Amount: <b>{inr(c.amount)}</b></span>
                      <span>Taxable: <b>{inr(c.taxableValue)}</b></span>
                      {supplyType === "Inter-State" ? (
                        <span>IGST: <b>{inr(c.igst)}</b></span>
                      ) : (
                        <>
                          <span>CGST: <b>{inr(c.cgst)}</b></span>
                          <span>SGST: <b>{inr(c.sgst)}</b></span>
                        </>
                      )}
                      <span>Line Total: <b className="text-slate-900">{inr(c.lineTotal)}</b></span>
                    </div>
                  )}
                </div>
              );
            })}
            <Button type="button" variant="outline" size="sm" onClick={() => set("items", [...form.items, blankLine()])}>
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product Line</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Input label="Less: Discount (₹)" type="number" step="any" min="0" value={form.discountAmount} onChange={(e) => set("discountAmount", e.target.value)} />
                <Input label="Freight / Packing (₹)" type="number" step="any" min="0" value={form.freightAmount} onChange={(e) => set("freightAmount", e.target.value)} />
              </div>
              <p className="text-[11px] text-slate-500">Discount and freight are spread across the lines by value, and GST is calculated on the result.</p>
              <Textarea label="Internal Remarks (not printed)" value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
            </div>
            <div className="rounded-lg border border-slate-200 overflow-hidden text-xs self-start">
              {(
                [
                  ["Total Taxable Value", computed.gross],
                  ["Less: Discount", -computed.discount],
                  ["Freight / Packing", computed.freight],
                  ["CGST", computed.cgst],
                  ["SGST", computed.sgst],
                  ["IGST", computed.igst],
                  ["Round Off", computed.roundOff],
                ] as [string, number][]
              ).map(([k, v]) => (
                <div key={k} className="flex justify-between px-3 py-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-600">{k}</span>
                  <span>{inr(v)}</span>
                </div>
              ))}
              <div className="flex justify-between px-3 py-2.5 bg-[#DFEEDD] text-sm font-bold text-slate-900">
                <span>Grand Total</span>
                <span>{inr(computed.grandTotal)}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Terms &amp; Conditions (printed on the invoice)</label>
              <button type="button" onClick={() => set("terms", profile.defaultTerms)} className="text-[11px] font-semibold text-[#1B4DB3] hover:underline">
                Reset to default terms
              </button>
            </div>
            <textarea
              value={form.terms}
              onChange={(e) => set("terms", e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs leading-relaxed font-mono focus:outline-none focus:ring-2 focus:ring-[#1B4DB3]/20 focus:border-[#1B4DB3]"
            />
            <p className="mt-1 text-[11px] text-slate-500">One point per line. A line starting with &quot;Declaration:&quot; prints with a bold label.</p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              {editingId ? "Save Changes" : "Save Invoice & Download PDF"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Invoice settings: letterhead, bank details, default terms */}
      <Modal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Invoice Settings"
        description="Printed on every tax invoice. Leave a field empty and it prints as a blank line."
        maxWidth="xl"
      >
        <form onSubmit={saveSettings} className="space-y-5">
          {settingsError && <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">{settingsError}</div>}
          <SectionTitle>Company details (letterhead)</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Email" type="email" value={settingsDraft.email} onChange={(e) => setSettingsDraft({ ...settingsDraft, email: e.target.value })} />
            <Input label="Website" placeholder="www.example.com" value={settingsDraft.website} onChange={(e) => setSettingsDraft({ ...settingsDraft, website: e.target.value })} />
            <Input label="GSTIN" maxLength={15} value={settingsDraft.gstin} onChange={(e) => setSettingsDraft({ ...settingsDraft, gstin: e.target.value.toUpperCase() })} />
            <Input label="PAN" maxLength={10} value={settingsDraft.pan} onChange={(e) => setSettingsDraft({ ...settingsDraft, pan: e.target.value.toUpperCase() })} />
            <Input label="IEC" maxLength={10} value={settingsDraft.iec} onChange={(e) => setSettingsDraft({ ...settingsDraft, iec: e.target.value.toUpperCase() })} />
          </div>
          <SectionTitle>Bank details for payment</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Account Name" value={settingsDraft.bankAccountName} onChange={(e) => setSettingsDraft({ ...settingsDraft, bankAccountName: e.target.value })} />
            <Input label="Bank & Branch" value={settingsDraft.bankName} onChange={(e) => setSettingsDraft({ ...settingsDraft, bankName: e.target.value })} />
            <Input label="Account No." value={settingsDraft.bankAccountNo} onChange={(e) => setSettingsDraft({ ...settingsDraft, bankAccountNo: e.target.value })} />
            <Input label="IFSC Code" maxLength={11} value={settingsDraft.bankIfsc} onChange={(e) => setSettingsDraft({ ...settingsDraft, bankIfsc: e.target.value.toUpperCase() })} />
            <Input label="A/c Type" placeholder="Current / Savings" value={settingsDraft.bankAccountType} onChange={(e) => setSettingsDraft({ ...settingsDraft, bankAccountType: e.target.value })} />
          </div>
          <SectionTitle>Default Terms &amp; Conditions</SectionTitle>
          <div>
            <textarea
              value={settingsDraft.defaultTerms}
              onChange={(e) => setSettingsDraft({ ...settingsDraft, defaultTerms: e.target.value })}
              rows={7}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs leading-relaxed font-mono focus:outline-none focus:ring-2 focus:ring-[#1B4DB3]/20 focus:border-[#1B4DB3]"
            />
            <div className="mt-1 flex items-center justify-between">
              <p className="text-[11px] text-slate-500">Pre-filled on every new invoice and can still be edited per invoice.</p>
              <button type="button" onClick={() => setSettingsDraft({ ...settingsDraft, defaultTerms: DEFAULT_INVOICE_TERMS })} className="text-[11px] font-semibold text-[#1B4DB3] hover:underline">
                Restore template terms
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={settingsSaving}>
              Save Settings
            </Button>
          </div>
        </form>
      </Modal>

      {/* Payments */}
      {payInvoice && (
        <Modal
          isOpen={!!payInvoice}
          onClose={() => setPayInvoice(null)}
          title={`Payments: ${payInvoice.invoiceNumber}`}
          description={`${payInvoice.customerName} · Total ${inr(payInvoice.grandTotal)}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-slate-500">Invoice Total</p>
                <p className="font-bold text-slate-900">{inr(payInvoice.grandTotal)}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="text-emerald-700">Received</p>
                <p className="font-bold text-emerald-800">{inr(payInvoice.paidAmount)}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                <p className="text-rose-700">Balance Due</p>
                <p className="font-bold text-rose-800">{inr(payInvoice.balanceAmount)}</p>
              </div>
            </div>

            {payInvoice.payments.length > 0 && (
              <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="py-2 px-3 text-left">Date</th>
                    <th className="py-2 px-3 text-left">Mode</th>
                    <th className="py-2 px-3 text-left">Reference / UTR</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                    <th className="py-2 px-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payInvoice.payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 px-3">{new Date(p.paymentDate).toLocaleDateString("en-IN")}</td>
                      <td className="py-2 px-3">{p.paymentMethod.replace(/_/g, " ")}</td>
                      <td className="py-2 px-3 font-mono">{p.referenceNumber || "-"}</td>
                      <td className="py-2 px-3 text-right font-semibold">{inr(p.amount)}</td>
                      <td className="py-2 px-3 text-right">
                        <button onClick={() => deletePayment(p)} className="text-rose-500 hover:text-rose-700" title="Remove payment">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {payInvoice.balanceAmount > 0 ? (
              <form onSubmit={submitPayment} className="space-y-3 p-3 rounded-lg border border-slate-200">
                <p className="text-xs font-bold text-[#1B4DB3]">Record a payment</p>
                {payError && <div className="p-2 rounded bg-rose-50 text-rose-700 text-xs">{payError}</div>}
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Amount (₹) *" type="number" step="any" min="0.01" max={payInvoice.balanceAmount} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} required />
                  <Input label="Payment Date *" type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} required />
                  <Select label="Mode *" value={payMethod} onChange={(e) => setPayMethod(e.target.value)} options={PAYMENT_METHODS.map((m) => ({ label: m.replace(/_/g, " "), value: m }))} />
                  <Input label="Reference / UTR / Cheque No." value={payRef} onChange={(e) => setPayRef(e.target.value)} />
                </div>
                <Input label="Notes" value={payNotes} onChange={(e) => setPayNotes(e.target.value)} />
                <div className="flex justify-end">
                  <Button type="submit" variant="primary" size="sm" isLoading={paySaving}>
                    Record Payment
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold">This invoice is fully paid.</div>
            )}

            <div className="flex justify-end">
              <a href={`/api/invoices/${payInvoice.id}/pdf`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline">
                <Download className="w-3.5 h-3.5" />
                Download invoice PDF (includes payment details)
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
