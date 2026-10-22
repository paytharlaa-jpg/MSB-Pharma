import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { quotations: true, invoices: true, deliveryChallans: true },
        },
      },
    });
    return NextResponse.json({ success: true, customers });
  } catch (error: unknown) {
    console.error("Customers GET error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
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
      return NextResponse.json({ error: "Customer/Company name is required" }, { status: 400 });
    }

    const customer = await prisma.customer.create({
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
      entityType: "CUSTOMER",
      entityId: customer.id,
      action: "CREATE",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { name: customer.name },
    });

    return NextResponse.json({ success: true, customer });
  } catch (error: unknown) {
    console.error("Customer POST error:", error);
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
