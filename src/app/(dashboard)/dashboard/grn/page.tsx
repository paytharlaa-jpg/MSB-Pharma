"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FileCheck2, Plus, Download, Eye, Pencil, Trash2, Search, RefreshCw, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  GRN_CHECKLIST_LEFT,
  GRN_CHECKLIST_RIGHT,
  GRN_QC_STATUSES,
  GRN_REJECTION_ACTIONS,
  GRN_THREE_WAY,
  GRN_SIGNATORIES,
} from "@/lib/grn-constants";
import { UQC_OPTIONS } from "@/lib/company";

interface GrnItem {
  materialDescription: string;
  batchNumber: string;
  mfgDate: string;
  expiryDate: string;
  qtyAsPerInvoice: string;
  receivedQuantity: string;
  acceptedQuantity: string;
  rejectedQuantity: string;
  unit: string;
  numContainers: string;
  remarks: string;
}

interface GrnForm {
  receiptDate: string;
  receiptTime: string;
  supplierName: string;
  supplierAddress: string;
  poNumberDate: string;
  invoiceNumberDate: string;
  vehicleNumber: string;
  transporterLr: string;
  ewayBillNumber: string;
  receivedAt: string;
  checklist: Record<string, string>;
  qcSampleRef: string;
  sampledBy: string;
  sampledDate: string;
  qcStatus: string;
  storageLocation: string;
  tempCondition: string;
  rejectionAction: string;
  threeWayMatch: string[];
  remarks: string;
  signatories: Record<string, { name: string; date: string }>;
  items: GrnItem[];
}

interface GrnRecord {
  id: string;
  grnNumber: string;
  receiptDate: string;
  receiptTime: string | null;
  supplierName: string;
  supplierAddress: string | null;
  poNumberDate: string | null;
  invoiceNumberDate: string | null;
  vehicleNumber: string | null;
  transporterLr: string | null;
  ewayBillNumber: string | null;
  receivedAt: string | null;
  checklist: string;
  qcSampleRef: string | null;
  sampledBy: string | null;
  sampledDate: string | null;
  qcStatus: string | null;
  storageLocation: string | null;
  tempCondition: string | null;
  rejectionAction: string | null;
  threeWayMatch: string;
  remarks: string | null;
  notes: string | null;
  signatories: string;
  items: Array<{
    materialDescription: string;
    batchNumber: string;
    mfgDate: string | null;
    expiryDate: string | null;
    qtyAsPerInvoice: number | null;
    receivedQuantity: number;
    acceptedQuantity: number;
    rejectedQuantity: number;
    unit: string;
    numContainers: number | null;
    remarks: string | null;
  }>;
}

const today = () => new Date().toISOString().slice(0, 10);
const d = (v: string | null | undefined) => (v ? String(v).slice(0, 10) : "");
const n = (v: number | null | undefined) => (v === null || v === undefined ? "" : String(v));
const parse = <T,>(s: string | null, fb: T): T => {
  try {
    return s ? (JSON.parse(s) as T) : fb;
  } catch {
    return fb;
  }
};

const blankItem = (): GrnItem => ({
  materialDescription: "",
  batchNumber: "",
  mfgDate: "",
  expiryDate: "",
  qtyAsPerInvoice: "",
  receivedQuantity: "",
  acceptedQuantity: "",
  rejectedQuantity: "0",
  unit: "KGS",
  numContainers: "",
  remarks: "",
});

const blankForm = (): GrnForm => ({
  receiptDate: today(),
  receiptTime: new Date().toTimeString().slice(0, 5),
  supplierName: "",
  supplierAddress: "",
  poNumberDate: "",
  invoiceNumberDate: "",
  vehicleNumber: "",
  transporterLr: "",
  ewayBillNumber: "",
  receivedAt: "Main Warehouse - Kukatpally",
  checklist: {},
  qcSampleRef: "",
  sampledBy: "",
  sampledDate: "",
  qcStatus: "QUARANTINE",
  storageLocation: "",
  tempCondition: "",
  rejectionAction: "",
  threeWayMatch: [],
  remarks: "",
  signatories: {},
  items: [blankItem()],
});

