import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const isPublicOnly = searchParams.get("public") === "true";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { isActive: true };

    if (isPublicOnly) {
      where.isApprovedForPublic = true;
    }

    if (category && category !== "ALL") {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { casNumber: { contains: search } },
        { therapeuticCategory: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        category: true,
        batches: {
          select: {
            id: true,
            batchNumber: true,
            currentQuantity: true,
            expiryDate: true,
            storageLocation: true,
          },
        },
      },
    });

    const categories = await prisma.productCategory.findMany({
      orderBy: { sortOrder: "asc" },
    });

    // Calculate total stock per product
    const enriched = products.map((p) => {
      const totalStock = p.batches.reduce((sum, b) => sum + b.currentQuantity, 0);
      return {
        ...p,
        totalStock,
        isLowStock: totalStock <= p.minimumStock && p.minimumStock > 0,
      };
    });

    return NextResponse.json({ success: true, products: enriched, categories });
  } catch (error: unknown) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
