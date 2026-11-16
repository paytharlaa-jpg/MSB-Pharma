import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const fyStart = new Date(now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1, 3, 1);

    const [
      totalEnquiries,
      newEnquiries,
      openEnquiries,
      grnTotal,
      grnThisMonth,
      grnQuarantine,
      invoiceAgg,
      invoiceFyAgg,
      unpaidCount,
      overdueCount,
      paymentsThisMonth,
      recentEnquiries,
      recentGrns,
      recentInvoices,
      monthlyInvoices,
    ] = await Promise.all([
      prisma.enquiry.count(),
      prisma.enquiry.count({ where: { status: "NEW" } }),
      prisma.enquiry.count({ where: { status: { notIn: ["WON", "LOST", "CLOSED"] } } }),
      prisma.goodsReceiptNote.count(),
      prisma.goodsReceiptNote.count({ where: { receiptDate: { gte: monthStart } } }),
      prisma.goodsReceiptNote.count({ where: { qcStatus: { in: ["QUARANTINE", "ON_HOLD"] } } }),
      prisma.invoice.aggregate({
        where: { status: { not: "CANCELLED" } },
        _sum: { grandTotal: true, paidAmount: true, balanceAmount: true },
        _count: true,
      }),
      prisma.invoice.aggregate({
        where: { status: { not: "CANCELLED" }, invoiceDate: { gte: fyStart } },
        _sum: { grandTotal: true, subtotal: true, taxAmount: true },
      }),
      prisma.invoice.count({ where: { balanceAmount: { gt: 0 }, status: { not: "CANCELLED" } } }),
      prisma.invoice.count({ where: { balanceAmount: { gt: 0 }, dueDate: { lt: now }, status: { not: "CANCELLED" } } }),
      prisma.paymentRecord.aggregate({ where: { paymentDate: { gte: monthStart } }, _sum: { amount: true } }),
      prisma.enquiry.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        select: { id: true, enquiryNumber: true, contactName: true, companyName: true, productOfInterest: true, status: true, createdAt: true },
      }),
      prisma.goodsReceiptNote.findMany({
        take: 5,
        orderBy: { receiptDate: "desc" },
        select: { id: true, grnNumber: true, supplierName: true, receiptDate: true, qcStatus: true, _count: { select: { items: true } } },
      }),
      prisma.invoice.findMany({
        take: 5,
        orderBy: { invoiceDate: "desc" },
        select: { id: true, invoiceNumber: true, customerName: true, invoiceDate: true, grandTotal: true, balanceAmount: true, paymentStatus: true },
      }),
      prisma.invoice.findMany({
        where: { status: { not: "CANCELLED" }, invoiceDate: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } },
        select: { invoiceDate: true, grandTotal: true },
      }),
    ]);

    // Last 6 months of billing
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-IN", { month: "short" }), total: 0 };
    });
    for (const inv of monthlyInvoices) {
      const m = months.find((x) => x.key === `${inv.invoiceDate.getFullYear()}-${inv.invoiceDate.getMonth()}`);
      if (m) m.total += inv.grandTotal;
    }

    return NextResponse.json({
      success: true,
      data: {
        enquiries: { total: totalEnquiries, new: newEnquiries, open: openEnquiries },
        grn: { total: grnTotal, thisMonth: grnThisMonth, pendingQc: grnQuarantine },
        invoices: {
          count: invoiceAgg._count,
          billed: invoiceAgg._sum.grandTotal || 0,
          received: invoiceAgg._sum.paidAmount || 0,
          outstanding: invoiceAgg._sum.balanceAmount || 0,
          unpaidCount,
          overdueCount,
          fyBilled: invoiceFyAgg._sum.grandTotal || 0,
          fyTaxable: invoiceFyAgg._sum.subtotal || 0,
          fyGst: invoiceFyAgg._sum.taxAmount || 0,
          receivedThisMonth: paymentsThisMonth._sum.amount || 0,
        },
        monthly: months.map(({ label, total }) => ({ label, total })),
        recentEnquiries,
        recentGrns,
        recentInvoices,
      },
    });
  } catch (error: unknown) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
