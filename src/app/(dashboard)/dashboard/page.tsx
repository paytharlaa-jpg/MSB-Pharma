"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare,
  AlertTriangle,
  Receipt,
  FileText,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Plus,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";

interface DashboardData {
  enquiries: {
    total: number;
    new: number;
    open: number;
  };
  inventory: {
    totalProducts: number;
    totalBatches: number;
    expiringSoonCount: number;
    lowStockCount: number;
    expiringBatches: Array<{
      id: string;
      batchNumber: string;
      currentQuantity: number;
      expiryDate: string;
      product: { name: string; sku: string };
    }>;
    lowStockProducts: Array<{
      id: string;
      name: string;
      sku: string;
      minimumStock: number;
      batches: Array<{ currentQuantity: number }>;
    }>;
  };
  quotations: {
    count: number;
    totalValue: number;
  };
  invoices: {
    count: number;
    totalInvoiced: number;
    totalCollected: number;
    totalOutstanding: number;
    unpaidCount: number;
  };
  recentEnquiries: Array<{
    id: string;
    enquiryNumber: string;
    contactName: string;
    companyName: string | null;
    productOfInterest: string | null;
    status: string;
    createdAt: string;
  }>;
  recentAuditLogs: Array<{
    id: string;
    entityType: string;
    action: string;
    userEmail: string | null;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/stats");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load stats");
      setData(json.data);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Operations Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time business records, batch inventory alerts, enquiries, and receivables tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStats}
            isLoading={loading}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </Button>

          <Link href="/dashboard/inventory">
            <Button variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5" />
              <span>Stock Adjustment</span>
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Enquiries Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New Enquiries</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">
              {data ? data.enquiries.new : "-"}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span>{data ? data.enquiries.open : "-"} open in pipeline</span>
              <Link href="/dashboard/enquiries" className="text-blue-600 hover:underline inline-flex items-center">
                View all <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Receivables Outstanding Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Balance</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">
              {data ? `₹${Number(data.invoices.totalOutstanding).toLocaleString("en-IN")}` : "-"}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span>{data ? data.invoices.unpaidCount : "-"} unpaid invoices</span>
              <Link href="/dashboard/invoices" className="text-amber-600 hover:underline inline-flex items-center">
                Invoices <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quotations Pipeline Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Quotations</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">
              {data ? `₹${Number(data.quotations.totalValue).toLocaleString("en-IN")}` : "-"}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span>{data ? data.quotations.count : "-"} issued quotations</span>
              <Link href="/dashboard/quotations" className="text-emerald-600 hover:underline inline-flex items-center">
                Quotes <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Expiry / Stock Alert Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Batch Expiry & Low Stock</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">
              {data ? data.inventory.expiringSoonCount + data.inventory.lowStockCount : "-"}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span>{data ? data.inventory.expiringSoonCount : 0} near expiry, {data ? data.inventory.lowStockCount : 0} low stock</span>
              <Link href="/dashboard/inventory" className="text-rose-600 hover:underline inline-flex items-center">
                Inventory <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Critical Alerts & Inventory Watch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batches Expiring Within 90 Days */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-slate-900">Batches Approaching Expiry (&lt; 90 Days)</h2>
            </div>
            <Link href="/dashboard/inventory" className="text-xs text-blue-600 hover:underline">
              View All Batches
            </Link>
          </div>

          <div className="p-4 overflow-x-auto">
            {data?.inventory.expiringBatches && data.inventory.expiringBatches.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="pb-2 font-medium">Product</th>
                    <th className="pb-2 font-medium">Batch No</th>
                    <th className="pb-2 font-medium">Quantity</th>
                    <th className="pb-2 font-medium">Expiry Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.inventory.expiringBatches.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-medium text-slate-800">{b.product.name}</td>
                      <td className="py-2.5 text-slate-600 font-mono">{b.batchNumber}</td>
                      <td className="py-2.5 font-semibold text-slate-900">{b.currentQuantity} KG</td>
                      <td className="py-2.5 text-rose-600 font-medium">
                        {new Date(b.expiryDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">
                ✓ No batches approaching expiry in the next 90 days.
              </p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-semibold text-slate-900">Low Stock Threshold Alerts</h2>
            </div>
            <Link href="/dashboard/inventory" className="text-xs text-blue-600 hover:underline">
              Manage Stock
            </Link>
          </div>

          <div className="p-4 overflow-x-auto">
            {data?.inventory.lowStockProducts && data.inventory.lowStockProducts.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="pb-2 font-medium">Product</th>
                    <th className="pb-2 font-medium">SKU</th>
                    <th className="pb-2 font-medium">Current Stock</th>
                    <th className="pb-2 font-medium">Min Threshold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.inventory.lowStockProducts.map((p) => {
                    const currentTotal = p.batches.reduce((sum, b) => sum + b.currentQuantity, 0);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 font-medium text-slate-800">{p.name}</td>
                        <td className="py-2.5 text-slate-500 font-mono">{p.sku}</td>
                        <td className="py-2.5 font-bold text-rose-600">{currentTotal} KG</td>
                        <td className="py-2.5 text-slate-500">{p.minimumStock} KG</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">
                ✓ All active products are currently above their configured minimum stock thresholds.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Enquiries & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enquiries (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent Commercial Enquiries</h2>
            <Link href="/dashboard/enquiries" className="text-xs text-blue-600 hover:underline">
              View All Enquiries →
            </Link>
          </div>

          <div className="p-4 overflow-x-auto">
            {data?.recentEnquiries && data.recentEnquiries.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="pb-2 font-medium">Ref No</th>
                    <th className="pb-2 font-medium">Contact / Company</th>
                    <th className="pb-2 font-medium">Product</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentEnquiries.map((enq) => (
                    <tr key={enq.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-mono font-medium text-blue-700">{enq.enquiryNumber}</td>
                      <td className="py-3">
                        <div className="font-semibold text-slate-800">{enq.contactName}</div>
                        <div className="text-[11px] text-slate-400">{enq.companyName || "Independent"}</div>
                      </td>
                      <td className="py-3 text-slate-700">{enq.productOfInterest || "General Enquiry"}</td>
                      <td className="py-3">
                        <StatusBadge status={enq.status} />
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/dashboard/enquiries`}
                          className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">No enquiries recorded yet.</p>
            )}
          </div>
        </div>

        {/* Audit Log Stream (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-semibold text-slate-900">Audit History Stream</h2>
            </div>
            <Link href="/dashboard/audit-logs" className="text-xs text-blue-600 hover:underline">
              Full Logs
            </Link>
          </div>

          <div className="p-4 space-y-3">
            {data?.recentAuditLogs && data.recentAuditLogs.length > 0 ? (
              data.recentAuditLogs.map((log) => (
                <div key={log.id} className="text-xs border-b border-slate-50 pb-2.5 last:border-none">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 uppercase tracking-wider text-[10px]">
                      {log.entityType} • {log.action}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5 truncate">
                    Actor: {log.userEmail || "System Automation"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No audit records yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
