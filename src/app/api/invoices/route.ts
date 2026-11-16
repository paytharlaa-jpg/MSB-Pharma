import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { generateDocumentNumber } from "@/lib/document-number";
import { createAuditLog } from "@/lib/audit";
import { parseInvoiceInput, invoiceSearchWhere, InvoiceInput } from "@/lib/invoice-input";

export async function GET(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("search") || "").trim();
    const paymentStatus = searchParams.get("paymentStatus") || "";

    const invoices = await prisma.invoice.findMany({
      where: { ...invoiceSearchWhere(q), ...(paymentStatus ? { paymentStatus } : {}) },
      orderBy: { invoiceDate: "desc" },
      include: { items: true, payments: { orderBy: { paymentDate: "asc" } } },
    });

    // Distinct past customers, so the form can auto-fill details for repeat buyers
    const customers = await prisma.invoice.findMany({
      distinct: ["customerName"],
      orderBy: { invoiceDate: "desc" },
      select: {
        customerName: true,
        customerGstin: true,
        customerAddress: true,
        customerPhone: true,
        customerEmail: true,
        placeOfSupply: true,
        category: true,
      },
    });

    return NextResponse.json({ success: true, invoices, customers });
  } catch (error: unknown) {
    console.error("Invoices GET error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { errors, data, items } = parseInvoiceInput((await request.json()) as InvoiceInput);
    if (errors.length) return NextResponse.json({ error: errors.join(". ") }, { status: 400 });

    const invoiceNumber = await generateDocumentNumber("INV");
    const invoice = await prisma.invoice.create({
      data: {
        ...data,
        invoiceNumber,
        status: "ISSUED",
        paymentStatus: "UNPAID",
        paidAmount: 0,
        balanceAmount: data.grandTotal,
        createdByUserId: user.id,
        items: { create: items },
      },
      include: { items: true, payments: true },
    });

    await createAuditLog({
      entityType: "INVOICE",
      entityId: invoice.id,
      action: "CREATE",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { invoiceNumber, customerName: data.customerName, grandTotal: data.grandTotal },
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error: unknown) {
    console.error("Invoices POST error:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
