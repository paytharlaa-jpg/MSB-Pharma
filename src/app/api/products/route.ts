import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

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

export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      sku,
      name,
      categoryId,
      grade,
      therapeuticCategory,
      casNumber,
      ihDmf,
      description,
      unitOfMeasurement,
      minimumStock,
      isApprovedForPublic,
    } = body;

    if (!sku || !name || !categoryId) {
      return NextResponse.json(
        { error: "SKU, Product Name, and Category are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({ where: { sku: sku.trim() } });
    if (existing) {
      return NextResponse.json({ error: `SKU '${sku}' already exists` }, { status: 409 });
    }

    const product = await prisma.product.create({
      data: {
        sku: sku.trim(),
        name: name.trim(),
        categoryId,
        grade: grade?.trim() || null,
        therapeuticCategory: therapeuticCategory?.trim() || null,
        casNumber: casNumber?.trim() || null,
        ihDmf: ihDmf?.trim() || null,
        description: description?.trim() || null,
        unitOfMeasurement: unitOfMeasurement || "KG",
        minimumStock: minimumStock ? Number(minimumStock) : 0,
        isApprovedForPublic: isApprovedForPublic !== false,
        isActive: true,
      },
      include: { category: true },
    });

    await createAuditLog({
      entityType: "PRODUCT",
      entityId: product.id,
      action: "CREATE",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { sku: product.sku, name: product.name },
    });

    return NextResponse.json({ success: true, product });
  } catch (error: unknown) {
    console.error("Product POST error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });

    await createAuditLog({
      entityType: "PRODUCT",
      entityId: id,
      action: "UPDATE",
      performedByUserId: user.id,
      userEmail: user.email,
      details: data,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: unknown) {
    console.error("Product PUT error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}
