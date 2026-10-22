"use client";

import React, { useState } from "react";
import { MessageCircle, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface Category {
  id: string;
  name: string;
}

export function PublicEnquiryForm({
  categories = [],
  defaultProduct = "",
}: {
  categories?: Category[];
  defaultProduct?: string;
}) {
  const [form, setForm] = useState({
    contactName: "",
    companyName: "",
    email: "",
    phone: "",
    productOfInterest: defaultProduct,
    category: "",
    requestedQuantity: "",
    unit: "KG",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<{
    enquiryNumber: string;
    whatsappUrl: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit enquiry");

      setSubmitted({
        enquiryNumber: data.enquiry.enquiryNumber,
        whatsappUrl: data.whatsappUrl,
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h3 className="text-xl font-bold text-slate-900">Enquiry Received Successfully!</h3>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 max-w-md mx-auto space-y-1">
          <p>
            Your Reference Number is: <strong className="text-blue-700 font-mono">{submitted.enquiryNumber}</strong>
          </p>
          <p className="text-slate-500">
            Our commercial sales team in Hyderabad will review your requirement and email the technical COA and quotation shortly.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href={submitted.whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="brand-green" size="md">
              <MessageCircle className="w-4 h-4" />
              <span>Connect Immediately on WhatsApp</span>
            </Button>
          </a>

          <Button
            variant="outline"
            size="md"
            onClick={() => {
              setSubmitted(null);
              setForm({
                contactName: "",
                companyName: "",
                email: "",
                phone: "",
                productOfInterest: "",
                category: "",
                requestedQuantity: "",
                unit: "KG",
                message: "",
              });
            }}
          >
            Submit Another Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-lg font-bold text-slate-900">Commercial Request for Quotation (RFQ)</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Enter requirement specifications for fast commercial quote & analytical documentation.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label="Your Full Name *"
          value={form.contactName}
          onChange={(e) => setForm({ ...form, contactName: e.target.value })}
          placeholder="e.g. Dr. Ramesh Kumar"
          required
        />

        <Input
          label="Company / Formulation Plant"
          value={form.companyName}
          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          placeholder="e.g. Aurobindo Pharma Ltd"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label="Corporate Email *"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="procurement@company.com"
          required
        />

        <Input
          label="Phone / Mobile Number *"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+91 98490..."
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="sm:col-span-2">
          <Input
            label="Product of Interest (API / CAS / Intermediate)"
            value={form.productOfInterest}
            onChange={(e) => setForm({ ...form, productOfInterest: e.target.value })}
            placeholder="e.g. Atorvastatin Calcium or Montelukast"
          />
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <Input
            label="Quantity"
            type="number"
            value={form.requestedQuantity}
            onChange={(e) => setForm({ ...form, requestedQuantity: e.target.value })}
            placeholder="50"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Unit</label>
            <select
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00488F]"
            >
              <option value="KG">KG</option>
              <option value="G">Grams</option>
              <option value="MT">MT</option>
              <option value="L">Liters</option>
            </select>
          </div>
        </div>
      </div>

      <Textarea
        label="Requirement Details / Message *"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        placeholder="Please specify grade (IP/BP/USP), delivery timeline, target quantity, or sample requirements..."
        rows={3}
        required
      />

      <div className="pt-2">
        <Button type="submit" variant="primary" size="md" className="w-full" isLoading={loading}>
          <Send className="w-4 h-4 mr-1.5" />
          <span>Submit Commercial RFQ</span>
        </Button>
      </div>
    </form>
  );
}
