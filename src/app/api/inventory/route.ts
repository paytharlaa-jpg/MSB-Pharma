import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter"); // "ALL", "EXPIRING", "LOW_STOCK", "HISTORY"

    const now = new Date();
    const ninetyDays = new Date();
    ninetyDays.setDate(ninetyDays.getDate() + 90);

    const batches = await prisma.productBatch.findMany({
      include: {
        product: { select: { id: true, name: true, sku: true, unitOfMeasurement: true, minimumStock: true } },
        supplier: { select: { id: true, name: true } },
      },
      orderBy: { expiryDate: "asc" },
    });

    const enrichedBatches = batches.map((b) => {
      const isExpired = b.expiryDate ? b.expiryDate < now : false;
      const isExpiringSoon = b.expiryDate ? b.expiryDate >= now && b.expiryDate <= ninetyDays : false;
      const isLowStock = b.product ? b.currentQuantity <= b.product.minimumStock : false;

      return {
        ...b,
        isExpired,
        isExpiringSoon,
        isLowStock,
      };
    });

    const recentAdjustments = await prisma.stockAdjustment.findMany({
      take: 25,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true, sku: true } },
        batch: { select: { batchNumber: true } },
        performedBy: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({
      success: true,
      batches: enrichedBatches,
      recentAdjustments,
    });
  } catch (error: unknown) {
    console.error("Inventory GET error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory records" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user.role, "adjust_stock")) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission to record manual stock adjustments." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      productId,
      batchNumber,
      mfgDate,
      expiryDate,
      storageLocation,
      supplierId,
      type, // "OPENING_BALANCE" | "INCREASE" | "DECREASE" | "RECONCILIATION"
      quantityChange,
      reason,
      documentRef,
    } = body;

    if (!productId || !batchNumber || !type || quantityChange === undefined || !reason) {
      return NextResponse.json(
        { error: "Product, Batch Number, Type, Quantity, and Reason are mandatory for stock adjustments." },
        { status: 400 }
      );
    }

    const qtyNumber = Number(quantityChange);
    if (isNaN(qtyNumber)) {
      return NextResponse.json({ error: "Invalid quantity value" }, { status: 400 });
    }

    // Execute atomic adjustment in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find or create batch
      let batch = await tx.productBatch.findUnique({
        where: {
          productId_batchNumber: {
            productId,
            batchNumber: batchNumber.trim(),
          },
        },
      });

      if (!batch) {
        batch = await tx.productBatch.create({
          data: {
            productId,
            batchNumber: batchNumber.trim(),
            mfgDate: mfgDate ? new Date(mfgDate) : null,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            storageLocation: storageLocation?.trim() || "Main Warehouse - Kukatpally",
            supplierId: supplierId || null,
            currentQuantity: 0,
          },
        });
      }

      const quantityBefore = batch.currentQuantity;
      let quantityAfter = quantityBefore;

      switch (type) {
        case "OPENING_BALANCE":
          quantityAfter = qtyNumber;
          break;
        case "INCREASE":
          quantityAfter = quantityBefore + Math.abs(qtyNumber);
          break;
        case "DECREASE":
          if (quantityBefore < Math.abs(qtyNumber)) {
            throw new Error(`Insufficient stock: current stock is ${quantityBefore}, cannot decrease by ${qtyNumber}.`);
          }
          quantityAfter = quantityBefore - Math.abs(qtyNumber);
          break;
        case "RECONCILIATION":
          quantityAfter = qtyNumber;
          break;
        default:
          throw new Error(`Invalid adjustment type: ${type}`);
      }

      // 2. Update batch current quantity
      const updatedBatch = await tx.productBatch.update({
        where: { id: batch.id },
        data: { currentQuantity: quantityAfter },
      });

      // 3. Create immutable stock adjustment audit entry
      const adjustment = await tx.stockAdjustment.create({
        data: {
          batchId: batch.id,
          productId,
          type,
          quantityChange: type === "DECREASE" ? -Math.abs(qtyNumber) : qtyNumber,
          quantityBefore,
          quantityAfter,
          reason: reason.trim(),
          documentRef: documentRef?.trim() || null,
          performedByUserId: user.id,
        },
      });

      return { batch: updatedBatch, adjustment };
    });

    await createAuditLog({
      entityType: "STOCK",
      entityId: result.batch.id,
      action: "MANUAL_ADJUSTMENT",
      performedByUserId: user.id,
      userEmail: user.email,
      details: {
        batchNumber,
        type,
        qtyNumber,
        reason,
        documentRef,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Stock adjustment recorded successfully.",
      data: result,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to record stock adjustment";
    console.error("Stock adjustment error:", error);
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
