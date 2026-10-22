import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./db";

const JWT_SECRET = process.env.AUTH_SECRET || "msb-pharmachem-default-secret-change-in-prod";
const COOKIE_NAME = "msb_auth_token";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "SALES" | "ACCOUNTS" | "INVENTORY";
  isActive: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
}

export function verifyToken(token: string): SessionUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionUser;
    return decoded;
  } catch {
    return null;
  }
}

export async function getSessionUser(request?: Request): Promise<SessionUser | null> {
  // Check authorization header first if request provided
  if (request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const user = verifyToken(token);
      if (user) {
        // Double check user still active in DB
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, email: true, name: true, role: true, isActive: true },
        });
        if (dbUser && dbUser.isActive) {
          return dbUser as SessionUser;
        }
      }
    }
  }

  // Fallback to cookie
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const user = verifyToken(token);
    if (!user) return null;

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    if (!dbUser || !dbUser.isActive) return null;
    return dbUser as SessionUser;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
