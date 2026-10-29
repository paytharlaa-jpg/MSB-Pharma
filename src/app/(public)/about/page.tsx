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
      <section className="bg-gradient-to-br from-[#0c234b] via-[#10326e] to-[#0a1c3d] text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <Image
            src="/images/about-company.webp"
            alt="Pharmaceutical Facility"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <span className="text-xs sm:text-sm font-extrabold text-[#3a991d] bg-[#edf8eb]/90 px-3.5 py-1 rounded-full uppercase tracking-wider border border-[#3a991d]/30 inline-block mb-3">
            About MSB PHARMACHEM
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mt-2 font-heading leading-tight text-white anim-text-reveal-up">
            Quality Products, Global Supply
          </h1>
          <p className="text-slate-200 text-base sm:text-xl mt-5 leading-relaxed max-w-2xl mx-auto font-normal">
            Welcome to MSB PHARMACHEM — a trusted pharmaceutical trading and sourcing partner built on three non-negotiable promises: Quality, Reliability, and Trust.
          </p>
        </div>
      </section>

      {/* Who We Are & Hyderabad Roots */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <span className="text-xs sm:text-sm font-bold text-[#1b4db3] uppercase tracking-wider">
                Who We Are
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#143e94] tracking-tight leading-tight font-heading anim-text-glow-expand">
                Built in Hyderabad — The Pharmaceutical Capital of India
              </h2>
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                Hyderabad is one of the world&apos;s leading pharmaceutical hubs, and it is where MSB PHARMACHEM was built. Our team brings more than 18 years of experience in supply chain management, inventory planning, procurement, and vendor coordination.
              </p>
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                This lets us do more than supply materials. We plan, source, and deliver with the discipline that pharma formulation customers expect. We work as an extension of our customers&apos; procurement teams. We understand that a delayed or inconsistent batch affects production schedules, so we focus on dependable availability, clear documentation, and honest communication.
              </p>

              <div className="p-5 rounded-2xl bg-[#edf3fd] border border-[#1b4db3]/25 text-sm sm:text-base text-[#143e94] flex items-center gap-3.5 shadow-xs">
                <Shield className="w-6 h-6 text-[#1b4db3] shrink-0" />
                <span className="font-semibold">
                  Every enquiry, order, and shipment is guided by documented COA verification and vetted manufacturer audits.
                </span>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-200/80">
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
      <section className="py-20 sm:py-24 bg-[#F8FAFC] border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs sm:text-sm font-bold text-[#3a991d] uppercase tracking-wider">
              Product Categories
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#143e94] tracking-tight font-heading">
              What We Supply
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Sourced for generic formulation, bulk drug synthesis, and analytical quality control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <h3 className="font-bold text-lg sm:text-xl text-[#143e94] font-heading">
                Active Pharmaceutical Ingredients (APIs)
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Human and veterinary APIs for generic formulation manufacturers, including Atorvastatin Calcium, Montelukast Sodium, Azithromycin, and Rosuvastatin Calcium.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <h3 className="font-bold text-lg sm:text-xl text-[#143e94] font-heading">
                Pharma Raw Materials & Intermediates
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Raw materials and chemical intermediates supplied in consistent quantities for continuous chemical synthesis (e.g. Canagliflozin, Dapagliflozin, Linagliptin intermediates).
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <h3 className="font-bold text-lg sm:text-xl text-[#143e94] font-heading">
                Excipients
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                High-grade pharmaceutical excipients that meet the precise formulation stability and dissolution requirements of manufacturing teams.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <h3 className="font-bold text-lg sm:text-xl text-[#143e94] font-heading">
                Chemicals & Solvents
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Industrial, laboratory, and pharma-grade chemicals and solvents for pharmaceuticals, agrochemicals, and allied synthesis industries.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <h3 className="font-bold text-lg sm:text-xl text-[#143e94] font-heading">
                Impurity Standards
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Certified reference and impurity standards that support analytical method validation, chromatographic characterization, and rigorous quality control.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-[#edf3fd] border border-[#1b4db3]/30 flex flex-col justify-between shadow-sm">
              <div className="space-y-3">
                <h3 className="font-bold text-lg sm:text-xl text-[#143e94] font-heading">
                  Looking for a Specific Item?
                </h3>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  Contact our sourcing desk with your CAS number, structural formula, or specification monograph.
                </p>
              </div>
              <div className="pt-6">
                <Link href="/contact">
                  <Button variant="primary" size="md" className="font-bold text-sm bg-[#1b4db3] hover:bg-[#153e94]">
                    <span>Send Sourcing Request</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global & Domestic Reach */}
      <section className="py-20 sm:py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-200/80 order-2 lg:order-1">
              <Image
                src="/images/global-supply.webp"
                alt="Global Pharmaceutical Logistics & Air Cargo"
                width={700}
                height={500}
                className="w-full h-auto object-cover"
              />
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <span className="text-xs sm:text-sm font-bold text-[#3a991d] uppercase tracking-wider">
                Our Reach
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-[#143e94] tracking-tight leading-tight font-heading">
                Local Roots, Global Supply
              </h2>

              <div className="space-y-5">
                <div className="p-6 rounded-2xl bg-[#edf3fd]/60 border border-[#1b4db3]/20 shadow-2xs">
                  <h4 className="font-bold text-base sm:text-lg text-[#143e94] font-heading">
                    Across India
                  </h4>
                  <p className="text-sm sm:text-base text-slate-700 mt-1.5 leading-relaxed">
                    We supply pharma and chemical manufacturers across Telangana, Andhra Pradesh, Maharashtra, Gujarat, and pan-India with prompt dispatch and dependable logistics.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#edf8eb]/60 border border-[#3a991d]/20 shadow-2xs">
                  <h4 className="font-bold text-base sm:text-lg text-[#143e94] font-heading">
                    Around the World
                  </h4>
                  <p className="text-sm sm:text-base text-slate-700 mt-1.5 leading-relaxed">
                    We support international buyers with export-ready documentation, tamper-evident packing, and compliance-conscious processes. We are steadily expanding our global network, with Southeast Asia as a key focus.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Customers Choose Us */}
      <section className="py-20 sm:py-24 bg-[#F8FAFC] border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs sm:text-sm font-bold text-[#1b4db3] uppercase tracking-wider">
              Customer Value
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#143e94] tracking-tight font-heading">
              Why Customers Choose Us
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
              <div className="font-bold text-base sm:text-lg text-[#143e94] flex items-center gap-2 font-heading">
                <CheckCircle2 className="w-5 h-5 text-[#3a991d] shrink-0" />
                <span>Quality You Can Verify</span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Products are supported by proper documentation, including COA and MSDS, and sourced from vetted suppliers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
              <div className="font-bold text-base sm:text-lg text-[#143e94] flex items-center gap-2 font-heading">
                <CheckCircle2 className="w-5 h-5 text-[#3a991d] shrink-0" />
                <span>Supply Chain Strength</span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Experienced planning means fewer delays, reduced production stoppages, and steady availability.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
              <div className="font-bold text-base sm:text-lg text-[#143e94] flex items-center gap-2 font-heading">
                <CheckCircle2 className="w-5 h-5 text-[#3a991d] shrink-0" />
                <span>Fair, Transparent Pricing</span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Direct sourcing relationships help us quote competitively and clearly without unexpected surcharges.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
              <div className="font-bold text-base sm:text-lg text-[#143e94] flex items-center gap-2 font-heading">
                <CheckCircle2 className="w-5 h-5 text-[#3a991d] shrink-0" />
                <span>Compliance-Focused</span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                We follow regulatory and documentation requirements for domestic and export shipments.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
              <div className="font-bold text-base sm:text-lg text-[#143e94] flex items-center gap-2 font-heading">
                <CheckCircle2 className="w-5 h-5 text-[#3a991d] shrink-0" />
                <span>Quick, Responsive Service</span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                You get fast quotations, rapid sample dispatch, and a team that responds promptly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
              <div className="font-bold text-base sm:text-lg text-[#143e94] flex items-center gap-2 font-heading">
                <CheckCircle2 className="w-5 h-5 text-[#3a991d] shrink-0" />
                <span>Flexible Order Sizes</span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                We handle everything from pilot R&D trial quantities to high-volume commercial production batches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-20 sm:py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#edf3fd] border border-[#1b4db3]/20 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-white text-[#1b4db3] mx-auto flex items-center justify-center shadow-xs border border-[#1b4db3]/20">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-xl text-[#143e94] font-heading">Our Mission</h3>
              <p className="text-base text-slate-700 leading-relaxed">
                To be a dependable partner to the pharmaceutical and chemical industry, delivering quality products and honest service that help our customers grow.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-3xl bg-[#edf8eb] border border-[#3a991d]/20 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-white text-[#3a991d] mx-auto flex items-center justify-center shadow-xs border border-[#3a991d]/20">
                <Eye className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-xl text-[#143e94] font-heading">Our Vision</h3>
              <p className="text-base text-slate-700 leading-relaxed">
                To become a leading Indian pharma and chemical sourcing company with a strong and trusted presence in global markets.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#edf3fd] to-[#edf8eb] border border-slate-200 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-white text-[#1b4db3] mx-auto flex items-center justify-center shadow-xs border border-slate-200">
                <HeartHandshake className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-xl text-[#143e94] font-heading">Our Core Values</h3>
              <p className="text-base text-slate-700 leading-relaxed space-y-1">
                <span className="block"><strong className="text-[#143e94]">Quality:</strong> We never compromise on standards.</span>
                <span className="block"><strong className="text-[#143e94]">Reliability:</strong> We deliver what we promise, when promised.</span>
                <span className="block"><strong className="text-[#3a991d]">Trust:</strong> We build long-term relationships through integrity.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Strip */}
      <section className="py-20 bg-gradient-to-br from-[#0c234b] via-[#10326e] to-[#0a1c3d] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-heading">
            Get in Touch with MSB PHARMACHEM
          </h2>
          <p className="text-slate-200 text-base sm:text-lg max-w-2xl mx-auto font-normal">
            Looking for a specific API, raw material, or chemical? Contact us for product specifications, samples, and quotations.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm sm:text-base text-slate-200 pt-3">
            <span className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#3a991d]" />
              <span>Plot No. 128, Allwyn Colony, Kukatpally, Hyderabad – 500072</span>
            </span>
            <span className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#3a991d]" />
              <span>+91 8008335333</span>
            </span>
            <span className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#3a991d]" />
              <span>mohank9@gmail.com</span>
            </span>
          </div>

          <div className="pt-6">
            <Link href="/contact">
              <Button variant="brand-green" size="lg" className="font-bold text-base shadow-xl shadow-[#3a991d]/30">
                <span>Contact Our Sales Desk</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}