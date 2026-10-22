import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { purchaseOrders: true, goodsReceiptNotes: true, batches: true },
        },
      },
    });
    return NextResponse.json({ success: true, suppliers });
  } catch (error: unknown) {
    console.error("Suppliers GET error:", error);
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, contactPerson, email, phone, address, gstin, pan, notes } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Supplier name is required" }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name: name.trim(),
        contactPerson: contactPerson?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        gstin: gstin?.trim() || null,
        pan: pan?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    await createAuditLog({
      entityType: "SUPPLIER",
      entityId: supplier.id,
      action: "CREATE",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { name: supplier.name },
    });

    return NextResponse.json({ success: true, supplier });
  } catch (error: unknown) {
    console.error("Supplier POST error:", error);
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 });
  }
}
