import { prisma } from "./db";

export type DocType = "ENQ" | "PO" | "GRN" | "QTN" | "INV" | "DC";

/**
 * Returns the Indian financial year string (e.g., "2026-27") for a given date.
 */
export function getFinancialYear(date: Date = new Date()): string {
  const month = date.getMonth(); // 0-indexed: April is 3
  const year = date.getFullYear();
  if (month >= 3) {
    // April or later
    const nextYearShort = String((year + 1) % 100).padStart(2, "0");
    return `${year}-${nextYearShort}`;
  } else {
    // Jan - Mar
    const prevYear = year - 1;
    const yearShort = String(year % 100).padStart(2, "0");
    return `${prevYear}-${yearShort}`;
  }
}

/**
 * Concurrency-safe document number generator.
 * Uses atomic upsert and sequence increment within a Prisma transaction.
 */
export async function generateDocumentNumber(docType: DocType): Promise<string> {
  const financialYear = getFinancialYear();
  const fyShort = financialYear.replace("20", ""); // e.g. "26-27"
  const defaultPrefix = `MSB/${docType}/${fyShort}/`;

  const updatedSequence = await prisma.$transaction(async (tx) => {
    // Find or create sequence
    const existing = await tx.documentSequence.findUnique({
      where: {
        docType_financialYear: {
          docType,
          financialYear,
        },
      },
    });

    if (!existing) {
      const created = await tx.documentSequence.create({
        data: {
          docType,
          financialYear,
          lastSequence: 1,
          prefix: defaultPrefix,
        },
      });
      return { seq: 1, prefix: created.prefix };
    } else {
      const updated = await tx.documentSequence.update({
        where: { id: existing.id },
        data: {
          lastSequence: { increment: 1 },
        },
      });
      return { seq: updated.lastSequence, prefix: updated.prefix };
    }
  });

  const formattedNumber = `${updatedSequence.prefix}${String(updatedSequence.seq).padStart(3, "0")}`;
  return formattedNumber;
}
