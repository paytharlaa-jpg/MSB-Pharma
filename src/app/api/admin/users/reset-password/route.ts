import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { createPasswordResetToken, TOKEN_EXPIRY_MINUTES } from "@/lib/password-reset";
import { sendNotificationEmail, buildPasswordResetEmailHtml } from "@/lib/email-service";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const admin = await getSessionUser(request);
    if (!admin || admin.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Super Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const { userId, sendEmail = true } = body;

    if (!userId) {
      return NextResponse.json({ error: "Target userId is required." }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Staff user not found." }, { status: 404 });
    }

    // Generate single-use reset token
    const { rawToken, expiresAt } = await createPasswordResetToken(targetUser.id);
    const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
    const resetUrl = `${appBaseUrl}/reset-password?token=${rawToken}`;

    // Dispatch email if requested
    if (sendEmail) {
      try {
        await sendNotificationEmail({
          to: targetUser.email,
          subject: "MSB PHARMACHEM — Password Reset Initiated by Administrator",
          html: buildPasswordResetEmailHtml({
            userName: targetUser.name,
            resetUrl,
            expiryMinutes: TOKEN_EXPIRY_MINUTES,
          }),
        });
      } catch (mailErr) {
        console.error("Failed to dispatch staff reset email:", mailErr);
      }
    }

    // Audit log
    await createAuditLog({
      entityType: "USER",
      entityId: targetUser.id,
      action: "UPDATE",
      performedByUserId: admin.id,
      userEmail: admin.email,
      details: {
        action: "ADMIN_INITIATED_STAFF_PASSWORD_RESET",
        targetUserId: targetUser.id,
        targetEmail: targetUser.email,
        targetRole: targetUser.role,
        sentEmail: sendEmail,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Password reset link generated for ${targetUser.name}.`,
      resetUrl,
      expiresAt,
    });
  } catch (error: unknown) {
    console.error("Admin staff reset error:", error);
    return NextResponse.json({ error: "Failed to initiate staff password reset." }, { status: 500 });
  }
}
