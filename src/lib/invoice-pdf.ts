import jsPDF from "jspdf";
import { COMPANY } from "./company";
import { amountInWords } from "./invoice-input";
import { InvoiceProfile, DEFAULT_INVOICE_TERMS } from "./invoice-profile";
import { drawFooter, sectionBar, cellBox, cellText, fmtDate, loadLogo } from "./grn-pdf";

/**
 * GST Tax Invoice laid out on the client's "TAX INVOICE" template (A4, points):
 * letterhead → title → invoice details grid → Billed To / Shipped To → goods table →
 * bank details + amount in words | tax summary → terms & conditions → signatures.
 */

type RGB = [number, number, number];
const BLUE: RGB = [27, 77, 179];
const GREEN: RGB = [58, 154, 30];
const NAVY: RGB = [15, 45, 107];
const TINT: RGB = [234, 241, 251];
const TOTAL_TINT: RGB = [223, 238, 221];
const GREY: RGB = [128, 128, 128];
const L = 34;
const R = 561.3;
const MID_L = 292; // right edge of the left half
const MID_R = 302; // left edge of the right half
const BOTTOM = 790;

export interface InvoicePdfData {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date | null;
  customerName: string;
  customerGstin: string | null;
  customerAddress: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  placeOfSupply: string;
  supplyType: string;
  poReference: string | null;
  vehicleNumber: string | null;
  ewayBillNumber: string | null;
  paymentTerms: string | null;
  shipToSameAsBilling: boolean;
  shipToName: string | null;
  shipToAddress: string | null;
  shipToGstin: string | null;
  shipToState: string | null;
  shipToContact: string | null;
  subtotal: number;
  igstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  cessAmount: number;
  discountAmount: number;
  freightAmount: number;
  roundOff: number;
  grandTotal: number;
  terms: string | null;
  items: Array<{
    description: string | null;
    hsnCode: string | null;
    batchNumber: string | null;
    mfgDate: Date | null;
    expDate: Date | null;
    packDetails: string | null;
    unit: string;
    quantity: number;
    unitPrice: number;
    gstRate: number;
    cgst: number;
    igst: number;
  }>;
}

const money = (n: number) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const qty = (n: number) => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 3 });
const blank = (v: string | null | undefined, len = 20) => (v && v.trim() ? v.trim() : "_".repeat(len));
const monthYear = (d: Date | null) => {
  if (!d) return "";
  const x = new Date(d);
  return `${String(x.getUTCMonth() + 1).padStart(2, "0")}/${x.getUTCFullYear()}`;
};
const stateFrom = (pos: string) => {
  const [code, ...name] = pos.split("-");
  return { code, name: name.join("-") };
};

function text(doc: jsPDF, s: string, x: number, y: number, opts: { bold?: boolean; size?: number; color?: RGB; align?: "left" | "center" | "right"; italic?: boolean } = {}) {
  doc.setFont("helvetica", opts.bold ? "bold" : opts.italic ? "italic" : "normal");
  doc.setFontSize(opts.size ?? 8);
  doc.setTextColor(...(opts.color ?? ([0, 0, 0] as RGB)));
  doc.text(s, x, y, { align: opts.align ?? "left" });
}

/** "Label: value" on one line, value in brand blue (or blank underline). Returns the x after the text. */
function labelled(doc: jsPDF, label: string, value: string | null, x: number, y: number, maxW: number, blankLen = 22) {
  text(doc, label, x, y, { size: 7.8 });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  const lx = x + doc.getTextWidth(label + " ");
  if (value && value.trim()) {
    const line = doc.splitTextToSize(value.trim(), Math.max(20, maxW - (lx - x)))[0] as string;
    text(doc, line, lx, y, { size: 7.8, color: BLUE });
    return lx + doc.getTextWidth(line);
  }
  text(doc, "_".repeat(blankLen), lx, y, { size: 7.8, color: GREY });
  return lx + doc.getTextWidth("_".repeat(blankLen));
}

