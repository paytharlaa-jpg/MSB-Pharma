import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: { id: "default" },
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: unknown) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Super Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const {
      companyName,
      phone,
      email,
      address,
      gstNumber,
      panNumber,
      bankDetails,
      invoiceTerms,
      quotationTerms,
    } = body;

    const updated = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {
        companyName,
        phone,
        email,
        address,
        gstNumber,
        panNumber,
        bankDetails,
        invoiceTerms,
        quotationTerms,
      },
      create: {
        id: "default",
        companyName,
        phone,
        email,
        address,
        gstNumber,
        panNumber,
        bankDetails,
        invoiceTerms,
        quotationTerms,
      },
    });

    await createAuditLog({
      entityType: "SETTINGS",
      entityId: "default",
      action: "UPDATE",
      performedByUserId: user.id,
      userEmail: user.email,
      details: body,
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: unknown) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
