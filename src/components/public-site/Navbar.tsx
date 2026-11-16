"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Phone, Lock, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Compliance", href: "/compliance" },
  { label: "Gallery", href: "/gallery" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Glass + compact once the page moves; slide away while reading downwards, return on scroll up
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 420);
        last = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileMenuOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={`sticky top-0 z-50 text-slate-800 transition-[transform,background-color,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
        hidden && !mobileMenuOpen ? "-translate-y-full" : "translate-y-0"
      } ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl backdrop-saturate-150 border-b border-slate-200/70 shadow-[0_10px_40px_-20px_rgba(15,45,107,0.25)]"
          : "bg-white border-b border-transparent"
      }`}
    >
      {/* Main bar */}
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-[height] duration-500 ${
          scrolled ? "h-[72px]" : "h-20 sm:h-24"
        }`}
      >
        <Link href="/" className="flex items-center gap-3 group" aria-label="MSB PHARMACHEM home">
          <div
            className={`rounded-full bg-white p-0.5 shrink-0 shadow-[0_6px_20px_-8px_rgba(27,77,179,0.5)] ring-1 ring-[#1b4db3]/15 flex items-center justify-center transition-all duration-500 group-hover:scale-105 ${
              scrolled ? "w-12 h-12" : "w-14 h-14 sm:w-16 sm:h-16"
            }`}
          >
            <Image src="/images/logo-msb-pharmachem.png" alt="" width={60} height={60} className="rounded-full object-contain" priority />
          </div>
          <div className="leading-tight">
            <span className="block font-heading font-bold text-lg sm:text-[22px] tracking-tight text-[#0f2d6b]">
              MSB <span className="text-[#3a991d]">PHARMACHEM</span>
            </span>
            <span className="block text-[10px] sm:text-[11px] font-semibold tracking-[0.24em] uppercase text-slate-500 mt-0.5">
              Quality · Reliability · Trust
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`nav-underline text-[15px] font-semibold transition-colors ${
                isActive(link.href) ? "text-[#1b4db3]" : "text-slate-600 hover:text-[#0f2d6b]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/contact"
            className="btn-shine inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1b4db3] to-[#2a62d1] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_-12px_rgba(27,77,179,0.8)] hover:shadow-[0_16px_36px_-12px_rgba(27,77,179,0.9)] transition-shadow"
          >
            Request Quote
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <button
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="lg:hidden p-2.5 text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
            className="lg:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-b border-slate-200"
          >
            <nav className="px-4 pt-2 pb-3 space-y-1" aria-label="Mobile">
              {NAV_LINKS.map((link, i) => (
                <motion.div key={link.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i + 0.08 }}>
                  <Link
                    href={link.href}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-base font-semibold ${
                      isActive(link.href) ? "text-[#1b4db3] bg-[#edf3fd]" : "text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    {link.label}
                    <ArrowRight className={`w-4 h-4 ${isActive(link.href) ? "text-[#1b4db3]" : "text-slate-300"}`} />
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="px-4 pb-6 pt-2 grid grid-cols-2 gap-2 border-t border-slate-100">
              <Link href="/contact" className="col-span-2 inline-flex justify-center items-center gap-2 rounded-full bg-[#1b4db3] py-3 text-sm font-semibold text-white">
                Request a Quote <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="tel:+918008335333" className="inline-flex justify-center items-center gap-1.5 rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-slate-700">
                <Phone className="w-4 h-4 text-[#1b4db3]" /> Call
              </a>
              <Link href="/login" className="inline-flex justify-center items-center gap-1.5 rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-slate-700">
                <Lock className="w-4 h-4 text-[#1b4db3]" /> Admin
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
