import { prisma } from "./db";
import { parseInvoiceProfile, InvoiceProfile } from "./invoice-profile";

export async function loadInvoiceProfile(): Promise<InvoiceProfile> {
  const row = await prisma.siteSettings.findUnique({ where: { id: "default" }, select: { invoiceProfile: true } });
  return parseInvoiceProfile(row?.invoiceProfile);
}

export async function saveInvoiceProfile(input: unknown): Promise<InvoiceProfile> {
  const profile = parseInvoiceProfile(JSON.stringify(input ?? {}));
  const json = JSON.stringify(profile);
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: { invoiceProfile: json },
    create: { id: "default", invoiceProfile: json },
  });
  return profile;
}
