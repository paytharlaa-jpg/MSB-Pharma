import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createPasswordResetToken, TOKEN_EXPIRY_MINUTES } from "@/lib/password-reset";
import { sendNotificationEmail, buildPasswordResetEmailHtml } from "@/lib/email-service";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // Generic confirmation message to prevent account enumeration
    const genericResponse = {
      success: true,
      message: "If an operational account is associated with that email, password reset instructions have been dispatched.",
    };

    if (!email || typeof email !== "string" || !email.includes("@")) {
      // Return same generic message even on malformed input to avoid leaking format expectations
      return NextResponse.json(genericResponse);
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find active user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, email: true, isActive: true },
    });

    if (user && user.isActive) {
      // 1. Generate secure single-use token
      const { rawToken } = await createPasswordResetToken(user.id);

      // 2. Build trusted reset URL from configured application base URL
      const appBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
      const resetUrl = `${appBaseUrl}/reset-password?token=${rawToken}`;

      // 3. Send email via configured transactional service
      try {
        await sendNotificationEmail({
          to: user.email,
          subject: "MSB PHARMACHEM — Staff Password Reset Request",
          html: buildPasswordResetEmailHtml({
            userName: user.name,
            resetUrl,
            expiryMinutes: TOKEN_EXPIRY_MINUTES,
          }),
        });
      } catch (mailErr) {
        console.error("Failed to dispatch password reset email:", mailErr);
      }

      // 4. Audit logging (without raw token or password)
      await createAuditLog({
        entityType: "USER",
        entityId: user.id,
        action: "UPDATE",
        performedByUserId: user.id,
        userEmail: user.email,
        details: { action: "PASSWORD_RESET_REQUESTED" },
      });
    }

    return NextResponse.json(genericResponse);
  } catch (error: unknown) {
    console.error("Forgot password route error:", error);
    // Return generic error message without database internal details
    return NextResponse.json(
      { success: true, message: "If an operational account is associated with that email, password reset instructions have been dispatched." }
    );
  }
}
