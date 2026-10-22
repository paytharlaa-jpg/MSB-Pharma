import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateDocumentPdf } from "@/lib/pdf-generator";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const grn = await prisma.goodsReceiptNote.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
    });

    if (!grn) {
      return NextResponse.json({ error: "GRN not found" }, { status: 404 });
    }

    const doc = generateDocumentPdf({
      title: "GOODS RECEIPT NOTE (GRN)",
      documentNumber: grn.grnNumber,
      documentDate: grn.receiptDate.toISOString().split("T")[0],
      partyTitle: "Supplier / Consignor",
      party: {
        name: grn.supplier.name,
        contactPerson: grn.supplier.contactPerson,
        phone: grn.supplier.phone,
        email: grn.supplier.email,
        address: grn.supplier.address,
        gstin: grn.supplier.gstin,
      },
      items: grn.items.map((item, idx) => ({
        srNo: idx + 1,
        description: `${item.product.name} (Accepted: ${item.acceptedQuantity} ${item.unit}${item.rejectedQuantity > 0 ? `, Rejected: ${item.rejectedQuantity}` : ""})`,
        batchOrCas: `Batch: ${item.batchNumber}${item.expiryDate ? ` | Exp: ${item.expiryDate.toISOString().split("T")[0]}` : ""}`,
        quantity: item.receivedQuantity,
        unit: item.unit,
      })),
      notes: grn.notes || "Material received, inspected, and documented. Physical stock adjustments must be confirmed separately in the inventory register.",
      showPricing: false,
    });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${grn.grnNumber.replace(/\//g, "-")}.pdf"`,
      },
    });
  } catch (error: unknown) {
    console.error("GRN PDF error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
