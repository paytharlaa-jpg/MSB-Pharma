import jsPDF from "jspdf";
import { COMPANY } from "./company";
import { amountInWords } from "./invoice-input";
import { drawLetterhead, drawFooter, drawTitleBar, sectionBar, cellBox, cellText, fmtDate } from "./grn-pdf";

/**
 * GST Tax Invoice in the same visual format as the client's GRN report:
 * letterhead, blue title bar, green numbered section bars, tinted label cells, grey grid.
 */

type RGB = [number, number, number];
const BLUE: RGB = [27, 77, 179];
const TINT: RGB = [234, 241, 251];
const L = 34;
const R = 561.3;

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
  category: string;
  invoiceType: string;
  reverseCharge: string;
  supplyType: string;
  poReference: string | null;
  vehicleNumber: string | null;
  ewayBillNumber: string | null;
  subtotal: number;
  igstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  cessAmount: number;
  discountAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: string;
  notes: string | null;
  terms: string | null;
  items: Array<{
    description: string | null;
    hsnCode: string | null;
    unit: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxableValue: number;
    gstRate: number;
    igst: number;
    cgst: number;
    sgst: number;
    lineTotal: number;
  }>;
  payments: Array<{ paymentDate: Date; paymentMethod: string; referenceNumber: string | null; amount: number }>;
}

const money = (n: number) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const qty = (n: number) => Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 3, maximumFractionDigits: 3 });

