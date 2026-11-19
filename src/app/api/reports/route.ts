import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { generateCsvString } from "@/lib/excel-export";
import { createAuditLog } from "@/lib/audit";
import { grnSearchWhere } from "@/lib/grn-input";
import { invoiceSearchWhere } from "@/lib/invoice-input";
import { buildRegisterWorkbook, RegisterColumn } from "@/lib/register-export";

const day = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : "");
const STATUS_LABEL: Record<string, string> = {
  NEW: "New",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  AWAITING_CUSTOMER: "Awaiting Customer",
  QUOTATION_SENT: "Quotation Sent",
  WON: "Won",
  LOST: "Lost",
  CLOSED: "Closed",
};

/** Pulls "[Business Type: …]" / "[Target Standard: …]" tags out of the enquiry message. */
function splitEnquiryMessage(message: string) {
  const tag = (name: string) => message.match(new RegExp(`\\[${name}:\\s*([^\\]]+)\\]`, "i"))?.[1]?.trim() || "";
  const body = message.replace(/\[(Business Type|Target Standard):[^\]]*\]\s*/gi, "").trim();
  return { businessType: tag("Business Type"), standard: tag("Target Standard"), body };
}

interface Report {
  title: string;
  sheet: string;
  columns: RegisterColumn[];
  rows: Record<string, unknown>[];
  summary: string;
}

