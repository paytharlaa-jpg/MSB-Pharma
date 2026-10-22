import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateDocumentPdf } from "@/lib/pdf-generator";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dc = await prisma.deliveryChallan.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: { product: true, batch: true },
        },
      },
    });

    if (!dc) {
      return NextResponse.json({ error: "Delivery challan not found" }, { status: 404 });
    }

    const doc = generateDocumentPdf({
      title: "DELIVERY CHALLAN",
      documentNumber: dc.challanNumber,
      documentDate: dc.deliveryDate.toISOString().split("T")[0],
      partyTitle: "Consignee / Delivery Address",
      party: {
        name: dc.customer.name,
        contactPerson: dc.customer.contactPerson,
        phone: dc.customer.phone,
        email: dc.customer.email,
        address: dc.deliveryAddress || dc.customer.address,
        gstin: dc.customer.gstin,
      },
      items: dc.items.map((item, idx) => ({
        srNo: idx + 1,
        description: item.product.name,
        batchOrCas: item.batch ? `Batch: ${item.batch.batchNumber}` : `CAS: ${item.product.casNumber || "-"}`,
        quantity: item.quantity,
        unit: item.unit,
      })),
      notes: `${dc.dispatchDetails ? `Dispatch Info: ${dc.dispatchDetails}\n` : ""}${dc.vehicleNumber ? `Vehicle: ${dc.vehicleNumber}\n` : ""}${dc.notes || ""}`,
      terms: "1. Received goods in good condition and intact tamper-evident packaging.\n2. Stock deducted in physical store registers as per agreed procedures.\n3. Receiver signature & company stamp required upon receipt.",
      showPricing: false,
    });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${dc.challanNumber.replace(/\//g, "-")}.pdf"`,
      },
    });
  } catch (error: unknown) {
    console.error("Delivery Challan PDF error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
