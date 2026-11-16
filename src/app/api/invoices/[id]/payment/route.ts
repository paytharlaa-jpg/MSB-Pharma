import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { paymentStatusFor } from "@/lib/invoice-input";
import { r2 } from "@/lib/company";

type Ctx = { params: Promise<{ id: string }> };

/** Recomputes paid / balance / status from the payment rows (single source of truth). */
async function syncInvoiceTotals(tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0], invoiceId: string) {
  const invoice = await tx.invoice.findUniqueOrThrow({ where: { id: invoiceId }, include: { payments: true } });
  const paid = r2(invoice.payments.reduce((s, p) => s + p.amount, 0));
  return tx.invoice.update({
    where: { id: invoiceId },
    data: { paidAmount: paid, ...paymentStatusFor(invoice.grandTotal, paid) },
  });
}

export async function POST(request: Request, { params }: Ctx) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id: invoiceId } = await params;
    const { amount, paymentMethod = "NEFT/RTGS", referenceNumber, notes, paymentDate } = await request.json();

    const paymentAmount = r2(Number(amount));
    if (!paymentAmount || paymentAmount <= 0) {
      return NextResponse.json({ error: "A valid positive payment amount is required" }, { status: 400 });
    }
    const when = paymentDate ? new Date(paymentDate) : new Date();
    if (isNaN(when.getTime())) return NextResponse.json({ error: "Invalid payment date" }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
      if (!invoice) throw new Error("Invoice not found");
      if (paymentAmount > invoice.balanceAmount + 0.01) {
        throw new Error(`Amount exceeds the balance due (₹${invoice.balanceAmount.toLocaleString("en-IN")})`);
      }
      const payment = await tx.paymentRecord.create({
        data: {
          invoiceId,
          amount: paymentAmount,
          paymentDate: when,
          paymentMethod: String(paymentMethod),
          referenceNumber: typeof referenceNumber === "string" && referenceNumber.trim() ? referenceNumber.trim() : null,
          notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
          recordedByUserId: user.id,
        },
      });
      const updated = await syncInvoiceTotals(tx, invoiceId);
      return { payment, invoice: updated };
    });

    await createAuditLog({
      entityType: "PAYMENT",
      entityId: result.payment.id,
      action: "PAYMENT_RECORD",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { invoiceId, amount: paymentAmount, paymentMethod, referenceNumber, newBalance: result.invoice.balanceAmount },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to record payment";
    console.error("Payment POST error:", error);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

/** DELETE /api/invoices/:id/payment?paymentId=... — removes a wrongly recorded payment. */
export async function DELETE(request: Request, { params }: Ctx) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id: invoiceId } = await params;
    const paymentId = new URL(request.url).searchParams.get("paymentId");
    if (!paymentId) return NextResponse.json({ error: "paymentId is required" }, { status: 400 });

    const invoice = await prisma.$transaction(async (tx) => {
      await tx.paymentRecord.delete({ where: { id: paymentId, invoiceId } });
      return syncInvoiceTotals(tx, invoiceId);
    });

    await createAuditLog({
      entityType: "PAYMENT",
      entityId: paymentId,
      action: "DELETE",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { invoiceId, newBalance: invoice.balanceAmount },
    });
    return NextResponse.json({ success: true, invoice });
  } catch (error: unknown) {
    console.error("Payment DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete payment" }, { status: 400 });
  }
}
