import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { generateDocumentNumber } from "@/lib/document-number";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { invoiceDate: "desc" },
      include: {
        customer: true,
        items: { include: { product: true } },
        payments: {
          include: { recordedBy: { select: { name: true } } },
          orderBy: { paymentDate: "desc" },
        },
        createdBy: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json({ success: true, invoices });
  } catch (error: unknown) {
    console.error("Invoices GET error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { customerId, quotationId, dueDays = 30, notes, terms, taxRate = 18, discountAmount = 0, items } = body;

    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Customer and invoice items are required" },
        { status: 400 }
      );
    }

    const invoiceNumber = await generateDocumentNumber("INV");

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Number(dueDays));

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

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId,
        quotationId: quotationId || null,
        invoiceDate: new Date(),
        dueDate,
        status: "ISSUED",
        paymentStatus: "UNPAID",
        currency: "INR",
        subtotal,
        taxRate: Number(taxRate),
        taxAmount,
        discountAmount: Number(discountAmount || 0),
        grandTotal,
        paidAmount: 0,
        balanceAmount: grandTotal,
        notes: notes?.trim() || null,
        terms: terms?.trim() || null,
        createdByUserId: user.id,
        items: {
          create: validatedItems,
        },
      },
      include: { customer: true, items: true },
    });

    await createAuditLog({
      entityType: "INVOICE",
      entityId: invoice.id,
      action: "CREATE",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { invoiceNumber, customerId, grandTotal },
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error: unknown) {
    console.error("Invoice POST error:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
