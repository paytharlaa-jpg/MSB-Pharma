"use client";

import React, { useState } from "react";
import { ScrollProgress } from "./ScrollProgress";
import { CinematicPreloader } from "./CinematicPreloader";
import { HeroSequence } from "./HeroSequence";
import { ProductRangeSection } from "./ProductRangeSection";
import { BrandPromiseSection } from "./BrandPromiseSection";
import { ProductCategoriesSection } from "./ProductCategoriesSection";
import { HorizontalProductJourney } from "./HorizontalProductJourney";
import { ReverseScientificGallery } from "./ReverseScientificGallery";
import { SupplyChainStorySection } from "./SupplyChainStorySection";
import { TimelineMotionSection } from "./TimelineMotionSection";
import { TrustValuesSection } from "./TrustValuesSection";
import { GlobalReachSection } from "./GlobalReachSection";
import { FeaturedProductsSection } from "./FeaturedProductsSection";
import { HomeExitTransition } from "./HomeExitTransition";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface ProductItem {
  id: string;
  sku: string;
  name: string;
  grade: string | null;
  casNumber: string | null;
  therapeuticCategory: string | null;
  ihDmf: string | null;
  description: string | null;
  category: { id: string; name: string; slug: string };
}

interface HomeExperienceProps {
  products: ProductItem[];
  categories: CategoryItem[];
}

export function HomeExperience({ products, categories }: HomeExperienceProps) {
  const [preloaderComplete, setPreloaderComplete] = useState(false);

  React.useEffect(() => {
    // Refresh ScrollTrigger to lock in accurate trigger heights
    const t1 = setTimeout(() => ScrollTrigger.refresh(), 300);
    const t2 = setTimeout(() => ScrollTrigger.refresh(), 1000);
    const t3 = setTimeout(() => ScrollTrigger.refresh(), 2200);

    let resizeTimer: NodeJS.Timeout;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [preloaderComplete]);

  return (
    <div className="relative w-full bg-white text-slate-900">
      {/* 1. Scroll Progress Bar */}
      <ScrollProgress />

      {/* 3. Cinematic Preloader */}
      <CinematicPreloader onComplete={() => setPreloaderComplete(true)} />

      {/* 4. Section 1 — Cinematic Hero Transformation & Rich 3D Graphics */}
      <HeroSequence />

      {/* 5. Section 2 — Product Range Showcase (3D Rotating Pharma Molecule & Glowing Moving Gradient Box) */}
      <ProductRangeSection />

      {/* 6. Section 3 — Brand Promise (Quality. Reliability. Trust.) */}
      <BrandPromiseSection />

      {/* 6. Section 3 — Product Categories */}
      <ProductCategoriesSection categories={categories} />

      {/* 7. Section 4 — Horizontal Product Journey: Left to Right */}
      <HorizontalProductJourney />

      {/* 8. Section 5 — Reverse Horizontal Scientific Gallery: Right to Left */}
      <ReverseScientificGallery />

      {/* 9. Section 6 — Company and Supply-Chain Story */}
      <SupplyChainStorySection />

      {/* 10. Interactive Alternating Timeline (Verified Sourcing & Quality Lifecycle) */}
      <TimelineMotionSection />

      {/* 11. Section 7 — Quality, Reliability, Trust: Deep Dive */}
      <TrustValuesSection />

      {/* 12. Section 8 — Domestic and International Reach */}
      <GlobalReachSection />

      {/* 13. Section 9 — Featured Products & Commercial RFQ CTA */}
      <FeaturedProductsSection products={products} categories={categories} />

      {/* 14. Section 10 — Footer Visual Exit & Direct Connect */}
      <HomeExitTransition />
    </div>
  );
}
