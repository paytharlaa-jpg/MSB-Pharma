import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { generateCsvString, generateExcelBuffer } from "@/lib/excel-export";
import { createAuditLog } from "@/lib/audit";
import { grnSearchWhere } from "@/lib/grn-input";
import { invoiceSearchWhere } from "@/lib/invoice-input";

const day = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : "");

/**
 * GET /api/reports?type=enquiries|grn|payments|outstanding&format=json|csv|xlsx&startDate&endDate&search
 * (The GST Sales Register lives at /api/reports/sales-register.)
 */
export async function GET(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "enquiries";
    const format = searchParams.get("format") || "json";
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");
    const q = (searchParams.get("search") || "").trim();

    const range: { gte?: Date; lte?: Date } = {};
    if (start) range.gte = new Date(`${start}T00:00:00`);
    if (end) range.lte = new Date(`${end}T23:59:59.999`);
    const hasRange = !!(start || end);

    let records: Record<string, unknown>[] = [];
    let title = "";

    switch (type) {
      case "enquiries": {
        title = "Enquiries";
        const data = await prisma.enquiry.findMany({
          where: {
            ...(hasRange ? { createdAt: range } : {}),
            ...(q
              ? {
                  OR: [
                    { enquiryNumber: { contains: q } },
                    { contactName: { contains: q } },
                    { companyName: { contains: q } },
                    { email: { contains: q } },
                    { phone: { contains: q } },
                    { productOfInterest: { contains: q } },
                  ],
                }
              : {}),
          },
          orderBy: { createdAt: "desc" },
        });
        records = data.map((e) => ({
          "Enquiry No.": e.enquiryNumber,
          Date: day(e.createdAt),
          "Contact Name": e.contactName,
          Company: e.companyName || "",
          Email: e.email,
          Phone: e.phone,
          Product: e.productOfInterest || "",
          Category: e.category || "",
          "Requested Qty": e.requestedQuantity ? `${e.requestedQuantity} ${e.unit || "KG"}` : "",
          Status: e.status,
          Source: e.source,
          Message: e.message,
        }));
        break;
      }

      case "grn": {
        title = "GRN Register";
        const data = await prisma.goodsReceiptNote.findMany({
          where: { ...(hasRange ? { receiptDate: range } : {}), ...grnSearchWhere(q) },
          orderBy: { receiptDate: "desc" },
          include: { items: true },
        });
        records = data.flatMap((g) =>
          (g.items.length ? g.items : [null]).map((i) => ({
            "GRN No.": g.grnNumber,
            "GRN Date": day(g.receiptDate),
            "Time of Receipt": g.receiptTime || "",
            Supplier: g.supplierName,
            "PO No. / Date": g.poNumberDate || "",
            "Invoice No. / Date": g.invoiceNumberDate || "",
            "Vehicle No.": g.vehicleNumber || "",
            "E-Way Bill No.": g.ewayBillNumber || "",
            Material: i?.materialDescription || "",
            "Batch No.": i?.batchNumber || "",
            "Mfg Date": day(i?.mfgDate),
            "Exp / Retest Date": day(i?.expiryDate),
            "Qty as per Invoice": i?.qtyAsPerInvoice ?? "",
            "Qty Received": i?.receivedQuantity ?? "",
            "Accepted Qty": i?.acceptedQuantity ?? "",
            "Rejected Qty": i?.rejectedQuantity ?? "",
            UOM: i?.unit || "",
            "No. of Containers": i?.numContainers ?? "",
            "QC Status": g.qcStatus || "",
            "Storage Location": g.storageLocation || "",
            Remarks: g.remarks || "",
          }))
        );
        break;
      }

      case "payments": {
        title = "Payments Received";
        const data = await prisma.paymentRecord.findMany({
          where: {
            ...(hasRange ? { paymentDate: range } : {}),
            ...(q
              ? {
                  OR: [
                    { referenceNumber: { contains: q } },
                    { invoice: { invoiceNumber: { contains: q } } },
                    { invoice: { customerName: { contains: q } } },
                  ],
                }
              : {}),
          },
          orderBy: { paymentDate: "desc" },
          include: { invoice: true },
        });
        records = data.map((p) => ({
          "Payment Date": day(p.paymentDate),
          "Invoice No.": p.invoice.invoiceNumber,
          "Invoice Date": day(p.invoice.invoiceDate),
          Customer: p.invoice.customerName,
          "Customer GSTIN": p.invoice.customerGstin || "",
          Mode: p.paymentMethod.replace(/_/g, " "),
          "Reference / UTR": p.referenceNumber || "",
          "Amount (₹)": p.amount,
          "Invoice Total (₹)": p.invoice.grandTotal,
          "Balance After (₹)": p.invoice.balanceAmount,
          Notes: p.notes || "",
        }));
        break;
      }

      case "outstanding": {
        title = "Outstanding Receivables";
        const data = await prisma.invoice.findMany({
          where: {
            balanceAmount: { gt: 0 },
            status: { not: "CANCELLED" },
            ...(hasRange ? { invoiceDate: range } : {}),
            ...invoiceSearchWhere(q),
          },
          orderBy: { invoiceDate: "asc" },
        });
        const now = Date.now();
        records = data.map((i) => ({
          "Invoice No.": i.invoiceNumber,
          "Invoice Date": day(i.invoiceDate),
          "Due Date": day(i.dueDate),
          "Days Overdue": i.dueDate && i.dueDate.getTime() < now ? Math.floor((now - i.dueDate.getTime()) / 86400000) : 0,
          Customer: i.customerName,
          "Customer GSTIN": i.customerGstin || "",
          "Invoice Total (₹)": i.grandTotal,
          "Received (₹)": i.paidAmount,
          "Balance Due (₹)": i.balanceAmount,
          Status: i.paymentStatus.replace(/_/g, " "),
        }));
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
    }

    if (format === "json") {
      return NextResponse.json({ success: true, title, count: records.length, records: records.slice(0, 200) });
    }

    await createAuditLog({
      entityType: "REPORT",
      entityId: type,
      action: "EXPORT",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { type, format, startDate: start, endDate: end, search: q, count: records.length },
    });

    const filename = `MSB_${title.replace(/\s+/g, "_")}_${[start, end].filter(Boolean).join("_to_") || new Date().toISOString().slice(0, 10)}`;
    if (format === "csv") {
      return new NextResponse(generateCsvString(records), {
        headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}.csv"` },
      });
    }
    const buf = generateExcelBuffer(records, title.slice(0, 31));
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      },
    });
  } catch (error: unknown) {
    console.error("Reports error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