/**
 * GET /api/reports?type=enquiries|grn|payments|outstanding&format=json|csv|xlsx&startDate&endDate&search
 * Excel downloads use the Sales Register look (see lib/register-export.ts).
 * The GST Sales Register itself lives at /api/reports/sales-register.
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

    let report: Report;

    switch (type) {
      case "enquiries": {
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
                    { assignedToName: { contains: q } },
                    { status: { contains: q.toUpperCase().replace(/\s+/g, "_") } },
                  ],
                }
              : {}),
          },
          orderBy: { createdAt: "asc" },
          include: { _count: { select: { enquiryNotes: true } } },
        });
        const rows = data.map((e, i) => {
          const m = splitEnquiryMessage(e.message);
          return {
            sr: i + 1,
            enquiryNumber: e.enquiryNumber,
            date: e.createdAt,
            contactName: e.contactName,
            company: e.companyName || "",
            businessType: m.businessType,
            email: e.email,
            phone: e.phone,
            category: e.category || "",
            product: e.productOfInterest || "",
            standard: m.standard,
            quantity: e.requestedQuantity ?? null,
            unit: e.requestedQuantity ? e.unit || "KG" : "",
            status: STATUS_LABEL[e.status] || e.status,
            assignedTo: e.assignedToName || "Unassigned",
            source: e.source,
            followUps: e._count.enquiryNotes,
            message: m.body,
          };
        });
        const assigned = data.filter((e) => e.assignedToName).length;
        const by = (s: string) => data.filter((e) => e.status === s).length;
        report = {
          title: "ENQUIRIES & LEADS REGISTER",
          sheet: "Leads Register",
          columns: [
            { header: "Sr", key: "sr", width: 5, type: "int" },
            { header: "Enquiry No.", key: "enquiryNumber", width: 19 },
            { header: "Date", key: "date", width: 11, type: "date" },
            { header: "Contact Name", key: "contactName", width: 22 },
            { header: "Company", key: "company", width: 26 },
            { header: "Business Type", key: "businessType", width: 22 },
            { header: "Email", key: "email", width: 28 },
            { header: "Phone", key: "phone", width: 16 },
            { header: "Product Category", key: "category", width: 26 },
            { header: "Product of Interest\n(API / CAS)", key: "product", width: 30 },
            { header: "Target\nStandard", key: "standard", width: 10 },
            { header: "Req. Qty", key: "quantity", width: 10, type: "qty" },
            { header: "Unit", key: "unit", width: 7 },
            { header: "Status", key: "status", width: 16 },
            { header: "Assigned To", key: "assignedTo", width: 20 },
            { header: "Source", key: "source", width: 11 },
            { header: "Follow-up\nNotes", key: "followUps", width: 10, type: "int" },
            { header: "Requirement / Message", key: "message", width: 50, type: "longtext" },
          ],
          rows,
          summary: `Total enquiries: ${data.length}   |   New: ${by("NEW")}   |   In progress: ${by("IN_PROGRESS") + by("AWAITING_CUSTOMER") + by("QUOTATION_SENT")}   |   Won: ${by("WON")}   |   Lost: ${by("LOST")}   |   Assigned: ${assigned}   |   Unassigned: ${data.length - assigned}`,
        };
        break;
      }

      case "grn": {
        const data = await prisma.goodsReceiptNote.findMany({
          where: { ...(hasRange ? { receiptDate: range } : {}), ...grnSearchWhere(q) },
          orderBy: { receiptDate: "asc" },
          include: { items: true },
        });
        const rows = data.flatMap((g) =>
          (g.items.length ? g.items : [null]).map((i) => ({
            grnNumber: g.grnNumber,
            grnDate: g.receiptDate,
            time: g.receiptTime || "",
            supplier: g.supplierName,
            po: g.poNumberDate || "",
            invoice: g.invoiceNumberDate || "",
            vehicle: g.vehicleNumber || "",
            eway: g.ewayBillNumber || "",
            material: i?.materialDescription || "",
            batch: i?.batchNumber || "",
            mfg: i?.mfgDate ?? null,
            exp: i?.expiryDate ?? null,
            qtyInvoice: i?.qtyAsPerInvoice ?? null,
            received: i?.receivedQuantity ?? null,
            accepted: i?.acceptedQuantity ?? null,
            rejected: i?.rejectedQuantity ?? null,
            uom: i?.unit || "",
            containers: i?.numContainers ?? null,
            qcStatus: (g.qcStatus || "").replace(/_/g, " "),
            storage: g.storageLocation || "",
            remarks: g.remarks || "",
          }))
        );
        report = {
          title: "GOODS RECEIPT (GRN) REGISTER",
          sheet: "GRN Register",
          columns: [
            { header: "GRN No.", key: "grnNumber", width: 22 },
            { header: "GRN Date", key: "grnDate", width: 11, type: "date" },
            { header: "Time", key: "time", width: 8 },
            { header: "Supplier", key: "supplier", width: 26 },
            { header: "PO No. / Date", key: "po", width: 20 },
            { header: "Invoice No. / Date", key: "invoice", width: 22 },
            { header: "Vehicle No.", key: "vehicle", width: 14 },
            { header: "E-Way Bill No.", key: "eway", width: 16 },
            { header: "Material", key: "material", width: 30 },
            { header: "Batch No.", key: "batch", width: 14 },
            { header: "Mfg Date", key: "mfg", width: 11, type: "date" },
            { header: "Exp / Retest", key: "exp", width: 11, type: "date" },
            { header: "Qty as per\nInvoice", key: "qtyInvoice", width: 11, type: "qty" },
            { header: "Qty\nReceived", key: "received", width: 11, type: "qty" },
            { header: "Accepted", key: "accepted", width: 11, type: "qty" },
            { header: "Rejected", key: "rejected", width: 10, type: "qty" },
            { header: "UOM", key: "uom", width: 7 },
            { header: "No. of\nCont.", key: "containers", width: 8, type: "int" },
            { header: "QC Status", key: "qcStatus", width: 13 },
            { header: "Storage Location", key: "storage", width: 18 },
            { header: "Remarks", key: "remarks", width: 36, type: "longtext" },
          ],
          rows,
          summary: `GRNs: ${data.length}   |   Material lines: ${rows.length}   |   Pending QC (quarantine / on hold): ${data.filter((g) => g.qcStatus === "QUARANTINE" || g.qcStatus === "ON_HOLD").length}`,
        };
        break;
      }

      case "payments": {
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
          orderBy: { paymentDate: "asc" },
          include: { invoice: true },
        });
        const total = data.reduce((s, p) => s + p.amount, 0);
        report = {
          title: "PAYMENTS RECEIVED REGISTER",
          sheet: "Payments Received",
          columns: [
            { header: "Payment Date", key: "date", width: 12, type: "date" },
            { header: "Invoice No.", key: "invoiceNumber", width: 18 },
            { header: "Invoice Date", key: "invoiceDate", width: 12, type: "date" },
            { header: "Customer", key: "customer", width: 30 },
            { header: "Customer GSTIN", key: "gstin", width: 18 },
            { header: "Mode", key: "mode", width: 14 },
            { header: "Reference / UTR", key: "ref", width: 20 },
            { header: "Amount (₹)", key: "amount", width: 15, type: "money" },
            { header: "Invoice Total (₹)", key: "invoiceTotal", width: 16, type: "money" },
            { header: "Balance Now (₹)", key: "balance", width: 15, type: "money" },
            { header: "Notes", key: "notes", width: 30, type: "longtext" },
          ],
          rows: data.map((p) => ({
            date: p.paymentDate,
            invoiceNumber: p.invoice.invoiceNumber,
            invoiceDate: p.invoice.invoiceDate,
            customer: p.invoice.customerName,
            gstin: p.invoice.customerGstin || "",
            mode: p.paymentMethod.replace(/_/g, " "),
            ref: p.referenceNumber || "",
            amount: p.amount,
            invoiceTotal: p.invoice.grandTotal,
            balance: p.invoice.balanceAmount,
            notes: p.notes || "",
          })),
          summary: `Payments: ${data.length}   |   Total received: ₹${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        };
        break;
      }

      case "outstanding": {
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
        const due = data.reduce((s, i) => s + i.balanceAmount, 0);
        report = {
          title: "OUTSTANDING RECEIVABLES",
          sheet: "Outstanding",
          columns: [
            { header: "Invoice No.", key: "invoiceNumber", width: 18 },
            { header: "Invoice Date", key: "invoiceDate", width: 12, type: "date" },
            { header: "Due Date", key: "dueDate", width: 12, type: "date" },
            { header: "Days\nOverdue", key: "overdue", width: 9, type: "int" },
            { header: "Customer", key: "customer", width: 30 },
            { header: "Customer GSTIN", key: "gstin", width: 18 },
            { header: "Invoice Total (₹)", key: "total", width: 16, type: "money" },
            { header: "Received (₹)", key: "received", width: 15, type: "money" },
            { header: "Balance Due (₹)", key: "balance", width: 15, type: "money" },
            { header: "Status", key: "status", width: 15 },
          ],
          rows: data.map((i) => ({
            invoiceNumber: i.invoiceNumber,
            invoiceDate: i.invoiceDate,
            dueDate: i.dueDate,
            overdue: i.dueDate && i.dueDate.getTime() < now ? Math.floor((now - i.dueDate.getTime()) / 86400000) : 0,
            customer: i.customerName,
            gstin: i.customerGstin || "",
            total: i.grandTotal,
            received: i.paidAmount,
            balance: i.balanceAmount,
            status: i.paymentStatus.replace(/_/g, " "),
          })),
          summary: `Open invoices: ${data.length}   |   Total balance due: ₹${due.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        };
        break;
      }

      default:
        return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
    }

    // Flat, human-readable rows for the on-screen preview and CSV
    const flat = report.rows.map((r) =>
      Object.fromEntries(
        report.columns.map((c) => {
          const v = r[c.key];
          return [c.header.replace(/\n/g, " "), c.type === "date" ? (v ? day(v as Date) : "") : (v ?? "")];
        })
      )
    );

    if (format === "json") {
      return NextResponse.json({ success: true, title: report.title, count: flat.length, records: flat.slice(0, 200) });
    }

    await createAuditLog({
      entityType: "REPORT",
      entityId: type,
      action: "EXPORT",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { type, format, startDate: start, endDate: end, search: q, count: flat.length },
    });

    const stamp = [start, end].filter(Boolean).join("_to_") || new Date().toISOString().slice(0, 10);
    const filename = `MSB_${report.sheet.replace(/\s+/g, "_")}_${stamp}`;
    if (format === "csv") {
      return new NextResponse(generateCsvString(flat), {
        headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}.csv"` },
      });
    }

    const fmt = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const period = start || end ? `${start ? fmt(start) : "start"} to ${end ? fmt(end) : "today"}` : "all records";
    const buf = await buildRegisterWorkbook({
      sheetName: report.sheet,
      title: report.title,
      note: `MSB PHARMACHEM, Hyderabad. Period: ${period}${q ? `. Filter: "${q}"` : ""}. Generated ${new Date().toLocaleString("en-IN")} from the MSB Business Portal.`,
      summary: report.summary,
      columns: report.columns,
      rows: report.rows,
      freezeColumns: 2,
    });
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
