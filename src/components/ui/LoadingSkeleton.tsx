import React from "react";

export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full space-y-3 p-4">
      <div className="h-8 bg-slate-200 rounded animate-pulse w-1/4"></div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse w-full"></div>
        ))}
      </div>
    </div>
  );
}
