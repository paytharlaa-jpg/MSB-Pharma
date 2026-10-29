"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, MessageCircle, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getWhatsAppClickToChatUrl } from "@/lib/whatsapp-service";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
    { label: "Products", href: "/products" },
    { label: "Gallery", href: "/gallery" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs text-slate-800">
      {/* Top Notification / Contact Bar */}
      <div className="bg-slate-50/90 border-b border-slate-200/70 px-4 py-1.5 text-xs text-slate-600 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a
              href="tel:+918008335333"
              className="flex items-center gap-1.5 text-slate-600 hover:text-[#1b4db3] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#1b4db3]" />
              <span className="font-semibold">+91 8008335333</span>
            </a>
            <span className="text-slate-300">•</span>
            <span className="truncate max-w-md">
              Plot No. 128, Allwyn Colony, Kukatpally, Hyderabad – 500072
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={getWhatsAppClickToChatUrl({})}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3a991d] hover:text-[#2e7b17] font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#3a991d]" />
              <span>WhatsApp Direct</span>
            </a>
            <span className="text-slate-300">|</span>
            <Link
              href="/login"
              className="text-slate-500 hover:text-[#1b4db3] inline-flex items-center gap-1 transition-colors text-xs font-medium"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Staff Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-22 sm:h-24 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-1 shrink-0 shadow-md border-2 border-[#1b4db3]/20 flex items-center justify-center transition-transform group-hover:scale-105">
            <Image
              src="/images/logo-msb-pharmachem.png"
              alt="MSB PHARMACHEM"
              width={58}
              height={58}
              className="rounded-full object-contain"
              priority
            />
          </div>
          <div>
            <span className="font-black text-xl sm:text-2xl tracking-tight text-[#143e94] group-hover:text-[#1b4db3] transition-colors block leading-tight font-heading">
              MSB PHARMACHEM
            </span>
            <span className="text-xs text-[#3a991d] font-extrabold tracking-wider uppercase block mt-0.5">
              Quality • Reliability • Trust
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-base font-semibold transition-colors hover:text-[#1b4db3] relative py-1.5 ${
                  isActive
                    ? "text-[#1b4db3] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#1b4db3] after:rounded-full"
                    : "text-slate-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3.5">
          <Link href="/products">
            <Button
              variant="outline"
              size="md"
              className="border-slate-300 text-slate-700 hover:text-[#1b4db3] hover:border-[#1b4db3] font-semibold text-sm"
            >
              Explore Catalog
            </Button>
          </Link>

          <Link href="/contact">
            <Button variant="brand-green" size="md" className="font-bold text-sm shadow-md shadow-[#3a991d]/20">
              <span>Request Quote</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-700 hover:text-[#1b4db3] rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 shadow-lg">
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3.5 py-2.5 rounded-xl text-base font-semibold transition-colors ${
                    isActive
                      ? "text-[#1b4db3] bg-[#edf3fd] font-bold"
                      : "text-slate-800 hover:text-[#1b4db3] hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="brand-green" size="sm" className="w-full">
                Request a Quote
              </Button>
            </Link>

            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-slate-700 border-slate-300 bg-white"
              >
                <Lock className="w-3.5 h-3.5 mr-1 text-[#1b4db3]" />
                Staff Portal Login
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
