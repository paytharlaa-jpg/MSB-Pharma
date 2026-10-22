"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  MessageSquare,
  Package,
  Boxes,
  Users,
  Truck,
  FileSpreadsheet,
  FileText,
  Receipt,
  FileCheck2,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { canAccessModule } from "@/lib/permissions";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function Sidebar({ user }: { user: UserInfo | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, module: "dashboard" },
    { label: "Enquiries & Leads", href: "/dashboard/enquiries", icon: MessageSquare, module: "enquiries" },
    { label: "Product Master", href: "/dashboard/products", icon: Package, module: "products" },
    { label: "Inventory & Batches", href: "/dashboard/inventory", icon: Boxes, module: "inventory" },
    { label: "Customers", href: "/dashboard/customers", icon: Users, module: "customers" },
    { label: "Suppliers", href: "/dashboard/suppliers", icon: Truck, module: "suppliers" },
    { label: "Purchase Orders", href: "/dashboard/purchasing", icon: FileSpreadsheet, module: "purchasing" },
    { label: "Goods Receipt (GRN)", href: "/dashboard/grn", icon: FileCheck2, module: "grn" },
    { label: "Quotations", href: "/dashboard/quotations", icon: FileText, module: "quotations" },
    { label: "Invoices & Payments", href: "/dashboard/invoices", icon: Receipt, module: "invoices" },
    { label: "Delivery Challans", href: "/dashboard/delivery-challans", icon: Truck, module: "challans" },
    { label: "Reports & Exports", href: "/dashboard/reports", icon: BarChart3, module: "reports" },
    { label: "Audit Logs", href: "/dashboard/audit-logs", icon: ShieldCheck, module: "audit-logs" },
    { label: "System Settings", href: "/dashboard/settings", icon: Settings, module: "settings" },
  ];

  const filteredNav = navItems.filter((item) => {
    if (item.module === "dashboard") return true;
    if (!user) return true;
    return canAccessModule(user.role, item.module);
  });

  return (
    <>
      {/* Mobile Hamburger Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0B1F33] text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <Image
            src="/images/logo-msb-pharmachem.png"
            alt="MSB Logo"
            width={32}
            height={32}
            className="rounded-full bg-white p-0.5"
          />
          <span className="font-bold text-sm tracking-wide">MSB PHARMACHEM</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0B1F33] text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-0.5 shrink-0 shadow-md">
            <Image
              src="/images/logo-msb-pharmachem.png"
              alt="MSB PHARMACHEM"
              width={38}
              height={38}
              className="rounded-full"
            />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm text-white tracking-wide truncate">MSB PHARMACHEM</h1>
            <p className="text-[10px] text-emerald-400 font-medium tracking-wider uppercase">Business Portal</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#00488F] text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-3 border-t border-slate-800 bg-[#071827]/60">
          <div className="flex items-center justify-between px-2 py-1.5 mb-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name || "Staff Member"}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-semibold border border-emerald-800 uppercase">
                  {user?.role || "GUEST"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <Link
              href="/"
              target="_blank"
              className="text-[11px] text-slate-400 hover:text-emerald-400 transition-colors"
            >
              ↗ Public Website
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2 py-1 rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}
    </>
  );
}
