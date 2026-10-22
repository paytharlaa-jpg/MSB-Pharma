"use client";

import React from "react";
import Link from "next/link";
import { NotificationBell } from "./NotificationBell";
import { User, Settings, Shield } from "lucide-react";
import { SessionUser } from "@/lib/auth";

interface DashboardHeaderProps {
  user: SessionUser;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const roleDisplay = {
    SUPER_ADMIN: { label: "Super Admin", color: "bg-purple-50 text-purple-700 border-purple-200" },
    SALES: { label: "Sales Lead", color: "bg-blue-50 text-blue-700 border-blue-200" },
    ACCOUNTS: { label: "Accounts Dept", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    INVENTORY: { label: "Inventory Officer", color: "bg-amber-50 text-amber-700 border-amber-200" },
  }[user.role] || { label: user.role, color: "bg-slate-100 text-slate-700 border-slate-200" };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3 flex items-center justify-between">
      {/* Left Title / Breadcrumb Area */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            MSB PHARMACHEM • Operations Panel
          </p>
          <h1 className="text-sm font-bold text-slate-800">
            Enterprise Business Management System
          </h1>
        </div>
      </div>

      {/* Right Controls: Notifications & User Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* In-Panel Notifications */}
        <NotificationBell />

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* User Badge & Profile */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[140px]">
              {user.name}
            </p>
            <span
              className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-medium border ${roleDisplay.color}`}
            >
              {roleDisplay.label}
            </span>
          </div>
        </div>

        {/* Quick Settings */}
        {user.role === "SUPER_ADMIN" && (
          <Link
            href="/dashboard/settings"
            title="System Settings"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors hidden sm:flex items-center"
          >
            <Settings className="w-4 h-4" />
          </Link>
        )}
      </div>
    </header>
  );
}
