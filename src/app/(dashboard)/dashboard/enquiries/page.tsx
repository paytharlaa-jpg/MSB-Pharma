"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Search,
  Download,
  MessageCircle,
  Plus,
  RefreshCw,
  Clock,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { getWhatsAppClickToChatUrl } from "@/lib/whatsapp-service";

interface EnquiryNote {
  id: string;
  content: string;
  createdAt: string;
  author: { name: string };
}

interface Enquiry {
  id: string;
  enquiryNumber: string;
  contactName: string;
  companyName: string | null;
  email: string;
  phone: string;
  productOfInterest: string | null;
  category: string | null;
  requestedQuantity: number | null;
  unit: string | null;
  message: string;
  status: string;
  source: string;
  notes: string | null;
  createdAt: string;
  assignedTo: { id: string; name: string; email: string } | null;
  assignedToName: string | null;
  enquiryNotes: EnquiryNote[];
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  // Deep links from the dashboard's global search: /dashboard/...?search=<doc no>
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("search");
    if (q) setSearch(q);
  }, []);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [newNote, setNewNote] = useState("");
  const [assignName, setAssignName] = useState("");
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignSaved, setAssignSaved] = useState(false);
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/enquiries?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setEnquiries(json.enquiries);
        // update selected enquiry if modal is open
        if (selectedEnquiry) {
          const updated = json.enquiries.find((e: Enquiry) => e.id === selectedEnquiry.id);
          if (updated) setSelectedEnquiry(updated);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, selectedEnquiry]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEnquiries();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedEnquiry) return;
    setStatusUpdating(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedEnquiry.id, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedEnquiry(json.enquiry);
        fetchEnquiries();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStatusUpdating(false);
    }
  };

  // Keep the "Assigned to" box in step with the lead being managed
  useEffect(() => {
    setAssignName(selectedEnquiry?.assignedToName || "");
  }, [selectedEnquiry?.id, selectedEnquiry?.assignedToName]);
  useEffect(() => setAssignSaved(false), [selectedEnquiry?.id]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    setAssignSaving(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedEnquiry.id, assignedToName: assignName }),
      });
      const json = await res.json();
      if (json.success) {
        setSelectedEnquiry(json.enquiry);
        setAssignSaved(true);
        fetchEnquiries();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAssignSaving(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry || !newNote.trim()) return;
    setNoteSubmitting(true);
    try {
      const res = await fetch(`/api/enquiries/${selectedEnquiry.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setNewNote("");
        fetchEnquiries();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNoteSubmitting(false);
    }
  };

  const handleExport = (format: "csv" | "xlsx") => {
    window.location.href = `/api/reports?type=enquiries&format=${format}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enquiries & Leads</h1>
          <p className="text-xs text-slate-500 mt-1">
            Commercial requests from the public website, lead qualification and follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("xlsx")}>
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ref number, contact, company, email, product, assignee..."
            className="pl-9"
          />
        </div>

        <div className="w-full md:w-56 shrink-0">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: "All Statuses", value: "ALL" },
              { label: "New Leads", value: "NEW" },
              { label: "In Progress", value: "IN_PROGRESS" },
              { label: "Awaiting Customer", value: "AWAITING_CUSTOMER" },
              { label: "Quotation Sent", value: "QUOTATION_SENT" },
              { label: "Won Deals", value: "WON" },
              { label: "Lost Deals", value: "LOST" },
              { label: "Closed", value: "CLOSED" },
            ]}
          />
        </div>

        <Button variant="ghost" size="sm" onClick={fetchEnquiries} isLoading={loading}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {enquiries.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ref No</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Product of Interest</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-blue-700">{enq.enquiryNumber}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(enq.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{enq.contactName}</div>
                      <div className="text-[11px] text-slate-500">{enq.email} • {enq.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{enq.companyName || "-"}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">
                      {enq.productOfInterest || "General Enquiry"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-semibold">
                      {enq.requestedQuantity ? `${enq.requestedQuantity} ${enq.unit || "KG"}` : "-"}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={enq.status} />
                      {enq.assignedToName && (
                        <div className="mt-1 text-[11px] text-slate-500 whitespace-nowrap">
                          Assigned: <span className="font-semibold text-slate-700">{enq.assignedToName}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedEnquiry(enq)}
                      >
                        Manage Lead
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8">
              <EmptyState
                title="No enquiries found"
                description="Try clearing your search terms or filter settings."
              />
            </div>
          )}
        </div>
      </div>

      {/* Enquiry Detail & Follow-up Modal */}
      {selectedEnquiry && (
        <Modal
          isOpen={!!selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
          title={`Enquiry: ${selectedEnquiry.enquiryNumber}`}
          description={`Received on ${new Date(selectedEnquiry.createdAt).toLocaleString("en-IN")}`}
          maxWidth="xl"
        >
          <div className="space-y-6">
            {/* Top Info Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Contact Person</span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">{selectedEnquiry.contactName}</p>
                <p className="text-xs text-slate-500">{selectedEnquiry.companyName || "Individual Client"}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Communication</span>
                <p className="text-xs font-medium text-slate-900 mt-0.5">{selectedEnquiry.email}</p>
                <p className="text-xs text-slate-600">{selectedEnquiry.phone}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Product Interest</span>
                <p className="text-xs font-semibold text-[#00488F] mt-0.5">{selectedEnquiry.productOfInterest || "General"}</p>
                <p className="text-xs text-slate-600">
                  {selectedEnquiry.requestedQuantity ? `Qty: ${selectedEnquiry.requestedQuantity} ${selectedEnquiry.unit || "KG"}` : "Quantity unspecified"}
                </p>
              </div>
            </div>

            {/* Requirement Message */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase mb-1">Requirement Message:</h4>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {selectedEnquiry.message}
              </div>
            </div>

            {/* Assigned to (free text) */}
            <form onSubmit={handleAssign} className="flex flex-wrap items-end gap-3 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="assign-name" className="text-xs font-semibold text-slate-700 block mb-1">
                  Assigned to
                </label>
                <input
                  id="assign-name"
                  value={assignName}
                  onChange={(e) => {
                    setAssignName(e.target.value);
                    setAssignSaved(false);
                  }}
                  maxLength={80}
                  placeholder="Type the name of the person handling this lead"
                  className="w-full text-sm rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00488F]/30 focus:border-[#00488F]"
                />
              </div>
              <Button type="submit" size="sm" variant="primary" isLoading={assignSaving} disabled={(selectedEnquiry.assignedToName || "") === assignName.trim()}>
                {assignName.trim() ? "Save assignment" : "Clear assignment"}
              </Button>
              {assignSaved && <span className="text-xs font-semibold text-emerald-700">Saved</span>}
            </form>

            {/* Status Workflow & Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Status Workflow:</span>
                <select
                  value={selectedEnquiry.status}
                  disabled={statusUpdating}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-xs font-semibold rounded-lg border border-slate-300 bg-white px-3 py-1.5 focus:ring-2 focus:ring-[#00488F]"
                >
                  <option value="NEW">New</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="AWAITING_CUSTOMER">Awaiting Customer</option>
                  <option value="QUOTATION_SENT">Quotation Sent</option>
                  <option value="WON">Won Deal</option>
                  <option value="LOST">Lost Deal</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {/* WhatsApp Click-to-Chat Button */}
                <a
                  href={getWhatsAppClickToChatUrl({
                    productName: selectedEnquiry.productOfInterest || undefined,
                    enquiryNumber: selectedEnquiry.enquiryNumber,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="brand-green" size="sm">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Client</span>
                  </Button>
                </a>
              </div>
            </div>

            {/* Internal Notes and Activity Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-700 uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Internal Notes & Activity Log</span>
              </h4>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <Input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record call summary, price discussion, or customer remarks..."
                  className="text-xs"
                />
                <Button type="submit" size="sm" variant="primary" isLoading={noteSubmitting}>
                  <Send className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </Button>
              </form>

              {/* Notes List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
                {selectedEnquiry.enquiryNotes && selectedEnquiry.enquiryNotes.length > 0 ? (
                  selectedEnquiry.enquiryNotes.map((note) => (
                    <div key={note.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between text-slate-500 text-[10px] mb-1">
                        <span className="font-semibold text-slate-700">{note.author?.name || "Admin"}</span>
                        <span>{new Date(note.createdAt).toLocaleString("en-IN")}</span>
                      </div>
                      <p className="text-slate-800">{note.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">No follow-up notes logged yet.</p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
