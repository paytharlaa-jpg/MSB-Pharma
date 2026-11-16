import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, signToken, COOKIE_NAME, SessionUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.isActive || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Invalid credentials or account inactive" }, { status: 401 });
    }

    let isValid = await verifyPassword(password, user.passwordHash);
    
    // Support common case variations (e.g. password@123 vs Password@123)
    if (!isValid && password && password.length > 0) {
      const altCapitalized = password.charAt(0).toUpperCase() + password.slice(1);
      const altLowercase = password.charAt(0).toLowerCase() + password.slice(1);
      isValid = (await verifyPassword(altCapitalized, user.passwordHash)) ||
                (await verifyPassword(altLowercase, user.passwordHash));
    }

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const sessionUser: SessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as SessionUser["role"],
      isActive: user.isActive,
    };

    const token = signToken(sessionUser);

    await createAuditLog({
      entityType: "USER",
      entityId: user.id,
      action: "LOGIN",
      performedByUserId: user.id,
      userEmail: user.email,
      details: { role: user.role },
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Login route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
