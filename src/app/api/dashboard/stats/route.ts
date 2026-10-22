import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const dateFilter =
      startDateParam && endDateParam
        ? {
            createdAt: {
              gte: new Date(startDateParam),
              lte: new Date(endDateParam),
            },
          }
        : {};

    // 1. Enquiries metrics
    const totalEnquiries = await prisma.enquiry.count({ where: dateFilter });
    const newEnquiries = await prisma.enquiry.count({
      where: { ...dateFilter, status: "NEW" },
    });
    const openEnquiries = await prisma.enquiry.count({
      where: {
        ...dateFilter,
        status: { in: ["NEW", "ASSIGNED", "IN_PROGRESS", "AWAITING_CUSTOMER"] },
      },
    });

    // 2. Inventory & Batches metrics
    const totalProducts = await prisma.product.count({ where: { isActive: true } });
    const totalBatches = await prisma.productBatch.count();

    // Batches expiring within 90 days
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    const expiringBatches = await prisma.productBatch.findMany({
      where: {
        expiryDate: {
          lte: ninetyDaysFromNow,
          gte: new Date(),
        },
        currentQuantity: { gt: 0 },
      },
      include: { product: true },
      take: 5,
    });

    const expiringCount = await prisma.productBatch.count({
      where: {
        expiryDate: {
          lte: ninetyDaysFromNow,
          gte: new Date(),
        },
        currentQuantity: { gt: 0 },
      },
    });

    // Low stock products (total batch stock < product minimumStock)
    const allProductsWithBatches = await prisma.product.findMany({
      where: { isActive: true },
      include: { batches: true },
    });

    const lowStockProducts = allProductsWithBatches.filter((p) => {
      const totalStock = p.batches.reduce((sum, b) => sum + b.currentQuantity, 0);
      return totalStock <= p.minimumStock && p.minimumStock > 0;
    });

    // 3. Purchasing & GRN
    const purchaseOrdersCount = await prisma.purchaseOrder.count({ where: dateFilter });
    const grnCount = await prisma.goodsReceiptNote.count({ where: dateFilter });

    // 4. Quotations
    const quotations = await prisma.quotation.findMany({
      where: dateFilter,
      select: { grandTotal: true, status: true },
    });
    const quotationsCount = quotations.length;
    const quotationsValue = quotations.reduce((sum, q) => sum + q.grandTotal, 0);

    // 5. Invoices & Payments
    const invoices = await prisma.invoice.findMany({
      where: dateFilter,
      select: {
        grandTotal: true,
        paidAmount: true,
        balanceAmount: true,
        paymentStatus: true,
      },
    });
    const invoicesCount = invoices.length;
    const totalInvoicedAmount = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const totalCollectedAmount = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalOutstandingAmount = invoices.reduce((sum, inv) => sum + inv.balanceAmount, 0);
    const unpaidInvoicesCount = invoices.filter((i) => i.paymentStatus !== "PAID").length;

    // 6. Recent Enquiries
    const recentEnquiries = await prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        enquiryNumber: true,
        contactName: true,
        companyName: true,
        productOfInterest: true,
        status: true,
        createdAt: true,
      },
    });

    // 7. Recent Audit Logs
    const recentAuditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    return NextResponse.json({
      success: true,
      data: {
        enquiries: {
          total: totalEnquiries,
          new: newEnquiries,
          open: openEnquiries,
        },
        inventory: {
          totalProducts,
          totalBatches,
          expiringSoonCount: expiringCount,
          lowStockCount: lowStockProducts.length,
          expiringBatches,
          lowStockProducts: lowStockProducts.slice(0, 5),
        },
        purchasing: {
          purchaseOrdersCount,
          grnCount,
        },
        quotations: {
          count: quotationsCount,
          totalValue: quotationsValue,
        },
        invoices: {
          count: invoicesCount,
          totalInvoiced: totalInvoicedAmount,
          totalCollected: totalCollectedAmount,
          totalOutstanding: totalOutstandingAmount,
          unpaidCount: unpaidInvoicesCount,
        },
        recentEnquiries,
        recentAuditLogs,
      },
    });
  } catch (error: unknown) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Failed to load dashboard statistics" }, { status: 500 });
  }
}