function toForm(g: GrnRecord): GrnForm {
  const sig = parse<Record<string, { name?: string; date?: string }>>(g.signatories, {});
  return {
    receiptDate: d(g.receiptDate),
    receiptTime: g.receiptTime || "",
    supplierName: g.supplierName,
    supplierAddress: g.supplierAddress || "",
    poNumberDate: g.poNumberDate || "",
    invoiceNumberDate: g.invoiceNumberDate || "",
    vehicleNumber: g.vehicleNumber || "",
    transporterLr: g.transporterLr || "",
    ewayBillNumber: g.ewayBillNumber || "",
    receivedAt: g.receivedAt || "",
    checklist: parse(g.checklist, {}),
    qcSampleRef: g.qcSampleRef || "",
    sampledBy: g.sampledBy || "",
    sampledDate: d(g.sampledDate),
    qcStatus: g.qcStatus || "",
    storageLocation: g.storageLocation || "",
    tempCondition: g.tempCondition || "",
    rejectionAction: g.rejectionAction || "",
    threeWayMatch: parse(g.threeWayMatch, []),
    remarks: g.remarks || g.notes || "",
    signatories: Object.fromEntries(
      GRN_SIGNATORIES.map((s) => [s.key, { name: sig[s.key]?.name || "", date: d(sig[s.key]?.date) }])
    ),
    items: g.items.length
      ? g.items.map((i) => ({
          materialDescription: i.materialDescription,
          batchNumber: i.batchNumber,
          mfgDate: d(i.mfgDate),
          expiryDate: d(i.expiryDate),
          qtyAsPerInvoice: n(i.qtyAsPerInvoice),
          receivedQuantity: n(i.receivedQuantity),
          acceptedQuantity: n(i.acceptedQuantity),
          rejectedQuantity: n(i.rejectedQuantity),
          unit: i.unit,
          numContainers: n(i.numContainers),
          remarks: i.remarks || "",
        }))
      : [blankItem()],
  };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#3A9A1E] text-white text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-md">
      {children}
    </div>
  );
}

