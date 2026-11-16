import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardCheck,
  FileCheck2,
  FileText,
  FlaskConical,
  PackageCheck,
  ShieldCheck,
  Thermometer,
  Truck,
  UserCheck,
  Warehouse,
  Check,
} from "lucide-react";
import { PageHero, SectionHeading } from "@/components/public-site/PageHero";
import { CREDENTIALS } from "@/components/home/CredentialIcons";

export const metadata = {
  title: "Compliance | MSB PHARMACHEM: Registrations, Quality & Documentation",
  description:
    "MSB PHARMACHEM is GST registered, an IEC holder, MSME registered and holds a wholesale drug licence. Learn about our quality checks and the documentation supplied with every batch.",
};

const REG_DETAIL: Record<string, string> = {
  gst: "Registered under the Goods and Services Tax regime. Every sale is invoiced with HSN-wise GST and filed in our GST returns.",
  iec: "Import Export Code issued by the Directorate General of Foreign Trade, enabling compliant export shipments to international buyers.",
  msme: "Registered as a Micro, Small & Medium Enterprise under the Udyam registration portal of the Government of India.",
  dl: "Licensed under the Drugs and Cosmetics Act, 1940 to stock and sell pharmaceutical materials on a wholesale basis.",
};

const DOCUMENTS = [
  { icon: FileCheck2, title: "Certificate of Analysis (COA)", body: "Manufacturer COA for every batch, checked against the agreed specification before dispatch." },
  { icon: FileText, title: "Material Safety Data Sheet", body: "MSDS / SDS covering hazards, handling, storage and transport for each material." },
  { icon: ShieldCheck, title: "TSE / BSE & residual solvent statements", body: "Declarations from the manufacturer where your quality or regulatory team requires them." },
  { icon: ClipboardCheck, title: "Open-part DMF support", body: "Drug Master File open-part documentation coordinated with the manufacturer for registrations." },
  { icon: PackageCheck, title: "Packing list & labelling", body: "Batch number, Mfg / Exp or retest date and net weight on every container, matched to the packing list." },
  { icon: BadgeCheck, title: "GST tax invoice & e-way bill", body: "HSN-wise GST invoice and e-way bill with every domestic consignment." },
];

const PROCESS = [
  { icon: UserCheck, title: "Supplier qualification", body: "We source only from manufacturers we have vetted for WHO-GMP practices, documentation discipline and consistent quality." },
  { icon: ClipboardCheck, title: "Incoming inspection", body: "Each receipt is logged on a Goods Receipt Note with a 10-point inspection: seals, labels, weights, COA, MSDS, shelf life and storage conditions." },
  { icon: FlaskConical, title: "Specification check", body: "Batch documents are matched against the pharmacopoeial grade and the customer's specification. Discrepancies are quarantined." },
  { icon: Warehouse, title: "Controlled storage", body: "Approved material is stored by batch at our Kukatpally warehouse under the conditions stated by the manufacturer." },
  { icon: Truck, title: "Documented dispatch", body: "Material ships in sealed, labelled packing with the full document set, and every movement can be traced back to its GRN." },
];

const STANDARDS = [
  { code: "IP", name: "Indian Pharmacopoeia" },
  { code: "BP", name: "British Pharmacopoeia" },
  { code: "USP", name: "United States Pharmacopeia" },
  { code: "EP", name: "European Pharmacopoeia" },
];

