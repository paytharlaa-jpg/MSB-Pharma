"use client";

import React, { useEffect, useState } from "react";
import { Settings, Save, CheckCircle2, AlertCircle, Shield, Mail, MessageCircle, Database } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface SiteSettings {
  id: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  panNumber: string;
  bankDetails: string;
  invoiceTerms: string;
  quotationTerms: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setSettings(json.settings);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading system configuration...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System & Business Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Confirmed company identity, statutory taxation placeholders, document terms, and integration readiness.
          </p>
        </div>

        {successMsg && (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settings updated successfully
          </span>
        )}
      </div>

      {/* Integration Readiness Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Email Notification Status */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-blue-600" />
              <span>Email Service</span>
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Phase 1 Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Receiving enquiries & sending internal notifications to mohank9@gmail.com.
          </p>
        </div>

        {/* WhatsApp Integration Status */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Integration</span>
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Click-to-Chat Ready
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Connected to +91 8008335333. Phase 2 Cloud API boundary configured.
          </p>
        </div>

        {/* Database & Backups */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#00488F]" />
              <span>Database Persistence</span>
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Healthy
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Local relational persistence enabled. PostgreSQL migration guide in docs.
          </p>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            Company & Verified Contact Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Company Name"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              required
            />
            <Input
              label="Confirmed Contact Phone"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              required
            />
            <Input
              label="Confirmed Business Email"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              required
            />
          </div>

          <div className="mt-4">
            <Textarea
              label="Confirmed Registered Address"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              rows={2}
              required
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Statutory Taxation & Banking Information
            </h3>
            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium border border-amber-200">
              [Placeholders - Edit when verified]
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="GSTIN Identifier"
              value={settings.gstNumber}
              onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })}
            />
            <Input
              label="PAN Identifier"
              value={settings.panNumber}
              onChange={(e) => setSettings({ ...settings, panNumber: e.target.value })}
            />
          </div>

          <div className="mt-4">
            <Textarea
              label="Banking & Remittance Information (Printed on Tax Invoices)"
              value={settings.bankDetails}
              onChange={(e) => setSettings({ ...settings, bankDetails: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            Document Terms & Legal Jurisdiction
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Textarea
              label="Standard Invoice Terms"
              value={settings.invoiceTerms}
              onChange={(e) => setSettings({ ...settings, invoiceTerms: e.target.value })}
              rows={4}
            />
            <Textarea
              label="Standard Quotation Terms"
              value={settings.quotationTerms}
              onChange={(e) => setSettings({ ...settings, quotationTerms: e.target.value })}
              rows={4}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button type="submit" variant="primary" size="md" isLoading={saving}>
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
