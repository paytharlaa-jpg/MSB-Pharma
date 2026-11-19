import jsPDF from "jspdf";
import fs from "fs";
import path from "path";
import { COMPANY } from "./company";
import {
  GRN_CHECKLIST_LEFT,
  GRN_CHECKLIST_RIGHT,
  GRN_QC_STATUSES,
  GRN_REJECTION_ACTIONS,
  GRN_THREE_WAY,
  GRN_SIGNATORIES,
} from "./grn-constants";

/**
 * Renders the "GOODS RECEIPT NOTE (GRN) & INCOMING INSPECTION REPORT" exactly on the client's
 * template grid (A4, points). Coordinates are taken from the supplied PDF.
 */

type RGB = [number, number, number];
const BLUE: RGB = [27, 77, 179]; // #1B4DB3
const GREEN: RGB = [58, 154, 30]; // #3A9A1E
const TINT: RGB = [234, 241, 251]; // label cells
const GREY: RGB = [128, 128, 128];

export interface GrnPdfItem {
  materialDescription: string;
  batchNumber: string;
  mfgDate: Date | null;
  expiryDate: Date | null;
  qtyAsPerInvoice: number | null;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  unit: string;
  numContainers: number | null;
  remarks: string | null;
}

export interface GrnPdfData {
  grnNumber: string;
  receiptDate: Date;
  receiptTime: string | null;
  supplierName: string;
  supplierAddress: string | null;
  poNumberDate: string | null;
  invoiceNumberDate: string | null;
  vehicleNumber: string | null;
  transporterLr: string | null;
  ewayBillNumber: string | null;
  receivedAt: string | null;
  checklist: Record<string, string>;
  qcSampleRef: string | null;
  sampledBy: string | null;
  sampledDate: Date | null;
  qcStatus: string | null;
  storageLocation: string | null;
  tempCondition: string | null;
  rejectionAction: string | null;
  threeWayMatch: string[];
  remarks: string | null;
  signatories: Record<string, { name?: string; date?: string }>;
  items: GrnPdfItem[];
}

const L = 34;
const R = 561.3;

