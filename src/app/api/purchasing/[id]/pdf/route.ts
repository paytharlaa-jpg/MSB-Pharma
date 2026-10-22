import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateDocumentPdf } from "@/lib/pdf-generator";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
    });

    if (!po) {
      return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
    }

    const doc = generateDocumentPdf({
      title: "PURCHASE ORDER",
      documentNumber: po.poNumber,
      documentDate: po.orderDate.toISOString().split("T")[0],
      dueDateOrExpiry: po.expectedDeliveryDate ? po.expectedDeliveryDate.toISOString().split("T")[0] : undefined,
      partyTitle: "Supplier Details",
      party: {
        name: po.supplier.name,
        contactPerson: po.supplier.contactPerson,
        phone: po.supplier.phone,
        email: po.supplier.email,
        address: po.supplier.address,
        gstin: po.supplier.gstin,
      },
      items: po.items.map((item, idx) => ({
        srNo: idx + 1,
        description: item.product.name,
        batchOrCas: item.product.casNumber || undefined,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
      })),
      subtotal: po.totalAmount,
      grandTotal: po.totalAmount,
      terms: po.paymentTerms || undefined,
      notes: po.notes || undefined,
      showPricing: true,
    });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${po.poNumber.replace(/\//g, "-")}.pdf"`,
      },
    });
  } catch (error: unknown) {
    console.error("PO PDF error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
