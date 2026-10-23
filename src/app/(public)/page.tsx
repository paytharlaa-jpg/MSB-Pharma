import React from "react";
import { prisma } from "@/lib/db";
import { HomeExperience } from "@/components/home/HomeExperience";

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

  return <HomeExperience products={featuredProducts} categories={categories} />;
}
