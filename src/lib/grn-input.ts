import type { Prisma } from "@prisma/client";

/** Shape posted by the GRN form (create + update). */
export interface GrnInput {
  receiptDate?: string;
  receiptTime?: string;
  supplierName?: string;
  supplierAddress?: string;
  poNumberDate?: string;
  invoiceNumberDate?: string;
  vehicleNumber?: string;
  transporterLr?: string;
  ewayBillNumber?: string;
  receivedAt?: string;
  checklist?: Record<string, string>;
  qcSampleRef?: string;
  sampledBy?: string;
  sampledDate?: string;
  qcStatus?: string;
  storageLocation?: string;
  tempCondition?: string;
  rejectionAction?: string;
  threeWayMatch?: string[];
  remarks?: string;
  signatories?: Record<string, { name?: string; date?: string }>;
  items?: Array<{
    materialDescription?: string;
    batchNumber?: string;
    mfgDate?: string;
    expiryDate?: string;
    qtyAsPerInvoice?: number | string | null;
    receivedQuantity?: number | string;
    acceptedQuantity?: number | string;
    rejectedQuantity?: number | string;
    unit?: string;
    numContainers?: number | string | null;
    remarks?: string;
  }>;
}

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const date = (v: unknown) => {
  if (typeof v !== "string" || !v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
};
const num = (v: unknown) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
};

export function parseGrnInput(body: GrnInput) {
  const errors: string[] = [];
  const supplierName = str(body.supplierName);
  if (!supplierName) errors.push("Supplier name is required");

  const items = (body.items || [])
    .filter((i) => str(i.materialDescription))
    .map((i) => {
      const received = num(i.receivedQuantity) ?? 0;
      const rejected = num(i.rejectedQuantity) ?? 0;
      const accepted = num(i.acceptedQuantity) ?? Math.max(received - rejected, 0);
      const containers = num(i.numContainers);
      return {
        materialDescription: str(i.materialDescription)!,
        batchNumber: str(i.batchNumber) || "",
        mfgDate: date(i.mfgDate),
        expiryDate: date(i.expiryDate),
        qtyAsPerInvoice: num(i.qtyAsPerInvoice),
        receivedQuantity: received,
        acceptedQuantity: accepted,
        rejectedQuantity: rejected,
        unit: str(i.unit) || "KGS",
        numContainers: containers === null ? null : Math.round(containers),
        remarks: str(i.remarks),
      };
    });
  if (items.length === 0) errors.push("Add at least one material line");

  const data = {
    receiptDate: date(body.receiptDate) ?? new Date(),
    receiptTime: str(body.receiptTime),
    supplierName: supplierName || "",
    supplierAddress: str(body.supplierAddress),
    poNumberDate: str(body.poNumberDate),
    invoiceNumberDate: str(body.invoiceNumberDate),
    vehicleNumber: str(body.vehicleNumber),
    transporterLr: str(body.transporterLr),
    ewayBillNumber: str(body.ewayBillNumber),
    receivedAt: str(body.receivedAt),
    checklist: JSON.stringify(body.checklist || {}),
    qcSampleRef: str(body.qcSampleRef),
    sampledBy: str(body.sampledBy),
    sampledDate: date(body.sampledDate),
    qcStatus: str(body.qcStatus),
    storageLocation: str(body.storageLocation),
    tempCondition: str(body.tempCondition),
    rejectionAction: str(body.rejectionAction),
    threeWayMatch: JSON.stringify(Array.isArray(body.threeWayMatch) ? body.threeWayMatch : []),
    remarks: str(body.remarks),
    notes: str(body.remarks),
    signatories: JSON.stringify(body.signatories || {}),
  } satisfies Partial<Prisma.GoodsReceiptNoteUncheckedCreateInput>;

  return { errors, data, items };
}

export function safeJson<T>(s: string | null | undefined, fallback: T): T {
  try {
    return s ? (JSON.parse(s) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Builds a Prisma "contains" search across GRN text fields. */
export function grnSearchWhere(q: string): Prisma.GoodsReceiptNoteWhereInput {
  if (!q) return {};
  return {
    OR: [
      { grnNumber: { contains: q } },
      { supplierName: { contains: q } },
      { poNumberDate: { contains: q } },
      { invoiceNumberDate: { contains: q } },
      { vehicleNumber: { contains: q } },
      { ewayBillNumber: { contains: q } },
      { items: { some: { materialDescription: { contains: q } } } },
      { items: { some: { batchNumber: { contains: q } } } },
    ],
  };
}
