"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  FileCheck2,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  Search,
  Plus,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface Stats {
  enquiries: { total: number; new: number; open: number };
  grn: { total: number; thisMonth: number; pendingQc: number };
  invoices: {
    count: number;
    billed: number;
    received: number;
    outstanding: number;
    unpaidCount: number;
    overdueCount: number;
    fyBilled: number;
    fyTaxable: number;
    fyGst: number;
    receivedThisMonth: number;
  };
  monthly: { label: string; total: number }[];
  recentEnquiries: { id: string; enquiryNumber: string; contactName: string; companyName: string | null; productOfInterest: string | null; status: string; createdAt: string }[];
  recentGrns: { id: string; grnNumber: string; supplierName: string; receiptDate: string; qcStatus: string | null; _count: { items: number } }[];
  recentInvoices: { id: string; invoiceNumber: string; customerName: string; invoiceDate: string; grandTotal: number; balanceAmount: number; paymentStatus: string }[];
}

interface SearchResult {
  type: string;
  title: string;
  subtitle: string;
  href: string;
}

const inr = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

function KpiCard({
  label,
  value,
  sub,
  href,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  href: string;
  icon: React.ElementType;
  tone: string;
}) {
  return (
    <Link href={href} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors group">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-lg ${tone}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 mt-3">{value}</div>
      <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
        <span>{sub}</span>
        <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600" />
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const searchBox = useRef<HTMLDivElement>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/stats");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load dashboard");
      setData(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
      const json = await res.json();
      setResults(json.results || []);
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (searchBox.current && !searchBox.current.contains(e.target as Node)) setResults(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const maxMonth = Math.max(1, ...(data?.monthly.map((m) => m.total) || [1]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Enquiries, goods receipts, invoices and receivables at a glance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchStats} isLoading={loading}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
          <Link href="/dashboard/grn" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
            <Plus className="w-3.5 h-3.5" />
            GRN
          </Link>
          <Link href="/dashboard/invoices" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1B4DB3] text-white hover:bg-[#163f94]">
            <Plus className="w-3.5 h-3.5" />
            Tax Invoice
          </Link>
        </div>
      </div>

      {/* Global search */}
      <div ref={searchBox} className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search everything: enquiry no., customer, supplier, invoice / GRN no., GSTIN, product, batch..."
          className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-[#1B4DB3]/20 focus:border-[#1B4DB3]"
        />
        {results && (
          <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <p className="p-4 text-xs text-slate-500">No matches for “{query}”.</p>
            ) : (
              results.map((r) => (
                <Link key={r.type + r.href} href={r.href} className="flex items-start gap-3 px-4 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0">
                  <span className="mt-0.5 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#EAF1FB] text-[#1B4DB3] shrink-0 w-16 text-center">{r.type}</span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-slate-900 truncate">{r.title}</span>
                    <span className="block text-[11px] text-slate-500 truncate">{r.subtitle}</span>
                  </span>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      {error && <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="New Enquiries"
          value={data ? String(data.enquiries.new) : "-"}
          sub={data ? `${data.enquiries.open} open · ${data.enquiries.total} total` : ""}
          href="/dashboard/enquiries"
          icon={MessageSquare}
          tone="bg-blue-50 text-blue-600"
        />
        <KpiCard
          label="Goods Receipts"
          value={data ? String(data.grn.thisMonth) : "-"}
          sub={data ? `this month · ${data.grn.pendingQc} pending QC` : ""}
          href="/dashboard/grn"
          icon={FileCheck2}
          tone="bg-emerald-50 text-emerald-600"
        />
        <KpiCard
          label="Billed This FY"
          value={data ? inr(data.invoices.fyBilled) : "-"}
          sub={data ? `GST ${inr(data.invoices.fyGst)} · ${data.invoices.count} invoices` : ""}
          href="/dashboard/reports"
          icon={BarChart3}
          tone="bg-indigo-50 text-indigo-600"
        />
        <KpiCard
          label="Outstanding"
          value={data ? inr(data.invoices.outstanding) : "-"}
          sub={data ? `${data.invoices.unpaidCount} unpaid · ${data.invoices.overdueCount} overdue` : ""}
          href="/dashboard/invoices"
          icon={Wallet}
          tone="bg-rose-50 text-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly billing */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">Billing: last 6 months</h2>
            <span className="text-[11px] text-slate-500">
              Received this month: <b className="text-emerald-600">{data ? inr(data.invoices.receivedThisMonth) : "-"}</b>
            </span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {(data?.monthly || []).map((m) => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100">{inr(m.total)}</span>
                <div className="w-full max-w-12 rounded-t-md bg-[#1B4DB3]" style={{ height: `${Math.max(2, (m.total / maxMonth) * 100)}%` }} title={inr(m.total)} />
                <span className="text-[11px] text-slate-500">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Receivables */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Receivables</h2>
          {[
            ["Total billed", data?.invoices.billed, "text-slate-900"],
            ["Received", data?.invoices.received, "text-emerald-600"],
            ["Outstanding", data?.invoices.outstanding, "text-rose-600"],
          ].map(([k, v, c]) => (
            <div key={k as string} className="flex justify-between text-xs border-b border-slate-100 pb-2">
              <span className="text-slate-500">{k}</span>
              <span className={`font-bold ${c}`}>{data ? inr(v as number) : "-"}</span>
            </div>
          ))}
          {data && data.invoices.overdueCount > 0 && (
            <Link href="/dashboard/reports" className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertTriangle className="w-4 h-4" />
              {data.invoices.overdueCount} invoice(s) past due date
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentList title="Latest Enquiries" href="/dashboard/enquiries" empty="No enquiries yet">
          {data?.recentEnquiries.map((e) => (
            <Row key={e.id} title={e.contactName} sub={`${e.enquiryNumber} · ${e.companyName || e.productOfInterest || ""}`} right={<StatusBadge status={e.status} />} />
          ))}
        </RecentList>
        <RecentList title="Latest Goods Receipts" href="/dashboard/grn" empty="No GRNs yet">
          {data?.recentGrns.map((g) => (
            <Row
              key={g.id}
              title={g.supplierName}
              sub={`${g.grnNumber} · ${new Date(g.receiptDate).toLocaleDateString("en-IN")} · ${g._count.items} item(s)`}
              right={g.qcStatus ? <StatusBadge status={g.qcStatus} /> : null}
            />
          ))}
        </RecentList>
        <RecentList title="Latest Invoices" href="/dashboard/invoices" empty="No invoices yet">
          {data?.recentInvoices.map((i) => (
            <Row
              key={i.id}
              title={i.customerName}
              sub={`${i.invoiceNumber} · ${inr(i.grandTotal)}`}
              right={<StatusBadge status={i.paymentStatus} />}
            />
          ))}
        </RecentList>
      </div>
    </div>
  );
}

function RecentList({ title, href, empty, children }: { title: string; href: string; empty: string; children?: React.ReactNode[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        <Link href={href} className="text-xs text-blue-600 hover:underline inline-flex items-center">
          View all <ArrowUpRight className="w-3 h-3 ml-0.5" />
        </Link>
      </div>
      <div className="divide-y divide-slate-100">
        {children && children.length > 0 ? children : <p className="p-4 text-xs text-slate-400">{empty}</p>}
      </div>
    </div>
  );
}

function Row({ title, sub, right }: { title: string; sub: string; right: React.ReactNode }) {
  return (
    <div className="px-4 py-2.5 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-900 truncate">{title}</p>
        <p className="text-[11px] text-slate-500 truncate">{sub}</p>
      </div>
      <div className="shrink-0">{right}</div>
    </div>
  );
}

