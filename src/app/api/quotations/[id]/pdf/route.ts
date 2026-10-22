import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateDocumentPdf } from "@/lib/pdf-generator";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const qtn = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });

    if (!qtn) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    const doc = generateDocumentPdf({
      title: "FORMAL QUOTATION",
      documentNumber: qtn.quotationNumber,
      documentDate: qtn.quotationDate.toISOString().split("T")[0],
      dueDateOrExpiry: qtn.validUntilDate ? qtn.validUntilDate.toISOString().split("T")[0] : undefined,
      partyTitle: "Quotation Prepared For",
      party: {
        name: qtn.customer.name,
        contactPerson: qtn.customer.contactPerson,
        phone: qtn.customer.phone,
        email: qtn.customer.email,
        address: qtn.customer.address,
        gstin: qtn.customer.gstin,
      },
      items: qtn.items.map((item, idx) => ({
        srNo: idx + 1,
        description: item.description || item.product.name,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
      subtotal: qtn.subtotal,
      taxRate: qtn.taxRate,
      taxAmount: qtn.taxAmount,
      discountAmount: qtn.discountAmount,
      grandTotal: qtn.grandTotal,
      notes: qtn.notes || undefined,
      terms: qtn.terms || "1. Prices valid for 15 days from issue date.\n2. GST applicable at prevailing rates.\n3. Delivery subject to stock confirmation upon PO receipt.",
      showPricing: true,
    });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${qtn.quotationNumber.replace(/\//g, "-")}.pdf"`,
      },
    });
  } catch (error: unknown) {
    console.error("Quotation PDF error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
