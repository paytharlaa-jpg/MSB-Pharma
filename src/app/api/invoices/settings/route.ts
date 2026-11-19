import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { loadInvoiceProfile, saveInvoiceProfile } from "@/lib/invoice-profile-server";

/** GET / PUT the tax-invoice letterhead, bank details and default Terms & Conditions. */
export async function GET(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ success: true, profile: await loadInvoiceProfile() });
}

export async function PUT(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const profile = await saveInvoiceProfile(await request.json());
    await createAuditLog({
      entityType: "SETTINGS",
      entityId: "invoice-profile",
      action: "UPDATE",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { gstin: profile.gstin, pan: profile.pan, iec: profile.iec },
    });
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Invoice settings error:", error);
    return NextResponse.json({ error: "Failed to save invoice settings" }, { status: 500 });
  }
}
