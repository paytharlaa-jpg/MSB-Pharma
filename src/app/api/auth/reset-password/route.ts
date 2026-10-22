import { NextResponse } from "next/server";
import { verifyPasswordResetToken, consumePasswordResetToken } from "@/lib/password-reset";

export const dynamic = "force-dynamic";

/**
 * Validate token server-side before showing password form
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false, error: "Token parameter is required." }, { status: 400 });
    }

    const verification = await verifyPasswordResetToken(token);

    if (!verification.valid || !verification.user) {
      return NextResponse.json({ valid: false, error: verification.error || "Invalid or expired token." }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      email: verification.user.email,
      name: verification.user.name,
    });
  } catch (error: unknown) {
    console.error("Token verification error:", error);
    return NextResponse.json({ valid: false, error: "An error occurred validating the token." }, { status: 500 });
  }
}

/**
 * Consume token and commit new password
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ error: "Token and new password are required." }, { status: 400 });
    }

    const result = await consumePasswordResetToken(token, password);

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Password reset failed." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Password has been successfully updated. You may now sign in with your new password.",
    });
  } catch (error: unknown) {
    console.error("Password reset commit error:", error);
    return NextResponse.json({ error: "Failed to reset password. Please try again." }, { status: 500 });
  }
}