function drawInvoiceLetterhead(doc: jsPDF, p: InvoiceProfile) {
  const logo = loadLogo();
  if (logo) doc.addImage(logo, "PNG", 34, 30, 66, 66);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...BLUE);
  doc.text("MSB ", 110, 50);
  doc.setTextColor(...GREEN);
  doc.text("PHARMACHEM", 110 + doc.getTextWidth("MSB "), 50);
  text(doc, COMPANY.tagline, 110, 61, { italic: true, size: 8.5, color: GREEN });
  text(doc, COMPANY.address, 110, 71.5, { size: 7.8 });
  text(doc, `Phone: ${COMPANY.phone}  |  Email: ${blank(p.email)}  |  Web: ${blank(p.website)}`, 110, 82, { size: 7.8 });
  text(doc, `GSTIN: ${blank(p.gstin, 22)}     PAN: ${blank(p.pan, 18)}     IEC: ${blank(p.iec, 18)}`, 110, 92.5, { size: 7.8 });
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(1.2);
  doc.line(L, 103, R, 103);
}

/** Items table columns (widths add up to 527.3pt). */
const COLS = [
  { h: ["S.No"], w: 26, a: "center" as const },
  { h: ["Description of Goods", "(Product / Grade)"], w: 138, a: "left" as const },
  { h: ["HSN", "Code"], w: 46, a: "center" as const },
  { h: ["Batch No. /", "Mfg - Exp"], w: 74, a: "center" as const },
  { h: ["Quantity"], w: 50, a: "right" as const },
  { h: ["Pack", "Details"], w: 50, a: "center" as const },
  { h: ["UOM"], w: 34, a: "center" as const },
  { h: ["Rate (Rs.)", "per UOM"], w: 52, a: "right" as const },
  { h: ["Amount", "(Rs.)"], w: 57.3, a: "right" as const },
];
const XS = COLS.reduce<number[]>((acc, c) => [...acc, acc[acc.length - 1] + c.w], [L]);

function drawItemsHeader(doc: jsPDF, y: number) {
  doc.setFillColor(...BLUE);
  doc.rect(L, y, R - L, 26, "F");
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  COLS.forEach((c, i) => {
    if (i > 0) doc.line(XS[i], y, XS[i], y + 26);
    const cx = (XS[i] + XS[i + 1]) / 2;
    const start = y + 13 - ((c.h.length - 1) * 8.5) / 2 + 2.6;
    c.h.forEach((t, j) => text(doc, t, cx, start + j * 8.5, { bold: true, size: 7.2, color: [255, 255, 255], align: "center" }));
  });
  return y + 26;
}

