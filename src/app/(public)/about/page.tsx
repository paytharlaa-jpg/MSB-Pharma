import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  ShieldCheck,
  Warehouse,
  Truck,
  Globe2,
  FileText,
  Target,
  Eye,
  HeartHandshake,
  MapPin,
  Phone,
  Mail,
  Pill,
  Atom,
  Layers,
  Beaker,
  ScanSearch,
  Check,
} from "lucide-react";
import { PageHero, SectionHeading } from "@/components/public-site/PageHero";
import { CREDENTIALS } from "@/components/home/CredentialIcons";

export const metadata = {
  title: "About Us | MSB PHARMACHEM: Trusted B2B Pharma Supply Partner",
  description:
    "MSB PHARMACHEM is a Hyderabad-based B2B supplier of pharmaceutical APIs, intermediates, excipients, chemicals, solvents and impurity standards, with 18+ years of supply-chain expertise.",
};

const STATS = [
  { value: 18, suffix: "+", label: "Years of supply-chain expertise" },
  { value: 540, suffix: "+", label: "Molecules in our sourcing portfolio" },
  { value: 24, suffix: " hrs", label: "Typical dispatch from Hyderabad" },
  { value: 100, suffix: "%", label: "Batches shipped with COA" },
];

const WHAT_WE_DO = [
  {
    icon: Search,
    title: "Strategic sourcing",
    body: "We identify and qualify the right manufacturer for each molecule, grade and volume, so your procurement team doesn't have to chase dozens of vendors.",
    points: ["Vetted WHO-GMP manufacturing partners", "IP / BP / USP / EP grades", "R&D samples to commercial batches"],
  },
  {
    icon: ShieldCheck,
    title: "Quality verification",
    body: "Every consignment is checked against its specification before it leaves us. We match batch documents, labels and quantities, and flag deviations early.",
    points: ["Batch-wise COA and MSDS", "Impurity profile and shelf-life checks", "Incoming inspection on every GRN"],
  },
  {
    icon: Warehouse,
    title: "Inventory planning",
    body: "We hold buffer stock of fast-moving APIs and intermediates in Hyderabad, protecting your production schedule from market shortages and price swings.",
    points: ["Ready stock at Kukatpally", "Forecast-based replenishment", "Scheduled and blanket orders"],
  },
  {
    icon: FileText,
    title: "Regulatory documentation",
    body: "We assemble the paperwork that audits ask for, from manufacturer COA to open-part DMF support, so releases aren't held up by missing documents.",
    points: ["COA, MSDS, TSE/BSE statements", "Open-part DMF support", "GST-compliant invoicing"],
  },
  {
    icon: Truck,
    title: "Logistics & dispatch",
    body: "Secure, temperature-aware packing and dependable transport partners move material from our hub to your plant, typically within 24 hours of confirmation.",
    points: ["Tamper-evident, sealed packing", "E-way bill and transport coordination", "Pan-India delivery"],
  },
  {
    icon: Globe2,
    title: "Export support",
    body: "For international buyers we prepare export-ready documentation and coordinate shipments, with Southeast Asia and the Middle East as growing markets.",
    points: ["IEC-registered exporter", "Export documentation packs", "Air and sea freight coordination"],
  },
];

const SUPPLY = [
  { icon: Pill, title: "Active Pharmaceutical Ingredients", body: "Human and veterinary APIs for generic formulation manufacturers, including Atorvastatin Calcium, Montelukast Sodium and Azithromycin." },
  { icon: Atom, title: "Raw Materials & Intermediates", body: "Key starting materials and intermediates in consistent quantities, including Canagliflozin, Dapagliflozin and Linagliptin intermediates." },
  { icon: Layers, title: "Excipients", body: "Pharmaceutical excipients that meet the stability and dissolution requirements of formulation teams." },
  { icon: Beaker, title: "Chemicals & Solvents", body: "Industrial, laboratory and pharma-grade chemicals and solvents for pharma, agro and allied industries." },
  { icon: ScanSearch, title: "Impurity Standards", body: "Reference and impurity standards that support analytical development, method validation and QC." },
];

