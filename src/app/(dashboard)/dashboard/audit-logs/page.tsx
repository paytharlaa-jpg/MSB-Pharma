"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";

interface AuditLogEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userEmail: string | null;
  details: string;
  ipAddress: string | null;
  createdAt: string;
  performedBy: { name: string; role: string } | null;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (entityFilter !== "ALL") params.set("entityType", entityFilter);

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      const json = await res.json();
      if (json.success) setLogs(json.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [entityFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security & Audit History</h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable tracking of logins, manual stock adjustments, status modifications, and data exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-48">
            <Select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              options={[
                { label: "All Entity Types", value: "ALL" },
                { label: "Stock Adjustments", value: "STOCK" },
                { label: "Enquiries", value: "ENQUIRY" },
                { label: "Products", value: "PRODUCT" },
                { label: "Invoices", value: "INVOICE" },
                { label: "Payments", value: "PAYMENT" },
                { label: "Quotations", value: "QUOTATION" },
                { label: "Purchase Orders", value: "PO" },
                { label: "Goods Receipt", value: "GRN" },
                { label: "Challans", value: "CHALLAN" },
                { label: "Data Exports", value: "REPORT" },
                { label: "User Authentication", value: "USER" },
              ]}
            />
          </div>

          <Button variant="outline" size="sm" onClick={fetchLogs} isLoading={loading}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {logs.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Audit Payload / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.createdAt).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#00488F] text-[11px]">{log.action}</td>
                    <td className="py-3 px-4 text-slate-700">
                      <div className="font-medium">{log.performedBy?.name || "System"}</div>
                      <div className="text-[10px] text-slate-400">{log.userEmail || "-"}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 max-w-md truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8">
              <EmptyState title="No audit entries matching filter" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
