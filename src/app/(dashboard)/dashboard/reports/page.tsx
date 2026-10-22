"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BarChart3, Download, RefreshCw, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("enquiries");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("type", reportType);
      params.set("format", "json");
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await fetch(`/api/reports?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setPreviewData(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [reportType, startDate, endDate]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleExport = (format: "csv" | "xlsx") => {
    const params = new URLSearchParams();
    params.set("type", reportType);
    params.set("format", format);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    window.open(`/api/reports?${params.toString()}`, "_blank");
  };

  const columns = previewData.length > 0 ? Object.keys(previewData[0]) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Data Exports</h1>
          <p className="text-xs text-slate-500 mt-1">
            Date-filtered operational reporting, audit-logged CSV/Excel exports with formula sanitization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>

          <Button variant="primary" size="sm" onClick={() => handleExport("xlsx")}>
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel (.xlsx)</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <Select
            label="Report Category"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={[
              { label: "Enquiries & Leads Report", value: "enquiries" },
              { label: "Invoices & Receivables Report", value: "invoices" },
              { label: "Inventory & Batch Expiry Report", value: "inventory" },
              { label: "Quotations Report", value: "quotations" },
              { label: "Purchase Orders Report", value: "purchasing" },
              { label: "Goods Receipt Notes (GRN) Report", value: "grn" },
              { label: "Delivery Challans Report", value: "challans" },
            ]}
          />
        </div>

        <div>
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="flex items-end gap-2">
          <Button
            variant="outline"
            size="md"
            className="w-full"
            onClick={fetchReportData}
            isLoading={loading}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Apply Filters</span>
          </Button>
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-semibold text-slate-700 uppercase">
            Data Preview: {previewData.length} records matching filter
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Formula-injection safe</span>
        </div>

        <div className="overflow-x-auto">
          {previewData.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="py-3 px-4 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewData.slice(0, 50).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    {columns.map((col) => (
                      <td key={col} className="py-3 px-4 whitespace-nowrap text-slate-800">
                        {String(row[col] ?? "-")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8">
              <EmptyState title="No records found in selected date range" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
