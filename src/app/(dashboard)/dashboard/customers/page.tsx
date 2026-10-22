"use client";

import React, { useEffect, useState } from "react";
import { Users, Plus, RefreshCw, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";

interface Customer {
  id: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  gstin: string | null;
  pan: string | null;
  notes: string | null;
  _count: { quotations: number; invoices: number; deliveryChallans: number };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
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

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customers");
      const json = await res.json();
      if (json.success) setCustomers(json.customers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setModalOpen(false);
        setForm({ name: "", contactPerson: "", email: "", phone: "", address: "", gstin: "", pan: "", notes: "" });
        fetchCustomers();
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Master Records</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pharmaceutical formulation manufacturers, procurement desks, and trading partners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchCustomers} isLoading={loading}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>

          <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((c) => (
          <div key={c.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-sm text-slate-900">{c.name}</h3>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
                  {c._count.invoices} Inv • {c._count.quotations} Qtn
                </span>
              </div>
              {c.contactPerson && <p className="text-xs text-slate-500 mt-1">Attn: {c.contactPerson}</p>}

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                {c.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.email}</span>
                  </div>
                )}
                {c.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.phone}</span>
                  </div>
                )}
                {c.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{c.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>GSTIN: {c.gstin || "Unrecorded"}</span>
              <span>PAN: {c.pan || "-"}</span>
            </div>
          </div>
        ))}

        {customers.length === 0 && !loading && (
          <div className="col-span-full">
            <EmptyState title="No customer accounts registered yet" />
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Customer Account" maxWidth="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Company / Customer Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Dr. Reddy's Laboratories Ltd"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Person"
              value={form.contactPerson}
              onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
              placeholder="e.g. Purchase Manager"
            />
            <Input
              label="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98490..."
            />
          </div>

          <Input
            label="Business Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="procurement@company.com"
          />

          <Textarea
            label="Billing & Shipping Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            rows={2}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="GSTIN Number"
              value={form.gstin}
              onChange={(e) => setForm({ ...form, gstin: e.target.value })}
              placeholder="36AAAA..."
            />
            <Input
              label="PAN Number"
              value={form.pan}
              onChange={(e) => setForm({ ...form, pan: e.target.value })}
              placeholder="AAAAA0000A"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={submitting}>
              Save Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
