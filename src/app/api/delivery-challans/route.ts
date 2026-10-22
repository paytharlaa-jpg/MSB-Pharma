import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { generateDocumentNumber } from "@/lib/document-number";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const challans = await prisma.deliveryChallan.findMany({
      orderBy: { deliveryDate: "desc" },
      include: {
        customer: true,
        invoice: { select: { invoiceNumber: true } },
        items: {
          include: { product: true, batch: true },
        },
        createdBy: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json({ success: true, challans });
  } catch (error: unknown) {
    console.error("Delivery Challans GET error:", error);
    return NextResponse.json({ error: "Failed to fetch delivery challans" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { customerId, invoiceId, deliveryAddress, dispatchDetails, vehicleNumber, notes, items } = body;

    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Customer and dispatched product items are required" },
        { status: 400 }
      );
    }

    const challanNumber = await generateDocumentNumber("DC");

    const validatedItems = items.map((item: {
      productId: string;
      batchId?: string;
      quantity: number;
      unit?: string;
    }) => ({
      productId: item.productId,
      batchId: item.batchId || null,
      quantity: Number(item.quantity),
      unit: item.unit || "KG",
    }));

    // NOTE: Creating delivery challan does NOT deduct inventory automatically (manual stock rule)
    const challan = await prisma.deliveryChallan.create({
      data: {
        challanNumber,
        customerId,
        invoiceId: invoiceId || null,
        deliveryDate: new Date(),
        deliveryAddress: deliveryAddress?.trim() || null,
        dispatchDetails: dispatchDetails?.trim() || null,
        vehicleNumber: vehicleNumber?.trim() || null,
        notes: notes?.trim() || null,
        status: "DISPATCHED",
        createdByUserId: user.id,
        items: {
          create: validatedItems,
        },
      },
      include: { customer: true, items: true },
    });

    await createAuditLog({
      entityType: "CHALLAN",
      entityId: challan.id,
      action: "CREATE",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { challanNumber, customerId, vehicleNumber },
    });

    return NextResponse.json({
      success: true,
      message: "Delivery challan recorded. Remember: stock deduction must be recorded separately in manual stock adjustment.",
      challan,
    });
  } catch (error: unknown) {
    console.error("Delivery Challan POST error:", error);
    return NextResponse.json({ error: "Failed to create delivery challan" }, { status: 500 });
  }
}