export function generateInvoicePdf(inv: InvoicePdfData): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  let page = 1;
  const newPage = () => {
    drawFooter(doc, page);
    doc.addPage();
    page++;
    return 40;
  };

  drawLetterhead(doc);
  drawTitleBar(doc, "TAX INVOICE");

  // --- Header strip
  const hy1 = 139.7, hy2 = 159.6;
  const strip: [number, number, string, string][] = [
    [34, 90.7, "Invoice No.", inv.invoiceNumber],
    [238.1, 292, "Invoice Date", fmtDate(inv.invoiceDate)],
    [399.7, 479.1, "Due Date", fmtDate(inv.dueDate)],
  ];
  const valueEnds = [238.1, 399.7, R];
  strip.forEach(([x1, x2, label, value], i) => {
    cellBox(doc, x1, hy1, x2, hy2, TINT);
    cellBox(doc, x2, hy1, valueEnds[i], hy2);
    cellText(doc, label, x1, hy1, x2, hy2, { bold: true });
    cellText(doc, value, x2, hy1, valueEnds[i], hy2, { color: BLUE, bold: i === 0 });
  });

  // --- 1. Billed to & supply details
  sectionBar(doc, 163.6, "1. BILLED TO & SUPPLY DETAILS");
  const rows1: [string, string, string, string][] = [
    ["Customer Name", inv.customerName, "Customer GSTIN", inv.customerGstin || (inv.category === "B2B" ? "" : "Unregistered")],
    ["Billing Address", inv.customerAddress || "", "Place of Supply", inv.placeOfSupply],
    ["Phone / Email", [inv.customerPhone, inv.customerEmail].filter(Boolean).join(" / "), "Category / Type", `${inv.category} / ${inv.invoiceType}`],
    ["Supply Type", inv.supplyType, "Reverse Charge", inv.reverseCharge === "Y" ? "Yes" : "No"],
    ["PO / Order Ref.", inv.poReference || "", "Vehicle / E-Way Bill", [inv.vehicleNumber, inv.ewayBillNumber].filter(Boolean).join(" / ")],
  ];
  let y = 178.6;
  const rh = 19.8;
  for (const r of rows1) {
    cellBox(doc, 34, y, 113.4, y + rh, TINT);
    cellBox(doc, 113.4, y, 297.6, y + rh);
    cellBox(doc, 297.6, y, 399.7, y + rh, TINT);
    cellBox(doc, 399.7, y, R, y + rh);
    cellText(doc, r[0], 34, y, 113.4, y + rh, { bold: true });
    cellText(doc, r[1], 113.4, y, 297.6, y + rh, { color: BLUE });
    cellText(doc, r[2], 297.6, y, 399.7, y + rh, { bold: true });
    cellText(doc, r[3], 399.7, y, R, y + rh, { color: BLUE });
    y += rh;
  }

  // --- 2. Product details (Sales Register columns)
  y += 4;
  sectionBar(doc, y, "2. PRODUCT DETAILS");
  y += 15;
  const inter = inv.supplyType === "Inter-State";
  const cols = inter
    ? [
        { h: ["S.", "No"], w: 20, a: "center" },
        { h: ["Product Description"], w: 104, a: "left" },
        { h: ["HSN", "Code"], w: 44, a: "center" },
        { h: ["Qty"], w: 42, a: "right" },
        { h: ["UQC"], w: 26, a: "center" },
        { h: ["Rate", "(₹)"], w: 46, a: "right" },
        { h: ["Disc.", "(₹)"], w: 42, a: "right" },
        { h: ["Taxable", "Value (₹)"], w: 56, a: "right" },
        { h: ["GST", "%"], w: 24, a: "center" },
        { h: ["IGST", "(₹)"], w: 54, a: "right" },
        { h: ["Total", "(₹)"], w: 69.3, a: "right" },
      ]
    : [
        { h: ["S.", "No"], w: 20, a: "center" },
        { h: ["Product Description"], w: 88, a: "left" },
        { h: ["HSN", "Code"], w: 42, a: "center" },
        { h: ["Qty"], w: 40, a: "right" },
        { h: ["UQC"], w: 25, a: "center" },
        { h: ["Rate", "(₹)"], w: 42, a: "right" },
        { h: ["Disc.", "(₹)"], w: 38, a: "right" },
        { h: ["Taxable", "Value (₹)"], w: 52, a: "right" },
        { h: ["GST", "%"], w: 22, a: "center" },
        { h: ["CGST", "(₹)"], w: 46, a: "right" },
        { h: ["SGST", "(₹)"], w: 46, a: "right" },
        { h: ["Total", "(₹)"], w: 66.3, a: "right" },
      ];
  const xs = [L];
  cols.forEach((c) => xs.push(xs[xs.length - 1] + c.w));

  const drawHead = (top: number) => {
    doc.setFillColor(...BLUE);
    doc.rect(L, top, R - L, 24, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    cols.forEach((c, i) => {
      const cx = (xs[i] + xs[i + 1]) / 2;
      const lines = c.h.map((t) => t.replace("₹", "Rs."));
      const sy = top + 12 - ((lines.length - 1) * 8) / 2 + 2.5;
      lines.forEach((t, j) => doc.text(t, cx, sy + j * 8, { align: "center" }));
    });
    doc.setDrawColor(128, 128, 128);
    doc.setLineWidth(0.5);
    for (let i = 1; i < xs.length - 1; i++) doc.line(xs[i], top, xs[i], top + 24);
  };
  drawHead(y);
  y += 24;

  const lineH = 20.7;
  const rowsToDraw = Math.max(inv.items.length, 3);
  for (let i = 0; i < rowsToDraw; i++) {
    if (y + lineH > 790) {
      y = newPage();
      drawHead(y);
      y += 24;
    }
    const it = inv.items[i];
    const vals = it
      ? inter
        ? [String(i + 1), it.description || "", it.hsnCode || "", qty(it.quantity), it.unit, money(it.unitPrice), money(it.discount), money(it.taxableValue), String(it.gstRate), money(it.igst), money(it.lineTotal)]
        : [String(i + 1), it.description || "", it.hsnCode || "", qty(it.quantity), it.unit, money(it.unitPrice), money(it.discount), money(it.taxableValue), String(it.gstRate), money(it.cgst), money(it.sgst), money(it.lineTotal)]
      : cols.map(() => "");
    cols.forEach((c, ci) => {
      cellBox(doc, xs[ci], y, xs[ci + 1], y + lineH);
      cellText(doc, vals[ci], xs[ci], y, xs[ci + 1], y + lineH, {
        size: 7,
        align: c.a as "left" | "center" | "right",
        color: ci === 0 ? [0, 0, 0] : BLUE,
      });
    });
    y += lineH;
  }

  // Totals row
  const totals = inter
    ? ["", "TOTAL", "", "", "", "", money(inv.discountAmount), money(inv.subtotal), "", money(inv.igstAmount), money(inv.grandTotal)]
    : ["", "TOTAL", "", "", "", "", money(inv.discountAmount), money(inv.subtotal), "", money(inv.cgstAmount), money(inv.sgstAmount), money(inv.grandTotal)];
  cols.forEach((c, ci) => {
    cellBox(doc, xs[ci], y, xs[ci + 1], y + lineH, TINT);
    cellText(doc, totals[ci], xs[ci], y, xs[ci + 1], y + lineH, { size: 7, bold: true, align: c.a as "left" | "center" | "right" });
  });
  y += lineH;

  // --- 3. Tax summary & amount
  if (y + 120 > 790) y = newPage();
  y += 4;
  sectionBar(doc, y, "3. TAX SUMMARY & AMOUNT");
  y += 15;
  const sumRows: [string, string][] = [
    ["Total Taxable Value", money(inv.subtotal)],
    ...(inter ? ([["IGST", money(inv.igstAmount)]] as [string, string][]) : ([["CGST", money(inv.cgstAmount)], ["SGST", money(inv.sgstAmount)]] as [string, string][])),
    ...(inv.cessAmount ? ([["Cess", money(inv.cessAmount)]] as [string, string][]) : []),
    ["Invoice Total (Rs.)", money(inv.grandTotal)],
  ];
  const sx1 = 360.9, sx2 = 470.6;
  const boxTop = y;
  sumRows.forEach(([k, v], i) => {
    const last = i === sumRows.length - 1;
    cellBox(doc, sx1, y, sx2, y + 17, TINT);
    cellBox(doc, sx2, y, R, y + 17, last ? TINT : undefined);
    cellText(doc, k, sx1, y, sx2, y + 17, { bold: true });
    cellText(doc, v, sx2, y, R, y + 17, { bold: last, align: "right", color: last ? [0, 0, 0] : BLUE });
    y += 17;
  });
  // Amount in words (left box spans the same height)
  cellBox(doc, L, boxTop, 355.2, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text("Amount in Words:", L + 6, boxTop + 12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...BLUE);
  doc.text(doc.splitTextToSize(amountInWords(inv.grandTotal), 355.2 - L - 12), L + 6, boxTop + 24);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Tax payable on reverse charge:", L + 6, y - 6);
  const rcX = L + 6 + doc.getTextWidth("Tax payable on reverse charge: ");
  doc.setFont("helvetica", "normal");
  doc.text(inv.reverseCharge === "Y" ? "Yes" : "No", rcX, y - 6);

  // --- 4. Payments
  const payRows = Math.max(inv.payments.length, 1);
  if (y + 40 + payRows * 15 + 45 > 790) y = newPage();
  y += 6;
  sectionBar(doc, y, "4. PAYMENT DETAILS");
  y += 15;
  const px = [L, 130, 260, 440, R];
  const ph = ["Payment Date", "Mode", "Reference / UTR No.", "Amount (Rs.)"];
  doc.setFillColor(...BLUE);
  doc.rect(L, y, R - L, 15.6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  ph.forEach((h, i) => doc.text(h, (px[i] + px[i + 1]) / 2, y + 10.5, { align: "center" }));
  y += 15.6;
  for (let i = 0; i < payRows; i++) {
    const p = inv.payments[i];
    const vals = p ? [fmtDate(p.paymentDate), p.paymentMethod.replace(/_/g, " "), p.referenceNumber || "-", money(p.amount)] : ["No payments received yet", "", "", ""];
    for (let c = 0; c < 4; c++) {
      cellBox(doc, px[c], y, px[c + 1], y + 15);
      cellText(doc, vals[c], px[c], y, px[c + 1], y + 15, { align: c === 3 ? "right" : "center", color: p ? BLUE : [128, 128, 128] });
    }
    y += 15;
  }
  const status = inv.paymentStatus.replace(/_/g, " ");
  const balRow: [string, string][] = [
    ["Amount Received", money(inv.paidAmount)],
    ["Balance Due", money(inv.balanceAmount)],
    ["Payment Status", status],
  ];
  balRow.forEach(([k, v], i) => {
    const x1 = L + i * ((R - L) / 3);
    const x2 = x1 + (R - L) / 3;
    const mid = x1 + 90;
    cellBox(doc, x1, y, mid, y + 16, TINT);
    cellBox(doc, mid, y, x2, y + 16);
    cellText(doc, k, x1, y, mid, y + 16, { bold: true });
    cellText(doc, v, mid, y, x2, y + 16, { bold: true, align: "right", color: i === 1 && inv.balanceAmount > 0 ? [190, 18, 60] : BLUE });
  });
  y += 16;

  // --- Remarks / terms / bank + signatures
  const terms = [inv.notes, inv.terms].filter(Boolean).join("\n");
  const bank = COMPANY.bankDetails;
  if (y + 120 > 800) y = newPage();
  y += 6;
  cellBox(doc, L, y, R, y + 15.6, TINT);
  cellText(doc, "Remarks / Terms & Conditions:", L, y, R, y + 15.6, { bold: true });
  y += 15.6;
  cellBox(doc, L, y, R, y + 36);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...BLUE);
  const termLines = doc
    .splitTextToSize(terms || "Goods once sold will not be taken back. Interest @18% p.a. on overdue payments. Subject to Hyderabad jurisdiction.", R - L - 12)
    .slice(0, 3);
  doc.text(termLines, L + 6, y + 10);
  y += 36 + 6;

  const sigCols = [L, 297.6, R];
  const sigLabels = ["Receiver's Signature (Customer)", `For ${COMPANY.name} - Authorised Signatory`];
  sigLabels.forEach((s, i) => {
    cellBox(doc, sigCols[i], y, sigCols[i + 1], y + 14.2, TINT);
    cellBox(doc, sigCols[i], y + 14.2, sigCols[i + 1], y + 56);
    cellText(doc, s, sigCols[i], y, sigCols[i + 1], y + 14.2, { bold: true });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text("Name:", sigCols[i] + 6, y + 25);
    doc.text("Sign:", sigCols[i] + 6, y + 37);
    doc.text("Date:", sigCols[i] + 6, y + 49);
  });
  if (bank) {
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text(bank.split("\n").join("  |  "), L, y + 66);
  }

  drawFooter(doc, page);
  return doc;
}
