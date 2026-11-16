/** Checklist / option definitions shared by the GRN form and the GRN PDF (client-safe). */
export const GRN_CHECKLIST_LEFT = [
  { key: "vehicleClean", label: "Vehicle clean, dry & covered" },
  { key: "sealIntact", label: "Container seal / packing intact" },
  { key: "labelOk", label: "Label: name, batch, Mfg/Exp, wt." },
  { key: "weightMatches", label: "Net weight / quantity matches" },
  { key: "coaReceived", label: "CoA received (batch-wise)" },
];
export const GRN_CHECKLIST_RIGHT = [
  { key: "msdsReceived", label: "MSDS / SDS received" },
  { key: "invoicePackingList", label: "Tax invoice & packing list received" },
  { key: "shelfLife", label: "Min. shelf life / retest as agreed" },
  { key: "storageTemp", label: "Storage temperature maintained" },
  { key: "noDamage", label: "No spillage / leakage / damage" },
];
export const GRN_QC_STATUSES = [
  { key: "QUARANTINE", label: "Quarantine" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
  { key: "ON_HOLD", label: "On Hold" },
];
export const GRN_REJECTION_ACTIONS = [
  { key: "RETURN_TO_SUPPLIER", label: "Return to Supplier" },
  { key: "DEBIT_NOTE", label: "Debit Note" },
  { key: "REPLACEMENT", label: "Replacement" },
];
export const GRN_THREE_WAY = [
  { key: "PO_VS_GRN", label: "PO vs GRN: Qty / Rate" },
  { key: "GRN_VS_INVOICE", label: "GRN vs Invoice: Qty" },
  { key: "PO_VS_INVOICE", label: "PO vs Invoice: Rate / Tax" },
  { key: "CLEARED_FOR_PAYMENT", label: "Cleared for payment" },
  { key: "DISCREPANCY", label: "Discrepancy noted" },
];
export const GRN_SIGNATORIES = [
  { key: "store", label: "Received by (Store)" },
  { key: "qc", label: "Inspected by (QC)" },
  { key: "purchase", label: "Verified by (Purchase)" },
  { key: "approver", label: "Approved by" },
];
