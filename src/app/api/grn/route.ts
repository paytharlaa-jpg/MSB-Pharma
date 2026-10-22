import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { generateDocumentNumber } from "@/lib/document-number";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const grns = await prisma.goodsReceiptNote.findMany({
      orderBy: { receiptDate: "desc" },
      include: {
        supplier: true,
        purchaseOrder: { select: { poNumber: true } },
        items: { include: { product: true } },
        receivedBy: { select: { name: true } },
      },
    });
    return NextResponse.json({ success: true, grns });
  } catch (error: unknown) {
    console.error("GRN GET error:", error);
    return NextResponse.json({ error: "Failed to fetch GRNs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { supplierId, purchaseOrderId, notes, items } = body;

    if (!supplierId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Supplier and received product items are required" },
        { status: 400 }
      );
    }

    const grnNumber = await generateDocumentNumber("GRN");

    const validatedItems = items.map((item: {
      productId: string;
      batchNumber: string;
      expiryDate?: string;
      receivedQuantity: number;
      acceptedQuantity: number;
      rejectedQuantity?: number;
      unit?: string;
      storageLocation?: string;
    }) => ({
      productId: item.productId,
      batchNumber: item.batchNumber.trim(),
      expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
      receivedQuantity: Number(item.receivedQuantity),
      acceptedQuantity: Number(item.acceptedQuantity),
      rejectedQuantity: Number(item.rejectedQuantity || 0),
      unit: item.unit || "KG",
      storageLocation: item.storageLocation?.trim() || "Main Warehouse - Kukatpally",
    }));

    // NOTE: In strict accordance with project rules, GRN does NOT mutate stock balances.
    // Stock updates must be done manually via the authorized stock adjustment workflow.
    const grn = await prisma.goodsReceiptNote.create({
      data: {
        grnNumber,
        supplierId,
        purchaseOrderId: purchaseOrderId || null,
        notes: notes?.trim() || null,
        receivedByUserId: user.id,
        status: "VERIFIED",
        items: {
          create: validatedItems,
        },
      },
      include: { supplier: true, items: true },
    });

    await createAuditLog({
      entityType: "GRN",
      entityId: grn.id,
      action: "CREATE",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { grnNumber, supplierId, itemsCount: validatedItems.length },
    });

    return NextResponse.json({
      success: true,
      message: "GRN recorded successfully. Remember: stock quantities must be updated separately via manual stock adjustment.",
      grn,
    });
  } catch (error: unknown) {
    console.error("GRN POST error:", error);
    return NextResponse.json({ error: "Failed to create GRN" }, { status: 500 });
  }
}
