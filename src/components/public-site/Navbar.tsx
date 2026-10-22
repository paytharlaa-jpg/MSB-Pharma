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
    <header className="sticky top-0 z-50 bg-[#0B1F33]/95 backdrop-blur-md border-b border-slate-800 text-white">
      {/* Top Notification / Contact Bar */}
      <div className="bg-[#071827] border-b border-slate-800/80 px-4 py-1.5 text-xs text-slate-300 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>+91 8008335333</span>
            </span>
            <span className="text-slate-500">•</span>
            <span>Plot No. 128, Allwyn Colony, Kukatpally, Hyderabad – 500072</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={getWhatsAppClickToChatUrl({})}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Us</span>
            </a>
            <span className="text-slate-700">|</span>
            <Link
              href="/login"
              className="text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Staff Portal</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-full bg-white p-0.5 shrink-0 shadow-md flex items-center justify-center transition-transform group-hover:scale-105">
            <Image
              src="/images/logo-msb-pharmachem.png"
              alt="MSB PHARMACHEM"
              width={46}
              height={46}
              className="rounded-full"
              priority
            />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white block leading-tight">
              MSB PHARMACHEM
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase block">
              Quality • Reliability • Trust
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-emerald-400 ${
                  isActive ? "text-emerald-400 font-semibold" : "text-slate-200"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/products">
            <Button variant="outline" size="sm" className="bg-transparent border-slate-600 text-white hover:bg-slate-800">
              Explore Catalog
            </Button>
          </Link>

          <Link href="/contact">
            <Button variant="brand-green" size="sm">
              <span>Request Quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-slate-300 hover:text-white"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#071827] border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-emerald-400 hover:bg-slate-800"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="brand-green" size="sm" className="w-full">
                Request a Quote
              </Button>
            </Link>

            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" size="sm" className="w-full text-slate-300 border-slate-700 bg-transparent">
                <Lock className="w-3.5 h-3.5 mr-1" />
                Staff Portal Login
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
