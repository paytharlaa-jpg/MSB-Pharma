import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { generateDocumentNumber } from "@/lib/document-number";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      orderBy: { orderDate: "desc" },
      include: {
        supplier: true,
        items: {
          include: { product: true },
        },
        goodsReceiptNotes: true,
        createdBy: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json({ success: true, orders });
  } catch (error: unknown) {
    console.error("Purchasing GET error:", error);
    return NextResponse.json({ error: "Failed to fetch purchase orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { supplierId, expectedDeliveryDate, notes, paymentTerms, items } = body;

    if (!supplierId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Supplier and at least one item line are required" },
        { status: 400 }
      );
    }

    const poNumber = await generateDocumentNumber("PO");

    let totalAmount = 0;
    const validatedItems = items.map((item: { productId: string; quantity: number; unitPrice: number; unit?: string }) => {
      const lineTotal = Number(item.quantity) * Number(item.unitPrice);
      totalAmount += lineTotal;
      return {
        productId: item.productId,
        quantity: Number(item.quantity),
        unit: item.unit || "KG",
        unitPrice: Number(item.unitPrice),
        lineTotal,
      };
    });

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        notes: notes?.trim() || null,
        paymentTerms: paymentTerms?.trim() || null,
        totalAmount,
        createdByUserId: user.id,
        status: "ISSUED",
        items: {
          create: validatedItems,
        },
      },
      include: { supplier: true, items: true },
    });

    await createAuditLog({
      entityType: "PO",
      entityId: po.id,
      action: "CREATE",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { poNumber, totalAmount, supplierId },
    });

    return NextResponse.json({ success: true, purchaseOrder: po });
  } catch (error: unknown) {
    console.error("Purchasing POST error:", error);
    return NextResponse.json({ error: "Failed to create purchase order" }, { status: 500 });
  }
}
