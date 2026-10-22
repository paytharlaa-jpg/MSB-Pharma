import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

interface ImportRow {
  sku?: string;
  name: string;
  category?: string;
  grade?: string;
  therapeuticCategory?: string;
  casNumber?: string;
  ihDmf?: string;
  description?: string;
  unitOfMeasurement?: string;
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rows, updateExisting = false } = (await request.json()) as {
      rows: ImportRow[];
      updateExisting?: boolean;
    };

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No product rows supplied for import" }, { status: 400 });
    }

    // Default category fallback
    let defaultCategory = await prisma.productCategory.findFirst();
    if (!defaultCategory) {
      defaultCategory = await prisma.productCategory.create({
        data: {
          name: "General APIs & Intermediates",
          slug: "general-apis-intermediates",
        },
      });
    }

    const categories = await prisma.productCategory.findMany();
    const catMap = new Map(categories.map((c) => [c.name.toLowerCase().trim(), c.id]));

    let importedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;
    const errors: Array<{ row: number; reason: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      if (!row.name || !row.name.trim()) {
        errors.push({ row: rowNum, reason: "Product Name is required" });
        skippedCount++;
        continue;
      }

      const sku = row.sku?.trim() || `SKU-IMP-${Date.now()}-${i}`;
      const name = row.name.trim();

      // Resolve category
      let categoryId = defaultCategory.id;
      if (row.category && catMap.has(row.category.toLowerCase().trim())) {
        categoryId = catMap.get(row.category.toLowerCase().trim())!;
      }

      const existingProduct = await prisma.product.findUnique({
        where: { sku },
      });

      if (existingProduct) {
        if (updateExisting) {
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              name,
              grade: row.grade || existingProduct.grade,
              therapeuticCategory: row.therapeuticCategory || existingProduct.therapeuticCategory,
              casNumber: row.casNumber || existingProduct.casNumber,
              ihDmf: row.ihDmf || existingProduct.ihDmf,
              description: row.description || existingProduct.description,
              unitOfMeasurement: row.unitOfMeasurement || existingProduct.unitOfMeasurement,
            },
          });
          updatedCount++;
        } else {
          skippedCount++;
          errors.push({ row: rowNum, reason: `SKU '${sku}' already exists; skipped` });
        }
      } else {
        await prisma.product.create({
          data: {
            sku,
            name,
            categoryId,
            grade: row.grade?.trim() || null,
            therapeuticCategory: row.therapeuticCategory?.trim() || null,
            casNumber: row.casNumber?.trim() || null,
            ihDmf: row.ihDmf?.trim() || null,
            description: row.description?.trim() || null,
            unitOfMeasurement: row.unitOfMeasurement?.trim() || "KG",
            isApprovedForPublic: true,
            isActive: true,
          },
        });
        importedCount++;
      }
    }

    await createAuditLog({
      entityType: "PRODUCT",
      entityId: "IMPORT_BATCH",
      action: "IMPORT",
      performedByUserId: user.id,
      userEmail: user.email,
      details: {
        totalRows: rows.length,
        importedCount,
        updatedCount,
        skippedCount,
      },
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalRows: rows.length,
        importedCount,
        updatedCount,
        skippedCount,
        errors,
      },
    });
  } catch (error: unknown) {
    console.error("Product import error:", error);
    return NextResponse.json({ error: "Failed to process product import" }, { status: 500 });
  }
}
