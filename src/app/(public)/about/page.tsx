import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Shield, Target, Eye, HeartHandshake, ArrowRight, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "About Us | MSB PHARMACHEM — Quality Products, Global Supply",
  description:
    "Learn about MSB PHARMACHEM's background in Kukatpally, Hyderabad, our 18+ years of supply chain expertise, and our core values of Quality, Reliability, and Trust.",
};

export default function AboutPage() {
  return (
    <div className="space-y-0">
      {/* Page Header */}
      <section className="bg-[#0B1F33] text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/images/about-company.webp"
            alt="Pharmaceutical Facility"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">About MSB PHARMACHEM</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2">
            Quality Products, Global Supply
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-4 leading-relaxed">
            Welcome to MSB PHARMACHEM — a trusted pharmaceutical trading and sourcing partner built on three non-negotiable promises: Quality, Reliability, and Trust.
          </p>
        </div>
      </section>

      {/* Who We Are & Hyderabad Roots */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <span className="text-xs font-bold text-[#00488F] uppercase tracking-wider">Who We Are</span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Built in Hyderabad — The Pharmaceutical Capital of India
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Hyderabad is one of the world&apos;s leading pharmaceutical hubs, and it is where MSB PHARMACHEM was built. Our team brings more than 18 years of experience in supply chain management, inventory planning, procurement, and vendor coordination.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                This lets us do more than supply materials. We plan, source, and deliver with the discipline that pharma formulation customers expect. We work as an extension of our customers&apos; procurement teams. We understand that a delayed or inconsistent batch affects production schedules, so we focus on dependable availability, clear documentation, and honest communication.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#00488F] shrink-0" />
                <span>
                  Every enquiry, order, and shipment is guided by documented COA verification and vetted manufacturer audits.
                </span>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200">
              <Image
                src="/images/about-company.webp"
                alt="QC Analytical Chemistry Laboratory"
                width={700}
                height={500}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What We Supply Grid */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#00488F] uppercase tracking-wider">Product Categories</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              What We Supply
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Sourced for generic formulation, bulk drug synthesis, and analytical quality control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <h3 className="font-bold text-base text-slate-900">Active Pharmaceutical Ingredients (APIs)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Human and veterinary APIs for generic formulation manufacturers, including Atorvastatin Calcium, Montelukast Sodium, Azithromycin, and Rosuvastatin Calcium.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <h3 className="font-bold text-base text-slate-900">Pharma Raw Materials & Intermediates</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Raw materials and chemical intermediates supplied in consistent quantities for continuous chemical synthesis (e.g. Canagliflozin, Dapagliflozin, Linagliptin intermediates).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <h3 className="font-bold text-base text-slate-900">Excipients</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                High-grade pharmaceutical excipients that meet the precise formulation stability and dissolution requirements of manufacturing teams.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <h3 className="font-bold text-base text-slate-900">Chemicals & Solvents</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Industrial, laboratory, and pharma-grade chemicals and solvents for pharmaceuticals, agrochemicals, and allied synthesis industries.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <h3 className="font-bold text-base text-slate-900">Impurity Standards</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Certified reference and impurity standards that support analytical method validation, chromatographic characterization, and rigorous quality control.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-[#00488F]">Looking for a Specific Item?</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Contact our sourcing desk with your CAS number, structural formula, or specification monograph.
                </p>
              </div>
              <div className="pt-4">
                <Link href="/contact">
                  <Button variant="primary" size="sm">
                    <span>Send Sourcing Request</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global & Domestic Reach */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 order-2 lg:order-1">
              <Image
                src="/images/global-supply.webp"
                alt="Global Pharmaceutical Logistics & Air Cargo"
                width={700}
                height={500}
                className="w-full h-auto object-cover"
              />
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Our Reach</span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Local Roots, Global Supply
              </h2>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-sm text-slate-900">Across India</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    We supply pharma and chemical manufacturers across Telangana, Andhra Pradesh, Maharashtra, Gujarat, and pan-India with prompt dispatch and dependable logistics.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-sm text-slate-900">Around the World</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    We support international buyers with export-ready documentation, tamper-evident packing, and compliance-conscious processes. We are steadily expanding our global network, with Southeast Asia as a key focus.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Customers Choose Us */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#00488F] uppercase tracking-wider">Customer Value</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Why Customers Choose Us
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Quality You Can Verify</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Products are supported by proper documentation, including COA and MSDS, and sourced from vetted suppliers.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Supply Chain Strength</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Experienced planning means fewer delays, reduced production stoppages, and steady availability.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Fair, Transparent Pricing</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct sourcing relationships help us quote competitively and clearly without unexpected surcharges.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Compliance-Focused</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                We follow regulatory and documentation requirements for domestic and export shipments.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Quick, Responsive Service</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                You get fast quotations, rapid sample dispatch, and a team that responds promptly.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Flexible Order Sizes</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                We handle everything from pilot R&D trial quantities to high-volume commercial production batches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#00488F] mx-auto flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Our Mission</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                To be a dependable partner to the pharmaceutical and chemical industry, delivering quality products and honest service that help our customers grow.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Our Vision</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                To become a leading Indian pharma and chemical sourcing company with a strong and trusted presence in global markets.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 mx-auto flex items-center justify-center">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Our Core Values</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Quality:</strong> We never compromise on standards.<br />
                <strong>Reliability:</strong> We deliver what we promise, when promised.<br />
                <strong>Trust:</strong> We build long-term relationships through integrity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Strip */}
      <section className="py-16 bg-[#071827] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Get in Touch with MSB PHARMACHEM
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
            Looking for a specific API, raw material, or chemical? Contact us for product specifications, samples, and quotations.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-300 pt-2">
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Plot No. 128, Allwyn Colony, Kukatpally, Hyderabad – 500072</span>
            </span>
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>+91 8008335333</span>
            </span>
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>mohank9@gmail.com</span>
            </span>
          </div>

          <div className="pt-4">
            <Link href="/contact">
              <Button variant="brand-green" size="md">
                <span>Contact Our Sales Desk</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
