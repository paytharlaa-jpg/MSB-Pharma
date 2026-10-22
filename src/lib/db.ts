import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

// Automatically guarantee database file accessibility across root and prisma directories
try {
  const rootDb = path.join(process.cwd(), "dev.db");
  const prismaDb = path.join(process.cwd(), "prisma", "dev.db");

  if (fs.existsSync(prismaDb) && !fs.existsSync(rootDb)) {
    fs.copyFileSync(prismaDb, rootDb);
  } else if (fs.existsSync(rootDb) && !fs.existsSync(prismaDb)) {
    fs.copyFileSync(rootDb, prismaDb);
  }
} catch (e) {
  // Ignore permission warnings on readonly filesystems
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
