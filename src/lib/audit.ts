import { prisma } from "./db";

export interface AuditLogParams {
  entityType: string;
  entityId: string;
  action: string;
  performedByUserId?: string | null;
  userEmail?: string | null;
  details: Record<string, unknown> | string;
  ipAddress?: string | null;
}

export async function createAuditLog(params: AuditLogParams) {
  try {
    const detailsString =
      typeof params.details === "string"
        ? params.details
        : JSON.stringify(params.details);

    await prisma.auditLog.create({
      data: {
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        performedByUserId: params.performedByUserId ?? null,
        userEmail: params.userEmail ?? null,
        details: detailsString,
        ipAddress: params.ipAddress ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log entry:", error);
  }
}
