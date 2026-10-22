import * as XLSX from "xlsx";

/**
 * Sanitizes values against CSV/Excel formula injection (attacks starting with =, +, -, @, \t, \r)
 */
export function sanitizeCellValue(val: unknown): unknown {
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (
      trimmed.startsWith("=") ||
      trimmed.startsWith("+") ||
      trimmed.startsWith("-") ||
      trimmed.startsWith("@") ||
      trimmed.startsWith("\t") ||
      trimmed.startsWith("\r")
    ) {
      return `'${val}`;
    }
  }
  return val;
}

export function sanitizeRecord<T extends Record<string, unknown>>(record: T): T {
  const sanitized = {} as Record<string, unknown>;
  for (const [key, value] of Object.entries(record)) {
    sanitized[key] = sanitizeCellValue(value);
  }
  return sanitized as T;
}

/**
 * Generates an Excel (XLSX) buffer from an array of object records
 */
export function generateExcelBuffer(data: Record<string, unknown>[], sheetName = "Data"): Buffer {
  const sanitizedData = data.map(sanitizeRecord);
  const worksheet = XLSX.utils.json_to_sheet(sanitizedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer as Buffer;
}

/**
 * Generates a standard CSV string with proper escaping and formula protection
 */
export function generateCsvString(data: Record<string, unknown>[]): string {
  const sanitizedData = data.map(sanitizeRecord);
  const worksheet = XLSX.utils.json_to_sheet(sanitizedData);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  return csv;
}
