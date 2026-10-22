import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

function resolveDatabaseUrl(): string | undefined {
  const envUrl = process.env.DATABASE_URL;
  // If user provided a remote database connection (e.g. Postgres, MySQL)
  if (envUrl && !envUrl.startsWith("file:")) {
    return envUrl;
  }

  try {
    const rootDb = path.resolve(process.cwd(), "dev.db");
    const prismaDb = path.resolve(process.cwd(), "prisma", "dev.db");

    const rootSize = fs.existsSync(rootDb) ? fs.statSync(rootDb).size : 0;
    const prismaSize = fs.existsSync(prismaDb) ? fs.statSync(prismaDb).size : 0;

    // If one file is seeded (> 1000 bytes) and the other is empty (< 1000 bytes), synchronize them
    if (prismaSize > 1000 && rootSize < 1000) {
      fs.copyFileSync(prismaDb, rootDb);
    } else if (rootSize > 1000 && prismaSize < 1000) {
      fs.copyFileSync(rootDb, prismaDb);
    }

    // Pick whichever file has data
    const chosenDb =
      rootSize >= 1000 ? rootDb : prismaSize >= 1000 ? prismaDb : rootDb;

    const normalized = chosenDb.replace(/\\/g, "/");
    return `file:${normalized}`;
  } catch (err) {
    console.warn("Database path resolution fallback:", err);
    return envUrl;
  }
}

const dbUrl = resolveDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: dbUrl
      ? {
          db: {
            url: dbUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
