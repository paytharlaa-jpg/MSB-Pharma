import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Supply Chain & Facility Gallery | MSB PHARMACHEM",
  description:
    "Explore MSB PHARMACHEM's pharmaceutical cold-chain logistics, analytical testing facilities, and warehouse storage operations.",
};

const galleryItems = [
  {
    title: "Global Air Freight & Temperature Controlled Logistics",
    category: "Supply Chain",
    image: "/images/global-supply.webp",
    caption: "Cold-chain air freight dispatch from Hyderabad Air Cargo Terminal to international destination ports.",
  },
  {
    title: "Analytical Quality Control & Chromatography",
    category: "Quality Assurance",
    image: "/images/about-company.webp",
    caption: "HPLC purity profiling and reference standard testing in state-of-the-art analytical testing facilities.",
  },
  {
    title: "API Molecular Synthesis & Chemical Precision",
    category: "R&D Standards",
    image: "/images/hero-scientific-background.webp",
    caption: "Luminous molecular structure modeling for active ingredient synthesis and chiral purification.",
  },
  {
    title: "Bulk Drug Handling & Tamper-Evident Packaging",
    category: "Warehouse Logistics",
    image: "/images/global-supply.webp",
    caption: "Sealed drum packaging adhering to strict pharmacopoeial moisture and light-barrier standards.",
  },
];

export default function GalleryPage() {
  return (
    <div className="py-16 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-[#00488F] uppercase tracking-wider">
            Supply Chain & Infrastructure
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Visual Gallery & Logistics Showcase
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Illustrating our dedication to pharmaceutical quality assurance, continuous cold-chain management, and rapid dispatch capabilities from Kukatpally, Hyderabad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {galleryItems.map((item, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-slate-900">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-emerald-400 font-semibold text-[11px] border border-slate-700">
                    {item.category}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-2">
                <h3 className="font-bold text-base text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 rounded-2xl bg-[#0B1F33] text-white text-center space-y-4 max-w-2xl mx-auto">
          <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold">Request Inspection Reports & Technical COA</h3>
          <p className="text-xs text-slate-300">
            All shipments are accompanied by authenticated manufacturer test certificates, MSDS, and batch release documentation.
          </p>
          <div className="pt-2">
            <Link href="/contact">
              <Button variant="brand-green" size="sm">
                <span>Inquire About Batch Specifications</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