export function generateInvoicePdf(inv: InvoicePdfData, profile: InvoiceProfile): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  let page = 1;
  const newPage = () => {
    drawFooter(doc, page);
    doc.addPage();
    page++;
    return 40;
  };

  drawInvoiceLetterhead(doc, profile);

  // Title
  doc.setFillColor(...BLUE);
  doc.rect(L, 108, R - L, 25, "F");
  text(doc, "TAX INVOICE", (L + R) / 2, 125.5, { bold: true, size: 14, color: [255, 255, 255], align: "center" });
  text(doc, "(Original for Recipient / Duplicate for Transporter / Triplicate for Supplier)", (L + R) / 2, 143, { size: 7, align: "center", color: [70, 70, 70] });

  // ---- Invoice details grid: two boxes ----
  const pos = stateFrom(inv.placeOfSupply);
  const leftRows: [string, string][] = [
    ["Invoice No.", inv.invoiceNumber],
    ["Invoice Date", fmtDate(inv.invoiceDate)],
    ["Buyer's PO No. / Date", inv.poReference || ""],
    ["Place of Supply / State Code", `${pos.name} / ${pos.code}`],
  ];
  const rightRows: [string, string][] = [
    ["Payment Terms", inv.paymentTerms || ""],
    ["Due Date", fmtDate(inv.dueDate)],
    ["Transport / Vehicle No.", inv.vehicleNumber || ""],
    ["E-Way Bill No. / LR No.", inv.ewayBillNumber || ""],
  ];
  let y = 150;
  const rh = 20;
  for (let i = 0; i < 4; i++) {
    const y2 = y + rh;
    cellBox(doc, L, y, 120, y2, TINT);
    cellBox(doc, 120, y, MID_L, y2);
    cellBox(doc, MID_R, y, 400, y2, TINT);
    cellBox(doc, 400, y, R, y2);
    cellText(doc, leftRows[i][0], L, y, 120, y2, { bold: true, size: 7.6 });
    cellText(doc, leftRows[i][1], 120, y, MID_L, y2, { color: BLUE, bold: i === 0, size: 7.8 });
    cellText(doc, rightRows[i][0], MID_R, y, 400, y2, { bold: true, size: 7.6 });
    cellText(doc, rightRows[i][1], 400, y, R, y2, { color: BLUE, size: 7.8 });
    y = y2;
  }

  // ---- Billed to / Shipped to ----
  y += 8;
  sectionBar(doc, y, "BILLED TO (BUYER)", L, MID_L);
  sectionBar(doc, y, "SHIPPED TO (CONSIGNEE)", MID_R, R);
  y += 15;
  const partyH = 86;
  cellBox(doc, L, y, MID_L, y + partyH);
  cellBox(doc, MID_R, y, R, y + partyH);

  const halfW = MID_L - L - 12;
  const bx = L + 6;
  labelled(doc, "Name:", inv.customerName, bx, y + 13, halfW, 40);
  doc.setFontSize(7.8);
  const addr: string[] = inv.customerAddress ? doc.splitTextToSize(inv.customerAddress, halfW - 36) : [];
  labelled(doc, "Address:", addr[0] || null, bx, y + 26, halfW, 38);
  if (addr[1]) text(doc, addr[1], bx + 34, y + 37, { size: 7.8, color: BLUE });
  else text(doc, "_".repeat(46), bx, y + 37, { size: 7.8, color: GREY });
  const afterGst = labelled(doc, "GSTIN:", inv.customerGstin, bx, y + 51, halfW * 0.62, 16);
  labelled(doc, "State / Code:", `${pos.name} / ${pos.code}`, Math.max(afterGst + 8, bx + halfW * 0.55), y + 51, halfW * 0.45, 8);
  labelled(doc, "Phone / Email:", [inv.customerPhone, inv.customerEmail].filter(Boolean).join(" / ") || null, bx, y + 65, halfW, 30);

  const sx = MID_R + 6;
  const sameAs = inv.shipToSameAsBilling;
  const shipName = sameAs ? inv.customerName : inv.shipToName;
  const shipAddr = sameAs ? inv.customerAddress : inv.shipToAddress;
  const shipGstin = sameAs ? inv.customerGstin : inv.shipToGstin;
  const shipContact = sameAs ? inv.customerPhone : inv.shipToContact;
  const shipW = R - MID_R - 12;
  labelled(doc, "Name:", shipName, sx, y + 13, shipW, 40);
  doc.setFontSize(7.8);
  const saddr: string[] = shipAddr ? doc.splitTextToSize(shipAddr, shipW - 36) : [];
  labelled(doc, "Address:", saddr[0] || null, sx, y + 26, shipW, 38);
  if (saddr[1]) text(doc, saddr[1], sx + 34, y + 37, { size: 7.8, color: BLUE });
  else text(doc, "_".repeat(46), sx, y + 37, { size: 7.8, color: GREY });
  labelled(doc, "GSTIN:", shipGstin, sx, y + 51, shipW * 0.55, 16);
  // "Same as Billed To: [ ]"
  const tickX = sx + shipW - 18;
  text(doc, "Same as Billed To:", tickX - 4, y + 51, { size: 7.8, align: "right" });
  doc.setDrawColor(...GREY);
  doc.setLineWidth(0.6);
  doc.rect(tickX, y + 44.5, 8, 8, "S");
  if (sameAs) text(doc, "X", tickX + 4, y + 51, { bold: true, size: 7.5, color: BLUE, align: "center" });
  labelled(doc, "Contact Person / Phone:", shipContact || null, sx, y + 65, shipW, 24);
  if (!sameAs && inv.shipToState) labelled(doc, "State:", inv.shipToState, sx, y + 78, shipW, 10);
  y += partyH + 8;

  // ---- Goods table ----
  y = drawItemsHeader(doc, y);
  const rowH = 22;
  const rows = Math.max(6, inv.items.length);
  for (let i = 0; i < rows; i++) {
    if (y + rowH > BOTTOM) {
      y = newPage();
      y = drawItemsHeader(doc, y);
    }
    const it = inv.items[i];
    COLS.forEach((_, c) => cellBox(doc, XS[c], y, XS[c + 1], y + rowH));
    cellText(doc, String(i + 1), XS[0], y, XS[1], y + rowH, { align: "center", size: 7.6 });
    if (it) {
      const amount = it.quantity * it.unitPrice;
      cellText(doc, it.description || "", XS[1], y, XS[2], y + rowH, { color: BLUE, size: 7.6 });
      cellText(doc, it.hsnCode || "", XS[2], y, XS[3], y + rowH, { color: BLUE, align: "center", size: 7.4 });
      // batch on line 1, mfg - exp on line 2
      const cx = (XS[3] + XS[4]) / 2;
      const me = [monthYear(it.mfgDate), monthYear(it.expDate)].filter(Boolean).join(" - ");
      if (it.batchNumber) text(doc, it.batchNumber, cx, me ? y + 9.5 : y + 13.5, { size: 7.2, color: BLUE, align: "center" });
      if (me) text(doc, me, cx, it.batchNumber ? y + 18 : y + 13.5, { size: 6.4, color: [90, 90, 90], align: "center" });
      cellText(doc, qty(it.quantity), XS[4], y, XS[5], y + rowH, { color: BLUE, align: "right", size: 7.6 });
      cellText(doc, it.packDetails || "", XS[5], y, XS[6], y + rowH, { color: BLUE, align: "center", size: 7 });
      cellText(doc, it.unit, XS[6], y, XS[7], y + rowH, { color: BLUE, align: "center", size: 7.4 });
      cellText(doc, money(it.unitPrice), XS[7], y, XS[8], y + rowH, { color: BLUE, align: "right", size: 7.4 });
      cellText(doc, money(amount), XS[8], y, XS[9], y + rowH, { color: BLUE, align: "right", size: 7.4 });
    }
    y += rowH;
  }

  // ---- Bank details & amount in words | totals ----
  const rateLabel = (rates: number[]) => (rates.length ? rates.map((r) => `${r}%`).join(", ") : "-");
  const cgstRates = [...new Set(inv.items.filter((i) => i.cgst > 0).map((i) => i.gstRate / 2))];
  const igstRates = [...new Set(inv.items.filter((i) => i.igst > 0).map((i) => i.gstRate))];
  const goodsValue = inv.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const totals: [string, string, boolean?][] = [
    ["Total Taxable Value", money(goodsValue)],
    ["Less: Discount", inv.discountAmount ? `- ${money(inv.discountAmount)}` : "0.00"],
    ["Freight / Packing", money(inv.freightAmount)],
    [`CGST @ ${rateLabel(cgstRates)}`, money(inv.cgstAmount)],
    [`SGST @ ${rateLabel(cgstRates)}`, money(inv.sgstAmount)],
    [`IGST @ ${rateLabel(igstRates)}`, money(inv.igstAmount)],
    ...(inv.cessAmount ? ([["Cess", money(inv.cessAmount)]] as [string, string][]) : []),
    ["Round Off", `${inv.roundOff >= 0 ? "" : "- "}${money(Math.abs(inv.roundOff))}`],
    ["GRAND TOTAL (Rs.)", money(inv.grandTotal), true],
  ];
  const trh = 17;
  const blockH = 15 + totals.length * trh;
  if (y + 8 + blockH > BOTTOM) y = newPage();
  y += 8;
  const top = y;

  // totals (right)
  let ty = top;
  const tl = 400;
  totals.forEach(([k, v, strong]) => {
    cellBox(doc, MID_R, ty, tl + 40, ty + trh, strong ? TOTAL_TINT : TINT);
    cellBox(doc, tl + 40, ty, R, ty + trh, strong ? TOTAL_TINT : undefined);
    cellText(doc, k, MID_R, ty, tl + 40, ty + trh, { bold: true, size: strong ? 8.4 : 7.8 });
    cellText(doc, v, tl + 40, ty, R, ty + trh, { align: "right", bold: strong, size: strong ? 9 : 7.8, color: strong ? NAVY : BLUE });
    ty += trh;
  });

  // bank (left)
  sectionBar(doc, top, "BANK DETAILS FOR PAYMENT", L, MID_L);
  const bankRows: [string, string][] = [
    ["Account Name:", profile.bankAccountName],
    ["Bank & Branch:", profile.bankName],
    ["Account No.:", profile.bankAccountNo],
  ];
  const bankBoxBottom = top + 15 + 5 * 13 + 4;
  cellBox(doc, L, top + 15, MID_L, bankBoxBottom);
  let by = top + 26;
  bankRows.forEach(([k, v]) => {
    labelled(doc, k, v || null, L + 6, by, MID_L - L - 12, 32);
    by += 13;
  });
  const afterIfsc = labelled(doc, "IFSC Code:", profile.bankIfsc || null, L + 6, by, 120, 14);
  labelled(doc, "A/c Type:", profile.bankAccountType || null, Math.max(afterIfsc + 10, L + 130), by, 120, 12);

  // amount in words fills the rest of the left column
  const wordsTop = bankBoxBottom + 6;
  cellBox(doc, L, wordsTop, MID_L, ty, TINT);
  text(doc, "Amount in Words:", L + 6, wordsTop + 12, { bold: true, size: 8 });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  const words = doc.splitTextToSize(amountInWords(inv.grandTotal), MID_L - L - 12).slice(0, Math.max(1, Math.floor((ty - wordsTop - 18) / 10)));
  text(doc, "", 0, 0);
  doc.setTextColor(...BLUE);
  doc.text(words, L + 6, wordsTop + 24);
  y = ty;

  // ---- Terms & conditions ----
  const termsText = (inv.terms && inv.terms.trim()) || profile.defaultTerms || DEFAULT_INVOICE_TERMS;
  doc.setFontSize(7.4);
  const termLines: { s: string; bold: string }[] = [];
  for (const raw of termsText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)) {
    const m = raw.match(/^(Declaration:)\s*(.*)$/i);
    const wrapped: string[] = doc.splitTextToSize(raw, R - L - 12);
    wrapped.forEach((w, i) => termLines.push({ s: w, bold: i === 0 && m ? m[1] : "" }));
  }
  const termsH = 15 + 8 + termLines.length * 9.6;
  const sigH = 62;
  if (y + 8 + termsH + 8 + sigH > BOTTOM + 14) y = newPage();
  y += 8;
  sectionBar(doc, y, "TERMS & CONDITIONS", L, R, BLUE);
  cellBox(doc, L, y + 15, R, y + termsH);
  let ly = y + 26;
  for (const t of termLines) {
    if (t.bold) {
      text(doc, t.bold, L + 6, ly, { bold: true, size: 7.4 });
      doc.setFont("helvetica", "bold");
      const bw = doc.getTextWidth(t.bold + " ");
      text(doc, t.s.slice(t.bold.length).trim(), L + 6 + bw, ly, { size: 7.4 });
    } else {
      text(doc, t.s, L + 6, ly, { size: 7.4 });
    }
    ly += 9.6;
  }
  y += termsH + 8;

  // ---- Signatures ----
  cellBox(doc, L, y, MID_L, y + 15, TINT);
  cellBox(doc, MID_R, y, R, y + 15, TINT);
  cellText(doc, "Receiver's Signature & Seal", L, y, MID_L, y + 15, { bold: true, size: 8 });
  cellText(doc, "Authorised Signatory", MID_R, y, R, y + 15, { bold: true, size: 8 });
  cellBox(doc, L, y + 15, MID_L, y + sigH);
  cellBox(doc, MID_R, y + 15, R, y + sigH);
  text(doc, "Name:", L + 6, y + 28, { size: 7.8 });
  text(doc, "Date:", L + 6, y + sigH - 8, { size: 7.8 });
  text(doc, `For ${COMPANY.name}`, MID_R + 6, y + 28, { bold: true, size: 8 });
  text(doc, "Name / Designation:", MID_R + 6, y + sigH - 8, { size: 7.8 });

  drawFooter(doc, page);
  return doc;
}
