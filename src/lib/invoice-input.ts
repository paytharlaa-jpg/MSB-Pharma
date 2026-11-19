import type { Prisma } from "@prisma/client";
import { computeInvoiceTotals, supplyTypeFor, GST_STATES, r2 } from "./company";

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
  paymentTerms?: string;
  shipToSameAsBilling?: boolean;
  shipToName?: string;
  shipToAddress?: string;
  shipToGstin?: string;
  shipToState?: string;
  shipToContact?: string;
  discountAmount?: number | string;
  freightAmount?: number | string;
  notes?: string;
  terms?: string;
  items?: Array<{
    description?: string;
    hsnCode?: string;
    batchNumber?: string;
    mfgDate?: string;
    expDate?: string;
    packDetails?: string;
    unit?: string;
    quantity?: number | string;
    unitPrice?: number | string;
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

  const lineInputs = rawItems.map((i) => ({
    quantity: num(i.quantity),
    unitPrice: num(i.unitPrice),
    gstRate: num(i.gstRate),
    cess: num(i.cess),
  }));
  rawItems.forEach((i, idx) => {
    if (!str(i.hsnCode)) errors.push(`HSN code missing for "${str(i.description)}"`);
    if (lineInputs[idx].quantity <= 0 || lineInputs[idx].unitPrice < 0) errors.push(`Check quantity / rate for "${str(i.description)}"`);
  });

  const discountAmount = Math.max(0, num(body.discountAmount));
  const freightAmount = Math.max(0, num(body.freightAmount));
  const totals = computeInvoiceTotals(lineInputs, discountAmount, freightAmount, placeOfSupply);
  if (rawItems.length && discountAmount > totals.gross) errors.push("Discount cannot be more than the total value of goods");

  const items = rawItems.map((i, idx) => {
    const c = totals.lines[idx];
    return {
      description: str(i.description)!,
      hsnCode: str(i.hsnCode),
      batchNumber: str(i.batchNumber),
      mfgDate: date(i.mfgDate),
      expDate: date(i.expDate),
      packDetails: str(i.packDetails),
      unit: str(i.unit) || "KGS",
      quantity: lineInputs[idx].quantity,
      unitPrice: lineInputs[idx].unitPrice,
      discount: c.discount,
      gstRate: lineInputs[idx].gstRate,
      taxableValue: c.taxableValue,
      igst: c.igst,
      cgst: c.cgst,
      sgst: c.sgst,
      cess: c.cess,
      lineTotal: c.lineTotal,
    };
  });

  const rates = [...new Set(items.map((i) => i.gstRate))];
  const sameAsBilling = body.shipToSameAsBilling !== false;

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
    paymentTerms: str(body.paymentTerms),
    shipToSameAsBilling: sameAsBilling,
    shipToName: sameAsBilling ? null : str(body.shipToName),
    shipToAddress: sameAsBilling ? null : str(body.shipToAddress),
    shipToGstin: sameAsBilling ? null : str(body.shipToGstin)?.toUpperCase() || null,
    shipToState: sameAsBilling ? null : str(body.shipToState),
    shipToContact: sameAsBilling ? null : str(body.shipToContact),
    notes: str(body.notes),
    terms: typeof body.terms === "string" && body.terms.trim() ? body.terms.trim().slice(0, 3000) : null,
    subtotal: totals.taxable,
    taxRate: rates.length === 1 ? rates[0] : 0,
    igstAmount: totals.igst,
    cgstAmount: totals.cgst,
    sgstAmount: totals.sgst,
    cessAmount: totals.cess,
    taxAmount: totals.tax,
    discountAmount: totals.discount,
    freightAmount: totals.freight,
    roundOff: totals.roundOff,
    grandTotal: totals.grandTotal,
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
