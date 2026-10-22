import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateDocumentPdf } from "@/lib/pdf-generator";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const inv = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });

    if (!inv) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const doc = generateDocumentPdf({
      title: "TAX INVOICE",
      documentNumber: inv.invoiceNumber,
      documentDate: inv.invoiceDate.toISOString().split("T")[0],
      dueDateOrExpiry: inv.dueDate ? inv.dueDate.toISOString().split("T")[0] : undefined,
      partyTitle: "Billed To (Consignee)",
      party: {
        name: inv.customer.name,
        contactPerson: inv.customer.contactPerson,
        phone: inv.customer.phone,
        email: inv.customer.email,
        address: inv.customer.address,
        gstin: inv.customer.gstin,
      },
      items: inv.items.map((item, idx) => ({
        srNo: idx + 1,
        description: item.description || item.product.name,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
      subtotal: inv.subtotal,
      taxRate: inv.taxRate,
      taxAmount: inv.taxAmount,
      discountAmount: inv.discountAmount,
      grandTotal: inv.grandTotal,
      paidAmount: inv.paidAmount,
      balanceAmount: inv.balanceAmount,
      notes: inv.notes || undefined,
      terms: inv.terms || "1. Payment due within 30 days of invoice date.\n2. Goods once sold will not be accepted without valid technical COA discrepancy report within 7 days.\n3. Subject to Hyderabad jurisdiction.",
      showPricing: true,
    });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${inv.invoiceNumber.replace(/\//g, "-")}.pdf"`,
      },
    });
  } catch (error: unknown) {
    console.error("Invoice PDF error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
