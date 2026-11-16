import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/public-site/PageHero";
import { GalleryGrid, GalleryItem } from "@/components/public-site/GalleryGrid";

export const metadata = {
  title: "Gallery | MSB PHARMACHEM: Science, Quality & Supply Chain",
  description:
    "A visual look at MSB PHARMACHEM: pharmaceutical science, quality documentation, warehousing and our supply network from Hyderabad.",
};

const ITEMS: GalleryItem[] = [
  {
    title: "Molecular architecture",
    category: "Science",
    image: "/images/gallery-molecular-architecture.webp",
    caption: "Every API we supply starts as a precisely defined structure, verified against its pharmacopoeial monograph.",
    isNew: true,
  },
  {
    title: "Analytical quality control",
    category: "Quality",
    image: "/images/gallery-quality-control.webp",
    caption: "HPLC purity profiling and reference-standard testing behind every Certificate of Analysis.",
    tall: true,
  },
  {
    title: "High-bay strategic warehousing",
    category: "Facility",
    image: "/images/msb-brand-highbay-warehouse.webp",
    caption: "Multi-tier pharmaceutical storage racks with certified MSB PHARMACHEM batch inventory in Kukatpally, Hyderabad.",
    tall: true,
  },
  {
    title: "Integrated logistics & material handling",
    category: "Supply Chain",
    image: "/images/msb-brand-logistics-forklift.webp",
    caption: "Automated forklift handling, IBC containers, and dispatch-ready pallet staging.",
    isNew: true,
  },
  {
    title: "Documentation with every batch",
    category: "Quality",
    image: "/images/gallery-quality-documentation.webp",
    caption: "COA, MSDS and inspection records travel with each consignment, ready for your QA release.",
  },
  {
    title: "Active pharmaceutical ingredients",
    category: "Science",
    image: "/images/gallery-api-materials.webp",
    caption: "Human and veterinary APIs for generic formulation manufacturers.",
    tall: true,
  },
  {
    title: "Air freight & export dispatch",
    category: "Supply Chain",
    image: "/images/gallery-export-dispatch.webp",
    caption: "Export-ready documentation and coordinated air and sea freight for international buyers.",
  },
  {
    title: "Tamper-evident batch packaging",
    category: "Quality",
    image: "/images/msb-brand-batch-drum-closeup.webp",
    caption: "Verified batch numbering, strict storage parameters, and intact security seals on MSB PHARMACHEM drums.",
    isNew: true,
  },
  {
    title: "Laboratory precision",
    category: "Quality",
    image: "/images/gallery-laboratory-precision.webp",
    caption: "Analytical instruments and trained chemists supporting impurity and assay checks.",
  },
  {
    title: "Impurity reference standards",
    category: "Quality",
    image: "/images/gallery-impurity-standards.webp",
    caption: "Certified standards for method validation and quality control.",
    tall: true,
  },
  {
    title: "Cleanroom batch inspection & staging",
    category: "Facility",
    image: "/images/msb-brand-drum-staging.webp",
    caption: "Dedicated laminar flow airlocks and sampling booths ensuring zero contamination during intake.",
    isNew: true,
  },
  {
    title: "Controlled sampling & dispensing suites",
    category: "Science",
    image: "/images/msb-brand-cleanroom-sampling.webp",
    caption: "Stainless steel roller staging and HEPA-filtered quarantine bays for incoming active ingredients.",
    isNew: true,
  },
  {
    title: "Bulk chemical storage infrastructure",
    category: "Facility",
    image: "/images/msb-brand-racking-storage.webp",
    caption: "Segregated, temperature-monitored pallet racking engineered for rapid formulation buffer orders.",
  },
  {
    title: "Excipients for formulation",
    category: "Science",
    image: "/images/gallery-excipients.webp",
    caption: "Binders, disintegrants and fillers that meet stability and dissolution needs.",
  },
  {
    title: "Molecular close-up",
    category: "Science",
    image: "/images/gallery-molecular-closeup.webp",
    caption: "Crystalline integrity and polymorphic form matter as much as chemical purity.",
  },
  {
    title: "Regional & national transit network",
    category: "Supply Chain",
    image: "/images/gallery-supply-network.webp",
    caption: "Dependable transport partners connecting Hyderabad's pharma corridor to formulation plants across India.",
  },
];

export default function GalleryPage() {
  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Gallery"
        title="Science, quality and"
        accent="supply in focus"
        lead="A closer look at the materials, checks and logistics behind every MSB PHARMACHEM consignment."
        image="/images/gallery-hero-facility.webp"
      />
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GalleryGrid items={ITEMS} />
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 rounded-[28px] bg-[#f6f8fc] px-8 py-8" data-reveal>
            <p className="font-heading text-xl font-bold text-[#0f2d6b] text-center sm:text-left">Want to see our documentation or visit the warehouse?</p>
            <Link href="/contact" className="btn-shine inline-flex items-center gap-2 rounded-full bg-[#0f2d6b] px-6 py-3.5 text-sm font-semibold text-white">
              Contact us <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
