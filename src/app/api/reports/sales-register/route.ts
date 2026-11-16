import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { invoiceSearchWhere } from "@/lib/invoice-input";
import { buildSalesRegister, RegisterLine } from "@/lib/sales-register";

/** GET /api/reports/sales-register?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&search=... → .xlsx */
export async function GET(request: Request) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");
    const q = (searchParams.get("search") || "").trim();

    const invoiceDate: { gte?: Date; lte?: Date } = {};
    if (start) invoiceDate.gte = new Date(`${start}T00:00:00`);
    if (end) invoiceDate.lte = new Date(`${end}T23:59:59.999`);

    const invoices = await prisma.invoice.findMany({
      where: {
        status: { not: "CANCELLED" },
        ...(start || end ? { invoiceDate } : {}),
        ...invoiceSearchWhere(q),
      },
      orderBy: [{ invoiceDate: "asc" }, { invoiceNumber: "asc" }],
      include: { items: { orderBy: { id: "asc" } } },
    });

    const lines: RegisterLine[] = invoices.flatMap((inv) =>
      inv.items.map((it) => ({
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.invoiceDate,
        customerName: inv.customerName,
        customerGstin: inv.customerGstin,
        placeOfSupply: inv.placeOfSupply,
        category: inv.category,
        invoiceType: inv.invoiceType,
        reverseCharge: inv.reverseCharge,
        description: it.description || "",
        hsnCode: it.hsnCode || "",
        unit: it.unit,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discount: it.discount,
        taxableValue: it.taxableValue,
        gstRate: it.gstRate,
        supplyType: inv.supplyType,
        igst: it.igst,
        cgst: it.cgst,
        sgst: it.sgst,
        cess: it.cess,
        lineTotal: it.lineTotal,
      }))
    );

    const fmt = (s: string) => new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    const period = start || end ? `${start ? fmt(start) : "start"} to ${end ? fmt(end) : "today"}` : "all invoices";
    const buffer = await buildSalesRegister(lines, period);

    await createAuditLog({
      entityType: "REPORT",
      entityId: "sales-register",
      action: "EXPORT",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { startDate: start, endDate: end, search: q, invoices: invoices.length, lines: lines.length },
    });

    const stamp = [start, end].filter(Boolean).join("_to_") || new Date().toISOString().slice(0, 10);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="MSB_Sales_Register_${stamp}.xlsx"`,
      },
    });
  } catch (error: unknown) {
    console.error("Sales register export error:", error);
    return NextResponse.json({ error: "Failed to export sales register" }, { status: 500 });
  }
}