export default function GrnPage() {
  const [grns, setGrns] = useState<GrnRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  // Deep links from the dashboard's global search: /dashboard/...?search=<doc no>
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("search");
    if (q) setSearch(q);
  }, []);
  const [qcFilter, setQcFilter] = useState("");
  const [products, setProducts] = useState<string[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GrnForm>(blankForm());
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchGrns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (qcFilter) params.set("qcStatus", qcFilter);
      const res = await fetch(`/api/grn?${params}`);
      const json = await res.json();
      if (json.success) setGrns(json.grns);
    } finally {
      setLoading(false);
    }
  }, [search, qcFilter]);

  useEffect(() => {
    const t = setTimeout(fetchGrns, 250);
    return () => clearTimeout(t);
  }, [fetchGrns]);

  useEffect(() => {
    fetch("/api/products?public=true")
      .then((r) => r.json())
      .then((j) => setProducts((j.products || []).map((p: { name: string }) => p.name)))
      .catch(() => {});
  }, []);

  const set = <K extends keyof GrnForm>(key: K, value: GrnForm[K]) => setForm((f) => ({ ...f, [key]: value }));

  const setItem = (idx: number, key: keyof GrnItem, value: string) =>
    setForm((f) => {
      const items = f.items.map((it, i) => {
        if (i !== idx) return it;
        const next = { ...it, [key]: value };
        // Auto-fill accepted = received - rejected while the user hasn't typed an accepted qty
        if ((key === "receivedQuantity" || key === "rejectedQuantity") && (it.acceptedQuantity === "" || Number(it.acceptedQuantity) === Number(it.receivedQuantity || 0) - Number(it.rejectedQuantity || 0))) {
          const acc = Number(next.receivedQuantity || 0) - Number(next.rejectedQuantity || 0);
          next.acceptedQuantity = next.receivedQuantity === "" ? "" : String(Math.max(acc, 0));
        }
        return next;
      });
      return { ...f, items };
    });

  const openCreate = () => {
    setEditingId(null);
    setForm(blankForm());
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEdit = (g: GrnRecord) => {
    setEditingId(g.id);
    setForm(toForm(g));
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(editingId ? `/api/grn/${editingId}` : "/api/grn", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save GRN");
      setModalOpen(false);
      await fetchGrns();
      if (!editingId && json.grn?.id) {
        // Attachment response: triggers a download without leaving the page (no popup blocker issues)
        const a = document.createElement("a");
        a.href = `/api/grn/${json.grn.id}/pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save GRN");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (g: GrnRecord) => {
    if (!window.confirm(`Delete ${g.grnNumber}? This cannot be undone.`)) return;
    await fetch(`/api/grn/${g.id}`, { method: "DELETE" });
    fetchGrns();
  };

  const checklistRow = (item: { key: string; label: string }) => (
    <div key={item.key} className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-700">{item.label}</span>
      <div className="flex gap-1 shrink-0">
        {[
          ["YES", "Yes"],
          ["NO", "No"],
          ["NA", "N/A"],
        ].map(([val, label]) => {
          const active = form.checklist[item.key] === val;
          return (
            <button
              type="button"
              key={val}
              onClick={() => set("checklist", { ...form.checklist, [item.key]: active ? "" : val })}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors ${
                active
                  ? val === "NO"
                    ? "bg-rose-600 text-white border-rose-600"
                    : "bg-[#1B4DB3] text-white border-[#1B4DB3]"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Goods Receipt (GRN)</h1>
          <p className="text-xs text-slate-500 mt-1">
            GRN &amp; incoming inspection reports. Fill the form, and the PDF downloads in the standard MSB format.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchGrns} isLoading={loading}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Plus className="w-3.5 h-3.5" />
            <span>New GRN</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search GRN no., supplier, material, batch, PO / invoice no., vehicle..."
            className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4DB3]/20 focus:border-[#1B4DB3]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" aria-label="Clear search">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={qcFilter}
          onChange={(e) => setQcFilter(e.target.value)}
          className="sm:w-48 py-2 px-3 text-sm rounded-lg border border-slate-200 bg-white"
        >
          <option value="">All QC statuses</option>
          {GRN_QC_STATUSES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {grns.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">GRN No.</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Supplier</th>
                  <th className="py-3 px-3">Invoice No. / Date</th>
                  <th className="py-3 px-3">Materials</th>
                  <th className="py-3 px-3">QC Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grns.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 font-mono font-medium text-blue-700 whitespace-nowrap">{g.grnNumber}</td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(g.receiptDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900 min-w-[140px]">{g.supplierName || "-"}</td>
                    <td className="py-3 px-3 text-slate-600 min-w-[120px]">{g.invoiceNumberDate || "-"}</td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs">
                      {g.items.map((i) => (
                        <div key={i.batchNumber + i.materialDescription} className="truncate">
                          {i.materialDescription}{" "}
                          <span className="text-slate-400">
                            ({i.receivedQuantity} {i.unit}
                            {i.batchNumber ? ` · ${i.batchNumber}` : ""})
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-3">{g.qcStatus ? <StatusBadge status={g.qcStatus} /> : "-"}</td>
                    <td className="py-3 px-3">
                      <div className="flex justify-end gap-1.5">
                        <a href={`/api/grn/${g.id}/pdf?view=1`} target="_blank" rel="noopener noreferrer" title="View PDF" className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100">
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={`/api/grn/${g.id}/pdf`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </a>
                        <button onClick={() => openEdit(g)} title="Edit" className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(g)} title="Delete" className="p-1.5 rounded-md text-rose-500 hover:bg-rose-50">
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
                icon={<FileCheck2 className="w-6 h-6" />}
                title={search || qcFilter ? "No GRNs match your search" : "No goods receipts recorded yet"}
                description={search || qcFilter ? "Try a different search term or clear the filter." : "Click “New GRN” to record incoming material."}
              />
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Goods Receipt Note" : "New Goods Receipt Note (GRN) & Incoming Inspection"}
        description="Every field here prints on the GRN PDF. Leave blank anything not applicable."
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="GRN Date *" type="date" value={form.receiptDate} onChange={(e) => set("receiptDate", e.target.value)} required />
            <Input label="Time of Receipt" type="time" value={form.receiptTime} onChange={(e) => set("receiptTime", e.target.value)} />
            <Input label="GRN No." value={editingId ? "(unchanged)" : "Auto-generated on save"} disabled />
          </div>

          <SectionTitle>1. Supplier &amp; Document Details</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Supplier Name *" value={form.supplierName} onChange={(e) => set("supplierName", e.target.value)} required />
            <Input label="Supplier Address" value={form.supplierAddress} onChange={(e) => set("supplierAddress", e.target.value)} />
            <Input label="PO No. / Date" placeholder="e.g. PO/4512 / 10-11-2026" value={form.poNumberDate} onChange={(e) => set("poNumberDate", e.target.value)} />
            <Input label="Invoice No. / Date" placeholder="e.g. INV/7781 / 14-11-2026" value={form.invoiceNumberDate} onChange={(e) => set("invoiceNumberDate", e.target.value)} />
            <Input label="Vehicle No." value={form.vehicleNumber} onChange={(e) => set("vehicleNumber", e.target.value)} />
            <Input label="Transporter / LR" value={form.transporterLr} onChange={(e) => set("transporterLr", e.target.value)} />
            <Input label="E-Way Bill No." value={form.ewayBillNumber} onChange={(e) => set("ewayBillNumber", e.target.value)} />
            <Input label="Received At" value={form.receivedAt} onChange={(e) => set("receivedAt", e.target.value)} />
          </div>

          <SectionTitle>2. Material Received</SectionTitle>
          <datalist id="grn-products">
            {products.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
          <div className="space-y-3">
            {form.items.map((it, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1B4DB3]">Line {idx + 1}</span>
                  {form.items.length > 1 && (
                    <button type="button" onClick={() => set("items", form.items.filter((_, i) => i !== idx))} className="text-rose-500 hover:text-rose-700" aria-label="Remove line">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="col-span-2">
                    <Input label="Material Description *" list="grn-products" value={it.materialDescription} onChange={(e) => setItem(idx, "materialDescription", e.target.value)} required />
                  </div>
                  <Input label="Batch No." value={it.batchNumber} onChange={(e) => setItem(idx, "batchNumber", e.target.value)} />
                  <Select label="UOM" value={it.unit} onChange={(e) => setItem(idx, "unit", e.target.value)} options={UQC_OPTIONS.map((u) => ({ label: u, value: u }))} />
                  <Input label="Mfg Date" type="date" value={it.mfgDate} onChange={(e) => setItem(idx, "mfgDate", e.target.value)} />
                  <Input label="Exp / Retest Date" type="date" value={it.expiryDate} onChange={(e) => setItem(idx, "expiryDate", e.target.value)} />
                  <Input label="Qty as per Invoice" type="number" step="any" min="0" value={it.qtyAsPerInvoice} onChange={(e) => setItem(idx, "qtyAsPerInvoice", e.target.value)} />
                  <Input label="Qty Received *" type="number" step="any" min="0" value={it.receivedQuantity} onChange={(e) => setItem(idx, "receivedQuantity", e.target.value)} required />
                  <Input label="No. of Containers" type="number" min="0" value={it.numContainers} onChange={(e) => setItem(idx, "numContainers", e.target.value)} />
                  <Input label="Accepted Qty" type="number" step="any" min="0" value={it.acceptedQuantity} onChange={(e) => setItem(idx, "acceptedQuantity", e.target.value)} />
                  <Input label="Rejected Qty" type="number" step="any" min="0" value={it.rejectedQuantity} onChange={(e) => setItem(idx, "rejectedQuantity", e.target.value)} />
                  <Input label="Remarks" value={it.remarks} onChange={(e) => setItem(idx, "remarks", e.target.value)} />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => set("items", [...form.items, blankItem()])}>
              <Plus className="w-3.5 h-3.5" />
              <span>Add Material Line</span>
            </Button>
          </div>

          <SectionTitle>3. Incoming Inspection Checklist</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 px-1">
            <div>{GRN_CHECKLIST_LEFT.map(checklistRow)}</div>
            <div>{GRN_CHECKLIST_RIGHT.map(checklistRow)}</div>
          </div>

          <SectionTitle>4. QC, Disposition &amp; Matching</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input label="QC Sample Ref. No." value={form.qcSampleRef} onChange={(e) => set("qcSampleRef", e.target.value)} />
                <Input label="Sampled by" value={form.sampledBy} onChange={(e) => set("sampledBy", e.target.value)} />
                <Input label="Sample Date" type="date" value={form.sampledDate} onChange={(e) => set("sampledDate", e.target.value)} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1.5">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {GRN_QC_STATUSES.map((s) => (
                    <button
                      type="button"
                      key={s.key}
                      onClick={() => set("qcStatus", form.qcStatus === s.key ? "" : s.key)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold border ${form.qcStatus === s.key ? "bg-[#1B4DB3] text-white border-[#1B4DB3]" : "bg-white text-slate-600 border-slate-200"}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input label="Storage Location / Bin" value={form.storageLocation} onChange={(e) => set("storageLocation", e.target.value)} />
                <Input label="Temp. Condition" placeholder="e.g. Below 25°C" value={form.tempCondition} onChange={(e) => set("tempCondition", e.target.value)} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-1.5">Action on Rejection</p>
                <div className="flex flex-wrap gap-1.5">
                  {GRN_REJECTION_ACTIONS.map((s) => (
                    <button
                      type="button"
                      key={s.key}
                      onClick={() => set("rejectionAction", form.rejectionAction === s.key ? "" : s.key)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold border ${form.rejectionAction === s.key ? "bg-rose-600 text-white border-rose-600" : "bg-white text-slate-600 border-slate-200"}`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200">
              <p className="text-xs font-bold text-[#1B4DB3] mb-2">THREE-WAY MATCH</p>
              {GRN_THREE_WAY.map((m) => (
                <label key={m.key} className="flex items-center gap-2 py-1 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.threeWayMatch.includes(m.key)}
                    onChange={(e) =>
                      set("threeWayMatch", e.target.checked ? [...form.threeWayMatch, m.key] : form.threeWayMatch.filter((k) => k !== m.key))
                    }
                    className="w-3.5 h-3.5 accent-[#1B4DB3]"
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </div>

          <Textarea
            label="Remarks / Discrepancies (shortage, excess, damage, documents missing)"
            value={form.remarks}
            onChange={(e) => set("remarks", e.target.value)}
            rows={2}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {GRN_SIGNATORIES.map((s) => (
              <div key={s.key} className="p-3 rounded-lg border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-800">{s.label}</p>
                <Input
                  label="Name"
                  value={form.signatories[s.key]?.name || ""}
                  onChange={(e) => set("signatories", { ...form.signatories, [s.key]: { ...(form.signatories[s.key] || { date: "" }), name: e.target.value } })}
                />
                <Input
                  label="Date"
                  type="date"
                  value={form.signatories[s.key]?.date || ""}
                  onChange={(e) => set("signatories", { ...form.signatories, [s.key]: { ...(form.signatories[s.key] || { name: "" }), date: e.target.value } })}
                />
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400">Signatures are left blank on the PDF for hand signing.</p>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              {editingId ? "Save Changes" : "Save GRN & Download PDF"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