export function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "";
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getUTCFullYear()}`;
}

function fmtQty(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(Number(n))) return "";
  return Number(n).toLocaleString("en-IN", { maximumFractionDigits: 3 });
}

let cachedLogo: string | null | undefined;
export function loadLogo(): string | null {
  if (cachedLogo !== undefined) return cachedLogo;
  try {
    const file = path.join(process.cwd(), "public", "images", "logo-pdf.png");
    cachedLogo = "data:image/png;base64," + fs.readFileSync(file).toString("base64");
  } catch {
    cachedLogo = null;
  }
  return cachedLogo;
}

/** Shared letterhead used by GRN and invoice PDFs. */
export function drawLetterhead(doc: jsPDF, contact: { email?: string; gstin?: string } = {}) {
  const logo = loadLogo();
  if (logo) doc.addImage(logo, "PNG", 34, 31.7, 68, 68);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...BLUE);
  doc.text("MSB ", 113.4, 58.2);
  doc.setTextColor(...GREEN);
  doc.text("PHARMACHEM", 113.4 + doc.getTextWidth("MSB "), 58.2);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.text(COMPANY.tagline, 113.4, 69.7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(COMPANY.address, 113.4, 80.2);
  doc.text(
    `Phone: ${COMPANY.phone}  |  Email: ${contact.email || COMPANY.email || "____________________"}  |  GSTIN: ${contact.gstin || COMPANY.gstin || "____________________"}`,
    113.4,
    90.7
  );

  doc.setDrawColor(...BLUE);
  doc.setLineWidth(1.2);
  doc.line(L, 104.7, R, 104.7);
}

export function drawFooter(doc: jsPDF, page: number) {
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(1.5);
  doc.line(L, 810.7, R, 810.7);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(...BLUE);
  doc.text("Quality  •  Reliability  •  Trust", 297.6, 822, { align: "center" });
  doc.setTextColor(...GREY);
  doc.text(`Page ${page}`, R, 822, { align: "right" });
}

export function drawTitleBar(doc: jsPDF, title: string) {
  doc.setFillColor(...BLUE);
  doc.rect(L, 108.7, R - L, 26, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(title, 297.6, 126.7, { align: "center" });
}

export function sectionBar(doc: jsPDF, y: number, label: string, x1 = L, x2 = R, color: RGB = GREEN, h = 15) {
  doc.setFillColor(...color);
  doc.rect(x1, y, x2 - x1, h, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(label, x1 + 6, y + h / 2 + 2.8);
}

export function cellBox(doc: jsPDF, x1: number, y1: number, x2: number, y2: number, fill?: RGB) {
  if (fill) {
    doc.setFillColor(...fill);
    doc.rect(x1, y1, x2 - x1, y2 - y1, "F");
  }
  doc.setDrawColor(...GREY);
  doc.setLineWidth(0.5);
  doc.rect(x1, y1, x2 - x1, y2 - y1, "S");
}

/** Writes text inside a cell, shrinking / wrapping (max 2 lines) to fit. */
export function cellText(
  doc: jsPDF,
  text: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  opts: { bold?: boolean; align?: "left" | "center" | "right"; size?: number; color?: RGB } = {}
) {
  if (!text) return;
  const size = opts.size ?? 8;
  doc.setFont("helvetica", opts.bold ? "bold" : "normal");
  doc.setTextColor(...(opts.color ?? ([0, 0, 0] as RGB)));
  const width = x2 - x1 - 8;
  let fs = size;
  doc.setFontSize(fs);
  // Prefer shrinking slightly to keep short values (numbers, labels) on one line
  while (doc.getTextWidth(text) > width && fs > size - 1.5) {
    fs -= 0.25;
    doc.setFontSize(fs);
  }
  let lines: string[] = doc.splitTextToSize(text, width);
  const maxLines = Math.max(1, Math.floor((y2 - y1 - 2) / (fs * 1.1)));
  while (lines.length > Math.min(2, maxLines) && fs > 6) {
    fs -= 0.5;
    doc.setFontSize(fs);
    lines = doc.splitTextToSize(text, width);
  }
  lines = lines.slice(0, Math.max(1, Math.min(2, Math.floor((y2 - y1 - 2) / (fs * 1.1)))));
  const lh = fs * 1.15;
  const blockH = lh * lines.length;
  let ty = y1 + (y2 - y1 - blockH) / 2 + fs * 0.85;
  const align = opts.align ?? "left";
  const tx = align === "center" ? (x1 + x2) / 2 : align === "right" ? x2 - 4 : x1 + 6;
  for (const line of lines) {
    doc.text(line, tx, ty, { align });
    ty += lh;
  }
}

/** Draws a tick mark centred in a box. */
function tick(doc: jsPDF, cx: number, cy: number, size = 4) {
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(1.2);
  doc.line(cx - size, cy, cx - size / 3, cy + size * 0.8);
  doc.line(cx - size / 3, cy + size * 0.8, cx + size, cy - size * 0.8);
}

/** "[   ] Label" option row; checked options get an X in the brackets. */
function optionRow(doc: jsPDF, x: number, y: number, options: { key: string; label: string }[], selected: string[]) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  let cx = x;
  for (const opt of options) {
    const on = selected.includes(opt.key);
    const prefix = " [   ] ";
    doc.text(prefix, cx, y);
    if (on) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BLUE);
      doc.text("X", cx + doc.getTextWidth(" [") + 1.6, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
    }
    cx += doc.getTextWidth(prefix);
    doc.setFont("helvetica", on ? "bold" : "normal");
    doc.text(opt.label, cx, y);
    cx += doc.getTextWidth(opt.label + "  ");
    doc.setFont("helvetica", "normal");
  }
}

function labelValue(doc: jsPDF, x: number, y: number, label: string, value: string, blank: string, boldLabel = true) {
  doc.setFont("helvetica", boldLabel ? "bold" : "normal");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text(label, x, y);
  let cx = x + doc.getTextWidth(label + " ");
  doc.setFont("helvetica", "normal");
  if (value) {
    doc.setTextColor(...BLUE);
    doc.text(value, cx, y);
    cx += doc.getTextWidth(value + "   ");
    doc.setTextColor(0, 0, 0);
  } else {
    doc.text(blank, cx, y);
    cx += doc.getTextWidth(blank + "   ");
  }
  return cx;
}

export function generateGrnPdf(g: GrnPdfData, contact: { email?: string; gstin?: string } = {}): jsPDF {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  let page = 1;

  drawLetterhead(doc, contact);
  drawTitleBar(doc, "GOODS RECEIPT NOTE (GRN) & INCOMING INSPECTION REPORT");

  // --- Header strip: GRN No / Date / Time
  const hy1 = 139.7, hy2 = 159.6;
  const hcols: [number, number, string][] = [
    [34, 90.7, "GRN No."],
    [238.1, 292, "GRN Date"],
    [399.7, 479.1, "Time of Receipt"],
  ];
  cellBox(doc, 34, hy1, 90.7, hy2, TINT);
  cellBox(doc, 90.7, hy1, 238.1, hy2);
  cellBox(doc, 238.1, hy1, 292, hy2, TINT);
  cellBox(doc, 292, hy1, 399.7, hy2);
  cellBox(doc, 399.7, hy1, 479.1, hy2, TINT);
  cellBox(doc, 479.1, hy1, R, hy2);
  for (const [x1, x2, label] of hcols) cellText(doc, label, x1, hy1, x2, hy2, { bold: true });
  cellText(doc, g.grnNumber, 90.7, hy1, 238.1, hy2, { color: BLUE, bold: true });
  cellText(doc, fmtDate(g.receiptDate), 292, hy1, 399.7, hy2, { color: BLUE });
  cellText(doc, g.receiptTime || "", 479.1, hy1, R, hy2, { color: BLUE });

  // --- 1. Supplier & document details
  sectionBar(doc, 163.6, "1. SUPPLIER & DOCUMENT DETAILS");
  const rows1: [string, string, string, string][] = [
    ["Supplier Name", g.supplierName, "Supplier Address", g.supplierAddress || ""],
    ["PO No. / Date", g.poNumberDate || "", "Invoice No. / Date", g.invoiceNumberDate || ""],
    ["Vehicle No.", g.vehicleNumber || "", "Transporter / LR", g.transporterLr || ""],
    ["E-Way Bill No.", g.ewayBillNumber || "", "Received At", g.receivedAt || ""],
  ];
  const ys1 = [178.6, 198.4, 218.2, 238.1, 257.9];
  rows1.forEach((r, i) => {
    const y1 = ys1[i], y2 = ys1[i + 1];
    cellBox(doc, 34, y1, 113.4, y2, TINT);
    cellBox(doc, 113.4, y1, 297.6, y2);
    cellBox(doc, 297.6, y1, 399.7, y2, TINT);
    cellBox(doc, 399.7, y1, R, y2);
    cellText(doc, r[0], 34, y1, 113.4, y2, { bold: true });
    cellText(doc, r[1], 113.4, y1, 297.6, y2, { color: BLUE });
    cellText(doc, r[2], 297.6, y1, 399.7, y2, { bold: true });
    cellText(doc, r[3], 399.7, y1, R, y2, { color: BLUE });
  });

  // --- 2. Material received
  sectionBar(doc, 261.9, "2. MATERIAL RECEIVED");
  const mx = [34, 56.7, 161.6, 223.9, 283.5, 331.7, 379.8, 413.9, 450.7, R];
  const heads = [
    ["S.", "No"],
    ["Material Description"],
    ["Batch No."],
    ["Mfg / Exp", "(Retest) Date"],
    ["Qty as", "per", "Invoice"],
    ["Qty", "Received"],
    ["UOM"],
    ["No. of", "Cont."],
    ["Accepted / Rejected", "Qty & Remarks"],
  ];
  doc.setFillColor(...BLUE);
  doc.rect(L, 276.9, R - L, 34.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  heads.forEach((h, i) => {
    const cx = (mx[i] + mx[i + 1]) / 2;
    const startY = 296.9 - ((h.length - 1) * 9.5) / 2;
    h.forEach((t, j) => doc.text(t, cx, startY + j * 9.5, { align: "center" }));
  });
  doc.setDrawColor(...GREY);
  doc.setLineWidth(0.5);
  for (let i = 1; i < mx.length - 1; i++) doc.line(mx[i], 276.9, mx[i], 311.4);

  const rowH = 20.7;
  const nRows = Math.max(5, g.items.length);
  let y = 311.4;
  for (let i = 0; i < nRows; i++) {
    if (y + rowH > 790) {
      drawFooter(doc, page);
      doc.addPage();
      page++;
      y = 40;
    }
    const it = g.items[i];
    for (let c = 0; c < mx.length - 1; c++) cellBox(doc, mx[c], y, mx[c + 1], y + rowH);
    cellText(doc, String(i + 1), mx[0], y, mx[1], y + rowH);
    if (it) {
      const mfgExp = [fmtDate(it.mfgDate), fmtDate(it.expiryDate)].filter(Boolean).join(" / ");
      const accRej = `A: ${fmtQty(it.acceptedQuantity)} / R: ${fmtQty(it.rejectedQuantity)}${it.remarks ? ` - ${it.remarks}` : ""}`;
      const blue = { color: BLUE };
      cellText(doc, it.materialDescription, mx[1], y, mx[2], y + rowH, blue);
      cellText(doc, it.batchNumber, mx[2], y, mx[3], y + rowH, { ...blue, align: "center" });
      cellText(doc, mfgExp, mx[3], y, mx[4], y + rowH, { ...blue, align: "center", size: 7 });
      cellText(doc, fmtQty(it.qtyAsPerInvoice), mx[4], y, mx[5], y + rowH, { ...blue, align: "center" });
      cellText(doc, fmtQty(it.receivedQuantity), mx[5], y, mx[6], y + rowH, { ...blue, align: "center" });
      cellText(doc, it.unit, mx[6], y, mx[7], y + rowH, { ...blue, align: "center" });
      cellText(doc, it.numContainers != null ? String(it.numContainers) : "", mx[7], y, mx[8], y + rowH, { ...blue, align: "center" });
      cellText(doc, accRej, mx[8], y, mx[9], y + rowH, { ...blue, size: 7 });
    }
    y += rowH;
  }

  // Remaining sections are a fixed 325pt block; start a new page if they don't fit.
  const BLOCK = 739.6 - 414.9;
  if (y + BLOCK > 805) {
    drawFooter(doc, page);
    doc.addPage();
    page++;
    y = 40;
  }
  const off = y - 414.9; // shift from template coordinates
  const Y = (v: number) => v + off;

  // --- 3. Incoming inspection checklist
  sectionBar(doc, Y(418.9), "3. INCOMING INSPECTION CHECKLIST");
  const drawChecklist = (x0: number, xs: number[], list: { key: string; label: string }[]) => {
    doc.setFillColor(...BLUE);
    doc.rect(x0, Y(436.9), xs[3] - x0, 15.6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text("Inspection Point", (x0 + xs[0]) / 2, Y(447.4), { align: "center" });
    ["Yes", "No", "N/A"].forEach((t, i) => doc.text(t, (xs[i] + xs[i + 1]) / 2, Y(447.4), { align: "center" }));
    const rys = [452.5, 467.2, 482.0, 496.7, 511.4, 526.2];
    list.forEach((item, r) => {
      const y1 = Y(rys[r]), y2 = Y(rys[r + 1]);
      cellBox(doc, x0, y1, xs[0], y2);
      cellBox(doc, xs[0], y1, xs[1], y2);
      cellBox(doc, xs[1], y1, xs[2], y2);
      cellBox(doc, xs[2], y1, xs[3], y2);
      cellText(doc, item.label, x0, y1, xs[0], y2);
      const v = g.checklist[item.key];
      const col = v === "YES" ? 0 : v === "NO" ? 1 : v === "NA" ? 2 : -1;
      if (col >= 0) tick(doc, (xs[col] + xs[col + 1]) / 2, (y1 + y2) / 2);
    });
  };
  // column edges: [inspection point end, yes end, no end, n/a end]
  drawChecklistCols(doc, drawChecklist);

  // --- 4. QC, disposition & matching
  sectionBar(doc, Y(533.2), "4. QC, DISPOSITION & MATCHING");
  cellBox(doc, 34, Y(551.2), 355.2, Y(613.7));
  cellBox(doc, 360.9, Y(551.2), R, Y(624.2));
  sectionBar(doc, Y(551.2), "QC SAMPLING & DISPOSITION", 34, 355.2, BLUE, 15.5);
  sectionBar(doc, Y(551.2), "THREE-WAY MATCH", 360.9, R, BLUE, 15.5);

  let cx = labelValue(doc, 40, Y(576.7), "QC Sample Ref. No.:", g.qcSampleRef || "", "__________", false);
  cx = labelValue(doc, cx, Y(576.7), "Sampled by:", g.sampledBy || "", "__________", false);
  labelValue(doc, cx, Y(576.7), "Date:", fmtDate(g.sampledDate), "________", false);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Status:", 40, Y(587.2));
  optionRow(doc, 67.1, Y(587.2), GRN_QC_STATUSES, g.qcStatus ? [g.qcStatus] : []);

  cx = labelValue(doc, 40, Y(597.7), "Storage Location / Bin:", g.storageLocation || "", "____________________");
  labelValue(doc, Math.max(cx, 225.4), Y(597.7), "Temp. Condition:", g.tempCondition || "", "____________");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Action on Rejection:", 40, Y(608.2));
  optionRow(doc, 117.8, Y(608.2), GRN_REJECTION_ACTIONS, g.rejectionAction ? [g.rejectionAction] : []);

  GRN_THREE_WAY.forEach((m, i) => optionRow(doc, 362.9, Y(576.7 + i * 10.5), [m], g.threeWayMatch));

  // Remarks
  cellBox(doc, 34, Y(630.2), R, Y(645.8), TINT);
  cellBox(doc, 34, Y(645.8), R, Y(676.9));
  cellText(doc, "Remarks / Discrepancies (shortage, excess, damage, documents missing):", 34, Y(630.2), R, Y(645.8), { bold: true });
  if (g.remarks) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...BLUE);
    const lines = doc.splitTextToSize(g.remarks, R - L - 12).slice(0, 3);
    doc.text(lines, 40, Y(656));
  }

  // Sign-off
  const sx = [34, 165.8, 297.6, 429.4, R];
  GRN_SIGNATORIES.forEach((s, i) => {
    cellBox(doc, sx[i], Y(682.9), sx[i + 1], Y(697.1), TINT);
    cellBox(doc, sx[i], Y(697.1), sx[i + 1], Y(739.6));
    cellText(doc, s.label, sx[i], Y(682.9), sx[i + 1], Y(697.1), { bold: true });
    const sig = g.signatories[s.key] || {};
    const x = sx[i] + 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text("Name:", x, Y(708.1));
    doc.text("Sign:", x, Y(718.6));
    doc.text("Date:", x, Y(729.1));
    doc.setTextColor(...BLUE);
    if (sig.name) doc.text(doc.splitTextToSize(sig.name, sx[i + 1] - x - 30)[0], x + 26, Y(708.1));
    if (sig.date) doc.text(fmtDate(sig.date), x + 26, Y(729.1));
  });

  drawFooter(doc, page);
  return doc;
}

function drawChecklistCols(
  _doc: jsPDF,
  draw: (x0: number, xs: number[], list: { key: string; label: string }[]) => void
) {
  draw(34, [206.9, 235.3, 263.6, 292], GRN_CHECKLIST_LEFT);
  draw(297.6, [470.6, 498.9, 527.2, 555.6], GRN_CHECKLIST_RIGHT);
}
