import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { parseGrnInput, GrnInput } from "@/lib/grn-input";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Ctx) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const grn = await prisma.goodsReceiptNote.findUnique({ where: { id }, include: { items: true } });
  if (!grn) return NextResponse.json({ error: "GRN not found" }, { status: 404 });
  return NextResponse.json({ success: true, grn });
}

export async function PUT(request: Request, { params }: Ctx) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { errors, data, items } = parseGrnInput((await request.json()) as GrnInput);
    if (errors.length) return NextResponse.json({ error: errors.join(". ") }, { status: 400 });

    const grn = await prisma.$transaction(async (tx) => {
      await tx.gRNItem.deleteMany({ where: { grnId: id } });
      return tx.goodsReceiptNote.update({
        where: { id },
        data: { ...data, items: { create: items } },
        include: { items: true },
      });
    });

    await createAuditLog({
      entityType: "GRN",
      entityId: id,
      action: "UPDATE",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { grnNumber: grn.grnNumber },
    });
    return NextResponse.json({ success: true, grn });
  } catch (error: unknown) {
    console.error("GRN PUT error:", error);
    return NextResponse.json({ error: "Failed to update GRN" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Ctx) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const grn = await prisma.goodsReceiptNote.delete({ where: { id } });
    await createAuditLog({
      entityType: "GRN",
      entityId: id,
      action: "DELETE",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { grnNumber: grn.grnNumber },
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("GRN DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete GRN" }, { status: 500 });
  }
}