export default function CompliancePage() {
  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Compliance"
        title="Registered, licensed and"
        accent="audit-ready"
        lead="Compliance is part of how we work. Statutory registrations, documented quality checks and a complete paper trail come with every batch we supply."
        image="/images/compliance-hero-dossier.webp"
      />

      {/* Registrations */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Statutory registrations"
            title="Registrations that let you buy with confidence"
            lead="Registration certificates are shared with customers during vendor onboarding."
          />
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5" data-stagger>
            {CREDENTIALS.map(({ key, label, sub, Icon }) => (
              <article key={key} className="premium-card premium-hover relative rounded-3xl p-7 overflow-hidden">
                <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-gradient-to-br from-[#1b4db3]/10 to-[#3a991d]/10" aria-hidden="true" />
                <span className="relative w-14 h-14 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm flex items-center justify-center">
                  <Icon className="w-8 h-8" />
                </span>
                <h3 className="mt-6 font-heading text-lg font-bold text-[#0f2d6b]">{label}</h3>
                <p className="mt-1 text-xs font-medium text-slate-400">{sub}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{REG_DETAIL[key]}</p>
                <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#edf8eb] px-3 py-1 text-xs font-semibold text-[#2e7b17]">
                  <Check className="w-3.5 h-3.5" /> Registered
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Quality process: vertical timeline with sticky intro */}
      <section className="relative bg-[#f6f8fc] py-24 sm:py-32 overflow-clip">
        <div className="absolute inset-0 scientific-grid-bg pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <SectionHeading
                eyebrow="Quality assurance"
                title="Five checkpoints between manufacturer and you"
                lead="Every consignment passes the same documented route, so the material you receive is the material that was specified."
              />
            </div>
          </div>
          <ol className="lg:col-span-7 relative space-y-5 before:absolute before:left-7 before:top-4 before:bottom-4 before:w-px before:bg-gradient-to-b before:from-[#1b4db3] before:to-[#3a991d]">
            {PROCESS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="relative pl-20" data-reveal>
                <span className="absolute left-0 top-0 w-14 h-14 rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_10px_30px_-15px_rgba(15,45,107,0.5)] flex items-center justify-center text-[#1b4db3]">
                  <Icon className="w-6 h-6" />
                </span>
                <div className="premium-card rounded-3xl p-6 sm:p-7">
                  <p className="text-xs font-bold text-[#3a991d]">Step 0{i + 1}</p>
                  <h3 className="mt-1.5 font-heading text-xl font-bold text-[#0f2d6b]">{title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Documentation */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Documentation"
            title="The paperwork your QA team asks for"
            lead="Supplied with every order, or on request during vendor qualification."
            center
          />
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5" data-stagger>
            {DOCUMENTS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="group rounded-3xl border border-slate-200/80 p-7 hover:border-[#1b4db3]/30 hover:shadow-[0_30px_60px_-30px_rgba(15,45,107,0.35)] transition-all duration-500">
                <span className="w-12 h-12 rounded-2xl bg-[#edf3fd] text-[#1b4db3] flex items-center justify-center transition-colors group-hover:bg-[#1b4db3] group-hover:text-white">
                  <Icon className="w-6 h-6" />
                </span>
                <h3 className="mt-6 font-heading text-lg font-bold text-[#0f2d6b]">{title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Standards */}
      <section className="relative overflow-hidden bg-[#0a1d45] text-white py-24 sm:py-28">
        <div className="absolute -left-40 top-0 w-[520px] h-[520px] rounded-full bg-[#1b4db3]/40 blur-[140px]" aria-hidden="true" />
        <div className="absolute -right-40 bottom-0 w-[520px] h-[520px] rounded-full bg-[#3a991d]/25 blur-[140px]" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div data-reveal>
            <p className="eyebrow eyebrow-light">Pharmacopoeial standards</p>
            <h2 className="mt-4 font-heading text-3xl sm:text-5xl font-bold leading-[1.08] !text-white">Materials to the monograph you specify</h2>
            <p className="mt-5 text-lg leading-relaxed text-white/70">
              We source to the grade your product registration requires, and every COA states the standard it was tested against.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4" data-stagger>
            {STANDARDS.map((s) => (
              <div key={s.code} className="rounded-3xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur p-6 sm:p-8">
                <p className="font-heading text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#8fb4ff] to-[#9be07e] bg-clip-text text-transparent">{s.code}</p>
                <p className="mt-2 text-sm text-white/70">{s.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Storage & handling + CTA */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 premium-card rounded-[32px] p-8 sm:p-12" data-reveal>
            <Thermometer className="w-8 h-8 text-[#1b4db3]" />
            <h2 className="mt-6 font-heading text-2xl sm:text-3xl font-bold text-[#0f2d6b]">Storage, handling &amp; traceability</h2>
            <ul className="mt-6 grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {[
                "Batch-wise storage with first-expiry, first-out issue",
                "Temperature-sensitive materials kept as per label",
                "Quarantine area for material awaiting QC decision",
                "Every container traceable to its GRN and supplier invoice",
                "Tamper-evident sealing on dispatch",
                "Rejected material returned or replaced against debit note",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <Check className="w-4 h-4 text-[#3a991d] shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0f2d6b] to-[#1b4db3] p-8 sm:p-10 text-white flex flex-col justify-between" data-reveal="scale">
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-[#3a991d]/30 blur-[70px]" aria-hidden="true" />
            <div className="relative">
              <h2 className="font-heading text-2xl font-bold !text-white">Need documents for vendor approval?</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                Ask for registration copies, sample COAs or a vendor questionnaire, and we&apos;ll respond within one working day.
              </p>
            </div>
            <Link href="/contact" className="btn-shine relative mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#0f2d6b]">
              Request documentation <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
