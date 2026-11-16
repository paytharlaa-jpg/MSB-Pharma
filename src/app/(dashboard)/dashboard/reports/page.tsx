"use client";

import React, { useCallback, useEffect, useState } from "react";
import { BarChart3, FileSpreadsheet, Download, Search, X, MessageSquare, FileCheck2, CreditCard, AlertTriangle, Receipt } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

type ReportType = "sales-register" | "enquiries" | "grn" | "payments" | "outstanding";

const REPORTS: { key: ReportType; label: string; desc: string; icon: React.ElementType }[] = [
  { key: "sales-register", label: "GST Sales Register", desc: "Line-wise tax invoices in the MSB Sales Register Excel format", icon: Receipt },
  { key: "payments", label: "Payments Received", desc: "All payments recorded against invoices", icon: CreditCard },
  { key: "outstanding", label: "Outstanding Receivables", desc: "Unpaid and part-paid invoices with days overdue", icon: AlertTriangle },
  { key: "grn", label: "GRN Register", desc: "Goods received, batches, quantities and QC status", icon: FileCheck2 },
  { key: "enquiries", label: "Enquiries & Leads", desc: "Website and manual enquiries", icon: MessageSquare },
];

const firstOfFy = () => {
  const now = new Date();
  const y = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${y}-04-01`;
};

export default function ReportsPage() {
  const [type, setType] = useState<ReportType>("sales-register");
  const [startDate, setStartDate] = useState(firstOfFy());
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<{ count: number; records: Record<string, unknown>[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const params = useCallback(
    (extra: Record<string, string> = {}) => {
      const p = new URLSearchParams();
      if (startDate) p.set("startDate", startDate);
      if (endDate) p.set("endDate", endDate);
      if (search.trim()) p.set("search", search.trim());
      for (const [k, v] of Object.entries(extra)) p.set(k, v);
      return p.toString();
    },
    [startDate, endDate, search]
  );

  // Sales register preview reuses the "invoices" listing (one row per product line)
  const loadPreview = useCallback(async () => {
    setLoading(true);
    try {
      if (type === "sales-register") {
        const p = new URLSearchParams();
        if (search.trim()) p.set("search", search.trim());
        const res = await fetch(`/api/invoices?${p}`);
        const json = await res.json();
        const from = startDate ? new Date(`${startDate}T00:00:00`).getTime() : -Infinity;
        const to = endDate ? new Date(`${endDate}T23:59:59`).getTime() : Infinity;
        type Inv = {
          invoiceNumber: string;
          invoiceDate: string;
          customerName: string;
          customerGstin: string | null;
          placeOfSupply: string;
          category: string;
          items: { description: string; hsnCode: string; unit: string; quantity: number; unitPrice: number; taxableValue: number; gstRate: number; igst: number; cgst: number; sgst: number; lineTotal: number }[];
        };
        const rows = ((json.invoices || []) as Inv[])
          .filter((i) => {
            const t = new Date(i.invoiceDate).getTime();
            return t >= from && t <= to;
          })
          .sort((a, b) => a.invoiceDate.localeCompare(b.invoiceDate))
          .flatMap((i) =>
            i.items.map((it) => ({
              "Invoice No.": i.invoiceNumber,
              Date: new Date(i.invoiceDate).toLocaleDateString("en-IN"),
              Customer: i.customerName,
              GSTIN: i.customerGstin || "",
              "Place of Supply": i.placeOfSupply,
              Category: i.category,
              Product: it.description,
              HSN: it.hsnCode,
              Qty: `${it.quantity} ${it.unit}`,
              Rate: it.unitPrice,
              "Taxable (₹)": it.taxableValue,
              "GST %": it.gstRate,
              "IGST (₹)": it.igst,
              "CGST (₹)": it.cgst,
              "SGST (₹)": it.sgst,
              "Line Total (₹)": it.lineTotal,
            }))
          );
        setPreview({ count: rows.length, records: rows.slice(0, 200) });
      } else {
        const res = await fetch(`/api/reports?${params({ type, format: "json" })}`);
        const json = await res.json();
        setPreview(json.success ? { count: json.count, records: json.records } : { count: 0, records: [] });
      }
    } finally {
      setLoading(false);
    }
  }, [type, params, search, startDate, endDate]);

  useEffect(() => {
    const t = setTimeout(loadPreview, 300);
    return () => clearTimeout(t);
  }, [loadPreview]);

  const downloadUrl = (format: "xlsx" | "csv") =>
    type === "sales-register" ? `/api/reports/sales-register?${params()}` : `/api/reports?${params({ type, format })}`;

  const current = REPORTS.find((r) => r.key === type)!;
  const cols = preview?.records[0] ? Object.keys(preview.records[0]) : [];
  const fmt = (v: unknown) =>
    typeof v === "number" ? v.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : String(v ?? "");

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports &amp; Exports</h1>
        <p className="text-xs text-slate-500 mt-1">Filter by date and search, preview, then download as Excel.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {REPORTS.map((r) => {
          const Icon = r.icon;
          const active = r.key === type;
          return (
            <button
              key={r.key}
              onClick={() => setType(r.key)}
              className={`text-left p-3.5 rounded-xl border transition-colors ${
                active ? "border-[#1B4DB3] bg-[#EAF1FB] ring-2 ring-[#1B4DB3]/15" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <Icon className={`w-4 h-4 mb-2 ${active ? "text-[#1B4DB3]" : "text-slate-400"}`} />
              <p className="text-xs font-bold text-slate-900">{r.label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{r.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
            From
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="py-2 px-3 text-sm rounded-lg border border-slate-200" />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
            To
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="py-2 px-3 text-sm rounded-lg border border-slate-200" />
          </label>
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search within ${current.label.toLowerCase()}...`}
              className="w-full pl-9 pr-9 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1B4DB3]/20 focus:border-[#1B4DB3]"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" aria-label="Clear search">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <a href={downloadUrl("xlsx")} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#1B4DB3] text-white hover:bg-[#163f94]">
              <FileSpreadsheet className="w-4 h-4" />
              Download Excel
            </a>
            {type !== "sales-register" && (
              <a href={downloadUrl("csv")} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50">
                <Download className="w-4 h-4" />
                CSV
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-800">
            Preview: {current.label}
            {preview && <span className="font-normal text-slate-500"> · {preview.count} row{preview.count === 1 ? "" : "s"}{preview.count > 200 ? " (first 200 shown)" : ""}</span>}
          </p>
          {loading && <span className="text-[11px] text-slate-400">Loading…</span>}
        </div>
        <div className="overflow-x-auto max-h-[480px]">
          {preview && preview.records.length > 0 ? (
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0">
                <tr>
                  {cols.map((c) => (
                    <th key={c} className="py-2 px-3 whitespace-nowrap">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preview.records.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    {cols.map((c) => (
                      <td key={c} className="py-2 px-3 whitespace-nowrap max-w-[260px] truncate">
                        {fmt(r[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8">
              <EmptyState icon={<BarChart3 className="w-6 h-6" />} title="No records for these filters" description="Widen the date range or clear the search." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
