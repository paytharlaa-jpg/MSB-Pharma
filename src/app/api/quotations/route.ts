import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { generateDocumentNumber } from "@/lib/document-number";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const quotations = await prisma.quotation.findMany({
      orderBy: { quotationDate: "desc" },
      include: {
        customer: true,
        items: { include: { product: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json({ success: true, quotations });
  } catch (error: unknown) {
    console.error("Quotations GET error:", error);
    return NextResponse.json({ error: "Failed to fetch quotations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { customerId, validDays = 15, notes, terms, taxRate = 18, discountAmount = 0, items } = body;

    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Customer and quotation line items are required" },
        { status: 400 }
      );
    }

    const quotationNumber = await generateDocumentNumber("QTN");

    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + Number(validDays));

    let subtotal = 0;
    const validatedItems = items.map((item: {
      productId: string;
      description?: string;
      quantity: number;
      unitPrice: number;
      unit?: string;
    }) => {
      const lineTotal = Number(item.quantity) * Number(item.unitPrice);
      subtotal += lineTotal;
      return {
        productId: item.productId,
        description: item.description?.trim() || null,
        quantity: Number(item.quantity),
        unit: item.unit || "KG",
        unitPrice: Number(item.unitPrice),
        lineTotal,
      };
    });

    const taxAmount = (subtotal * Number(taxRate)) / 100;
    const grandTotal = subtotal + taxAmount - Number(discountAmount || 0);

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        customerId,
        quotationDate: new Date(),
        validUntilDate,
        status: "SENT",
        notes: notes?.trim() || null,
        terms: terms?.trim() || null,
        subtotal,
        taxRate: Number(taxRate),
        taxAmount,
        discountAmount: Number(discountAmount || 0),
        grandTotal,
        createdByUserId: user.id,
        items: {
          create: validatedItems,
        },
      },
      include: { customer: true, items: true },
    });

    await createAuditLog({
      entityType: "QUOTATION",
      entityId: quotation.id,
      action: "CREATE",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { quotationNumber, customerId, grandTotal },
    });

    return NextResponse.json({ success: true, quotation });
  } catch (error: unknown) {
    console.error("Quotation POST error:", error);
    return NextResponse.json({ error: "Failed to create quotation" }, { status: 500 });
  }
}
