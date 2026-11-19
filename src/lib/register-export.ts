import ExcelJS from "exceljs";

/**
 * Builds report workbooks in the same visual format as the client's Sales Register:
 * blue title bar (row 1), italic note (row 2), summary (row 3), blue header row (row 5),
 * Arial 10 data rows with grey grid lines, frozen header + first columns, filters, print setup.
 */

export type ColumnType = "text" | "longtext" | "date" | "money" | "qty" | "int";

export interface RegisterColumn {
  header: string;
  key: string;
  width: number;
  type?: ColumnType;
}

const BLUE = "FF1B4DB3";
const BORDER = { style: "thin" as const, color: { argb: "FF9AA5B8" } };
const ALL_BORDERS = { top: BORDER, left: BORDER, bottom: BORDER, right: BORDER };
const ZEBRA = "FFF7F9FC";

/**
 * Values are written as typed string / number / date cells, never as formulas, so text such as
 * "+91 98490…" or "=1+1" is stored literally and cannot execute (CSV exports sanitise separately).
 */
function safe(v: unknown): ExcelJS.CellValue {
  return (v ?? null) as ExcelJS.CellValue;
}

function colLetter(n: number) {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export async function buildRegisterWorkbook(opts: {
  sheetName: string;
  title: string;
  note: string;
  summary?: string;
  columns: RegisterColumn[];
  rows: Record<string, unknown>[];
  freezeColumns?: number;
}): Promise<Buffer> {
  const { columns, rows } = opts;
  const wb = new ExcelJS.Workbook();
  wb.creator = "MSB PHARMACHEM Business Portal";
  wb.created = new Date();
  const ws = wb.addWorksheet(opts.sheetName.slice(0, 31), {
    views: [{ state: "frozen", xSplit: opts.freezeColumns ?? 2, ySplit: 5, showGridLines: false }],
    pageSetup: { orientation: "landscape", paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: "5:5" },
  });
  const last = colLetter(columns.length);

  ws.columns = columns.map((c) => ({ key: c.key, width: c.width }));

  // Row 1: title bar
  ws.mergeCells(`A1:${last}1`);
  const title = ws.getCell("A1");
  title.value = opts.title;
  title.font = { name: "Arial", size: 15, bold: true, color: { argb: "FFFFFFFF" } };
  title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BLUE } };
  title.alignment = { vertical: "middle", indent: 1 };
  ws.getRow(1).height = 30;

  // Row 2: note
  ws.mergeCells(`A2:${last}2`);
  const note = ws.getCell("A2");
  note.value = opts.note;
  note.font = { name: "Arial", size: 9, italic: true, color: { argb: "FF555555" } };
  note.alignment = { vertical: "middle", wrapText: true };
  ws.getRow(2).height = 30;

  // Row 3: summary
  if (opts.summary) {
    ws.mergeCells(`A3:${last}3`);
    const sum = ws.getCell("A3");
    sum.value = opts.summary;
    sum.font = { name: "Arial", size: 10, bold: true, color: { argb: "FF0F2D6B" } };
    sum.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEAF1FB" } };
    sum.alignment = { vertical: "middle", indent: 1 };
    ws.getRow(3).height = 22;
  }

  // Row 5: header
  const header = ws.getRow(5);
  columns.forEach((c, i) => {
    const cell = header.getCell(i + 1);
    cell.value = c.header;
    cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BLUE } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = ALL_BORDERS;
  });
  header.height = 33.75;

  // Data rows
  rows.forEach((r, idx) => {
    const row = ws.getRow(6 + idx);
    columns.forEach((c, i) => {
      const cell = row.getCell(i + 1);
      const raw = r[c.key];
      cell.value = c.type === "date" && raw ? new Date(raw as string | Date) : safe(raw);
      cell.font = { name: "Arial", size: 10, color: { argb: "FF000000" } };
      cell.border = ALL_BORDERS;
      if (idx % 2 === 1) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ZEBRA } };
      const wrap = c.type === "longtext";
      cell.alignment = {
        vertical: "middle",
        wrapText: wrap,
        horizontal: c.type === "money" || c.type === "qty" || c.type === "int" ? "right" : c.type === "date" ? "center" : "left",
      };
      if (c.type === "date") cell.numFmt = "dd-mmm-yy";
      if (c.type === "money") cell.numFmt = "#,##0.00";
      if (c.type === "qty") cell.numFmt = "#,##0.000";
      if (c.type === "int") cell.numFmt = "0";
    });
    row.height = columns.some((c) => c.type === "longtext") ? 36 : 22;
  });

  if (rows.length === 0) {
    ws.mergeCells(`A6:${last}6`);
    const empty = ws.getCell("A6");
    empty.value = "No records for the selected period / filters.";
    empty.font = { name: "Arial", size: 10, italic: true, color: { argb: "FF888888" } };
    empty.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(6).height = 24;
  }

  ws.autoFilter = { from: { row: 5, column: 1 }, to: { row: 5 + Math.max(rows.length, 1), column: columns.length } };

  return Buffer.from(await wb.xlsx.writeBuffer());
}
