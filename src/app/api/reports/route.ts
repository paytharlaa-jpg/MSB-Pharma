import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { generateCsvString, generateExcelBuffer } from "@/lib/excel-export";
import { createAuditLog } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") || "enquiries"; // enquiries, inventory, invoices, quotations, po, grn, challans
    const format = searchParams.get("format") || "json"; // json, csv, xlsx
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

    let records: Record<string, unknown>[] = [];
    let filename = `report_${reportType}_${new Date().toISOString().split("T")[0]}`;

    switch (reportType) {
      case "enquiries": {
        const data = await prisma.enquiry.findMany({
          where: dateFilter,
          orderBy: { createdAt: "desc" },
          include: { assignedTo: { select: { name: true } } },
        });
        records = data.map((e) => ({
          "Enquiry Number": e.enquiryNumber,
          Date: e.createdAt.toISOString().split("T")[0],
          "Contact Name": e.contactName,
          Company: e.companyName || "-",
          Email: e.email,
          Phone: e.phone,
          Product: e.productOfInterest || "-",
          Category: e.category || "-",
          "Requested Qty": e.requestedQuantity ? `${e.requestedQuantity} ${e.unit || "KG"}` : "-",
          Status: e.status,
          "Assigned To": e.assignedTo?.name || "Unassigned",
          Message: e.message,
        }));
        break;
      }

      case "invoices": {
        const data = await prisma.invoice.findMany({
          where: dateFilter,
          orderBy: { invoiceDate: "desc" },
          include: { customer: { select: { name: true } } },
        });
        records = data.map((i) => ({
          "Invoice Number": i.invoiceNumber,
          Date: i.invoiceDate.toISOString().split("T")[0],
          "Due Date": i.dueDate ? i.dueDate.toISOString().split("T")[0] : "-",
          Customer: i.customer.name,
          Subtotal: i.subtotal,
          "Tax (18%)": i.taxAmount,
          "Grand Total (INR)": i.grandTotal,
          "Paid Amount (INR)": i.paidAmount,
          "Balance Due (INR)": i.balanceAmount,
          "Payment Status": i.paymentStatus,
          Status: i.status,
        }));
        break;
      }

      case "inventory": {
        const data = await prisma.productBatch.findMany({
          include: {
            product: { select: { sku: true, name: true, grade: true, casNumber: true } },
            supplier: { select: { name: true } },
          },
          orderBy: { expiryDate: "asc" },
        });
        records = data.map((b) => ({
          "Product SKU": b.product.sku,
          "Product Name": b.product.name,
          Grade: b.product.grade || "-",
          "CAS Number": b.product.casNumber || "-",
          "Batch Number": b.batchNumber,
          "Current Stock": `${b.currentQuantity} ${b.unit}`,
          "Storage Location": b.storageLocation,
          "Expiry Date": b.expiryDate ? b.expiryDate.toISOString().split("T")[0] : "-",
          Supplier: b.supplier?.name || "-",
        }));
        break;
      }

      case "quotations": {
        const data = await prisma.quotation.findMany({
          where: dateFilter,
          orderBy: { quotationDate: "desc" },
          include: { customer: { select: { name: true } } },
        });
        records = data.map((q) => ({
          "Quotation Number": q.quotationNumber,
          Date: q.quotationDate.toISOString().split("T")[0],
          "Valid Until": q.validUntilDate ? q.validUntilDate.toISOString().split("T")[0] : "-",
          Customer: q.customer.name,
          Subtotal: q.subtotal,
          "Tax Amount": q.taxAmount,
          "Grand Total (INR)": q.grandTotal,
          Status: q.status,
        }));
        break;
      }

      case "purchasing": {
        const data = await prisma.purchaseOrder.findMany({
          where: dateFilter,
          orderBy: { orderDate: "desc" },
          include: { supplier: { select: { name: true } } },
        });
        records = data.map((po) => ({
          "PO Number": po.poNumber,
          Date: po.orderDate.toISOString().split("T")[0],
          Supplier: po.supplier.name,
          "Total Amount (INR)": po.totalAmount,
          Status: po.status,
          "Payment Terms": po.paymentTerms || "-",
        }));
        break;
      }

      case "grn": {
        const data = await prisma.goodsReceiptNote.findMany({
          where: dateFilter,
          orderBy: { receiptDate: "desc" },
          include: { supplier: { select: { name: true } } },
        });
        records = data.map((g) => ({
          "GRN Number": g.grnNumber,
          Date: g.receiptDate.toISOString().split("T")[0],
          Supplier: g.supplier.name,
          Status: g.status,
          Notes: g.notes || "-",
        }));
        break;
      }

      case "challans": {
        const data = await prisma.deliveryChallan.findMany({
          where: dateFilter,
          orderBy: { deliveryDate: "desc" },
          include: { customer: { select: { name: true } } },
        });
        records = data.map((c) => ({
          "Challan Number": c.challanNumber,
          Date: c.deliveryDate.toISOString().split("T")[0],
          Customer: c.customer.name,
          "Vehicle Number": c.vehicleNumber || "-",
          Dispatch: c.dispatchDetails || "-",
          Status: c.status,
        }));
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
    }

    // Log export event in audit trail
    if (format !== "json") {
      await createAuditLog({
        entityType: "REPORT",
        entityId: reportType,
        action: "EXPORT",
        performedByUserId: user.id,
        userEmail: user.email,
        details: { reportType, format, rowsCount: records.length, startDateParam, endDateParam },
      });
    }

    if (format === "csv") {
      const csv = generateCsvString(records);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      });
    }

    if (format === "xlsx") {
      const buffer = generateExcelBuffer(records, reportType);
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      reportType,
      count: records.length,
      data: records,
    });
  } catch (error: unknown) {
    console.error("Reports API error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
