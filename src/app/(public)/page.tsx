import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Globe2,
  CheckCircle2,
  ArrowRight,
  FlaskConical,
  Boxes,
  Truck,
  Award,
  FileCheck,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/db";
import { PublicEnquiryForm } from "@/components/public-site/PublicEnquiryForm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let featuredProducts: Array<{
    id: string;
    sku: string;
    name: string;
    grade: string | null;
    casNumber: string | null;
    therapeuticCategory: string | null;
    ihDmf: string | null;
    description: string | null;
    category: { id: string; name: string; slug: string };
  }> = [];

  let categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
  }> = [];

  let recentPosts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string | null;
    publishedDate: Date;
    author: string;
  }> = [];

  try {
    featuredProducts = await prisma.product.findMany({
      where: { isApprovedForPublic: true, isActive: true },
      take: 6,
      include: { category: true },
      orderBy: { createdAt: "asc" },
    });
  } catch (err) {
    console.error("HomePage featuredProducts query error:", err);
  }

  try {
    categories = await prisma.productCategory.findMany({
      orderBy: { sortOrder: "asc" },
    });
  } catch (err) {
    console.error("HomePage categories query error:", err);
  }

  try {
    recentPosts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      take: 3,
      orderBy: { publishedDate: "desc" },
    });
  } catch (err) {
    console.error("HomePage recentPosts query error:", err);
  }

  return (
    <div className="space-y-0">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative bg-[#071827] text-white overflow-hidden py-24 sm:py-32 lg:py-40">
        {/* Background Visual Layer */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-scientific-background.webp"
            alt="Pharmaceutical Molecular Crystal Lattice"
            fill
            className="object-cover opacity-35 object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071827] via-[#071827]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071827] via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            {/* Scientific Precision Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Hyderabad Life Sciences Hub • Commercial API Sourcing</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Quality Products, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">
                Global Supply.
              </span>
            </h1>

            {/* Verified Subheading */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              MSB PHARMACHEM is a trusted supplier of Pharmaceutical APIs, Bulk Drugs, Pharma Raw Materials, Excipients, Domestic Chemicals, Solvents, and Certified Impurity Standards. From our base in Kukatpally, Hyderabad, we serve formulation leaders across India and international markets.
            </p>

            {/* Value Pillars */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-300 pt-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Quality Assured (COA / MSDS)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Dependable Lead Times</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>18+ Years Team Experience</span>
              </span>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a href="#rfq-section">
                <Button variant="brand-green" size="lg" className="shadow-lg shadow-emerald-900/30">
                  <span>Request a Quote</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </a>

              <Link href="/products">
                <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
                  <span>Explore 18+ Master Products</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST AND CAPABILITY STRIP */}
      <section className="bg-[#0B1F33] border-y border-slate-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="pt-4 md:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">18+ Years</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Team Supply-Chain Experience</div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">Hyderabad</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Global Pharma Hub Location</div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">WHO-GMP</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Vetted Supplier Facilities</div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">Full COA</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Verified Batch Analytical Reports</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT CATEGORIES */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#00488F] uppercase tracking-wider">What We Supply</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Comprehensive Raw Material Portfolio
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              From Active Pharmaceutical Ingredients to key synthetic intermediates and analytical impurity standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat, idx) => {
              const icons = [FlaskConical, Boxes, ShieldCheck, Truck, Award];
              const IconComponent = icons[idx % icons.length];
              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-[#00488F]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#00488F] flex items-center justify-center mb-4 group-hover:bg-[#00488F] group-hover:text-white transition-colors">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#00488F] transition-colors leading-snug">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                      {cat.description || "High purity raw materials verified with complete regulatory documentation."}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-[#00488F] group-hover:translate-x-1 transition-transform">
                    <span>Explore Products</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS SHOWCASE */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Verified Products</span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                Approved Commercial Product Catalog
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Sourced from WHO-GMP, ISO, and GLP approved facilities with complete COA support.
              </p>
            </div>

            <Link href="/products">
              <Button variant="outline" size="sm">
                <span>View All Products</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono text-[11px] text-blue-700 font-semibold">{p.sku}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      {p.category.name}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 leading-snug">{p.name}</h3>
                  {p.therapeuticCategory && (
                    <p className="text-xs text-emerald-700 font-medium mt-1">{p.therapeuticCategory}</p>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block">CAS Number</span>
                      <span className="font-mono font-medium">{p.casNumber || "-"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Standard / Grade</span>
                      <span className="font-medium">{p.grade || "IP / BP / USP"}</span>
                    </div>
                  </div>

                  {p.ihDmf && (
                    <div className="mt-2 text-[11px] text-slate-500">
                      <span className="text-slate-400">Documentation:</span> {p.ihDmf}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <a href={`#rfq-section`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Request Quotation / Sample
                    </Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. COMPANY CAPABILITIES & QUALITY PROMISE */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-[#00488F] uppercase tracking-wider">Quality • Reliability • Trust</span>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  Why Leading Pharma Formulators Rely on MSB PHARMACHEM
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Hyderabad is one of the world&apos;s foremost pharmaceutical hubs, and it is where MSB PHARMACHEM was built. Our team brings more than 18 years of experience in supply chain management, inventory planning, procurement, and vendor coordination.
              </p>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-md bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Quality You Can Verify</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Products are supported by authentic manufacturer COA, MSDS, and sourced from vetted facilities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-md bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Supply Chain Strength</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Experienced procurement planning eliminates production interruptions and buffers formulation schedules.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-md bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Global Supply Reach</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Supporting domestic manufacturers across India and export-ready shipments to Southeast Asia and international markets.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/about">
                  <Button variant="primary" size="md">
                    <span>Read Full Company Profile</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quality Lab Visual */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
              <Image
                src="/images/about-company.webp"
                alt="Analytical Quality Control Testing Laboratory"
                width={800}
                height={550}
                className="w-full h-auto object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/90 to-transparent p-6 text-white">
                <div className="text-xs font-bold text-emerald-400 uppercase">Analytical Verification</div>
                <div className="text-sm font-semibold mt-0.5">
                  High-Performance Liquid Chromatography (HPLC) & Purity Profiling
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE REQUEST A QUOTE (RFQ) / ENQUIRY SECTION */}
      <section id="rfq-section" className="py-20 bg-[#0B1F33] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Context */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 text-xs font-semibold border border-emerald-800">
                <span>Fast Commercial Response</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Request a Commercial Quotation or Sample
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Looking for specific APIs, intermediates, excipients, or custom impurity standards? Send your requirement details, and our commercial team in Hyderabad will provide availability, COA specifications, and competitive quotations.
              </p>

              <div className="p-4 rounded-xl bg-[#071827] border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Head Office:</span>
                  <span className="text-white font-medium">Kukatpally, Hyderabad</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Direct Business Phone:</span>
                  <span className="text-emerald-400 font-mono font-semibold">+91 8008335333</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Commercial Email:</span>
                  <span className="text-white font-mono">mohank9@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Form Component */}
            <div className="lg:col-span-7 bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl">
              <PublicEnquiryForm categories={categories} />
            </div>
          </div>
        </div>
      </section>

      {/* 7. INDUSTRY BLOG PREVIEW */}
      {recentPosts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
              <div>
                <span className="text-xs font-bold text-[#00488F] uppercase tracking-wider">Technical Desk</span>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                  Industry Insights & Sourcing Standards
                </h2>
              </div>

              <Link href="/blog">
                <Button variant="outline" size="sm">
                  <span>View All Articles</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {post.coverImage && (
                      <div className="h-44 relative bg-slate-100 overflow-hidden">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">
                        {new Date(post.publishedDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#00488F] transition-colors mt-1.5 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-0 text-xs font-semibold text-[#00488F] flex items-center">
                    <span>Read Article</span>
                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
