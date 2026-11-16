import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { generateInvoicePdf } from "@/lib/invoice-pdf";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const inv = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true, payments: { orderBy: { paymentDate: "asc" } } },
    });
    if (!inv) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const doc = generateInvoicePdf(inv);
    const inline = new URL(request.url).searchParams.get("view") === "1";
    const filename = `${inv.invoiceNumber.replace(/\//g, "-")}.pdf`;
    return new NextResponse(new Uint8Array(doc.output("arraybuffer")), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    console.error("Invoice PDF error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
