import ExcelJS from "exceljs";
import path from "path";
import { COMPANY } from "./company";

/**
 * Fills the client's "Sales Register Format (MSB).xlsx" template (src/templates) with one row per
 * product per invoice. All template styling, dropdowns, frozen panes, hidden helper columns and
 * formulas are preserved; formula cells also get cached results so values show without recalculation.
 */

export interface RegisterLine {
  invoiceNumber: string;
  invoiceDate: Date;
  customerName: string;
  customerGstin: string | null;
  placeOfSupply: string;
  category: string;
  invoiceType: string;
  reverseCharge: string;
  description: string;
  hsnCode: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxableValue: number;
  gstRate: number;
  supplyType: string;
  igst: number;
  cgst: number;
  sgst: number;
  cess: number;
  lineTotal: number;
}

const FIRST_ROW = 6;
const TEMPLATE_LAST_ROW = 505;
const TEMPLATE_PATH = path.join(process.cwd(), "src", "templates", "sales-register-template.xlsx");

/** Template formulas (columns A, P–AE) with {r} = row, {p} = previous row. */
const FORMULAS: Record<string, string> = {
  A: 'IF(B{r}="","",ROW()-5)',
  P: 'IF(B{r}="","",ROUND(M{r}*N{r}-O{r},2))',
  // Original referenced an external Setup sheet for the company state code; inlined here.
  R: `IF(F{r}="","",IF(LEFT(F{r},2)="${COMPANY.stateCode}","Intra-State","Inter-State"))`,
  S: 'IF(R{r}="","",IF(R{r}="Inter-State",ROUND(P{r}*Q{r}/100,2),0))',
  T: 'IF(R{r}="","",IF(R{r}="Intra-State",ROUND(P{r}*Q{r}/200,2),0))',
  U: 'IF(R{r}="","",IF(R{r}="Intra-State",ROUND(P{r}*Q{r}/200,2),0))',
  W: 'IF(B{r}="","",SUM(P{r},S{r},T{r},U{r},V{r}))',
  X: 'IF(B{r}="","",IF(LEN(B{r})>16,"Invoice no. > 16 chars",IF(K{r}="","Missing HSN",IF(OR(M{r}="",N{r}=""),"Missing qty / rate",IF(Q{r}="","Missing GST rate",IF(F{r}="","Missing place of supply",IF(AND(G{r}="B2B",LEN(E{r})<>15),"Check recipient GSTIN","OK")))))))',
  Y: 'IF(B{r}="","",IF(COUNTIF($B$6:B{r},B{r})=1,MAX($Y$5:Y{p})+1,""))',
  Z: 'IF(B{r}="","",J{r}&"|"&K{r})',
  AA: 'IF(B{r}="","",IF(COUNTIF($Z$6:Z{r},Z{r})=1,MAX($AA$5:AA{p})+1,""))',
  AB: 'IF(B{r}="","",IF(G{r}="B2B","B2B","B2C")&"|"&K{r}&"|"&L{r}&"|"&Q{r})',
  AC: 'IF(B{r}="","",IF(COUNTIF($AB$6:AB{r},AB{r})=1,MAX($AC$5:AC{p})+1,""))',
  AD: 'IF(OR(B{r}="",G{r}<>"B2B"),"",B{r}&"|"&Q{r})',
  AE: 'IF(AD{r}="","",IF(COUNTIF($AD$6:AD{r},AD{r})=1,MAX($AE$5:AE{p})+1,""))',
};
const INPUT_COLS = ["B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "Q", "V"];

const f = (col: string, r: number) => FORMULAS[col].replace(/\{r\}/g, String(r)).replace(/\{p\}/g, String(r - 1));

function utcDate(d: Date) {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export async function buildSalesRegister(lines: RegisterLine[], periodLabel: string): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(TEMPLATE_PATH);
  const ws = wb.getWorksheet("Sales Register") ?? wb.worksheets[0];

  // Instruction row: drop the "rows 6–10 are examples" note and stamp the export period
  const note = ws.getCell("A2");
  note.value = `Type in yellow cells only. Dropdowns: Category, Invoice Type, Reverse Charge, UQC, GST Rate. Black cells are formulas. Columns Y–AE are hidden helper columns used by the summary sheets. Exported from MSB Business Portal: ${periodLabel}.`;

  const lastRow = Math.max(TEMPLATE_LAST_ROW, FIRST_ROW + lines.length - 1);
  const styleRow = ws.getRow(FIRST_ROW + 5); // an untouched template row to copy styles from

  // Track (invoice, key) first-occurrence sequences for the hidden helper columns' cached results
  const seen = { inv: new Map<string, number>(), prod: new Map<string, number>(), hsn: new Map<string, number>(), b2b: new Map<string, number>() };
  const seq = (m: Map<string, number>, k: string) => (m.has(k) ? "" : (m.set(k, m.size + 1), m.size));

  for (let r = FIRST_ROW; r <= lastRow; r++) {
    const row = ws.getRow(r);
    if (r > TEMPLATE_LAST_ROW) {
      row.height = styleRow.height;
      styleRow.eachCell({ includeEmpty: true }, (cell, col) => {
        row.getCell(col).style = { ...cell.style };
      });
    }
    const line = lines[r - FIRST_ROW];
    for (const c of INPUT_COLS) ws.getCell(`${c}${r}`).value = null;

    if (!line) {
      for (const c of Object.keys(FORMULAS)) ws.getCell(`${c}${r}`).value = { formula: f(c, r), result: "" } as ExcelJS.CellFormulaValue;
      continue;
    }

    const set = (c: string, v: ExcelJS.CellValue) => (ws.getCell(`${c}${r}`).value = v);
    set("B", line.invoiceNumber);
    set("C", utcDate(line.invoiceDate));
    set("D", line.customerName);
    set("E", line.customerGstin || null);
    set("F", line.placeOfSupply);
    set("G", line.category);
    set("H", line.invoiceType);
    set("I", line.reverseCharge);
    set("J", line.description);
    set("K", line.hsnCode || null);
    set("L", line.unit);
    set("M", line.quantity);
    set("N", line.unitPrice);
    set("O", line.discount || 0);
    set("Q", line.gstRate);
    set("V", line.cess ? line.cess : null);

    const isB2B = line.category === "B2B";
    const prodKey = `${line.description}|${line.hsnCode}`;
    const hsnKey = `${isB2B ? "B2B" : "B2C"}|${line.hsnCode}|${line.unit}|${line.gstRate}`;
    const b2bKey = isB2B ? `${line.invoiceNumber}|${line.gstRate}` : "";
    const check =
      line.invoiceNumber.length > 16
        ? "Invoice no. > 16 chars"
        : !line.hsnCode
          ? "Missing HSN"
          : isB2B && (line.customerGstin || "").length !== 15
            ? "Check recipient GSTIN"
            : "OK";
    const results: Record<string, ExcelJS.CellValue> = {
      A: r - 5,
      P: line.taxableValue,
      R: line.supplyType,
      S: line.igst,
      T: line.cgst,
      U: line.sgst,
      W: line.lineTotal,
      X: check,
      Y: seq(seen.inv, line.invoiceNumber),
      Z: prodKey,
      AA: seq(seen.prod, prodKey),
      AB: hsnKey,
      AC: seq(seen.hsn, hsnKey),
      AD: b2bKey,
      AE: b2bKey ? seq(seen.b2b, b2bKey) : "",
    };
    for (const c of Object.keys(FORMULAS)) {
      ws.getCell(`${c}${r}`).value = { formula: f(c, r), result: results[c] } as ExcelJS.CellFormulaValue;
    }
  }

  if (lastRow > TEMPLATE_LAST_ROW) ws.autoFilter = `A5:X${lastRow}`;

  // Ask Excel to recalculate on open so formulas stay live
  wb.calcProperties = { ...(wb.calcProperties || {}), fullCalcOnLoad: true };

  return Buffer.from(await wb.xlsx.writeBuffer());
}
