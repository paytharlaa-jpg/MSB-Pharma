import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Super Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (entityType && entityType !== "ALL") {
      where.entityType = entityType;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        performedBy: { select: { name: true, email: true, role: true } },
      },
    });

    return NextResponse.json({ success: true, logs });
  } catch (error: unknown) {
    console.error("Audit log GET error:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
