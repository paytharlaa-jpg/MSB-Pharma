import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const norm = status.toUpperCase().replace(/\s+/g, "_");

  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200";
  let label = status.replace(/_/g, " ");

  switch (norm) {
    // Green / Positive
    case "PAID":
    case "WON":
    case "COMPLETED":
    case "VERIFIED":
    case "DELIVERED":
    case "ACCEPTED":
    case "ACTIVE":
      colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
      break;

    // Amber / Warning / In Progress
    case "PARTIALLY_PAID":
    case "IN_PROGRESS":
    case "ASSIGNED":
    case "QUOTATION_SENT":
    case "PARTIALLY_RECEIVED":
    case "DISPATCHED":
    case "SENT":
    case "EXPIRING_SOON":
    case "LOW_STOCK":
      colorClasses = "bg-amber-50 text-amber-700 border-amber-200";
      break;

    // Blue / Info / New
    case "NEW":
    case "ISSUED":
    case "DRAFT":
    case "OPEN":
      colorClasses = "bg-blue-50 text-blue-700 border-blue-200";
      break;

    // Red / Danger / Closed
    case "UNPAID":
    case "LOST":
    case "CANCELLED":
    case "REJECTED":
    case "EXPIRED":
    case "INACTIVE":
      colorClasses = "bg-rose-50 text-rose-700 border-rose-200";
      break;

    // Default Gray
    case "CLOSED":
    case "AWAITING_CUSTOMER":
      colorClasses = "bg-slate-100 text-slate-700 border-slate-300";
      break;
  }

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
          colorClasses,
          className
        )
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 shrink-0" />
      {label}
    </span>
  );
}
