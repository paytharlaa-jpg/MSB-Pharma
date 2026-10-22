import crypto from "crypto";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export const TOKEN_EXPIRY_MINUTES = 30;

/**
 * Computes a secure SHA-256 hash of a raw reset token
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Creates a cryptographically secure, single-use, time-limited reset token for a user
 */
export async function createPasswordResetToken(userId: string): Promise<{ rawToken: string; expiresAt: Date }> {
  // Generate 64-character high-entropy random hex token
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

  // Invalidate any existing unused tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: {
      userId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });

  // Persist only the secure token hash
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return { rawToken, expiresAt };
}

/**
 * Validates a raw token server-side without consuming it
 */
export async function verifyPasswordResetToken(rawToken: string) {
  if (!rawToken || typeof rawToken !== "string" || rawToken.length < 32) {
    return { valid: false, error: "Invalid token format." };
  }

  const tokenHash = hashToken(rawToken);

  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: { id: true, name: true, email: true, isActive: true },
      },
    },
  });

  if (!resetRecord) {
    return { valid: false, error: "Reset token not found or already invalidated." };
  }

  if (resetRecord.usedAt) {
    return { valid: false, error: "This password reset token has already been used." };
  }

  if (new Date() > resetRecord.expiresAt) {
    return { valid: false, error: "This password reset token has expired. Please request a new link." };
  }

  if (!resetRecord.user || !resetRecord.user.isActive) {
    return { valid: false, error: "The associated account is deactivated or no longer exists." };
  }

  return {
    valid: true,
    user: resetRecord.user,
    tokenRecordId: resetRecord.id,
  };
}

/**
 * Consumes a valid token, updates user password hash, invalidates token, and logs audit event
 */
export async function consumePasswordResetToken(rawToken: string, newPassword: string) {
  // 1. Password Policy Check
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." };
  }

  // 2. Token Verification
  const verification = await verifyPasswordResetToken(rawToken);
  if (!verification.valid || !verification.user || !verification.tokenRecordId) {
    return { success: false, error: verification.error || "Invalid or expired token." };
  }

  const user = verification.user;

  // 3. Hash New Password
  const newHash = await hashPassword(newPassword);

  // 4. Atomic Execution in Database Transaction
  await prisma.$transaction([
    // Invalidate token
    prisma.passwordResetToken.update({
      where: { id: verification.tokenRecordId },
      data: { usedAt: new Date() },
    }),
    // Update user password
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    }),
  ]);

  // 5. Audit Logging (without storing raw token or password)
  await createAuditLog({
    entityType: "USER",
    entityId: user.id,
    action: "UPDATE",
    performedByUserId: user.id,
    userEmail: user.email,
    details: {
      action: "PASSWORD_RESET_SUCCESS",
      timestamp: new Date().toISOString(),
    },
  });

  return { success: true };
}
