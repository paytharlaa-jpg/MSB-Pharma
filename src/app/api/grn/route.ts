import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { generateDocumentNumber } from "@/lib/document-number";
import { createAuditLog } from "@/lib/audit";
import { parseGrnInput, grnSearchWhere, GrnInput } from "@/lib/grn-input";

export async function GET(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("search") || "").trim();
    const status = searchParams.get("qcStatus") || "";

    const grns = await prisma.goodsReceiptNote.findMany({
      where: { ...grnSearchWhere(q), ...(status ? { qcStatus: status } : {}) },
      orderBy: { receiptDate: "desc" },
      include: { items: true },
    });
    return NextResponse.json({ success: true, grns });
  } catch (error: unknown) {
    console.error("GRN GET error:", error);
    return NextResponse.json({ error: "Failed to fetch GRNs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as GrnInput;
    const { errors, data, items } = parseGrnInput(body);
    if (errors.length) return NextResponse.json({ error: errors.join(". ") }, { status: 400 });

    const grnNumber = await generateDocumentNumber("GRN");
    const grn = await prisma.goodsReceiptNote.create({
      data: {
        ...data,
        grnNumber,
        status: "VERIFIED",
        receivedByUserId: user.id,
        items: { create: items },
      },
      include: { items: true },
    });

    await createAuditLog({
      entityType: "GRN",
      entityId: grn.id,
      action: "CREATE",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { grnNumber, supplierName: data.supplierName, itemsCount: items.length },
    });

    return NextResponse.json({ success: true, grn });
  } catch (error: unknown) {
    console.error("GRN POST error:", error);
    return NextResponse.json({ error: "Failed to create GRN" }, { status: 500 });
  }
}
