"use client";

import React, { useEffect, useState } from "react";
import { Truck, Plus, RefreshCw, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";

interface Supplier {
  id: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  gstin: string | null;
  pan: string | null;
  notes: string | null;
  _count: { purchaseOrders: number; goodsReceiptNotes: number; batches: number };
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    gstin: "",
    pan: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/suppliers");
      const json = await res.json();
      if (json.success) setSuppliers(json.suppliers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setModalOpen(false);
        setForm({ name: "", contactPerson: "", email: "", phone: "", address: "", gstin: "", pan: "", notes: "" });
        fetchSuppliers();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Supplier Master Records</h1>
          <p className="text-xs text-slate-500 mt-1">
            Vetted primary chemical synthesizers, bulk drug manufacturers, and API vendors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSuppliers} isLoading={loading}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>

          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>Add Supplier</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((s) => (
          <div key={s.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-sm text-slate-900">{s.name}</h3>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
                  {s._count.purchaseOrders} PO • {s._count.goodsReceiptNotes} GRN
                </span>
              </div>
              {s.contactPerson && <p className="text-xs text-slate-500 mt-1">Vendor Contact: {s.contactPerson}</p>}

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                {s.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.email}</span>
                  </div>
                )}
                {s.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.phone}</span>
                  </div>
                )}
                {s.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{s.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>GSTIN: {s.gstin || "Unrecorded"}</span>
              <span>PAN: {s.pan || "-"}</span>
            </div>
          </div>
        ))}

        {suppliers.length === 0 && !loading && (
          <div className="col-span-full">
            <EmptyState title="No supplier accounts registered yet" />
          </div>
        )}
      </div>

      {/* Add Supplier Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Supplier Account" maxWidth="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Supplier Company Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Deccan Fine Chemicals Pvt Ltd"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Person"
              value={form.contactPerson}
              onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
              placeholder="e.g. Sales Manager"
            />
            <Input
              label="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 891 282..."
            />
          </div>

          <Input
            label="Commercial Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="sales@supplier.com"
          />

          <Textarea
            label="Factory / Registered Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            rows={2}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="GSTIN Number"
              value={form.gstin}
              onChange={(e) => setForm({ ...form, gstin: e.target.value })}
              placeholder="37AAAC..."
            />
            <Input
              label="PAN Number"
              value={form.pan}
              onChange={(e) => setForm({ ...form, pan: e.target.value })}
              placeholder="AAACD0000E"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
              Save Supplier
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
