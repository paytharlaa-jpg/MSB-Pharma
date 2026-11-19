import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { generateGrnPdf } from "@/lib/grn-pdf";
import { safeJson } from "@/lib/grn-input";
import { loadInvoiceProfile } from "@/lib/invoice-profile-server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const grn = await prisma.goodsReceiptNote.findUnique({ where: { id }, include: { items: true } });
    if (!grn) return NextResponse.json({ error: "GRN not found" }, { status: 404 });

    const doc = generateGrnPdf({
      ...grn,
      checklist: safeJson<Record<string, string>>(grn.checklist, {}),
      threeWayMatch: safeJson<string[]>(grn.threeWayMatch, []),
      signatories: safeJson<Record<string, { name?: string; date?: string }>>(grn.signatories, {}),
      remarks: grn.remarks ?? grn.notes,
    }, await loadInvoiceProfile());

    const inline = new URL(request.url).searchParams.get("view") === "1";
    const filename = `${grn.grnNumber.replace(/\//g, "-")}.pdf`;
    return new NextResponse(new Uint8Array(doc.output("arraybuffer")), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    console.error("GRN PDF error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
