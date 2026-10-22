"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  Save,
  CheckCircle2,
  Shield,
  Mail,
  MessageCircle,
  Database,
  KeyRound,
  Copy,
  Check,
  AlertCircle,
  UserCheck,
} from "lucide-react";
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
  enquiryNotificationEmail: string;
}

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Staff user management
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [resetModalUser, setResetModalUser] = useState<StaffUser | null>(null);
  const [generatedResetUrl, setGeneratedResetUrl] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((res) => res.json()),
      fetch("/api/admin/users").then((res) => res.json()),
    ])
      .then(([settingsData, usersData]) => {
        if (settingsData.success) setSettings(settingsData.settings);
        if (usersData.success) setStaffUsers(usersData.users || []);
      })
      .catch(console.error)
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

  const initiateStaffReset = async (user: StaffUser) => {
    setResetModalUser(user);
    setGeneratedResetUrl(null);
    setResetLoading(true);
    setCopied(false);

    try {
      const res = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, sendEmail: true }),
      });
      const data = await res.json();
      if (data.success && data.resetUrl) {
        setGeneratedResetUrl(data.resetUrl);
      }
    } catch (err) {
      console.error("Failed to generate staff reset link:", err);
    } finally {
      setResetLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedResetUrl) return;
    navigator.clipboard.writeText(generatedResetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading || !settings) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading system configuration...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">System Configuration</h1>
          <p className="text-xs text-slate-500 mt-1">
            Corporate settings, statutory tax information, notification dispatch addresses, and staff security controls.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings successfully saved and synchronized across all operational modules.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
        {/* Section 1: Business Identity */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            Company Profile & Business Identity
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Legal Corporate Name"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              required
            />
            <Input
              label="Primary Phone Number"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <Input
              label="Confirmed Business Email (Public Display)"
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              required
            />
            <div>
              <Input
                label="Enquiry Notification Recipient Email"
                type="email"
                value={settings.enquiryNotificationEmail || "paytharlaa@gmail.com"}
                onChange={(e) => setSettings({ ...settings, enquiryNotificationEmail: e.target.value })}
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                All public RFQ submissions & enquiries are dispatched immediately to this email.
              </p>
            </div>
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

        {/* Section 2: Statutory Tax & Banking */}
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

        {/* Section 3: Document Terms */}
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
            <Save className="w-4 h-4 mr-1.5" />
            <span>Save Configuration</span>
          </Button>
        </div>
      </form>

      {/* Section 4: Super Admin Staff Security & Password Reset Management */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Staff Accounts & Password Management</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Super Admin can initiate secure, single-use password resets for operational staff.
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {staffUsers.length} Registered Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Staff Name</th>
                <th className="py-2.5 px-3">Corporate Email</th>
                <th className="py-2.5 px-3">System Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-800 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                      {user.name.charAt(0)}
                    </div>
                    <span>{user.name}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{user.email}</td>
                  <td className="py-3 px-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => initiateStaffReset(user)}
                      className="text-[11px] h-7 px-2.5"
                    >
                      <KeyRound className="w-3 h-3 mr-1 text-blue-600" />
                      <span>Reset Password</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Password Reset Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Initiate Staff Password Reset</h3>
                  <p className="text-[11px] text-slate-500">
                    Target: {resetModalUser.name} ({resetModalUser.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetModalUser(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {resetLoading ? (
              <div className="py-8 text-center text-slate-500 space-y-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs">Generating single-use cryptographic token...</p>
              </div>
            ) : generatedResetUrl ? (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>
                    A secure password reset email has been dispatched to <strong>{resetModalUser.email}</strong>.
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Direct Reset Link (Valid for 30 minutes, single-use):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedResetUrl}
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700 select-all"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="shrink-0 text-xs"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700">Security Guarantees:</p>
                  <p>• Plaintext passwords are never revealed or transmitted.</p>
                  <p>• Once used or after 30 minutes, this link expires permanently.</p>
                  <p>• Action is logged to the system audit trail.</p>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => setResetModalUser(null)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                Failed to generate reset link. Please try again.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
