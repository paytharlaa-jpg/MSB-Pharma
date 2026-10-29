"use client";

import React, { useState } from "react";
import { Phone, Mail } from "lucide-react";
import { getWhatsAppClickToChatUrl } from "@/lib/whatsapp-service";

export function FloatingActionButtons() {
  const [hoveredButton, setHoveredButton] = useState<"whatsapp" | "call" | "mail" | null>(null);

  const phoneHref = "tel:+918008335333";
  const emailHref = "mailto:mohank9@gmail.com?subject=Commercial%20Product%20Inquiry%20-%20MSB%20PHARMACHEM";
  const whatsappHref = getWhatsAppClickToChatUrl({
    customMessage: "Hello MSB PHARMACHEM, I am contacting you from the website regarding pharmaceutical products & API requirements.",
  });

  return (
    <aside
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3.5 select-none pointer-events-auto"
      aria-label="Direct Quick Contact Channels"
    >
      {/* 1. Direct Mail Floating Button */}
      <div className="relative flex items-center justify-end">
        {/* Tooltip Label on Desktop */}
        <div
          className={`absolute right-16 px-3.5 py-1.5 rounded-full bg-slate-900/95 text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-slate-700/60 transition-all duration-200 pointer-events-none hidden sm:block ${
            hoveredButton === "mail"
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-2"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
            <span>Email: mohank9@gmail.com</span>
          </div>
        </div>

        <a
          href={emailHref}
          onMouseEnter={() => setHoveredButton("mail")}
          onMouseLeave={() => setHoveredButton(null)}
          className="relative group w-14 h-14 rounded-full bg-gradient-to-tr from-[#143e94] to-[#2563eb] text-white flex items-center justify-center shadow-lg shadow-[#1b4db3]/35 hover:shadow-xl hover:shadow-[#2563eb]/50 hover:scale-108 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#2563eb]/40"
          aria-label="Email MSB PHARMACHEM at mohank9@gmail.com"
        >
          {/* Ambient Breathing Glow */}
          <span className="absolute -inset-1 rounded-full bg-[#2563eb]/30 blur-sm group-hover:bg-[#2563eb]/50 transition-all duration-300 pointer-events-none" />

          {/* Mail Icon */}
          <Mail className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
        </a>
      </div>

      {/* 2. Phone Call Floating Button */}
      <div className="relative flex items-center justify-end">
        {/* Tooltip Label on Desktop */}
        <div
          className={`absolute right-16 px-3.5 py-1.5 rounded-full bg-slate-900/95 text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-slate-700/60 transition-all duration-200 pointer-events-none hidden sm:block ${
            hoveredButton === "call"
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-2"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1b4db3]" />
            <span>Call: +91 8008335333</span>
          </div>
        </div>

        <a
          href={phoneHref}
          onMouseEnter={() => setHoveredButton("call")}
          onMouseLeave={() => setHoveredButton(null)}
          className="relative group w-14 h-14 rounded-full bg-[#1b4db3] text-white flex items-center justify-center shadow-lg shadow-[#1b4db3]/35 hover:shadow-xl hover:shadow-[#1b4db3]/50 hover:scale-108 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#1b4db3]/40"
          aria-label="Call MSB PHARMACHEM at +91 8008335333"
        >
          {/* Subtle radiating pulse ring */}
          <span className="absolute inset-0 rounded-full bg-[#1b4db3] opacity-30 animate-ping pointer-events-none" />

          {/* Phone Icon */}
          <Phone className="w-6 h-6 transition-transform duration-200 group-hover:rotate-12" />
        </a>
      </div>

      {/* 3. WhatsApp Floating Button */}
      <div className="relative flex items-center justify-end">
        {/* Tooltip Label on Desktop */}
        <div
          className={`absolute right-16 px-3.5 py-1.5 rounded-full bg-slate-900/95 text-white text-xs font-semibold whitespace-nowrap shadow-xl border border-slate-700/60 transition-all duration-200 pointer-events-none hidden sm:block ${
            hoveredButton === "whatsapp"
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-2"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#25D366]" />
            <span>Chat on WhatsApp</span>
          </div>
        </div>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setHoveredButton("whatsapp")}
          onMouseLeave={() => setHoveredButton(null)}
          className="relative group w-14 h-14 rounded-full bg-gradient-to-tr from-[#3a991d] to-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#3a991d]/35 hover:shadow-xl hover:shadow-[#25D366]/50 hover:scale-108 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
          aria-label="Chat with MSB PHARMACHEM on WhatsApp"
        >
          {/* Ambient Breathing Glow */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 blur-sm group-hover:bg-[#25D366]/50 transition-all duration-300 pointer-events-none" />

          {/* Official WhatsApp SVG Icon */}
          <svg
            className="w-7 h-7 fill-current relative z-10 transition-transform duration-200 group-hover:scale-110"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12.031 2C6.495 2 2 6.495 2 12.031c0 1.956.556 3.861 1.609 5.518L2 22l4.615-1.565a10.02 10.02 0 0 0 5.416 1.597h.004c5.532 0 10.027-4.495 10.027-10.031C22.062 6.495 17.567 2 12.031 2zm5.856 14.184c-.244.686-1.42 1.309-1.957 1.353-.497.04-1.127.186-3.64-0.852-2.736-1.13-4.508-3.903-4.646-4.088-.137-.186-1.107-1.472-1.107-2.808 0-1.336.7-1.993.95-2.257.249-.264.544-.33.725-.33.181 0 .362.002.52.01.17.009.398-.064.622.474.232.556.792 1.936.861 2.077.069.141.115.307.023.491-.092.184-.138.298-.276.459-.138.161-.29.359-.414.482-.138.138-.282.288-.121.564.161.276.716 1.18 1.538 1.913 1.058.943 1.95 1.235 2.226 1.373.276.138.437.115.598-.069.161-.184.69-.805.874-1.081.184-.276.368-.23.621-.138.253.092 1.61.76 1.886.898.276.138.46.207.529.322.069.115.069.667-.175 1.353z" />
          </svg>
        </a>
      </div>
    </aside>
  );
}
