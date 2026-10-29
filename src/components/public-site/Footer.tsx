import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ArrowUpRight, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-50 text-slate-600 border-t border-slate-200 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full bg-white p-1 shadow-sm border border-[#1b4db3]/20 flex items-center justify-center shrink-0">
                <Image
                  src="/images/logo-msb-pharmachem.png"
                  alt="MSB PHARMACHEM"
                  width={52}
                  height={52}
                  className="rounded-full object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-[#143e94] block font-heading">
                  MSB PHARMACHEM
                </span>
                <span className="text-xs text-[#3a991d] font-extrabold tracking-wider uppercase block">
                  Quality • Reliability • Trust
                </span>
              </div>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-sm">
              Trusted supplier of Active Pharmaceutical Ingredients (APIs), Bulk Drugs, Pharma Raw Materials, Excipients, Domestic Chemicals, Solvents and Impurity Standards from Kukatpally, Hyderabad to manufacturers across India and global markets.
            </p>

            <div className="pt-2 flex items-center gap-2 text-slate-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#3a991d]" />
              <span className="text-xs">COA, MSDS & WHO-GMP compliant documentation support.</span>
            </div>
          </div>

          {/* Product Categories (1 col) */}
          <div>
            <h4 className="text-[#143e94] font-bold uppercase tracking-wider text-xs mb-4 font-heading">
              Product Categories
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/products?category=apis" className="hover:text-[#1b4db3] transition-colors">
                  Active Pharmaceutical Ingredients (APIs)
                </Link>
              </li>
              <li>
                <Link href="/products?category=intermediates-raw-materials" className="hover:text-[#1b4db3] transition-colors">
                  Pharma Raw Materials & Intermediates
                </Link>
              </li>
              <li>
                <Link href="/products?category=excipients" className="hover:text-[#1b4db3] transition-colors">
                  Pharmaceutical Excipients
                </Link>
              </li>
              <li>
                <Link href="/products?category=chemicals-solvents" className="hover:text-[#1b4db3] transition-colors">
                  Industrial Chemicals & Solvents
                </Link>
              </li>
              <li>
                <Link href="/products?category=impurity-standards" className="hover:text-[#1b4db3] transition-colors">
                  Certified Impurity Standards
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Navigation (1 col) */}
          <div>
            <h4 className="text-[#143e94] font-bold uppercase tracking-wider text-xs mb-4 font-heading">
              Company & Links
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="hover:text-[#1b4db3] transition-colors">
                  About Our Company
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#1b4db3] transition-colors">
                  Complete Product Catalog
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#1b4db3] transition-colors">
                  Supply Chain & Facility Gallery
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[#1b4db3] transition-colors">
                  Technical Articles & Insights
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#1b4db3] transition-colors">
                  Request a Commercial Quote
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-[#1b4db3] hover:text-[#153e94] font-semibold inline-flex items-center gap-1">
                  <span>Staff Portal Login</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details (1 col) */}
          <div>
            <h4 className="text-[#143e94] font-bold uppercase tracking-wider text-xs mb-4 font-heading">
              Headquarters
            </h4>
            <div className="space-y-3 text-slate-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#1b4db3] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Plot No. 128, Kamala Prasanna Nagar, Allwyn Colony, Kukatpally, Hyderabad – 500072, Telangana, India
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#3a991d] shrink-0" />
                <a href="tel:+918008335333" className="hover:text-[#1b4db3] transition-colors font-medium">
                  +91 8008335333
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#1b4db3] shrink-0" />
                <a href="mailto:mohank9@gmail.com" className="hover:text-[#1b4db3] transition-colors font-medium">
                  mohank9@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} MSB PHARMACHEM. All rights reserved.</p>
          <p className="text-center sm:text-right">
            Pharmaceutical APIs & Intermediates Trading Hub • Hyderabad, India
          </p>
        </div>
      </div>
    </footer>
  );
}
