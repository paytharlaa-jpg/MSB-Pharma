import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: invoiceId } = await params;
    const body = await request.json();
    const { amount, paymentMethod = "BANK_TRANSFER", referenceNumber, notes } = body;

    const paymentAmount = Number(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      return NextResponse.json({ error: "A valid positive payment amount is required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      const newPaidAmount = invoice.paidAmount + paymentAmount;
      const newBalanceAmount = Math.max(0, invoice.grandTotal - newPaidAmount);

      let newStatus = invoice.paymentStatus;
      if (newBalanceAmount <= 0) {
        newStatus = "PAID";
      } else if (newPaidAmount > 0) {
        newStatus = "PARTIALLY_PAID";
      }

      // Record payment event
      const payment = await tx.paymentRecord.create({
        data: {
          invoiceId,
          amount: paymentAmount,
          paymentMethod,
          referenceNumber: referenceNumber?.trim() || null,
          notes: notes?.trim() || null,
          recordedByUserId: user.id,
        },
      });

      // Update invoice status & balances
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaidAmount,
          balanceAmount: newBalanceAmount,
          paymentStatus: newStatus,
        },
      });

      return { payment, invoice: updatedInvoice };
    });

    await createAuditLog({
      entityType: "PAYMENT",
      entityId: result.payment.id,
      action: "RECORD_PAYMENT",
      performedByUserId: user.id,
      userEmail: user.email,
      details: {
        invoiceId,
        amount: paymentAmount,
        paymentMethod,
        referenceNumber,
        newBalance: result.invoice.balanceAmount,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment recorded successfully",
      data: result,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to record payment";
    console.error("Payment POST error:", error);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
