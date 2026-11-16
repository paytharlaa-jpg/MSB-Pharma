import React from "react";

/** Custom line icons for the statutory registrations (brand blue / green, 24px grid). */

type P = { className?: string };
const base = { fill: "none", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function GstIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...base} stroke="#1b4db3" d="M6 2.75h8.5L19 7.25v14H6z" />
      <path {...base} stroke="#1b4db3" d="M14.5 2.75v4.5H19" />
      <path {...base} stroke="#3a991d" d="M9 12.5h7M9 15.5h4.5" />
      <path {...base} stroke="#3a991d" d="M9.25 9.25 10.4 10.4l2.1-2.15" />
      <circle cx="16.75" cy="17.75" r="2.6" fill="#3a991d" />
      <path d="m15.7 17.8.75.75 1.45-1.5" stroke="#fff" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IecIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle {...base} stroke="#1b4db3" cx="12" cy="12" r="8.25" />
      <path {...base} stroke="#1b4db3" d="M3.75 12h16.5M12 3.75c2.4 2.3 3.6 5.05 3.6 8.25s-1.2 5.95-3.6 8.25c-2.4-2.3-3.6-5.05-3.6-8.25S9.6 6.05 12 3.75z" />
      <path {...base} stroke="#3a991d" strokeWidth={1.9} d="M16.5 2.75h4.75V7.5M21.25 2.75 16.75 7.25" />
      <path {...base} stroke="#3a991d" strokeWidth={1.9} d="M7.5 21.25H2.75V16.5M2.75 21.25l4.5-4.5" />
    </svg>
  );
}

export function MsmeIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...base} stroke="#1b4db3" d="M3 20.25h18M4.75 20.25V10.5l4.5 2.75V10.5l4.5 2.75V6.75h5.5v13.5" />
      <path {...base} stroke="#3a991d" d="M15.75 9.5h1.5M15.75 12.5h1.5M15.75 15.5h1.5" />
      <path {...base} stroke="#3a991d" d="M7.25 16.5h1.5M11.75 16.5h1.5" />
      <path {...base} stroke="#1b4db3" d="M16 6.75V3.75h2.25v3" />
    </svg>
  );
}

export function DrugLicenseIcon({ className }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...base} stroke="#1b4db3" d="M12 2.75 19.5 5.5v6.1c0 4.55-3.15 8.25-7.5 9.65-4.35-1.4-7.5-5.1-7.5-9.65V5.5z" />
      <rect x="8.4" y="8.9" width="7.2" height="4.4" rx="2.2" transform="rotate(-35 12 11.1)" stroke="#3a991d" strokeWidth={1.6} fill="none" />
      <path d="M10.6 9.6 13.1 13" stroke="#3a991d" strokeWidth={1.6} strokeLinecap="round" />
      <path {...base} stroke="#1b4db3" d="M9.25 16.75h5.5" />
    </svg>
  );
}

export const CREDENTIALS = [
  { key: "gst", label: "GST Registered", sub: "Goods & Services Tax", Icon: GstIcon },
  { key: "iec", label: "IEC Holder", sub: "Import Export Code (DGFT)", Icon: IecIcon },
  { key: "msme", label: "MSME Registered", sub: "Udyam registration", Icon: MsmeIcon },
  { key: "dl", label: "Wholesale Drug Licence", sub: "Drugs & Cosmetics Act", Icon: DrugLicenseIcon },
];
