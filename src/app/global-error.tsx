"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global uncaught error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-[#00488F] text-2xl font-bold">
            MSB
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900">
              MSB PHARMACHEM
            </h1>
            <p className="text-sm text-slate-600">
              The application experienced a startup delay. Please click below to reload the session.
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-5 py-2.5 rounded-xl bg-[#00488F] hover:bg-[#003870] text-white text-sm font-semibold transition-colors shadow-sm"
            >
              Reload Page
            </button>
            <a
              href="/"
              className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors"
            >
              Go to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