const WHY = [
  ["Quality you can verify", "Products come with proper documentation, including COA and MSDS, from vetted suppliers."],
  ["Supply-chain strength", "Experienced planning means fewer delays and steady availability."],
  ["Fair, transparent pricing", "Direct sourcing relationships let us quote competitively and clearly."],
  ["Compliance-focused", "We follow regulatory and documentation requirements for domestic and export shipments."],
  ["Quick, responsive service", "Fast quotations, rapid sample dispatch and a team that answers promptly."],
  ["Flexible order sizes", "From R&D trial quantities to high-volume commercial batches."],
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <PageHero
        eyebrow="About MSB PHARMACHEM"
        title="Your trusted B2B partner for"
        accent="pharmaceutical supply"
        lead="We supply pharmaceutical manufacturers, formulation companies and chemical industries across India and abroad, built on three promises: Quality, Reliability and Trust."
        image="/images/about-hero-facility.webp"
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/contact" className="btn-shine inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#0f2d6b]">
            Talk to our sourcing desk <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/compliance" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors">
            Our compliance <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </PageHero>

      {/* Trusted B2B positioning: numbers + registrations */}
      <section className="relative -mt-12 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="premium-card rounded-3xl p-6 sm:p-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10" data-stagger>
              {STATS.map((s) => (
                <div key={s.label}>
                  <p className="font-heading text-4xl sm:text-5xl font-bold text-[#0f2d6b] tabular-nums">
                    <span data-count={s.value} data-suffix={s.suffix}>
                      {s.value}
                      {s.suffix}
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-slate-500 leading-snug">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-3" data-stagger>
              {CREDENTIALS.map(({ key, label, sub, Icon }) => (
                <div key={key} className="flex items-center gap-3 rounded-2xl bg-slate-50/80 px-4 py-3">
                  <span className="w-10 h-10 shrink-0 rounded-xl bg-white ring-1 ring-slate-200 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[#0f2d6b] leading-tight">{label}</span>
                    <span className="block text-[11px] text-slate-500 truncate">{sub}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div>
            <SectionHeading
              eyebrow="Who we are"
              title={
                <>
                  Built in Hyderabad, <span className="text-[#3a991d]">India&apos;s pharma capital</span>
                </>
              }
            />
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-slate-600" data-reveal>
              <p>
                Hyderabad is one of the world&apos;s leading pharmaceutical hubs, and it is where MSB PHARMACHEM was built. Our team brings more than 18
                years of experience in supply-chain management, inventory planning, procurement and vendor coordination.
              </p>
              <p>
                We work as an extension of our customers&apos; procurement teams. A delayed or inconsistent batch affects production schedules, so we
                focus on dependable availability, clear documentation and honest communication.
              </p>
            </div>
            <div className="mt-8 flex items-start gap-4 rounded-2xl border-l-4 border-[#3a991d] bg-[#f4faf1] p-5" data-reveal>
              <ShieldCheck className="w-6 h-6 text-[#3a991d] shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                Every enquiry, order and shipment is guided by documented COA verification and vetted manufacturer audits.
              </p>
            </div>
          </div>
          <div className="relative" data-reveal="right">
            <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] rounded-[28px] overflow-hidden shadow-[0_40px_80px_-40px_rgba(15,45,107,0.6)]">
              <Image src="/images/about-quality-lab.webp" alt="Pharmaceutical quality control and testing laboratory in Hyderabad" fill className="object-cover" data-parallax="8" />
            </div>
            <div className="absolute -bottom-8 -left-4 sm:-left-10 w-48 sm:w-60 aspect-square rounded-3xl overflow-hidden ring-8 ring-white shadow-2xl">
              <Image src="/images/about-warehouse-logistics.webp" alt="Warehouse and logistics" fill className="object-cover" data-parallax="6" />
            </div>
          </div>
        </div>
      </section>

      {/* What we do: sticky heading + service cards */}
      <section className="relative bg-[#f6f8fc] py-24 sm:py-32 overflow-clip">
        <div className="absolute inset-0 scientific-grid-bg pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <SectionHeading
                eyebrow="What we do"
                title={
                  <>
                    One partner from <span className="text-[#1b4db3]">sourcing</span> to <span className="text-[#3a991d]">delivery</span>
                  </>
                }
                lead="We take the whole supply cycle off your desk: finding the right manufacturer, verifying every batch, holding stock, completing the paperwork and getting material to your plant on time."
              />
              <Link href="/contact" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#1b4db3] group" data-reveal>
                Discuss your requirement
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-5">
            {WHAT_WE_DO.map(({ icon: Icon, title, body, points }, i) => (
              <article
                key={title}
                className={`premium-card premium-hover rounded-3xl p-7 ${i % 2 === 1 ? "sm:mt-12 sm:-mb-12" : ""}`}
                data-reveal
                data-reveal-delay={String((i % 2) * 0.1)}
              >
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1b4db3] to-[#2a62d1] text-white flex items-center justify-center shadow-[0_12px_24px_-12px_rgba(27,77,179,0.8)]">
                    <Icon className="w-6 h-6" />
                  </span>
                  <span className="font-heading text-sm font-bold text-slate-300">0{i + 1}</span>
                </div>
                <h3 className="mt-6 font-heading text-xl font-bold text-[#0f2d6b]">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{body}</p>
                <ul className="mt-5 space-y-2">
                  {points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-[13px] font-medium text-slate-700">
                      <Check className="w-4 h-4 text-[#3a991d] shrink-0 mt-0.5" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* What we supply */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What we supply"
            title="Five categories, one accountable supplier"
            lead="Sourced for generic formulation, bulk-drug synthesis and analytical quality control."
          />
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5" data-stagger>
            {SUPPLY.map(({ icon: Icon, title, body }) => (
              <div key={title} className="group rounded-3xl border border-slate-200/80 p-7 hover:border-[#1b4db3]/30 hover:shadow-[0_30px_60px_-30px_rgba(15,45,107,0.35)] transition-all duration-500">
                <Icon className="w-8 h-8 text-[#1b4db3] transition-transform duration-500 group-hover:-translate-y-1" />
                <h3 className="mt-6 font-heading text-lg font-bold text-[#0f2d6b]">{title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
            <div className="rounded-3xl bg-[#0f2d6b] p-7 text-white flex flex-col justify-between">
              <div>
                <h3 className="font-heading text-lg font-bold !text-white">Looking for a specific molecule?</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-white/70">Send us the CAS number, structure or monograph and we&apos;ll source it.</p>
              </div>
              <Link href="/contact" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#9be07e] group">
                Send a sourcing request <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Reach */}
      <section className="relative overflow-hidden bg-[#0a1d45] text-white py-24 sm:py-32">
        <div className="absolute inset-0" aria-hidden="true">
          <Image src="/images/about-global-network.webp" alt="Global Supply Network" fill className="object-cover opacity-30" data-parallax="10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1d45] via-[#0a1d45]/90 to-[#0a1d45]/30" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
          <div data-reveal>
            <p className="eyebrow eyebrow-light">Our reach</p>
            <h2 className="mt-4 font-heading text-3xl sm:text-5xl font-bold leading-[1.08] !text-white">Local roots, global supply</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5" data-stagger>
            <div className="rounded-3xl bg-white/[0.06] backdrop-blur ring-1 ring-white/10 p-7">
              <MapPin className="w-6 h-6 text-[#9be07e]" />
              <h3 className="mt-5 font-heading text-lg font-bold !text-white">Across India</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Pharma and chemical manufacturers in Telangana, Andhra Pradesh, Maharashtra, Gujarat and beyond, with prompt dispatch and dependable logistics.
              </p>
            </div>
            <div className="rounded-3xl bg-white/[0.06] backdrop-blur ring-1 ring-white/10 p-7">
              <Globe2 className="w-6 h-6 text-[#8fb4ff]" />
              <h3 className="mt-5 font-heading text-lg font-bold !text-white">Around the world</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Export-ready documentation and compliance-conscious processes for international buyers, with Southeast Asia as a key focus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Why customers choose us" title="Reasons buyers stay with us" center />
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10" data-stagger>
            {WHY.map(([t, d], i) => (
              <div key={t} className="border-t border-slate-200 pt-6">
                <span className="font-heading text-sm font-bold text-[#3a991d]">0{i + 1}</span>
                <h3 className="mt-3 font-heading text-lg font-bold text-[#0f2d6b]">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission / vision / values */}
      <section className="pb-24 sm:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-5" data-stagger>
          {[
            { icon: Target, title: "Our mission", body: "To be a dependable partner to the pharmaceutical and chemical industry, delivering quality products and honest service that help our customers grow." },
            { icon: Eye, title: "Our vision", body: "To become a leading Indian pharma and chemical sourcing company with a strong and trusted presence in global markets." },
            { icon: HeartHandshake, title: "Our values", body: "Quality: we never compromise on standards. Reliability: we deliver what we promise, when promised. Trust: we build long-term relationships through integrity." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="premium-card premium-hover rounded-3xl p-8">
              <span className="w-12 h-12 rounded-2xl bg-[#edf8eb] text-[#3a991d] flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </span>
              <h3 className="mt-6 font-heading text-xl font-bold text-[#0f2d6b]">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact strip */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0f2d6b] via-[#143e94] to-[#1b4db3] p-8 sm:p-14 text-white" data-reveal="scale">
            <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-[#3a991d]/30 blur-[90px]" aria-hidden="true" />
            <div className="relative grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="font-heading text-3xl sm:text-4xl font-bold leading-tight !text-white">Get in touch with MSB PHARMACHEM</h2>
                <p className="mt-4 text-white/75 leading-relaxed">
                  Looking for a specific API, raw material or chemical? Contact us for specifications, samples and quotations.
                </p>
              </div>
              <div className="space-y-3 text-sm">
                <p className="flex items-center gap-3 text-white/85"><MapPin className="w-4 h-4 text-[#9be07e]" /> Plot No. 128, Allwyn Colony, Kukatpally, Hyderabad 500072</p>
                <p className="flex items-center gap-3 text-white/85"><Phone className="w-4 h-4 text-[#9be07e]" /> +91 8008335333</p>
                <p className="flex items-center gap-3 text-white/85"><Mail className="w-4 h-4 text-[#9be07e]" /> mohank9@gmail.com</p>
                <Link href="/contact" className="btn-shine mt-4 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-[#0f2d6b]">
                  Contact our sales desk <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
