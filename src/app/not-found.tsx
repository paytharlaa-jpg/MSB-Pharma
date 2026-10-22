import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
        <div className="space-y-2">
          <span className="text-6xl font-black text-[#00488F]">404</span>
          <h1 className="text-2xl font-bold text-slate-900">Page Not Found</h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            The page you requested may have moved or is temporarily unavailable. Browse our products or return home.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/products">
            <Button variant="primary" className="w-full inline-flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full inline-flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
