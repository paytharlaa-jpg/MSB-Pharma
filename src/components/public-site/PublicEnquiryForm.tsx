"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Send,
  User,
  Building2,
  Mail,
  Phone,
  FlaskConical,
  Scale,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  Award,
  Clock,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { getWhatsAppClickToChatUrl } from "@/lib/whatsapp-service";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface Category {
  id: string;
  name: string;
}

export interface PublicEnquiryFormProps {
  categories?: Category[];
  defaultProduct?: string;
  asCard?: boolean;
  className?: string;
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

const PHARMACOPOEIA_GRADES = [
  { id: "IP", label: "IP (Indian)" },
  { id: "BP", label: "BP (British)" },
  { id: "USP", label: "USP (United States)" },
  { id: "EP", label: "EP (European)" },
  { id: "IN", label: "IN (In-House)" },
  { id: "SAMPLE", label: "Working Sample" },
];

const BUSINESS_TYPES = [
  "Formulation / Finished Dosage Manufacturer",
  "API / Bulk Drug Manufacturer",
  "Contract Manufacturing (CDMO / CRAMS)",
  "Pharmaceutical Trader / Distributor",
  "R&D / Analytical Testing Laboratory",
  "Biotech & Life Sciences",
  "Hospital / Institutional Procurement",
  "Other",
];

const DEFAULT_CATEGORIES = [
  { id: "apis", name: "Active Pharmaceutical Ingredients (APIs)" },
  { id: "excipients", name: "Pharmaceutical Excipients" },
  { id: "intermediates", name: "Raw Materials & Intermediates" },
  { id: "solvents", name: "Chemicals & Solvents" },
  { id: "impurities", name: "Impurity Reference Standards" },
];

export function PublicEnquiryForm({
  categories = [],
  defaultProduct = "",
  asCard = true,
  className = "",
  title = "Commercial Request for Quotation (RFQ)",
  subtitle = "Direct submission to Hyderabad procurement desk. Technical COA, MOA & pricing dispatched within 24h.",
  showLogo = true,
}: PublicEnquiryFormProps) {
  const effectiveCategories = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  const [form, setForm] = useState({
    contactName: "",
    companyName: "",
    businessType: "",
    email: "",
    phone: "",
    productOfInterest: defaultProduct || "",
    category: "",
    requestedQuantity: "",
    unit: "KG",
    message: "",
  });

  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState<{
    enquiryNumber: string;
    whatsappUrl: string;
    contactName: string;
    product: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync defaultProduct when prop changes
  useEffect(() => {
    if (defaultProduct) {
      setForm((prev) => ({
        ...prev,
        productOfInterest: defaultProduct,
      }));
    }
  }, [defaultProduct]);

  const toggleGrade = (gradeId: string, gradeLabel: string) => {
    if (selectedGrade === gradeId) {
      setSelectedGrade(null);
    } else {
      setSelectedGrade(gradeId);
      // If message is empty or doesn't mention grade, gently append it
      if (!form.message.includes(gradeId)) {
        setForm((prev) => ({
          ...prev,
          message: prev.message
            ? `${prev.message.trim()} (Required Grade: ${gradeId})`
            : `Please provide quote and COA for ${gradeLabel} standard.`,
        }));
      }
    }
  };

  const copyEnquiryNumber = async () => {
    if (!submitted?.enquiryNumber) return;
    try {
      await navigator.clipboard.writeText(submitted.enquiryNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const resetForm = () => {
    setSubmitted(null);
    setSelectedGrade(null);
    setForm({
      contactName: "",
      companyName: "",
      businessType: "",
      email: "",
      phone: "",
      productOfInterest: "",
      category: "",
      requestedQuantity: "",
      unit: "KG",
      message: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const payload = {
        ...form,
        message: form.businessType
          ? `[Business Type: ${form.businessType}]\n${form.message}`
          : form.message,
      };

      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit enquiry");

      setSubmitted({
        enquiryNumber: data.enquiry.enquiryNumber,
        whatsappUrl: data.whatsappUrl,
        contactName: form.contactName,
        product: form.productOfInterest,
      });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS / CONFIRMATION TICKET VIEW
  if (submitted) {
    const successContent = (
      <div className="py-6 px-2 sm:px-4 text-center space-y-6">
        {/* Check Icon with Brand Gradient Glow */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#edf8eb] via-emerald-100 to-[#edf3fd] border-2 border-[#3a991d]/30 flex items-center justify-center text-[#3a991d] shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-[#edf8eb] to-[#edf3fd] text-[#3a991d] border border-[#3a991d]/30">
            <Check className="w-3 h-3 text-[#3a991d]" />
            <span>RFQ Registered Successfully</span>
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading pt-1">
            Commercial Enquiry Dispatched
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Our procurement desk in Kukatpally, Hyderabad has received your requirement. Batch COA, pharmacopoeial monograph confirmation, and wholesale pricing will be emailed promptly.
          </p>
        </div>

        {/* Official Reference Ticket Box */}
        <div className="max-w-md mx-auto rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 p-5 shadow-xs text-left space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Official Reference ID
              </p>
              <p className="text-lg font-bold font-mono text-[#1b4db3]">
                {submitted.enquiryNumber}
              </p>
            </div>
            <button
              type="button"
              onClick={copyEnquiryNumber}
              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
            <div>
              <span className="text-slate-400 text-[10px] block">Procurement Officer:</span>
              <span className="font-semibold text-slate-800 truncate block">
                {submitted.contactName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">Material Sourced:</span>
              <span className="font-semibold text-slate-800 truncate block">
                {submitted.product || "Commercial Inquiry"}
              </span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={submitted.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#3a991d] hover:bg-[#2e7b17] text-white text-xs font-bold transition-all shadow-md shadow-[#3a991d]/20 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Track on WhatsApp Instantly</span>
          </a>

          <button
            type="button"
            onClick={resetForm}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
          >
            Submit Another RFQ
          </button>
        </div>
      </div>
    );

    if (!asCard) return successContent;

    return (
      <div
        className={twMerge(
          "relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-900/10 text-slate-900",
          className
        )}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-[#1b4db3] via-[#2563eb] to-[#3a991d]" />
        <div className="p-6 sm:p-8">{successContent}</div>
      </div>
    );
  }

  // FORM CONTENT
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Brand Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          {showLogo && (
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-slate-100 p-1 border border-slate-200 shadow-sm shrink-0 flex items-center justify-center">
              <Image
                src="/images/logo-msb-pharmachem.png"
                alt="MSB PHARMACHEM"
                width={38}
                height={38}
                className="rounded-xl object-contain"
              />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-[#edf3fd] to-[#edf8eb] text-[#143e94] border border-[#1b4db3]/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3a991d] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3a991d]"></span>
                </span>
                <span>Commercial Desk</span>
              </span>
              <span className="text-xs font-medium text-slate-500">• Hyderabad</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#143e94] font-heading">
              {title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Selected Product Pill (if present) */}
      {form.productOfInterest && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#edf3fd] via-[#f7faff] to-[#edf8eb] border border-[#1b4db3]/25 text-xs text-slate-700">
          <div className="flex items-center gap-2 min-w-0">
            <FlaskConical className="w-4 h-4 text-[#1b4db3] shrink-0" />
            <span className="text-slate-600 text-xs font-semibold">Target Material:</span>
            <span className="font-bold text-[#143e94] font-mono truncate text-sm">
              {form.productOfInterest}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setForm({ ...form, productOfInterest: "" })}
            className="text-xs text-slate-500 hover:text-red-600 hover:underline shrink-0 ml-2 font-medium"
          >
            Clear
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Row 1: Full Name & Company */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-bold text-[#143e94] block mb-1.5">
            Full Name <span className="text-[#1b4db3]">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={form.contactName}
              onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              placeholder="e.g. Dr. Ramesh Kumar"
              required
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1b4db3] focus:ring-4 focus:ring-[#1b4db3]/10 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-[#143e94] block mb-1.5">
            Company <span className="text-[#1b4db3]">*</span>
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              placeholder="e.g. Aurobindo Pharma Ltd"
              required
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1b4db3] focus:ring-4 focus:ring-[#1b4db3]/10 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Row 2: Business Type & Corporate Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-bold text-[#143e94] block mb-1.5">
            Business Type <span className="text-[#1b4db3]">*</span>
          </label>
          <div className="relative">
            <select
              value={form.businessType}
              onChange={(e) => setForm({ ...form, businessType: e.target.value })}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#1b4db3] focus:ring-4 focus:ring-[#1b4db3]/10 transition-colors font-medium"
            >
              <option value="">Select Business Type...</option>
              {BUSINESS_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-[#143e94] block mb-1.5">
            Corporate Email <span className="text-[#1b4db3]">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="procurement@company.com"
              required
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1b4db3] focus:ring-4 focus:ring-[#1b4db3]/10 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Row 3: Phone & Product Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-bold text-[#143e94] block mb-1.5">
            Phone / Mobile (WhatsApp) <span className="text-[#3a991d]">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-[#3a991d] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 98490..."
              required
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3a991d] focus:ring-4 focus:ring-[#3a991d]/10 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-[#143e94] block mb-1.5">
            Product of Interest (API / CAS / Intermediates)
          </label>
          <div className="relative">
            <FlaskConical className="w-4 h-4 text-[#1b4db3] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={form.productOfInterest}
              onChange={(e) => setForm({ ...form, productOfInterest: e.target.value })}
              placeholder="e.g. Atorvastatin Calcium or Montelukast Sodium"
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1b4db3] focus:ring-4 focus:ring-[#1b4db3]/10 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Row 4: Product Category (Required) & Quantity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-bold text-[#143e94] block mb-1.5">
            Product Category <span className="text-[#1b4db3]">*</span>
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#1b4db3] focus:ring-4 focus:ring-[#1b4db3]/10 transition-colors font-medium"
          >
            <option value="">Select Category...</option>
            {effectiveCategories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-bold text-[#143e94] block mb-1.5">
            Requested Quantity
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            <div className="col-span-3 relative">
              <Scale className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="number"
                value={form.requestedQuantity}
                onChange={(e) => setForm({ ...form, requestedQuantity: e.target.value })}
                placeholder="50"
                className="w-full rounded-xl border border-slate-300 bg-white pl-8 pr-2 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1b4db3] focus:ring-4 focus:ring-[#1b4db3]/10 transition-colors"
              />
            </div>
            <div className="col-span-2">
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-2 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#1b4db3] focus:ring-4 focus:ring-[#1b4db3]/10 transition-colors font-medium"
              >
                <option value="KG">KG</option>
                <option value="G">Grams</option>
                <option value="MT">MT</option>
                <option value="L">Liters</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Target Standard / Grade: MOVED DIRECTLY BEHIND PRODUCT CATEGORY */}
      <div className="rounded-2xl bg-gradient-to-r from-[#edf3fd]/60 to-[#edf8eb]/60 border border-[#1b4db3]/20 p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-[#143e94] flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#3a991d]" />
            <span>Target Standard / Grade:</span>
          </label>
          <span className="text-xs text-slate-500 font-medium">Select required pharmacopoeia</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PHARMACOPOEIA_GRADES.map((grade) => {
            const active = selectedGrade === grade.id;
            return (
              <button
                key={grade.id}
                type="button"
                onClick={() => toggleGrade(grade.id, grade.label)}
                className={twMerge(
                  "text-xs sm:text-sm px-3.5 py-1.5 rounded-xl border transition-all duration-150 select-none flex items-center gap-1.5 shadow-2xs",
                  active
                    ? "bg-gradient-to-r from-[#1b4db3] to-[#3a991d] text-white border-transparent shadow-sm font-bold scale-102"
                    : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300 font-semibold"
                )}
              >
                {active && <Check className="w-3.5 h-3.5 text-white" />}
                <span>{grade.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 5: Requirement Details / Message */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-bold text-[#143e94] flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#1b4db3]" />
            <span>Material Specifications & Commercial Notes <span className="text-[#1b4db3]">*</span></span>
          </label>
          <span className="text-xs text-slate-500 font-medium">COA, delivery timeline, payment terms</span>
        </div>
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Please specify target assay purity, delivery timeline to facility, sample dispatch requirement, or packaging specifications..."
          rows={3}
          required
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1b4db3] focus:ring-4 focus:ring-[#1b4db3]/10 transition-colors resize-none font-medium"
        />
      </div>

      {/* Logo Colors Grade CTA Submit Button */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={loading}
          className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-[#1b4db3] via-[#1a44a1] to-[#3a991d] hover:from-[#153e94] hover:to-[#2e7b17] text-white font-bold py-3.5 px-6 shadow-lg shadow-[#1b4db3]/20 hover:shadow-xl hover:shadow-[#3a991d]/25 transition-all duration-300 flex items-center justify-center gap-2 text-sm select-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Subtle light shimmer overlay */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000" />
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Dispatching RFQ to Commercial Desk...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              <span>Submit Commercial RFQ</span>
              <ArrowRight className="w-4 h-4 opacity-75 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </>
          )}
        </button>
      </div>

      {/* Fast WhatsApp Alternative Row */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-[#edf8eb] to-[#edf3fd] border border-[#3a991d]/25 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 text-slate-700 text-left">
          <MessageCircle className="w-4 h-4 text-[#3a991d] shrink-0" />
          <span className="text-[11px] sm:text-xs">
            Need urgent pricing or working sample availability?
          </span>
        </div>
        <a
          href={getWhatsAppClickToChatUrl({
            customText: form.productOfInterest
              ? `Hello MSB PHARMACHEM, I am requesting instant quote and COA for ${form.productOfInterest}.`
              : "Hello MSB PHARMACHEM, I would like to inquire about material availability and commercial pricing.",
          })}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-3 py-1.5 rounded-lg bg-[#3a991d] hover:bg-[#2e7b17] text-white text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp Sales Desk (+91 8008335333)</span>
        </a>
      </div>

      {/* Trust Badges Strip (Card Footer) */}
      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#1b4db3] shrink-0" />
          <span className="font-medium">WHO-GMP & cGMP Vetted</span>
        </div>
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#3a991d] shrink-0" />
          <span className="font-medium">Batch Analytical COA Included</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#1b4db3] shrink-0" />
          <span className="font-medium">24h Dispatch from Hyderabad</span>
        </div>
      </div>
    </form>
  );

  if (!asCard) return formContent;

  return (
    <div
      className={twMerge(
        "relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-900/10 text-slate-900 transition-all",
        className
      )}
    >
      {/* Top Logo-Color Brand Gradient Accent Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#1b4db3] via-[#2563eb] to-[#3a991d]" />

      {/* Soft Decorative Ambient Background Glows in Brand Logo Colors */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-60 h-60 bg-gradient-to-br from-[#1b4db3]/15 via-[#2563eb]/10 to-[#3a991d]/10 rounded-full blur-3xl opacity-60" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-60 h-60 bg-gradient-to-tr from-[#3a991d]/15 via-[#2563eb]/10 to-[#1b4db3]/10 rounded-full blur-3xl opacity-50" />

      <div className="relative p-6 sm:p-8">{formContent}</div>
    </div>
  );
}
