import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { grnSearchWhere } from "@/lib/grn-input";
import { invoiceSearchWhere } from "@/lib/invoice-input";

/** Global back-office search across enquiries, GRNs and invoices (dashboard search box). */
export async function GET(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = (new URL(request.url).searchParams.get("q") || "").trim();
  if (q.length < 2) return NextResponse.json({ success: true, results: [] });

  const [enquiries, grns, invoices] = await Promise.all([
    prisma.enquiry.findMany({
      where: {
        OR: [
          { enquiryNumber: { contains: q } },
          { contactName: { contains: q } },
          { companyName: { contains: q } },
          { email: { contains: q } },
          { phone: { contains: q } },
          { productOfInterest: { contains: q } },
        ],
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    prisma.goodsReceiptNote.findMany({ where: grnSearchWhere(q), take: 6, orderBy: { receiptDate: "desc" } }),
    prisma.invoice.findMany({ where: invoiceSearchWhere(q), take: 6, orderBy: { invoiceDate: "desc" } }),
  ]);

  const results = [
    ...enquiries.map((e) => ({
      type: "Enquiry",
      title: `${e.enquiryNumber}: ${e.contactName}`,
      subtitle: [e.companyName, e.productOfInterest, e.status].filter(Boolean).join(" · "),
      href: `/dashboard/enquiries?search=${encodeURIComponent(e.enquiryNumber)}`,
    })),
    ...grns.map((g) => ({
      type: "GRN",
      title: `${g.grnNumber}: ${g.supplierName}`,
      subtitle: [g.receiptDate.toISOString().slice(0, 10), g.qcStatus].filter(Boolean).join(" · "),
      href: `/dashboard/grn?search=${encodeURIComponent(g.grnNumber)}`,
    })),
    ...invoices.map((i) => ({
      type: "Invoice",
      title: `${i.invoiceNumber}: ${i.customerName}`,
      subtitle: `₹${i.grandTotal.toLocaleString("en-IN")} · ${i.paymentStatus.replace(/_/g, " ")}`,
      href: `/dashboard/invoices?search=${encodeURIComponent(i.invoiceNumber)}`,
    })),
  ];
  return NextResponse.json({ success: true, results });
}
