import type { Prisma } from "@prisma/client";
import { computeGstLine, supplyTypeFor, r2, GST_STATES } from "./company";

export interface InvoiceInput {
  invoiceDate?: string;
  dueDate?: string;
  customerName?: string;
  customerGstin?: string;
  customerAddress?: string;
  customerPhone?: string;
  customerEmail?: string;
  placeOfSupply?: string;
  category?: string;
  invoiceType?: string;
  reverseCharge?: string;
  poReference?: string;
  vehicleNumber?: string;
  ewayBillNumber?: string;
  notes?: string;
  terms?: string;
  items?: Array<{
    description?: string;
    hsnCode?: string;
    unit?: string;
    quantity?: number | string;
    unitPrice?: number | string;
    discount?: number | string;
    gstRate?: number | string;
    cess?: number | string;
  }>;
}

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const num = (v: unknown) => {
  const n = Number(v);
  return v === "" || v === null || v === undefined || isNaN(n) ? 0 : n;
};
const date = (v: unknown) => {
  if (typeof v !== "string" || !v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};

export function parseInvoiceInput(body: InvoiceInput) {
  const errors: string[] = [];
  const customerName = str(body.customerName);
  if (!customerName) errors.push("Customer name is required");

  const placeOfSupply = str(body.placeOfSupply) || "36-Telangana";
  if (!GST_STATES.includes(placeOfSupply)) errors.push("Choose a valid Place of Supply");

  const category = str(body.category) || "B2B";
  const gstin = str(body.customerGstin)?.toUpperCase() || null;
  if (category === "B2B" && (!gstin || gstin.length !== 15)) errors.push("B2B invoices need a 15-character customer GSTIN");

  const rawItems = (body.items || []).filter((i) => str(i.description));
  if (rawItems.length === 0) errors.push("Add at least one product line");

  const items = rawItems.map((i) => {
    const line = {
      quantity: num(i.quantity),
      unitPrice: num(i.unitPrice),
      discount: num(i.discount),
      gstRate: num(i.gstRate),
      cess: num(i.cess),
    };
    const t = computeGstLine(line, placeOfSupply);
    if (!str(i.hsnCode)) errors.push(`HSN code missing for "${str(i.description)}"`);
    if (line.quantity <= 0 || line.unitPrice < 0) errors.push(`Check quantity / rate for "${str(i.description)}"`);
    return {
      description: str(i.description)!,
      hsnCode: str(i.hsnCode),
      unit: str(i.unit) || "KGS",
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      discount: line.discount,
      gstRate: line.gstRate,
      taxableValue: t.taxableValue,
      igst: t.igst,
      cgst: t.cgst,
      sgst: t.sgst,
      cess: t.cess,
      lineTotal: t.lineTotal,
    };
  });

  const sum = (k: "taxableValue" | "igst" | "cgst" | "sgst" | "cess" | "discount" | "lineTotal") =>
    r2(items.reduce((s, i) => s + i[k], 0));
  const subtotal = sum("taxableValue");
  const igstAmount = sum("igst");
  const cgstAmount = sum("cgst");
  const sgstAmount = sum("sgst");
  const cessAmount = sum("cess");
  const grandTotal = sum("lineTotal");
  const rates = [...new Set(items.map((i) => i.gstRate))];

  const data = {
    invoiceDate: date(body.invoiceDate) ?? new Date(),
    dueDate: date(body.dueDate),
    customerName: customerName || "",
    customerGstin: gstin,
    customerAddress: str(body.customerAddress),
    customerPhone: str(body.customerPhone),
    customerEmail: str(body.customerEmail),
    placeOfSupply,
    category,
    invoiceType: str(body.invoiceType) || "Regular",
    reverseCharge: body.reverseCharge === "Y" ? "Y" : "N",
    supplyType: supplyTypeFor(placeOfSupply),
    poReference: str(body.poReference),
    vehicleNumber: str(body.vehicleNumber),
    ewayBillNumber: str(body.ewayBillNumber),
    notes: str(body.notes),
    terms: str(body.terms),
    subtotal,
    taxRate: rates.length === 1 ? rates[0] : 0,
    igstAmount,
    cgstAmount,
    sgstAmount,
    cessAmount,
    taxAmount: r2(igstAmount + cgstAmount + sgstAmount + cessAmount),
    discountAmount: sum("discount"),
    grandTotal,
  } satisfies Partial<Prisma.InvoiceUncheckedCreateInput>;

  return { errors: [...new Set(errors)], data, items };
}

export function paymentStatusFor(grandTotal: number, paid: number) {
  const balance = r2(Math.max(grandTotal - paid, 0));
  return { balanceAmount: balance, paymentStatus: paid <= 0 ? "UNPAID" : balance <= 0 ? "PAID" : "PARTIALLY_PAID" };
}

export function invoiceSearchWhere(q: string): Prisma.InvoiceWhereInput {
  if (!q) return {};
  return {
    OR: [
      { invoiceNumber: { contains: q } },
      { customerName: { contains: q } },
      { customerGstin: { contains: q } },
      { placeOfSupply: { contains: q } },
      { items: { some: { description: { contains: q } } } },
      { items: { some: { hsnCode: { contains: q } } } },
      { payments: { some: { referenceNumber: { contains: q } } } },
    ],
  };
}

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  return `${TENS[Math.floor(n / 10)]}${n % 10 ? " " + ONES[n % 10] : ""}`;
}
function threeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  return [h ? `${ONES[h]} Hundred` : "", rest ? twoDigits(rest) : ""].filter(Boolean).join(" ");
}

/** Indian-system amount in words, e.g. "Rupees Two Lakh Twelve Thousand Four Hundred Only". */
export function amountInWords(amount: number): string {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  const parts: string[] = [];
  let n = rupees;
  const crore = Math.floor(n / 1e7);
  n %= 1e7;
  const lakh = Math.floor(n / 1e5);
  n %= 1e5;
  const thousand = Math.floor(n / 1e3);
  n %= 1e3;
  if (crore) parts.push(`${crore >= 100 ? amountInWords(crore).replace(/^Rupees |\sOnly$/g, "") : twoDigits(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (n) parts.push(threeDigits(n));
  const words = parts.join(" ") || "Zero";
  return `Rupees ${words}${paise ? ` and ${twoDigits(paise)} Paise` : ""} Only`;
}
