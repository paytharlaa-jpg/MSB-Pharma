import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { parseInvoiceInput, paymentStatusFor, InvoiceInput } from "@/lib/invoice-input";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Ctx) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { errors, data, items } = parseInvoiceInput((await request.json()) as InvoiceInput);
    if (errors.length) return NextResponse.json({ error: errors.join(". ") }, { status: 400 });

    const existing = await prisma.invoice.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    if (existing.paidAmount > data.grandTotal + 0.01) {
      return NextResponse.json(
        { error: `New total is less than payments already received (₹${existing.paidAmount.toLocaleString("en-IN")})` },
        { status: 400 }
      );
    }

    const invoice = await prisma.$transaction(async (tx) => {
      await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
      return tx.invoice.update({
        where: { id },
        data: { ...data, ...paymentStatusFor(data.grandTotal, existing.paidAmount), items: { create: items } },
        include: { items: true, payments: true },
      });
    });

    await createAuditLog({
      entityType: "INVOICE",
      entityId: id,
      action: "UPDATE",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { invoiceNumber: invoice.invoiceNumber, grandTotal: invoice.grandTotal },
    });
    return NextResponse.json({ success: true, invoice });
  } catch (error: unknown) {
    console.error("Invoice PUT error:", error);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const inv = await prisma.$transaction(async (tx) => {
      // Detach legacy delivery challans (module removed) so the delete isn't blocked
      await tx.deliveryChallan.updateMany({ where: { invoiceId: id }, data: { invoiceId: null } });
      return tx.invoice.delete({ where: { id } });
    });
    await createAuditLog({
      entityType: "INVOICE",
      entityId: id,
      action: "DELETE",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { invoiceNumber: inv.invoiceNumber },
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Invoice DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
