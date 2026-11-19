/**
 * Company details printed on the tax invoice (and GRN letterhead), bank details and the default
 * Terms & Conditions. Stored as JSON in SiteSettings.invoiceProfile and edited from
 * Invoices > Invoice Settings. Blank values print as "______" lines, like the client's template.
 */
export interface InvoiceProfile {
  email: string;
  website: string;
  gstin: string;
  pan: string;
  iec: string;
  bankAccountName: string;
  bankName: string;
  bankAccountNo: string;
  bankIfsc: string;
  bankAccountType: string;
  defaultTerms: string;
}

export const DEFAULT_INVOICE_TERMS = [
  "Declaration: We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
  "1. Goods once sold will not be taken back or exchanged except for quality non-conformity reported in writing within 7 days of receipt.",
  "2. Interest @ 18% p.a. will be charged on payments delayed beyond the due date.",
  "3. Certificate of Analysis (CoA) and MSDS are supplied with each batch, where applicable.",
  "4. Subject to Hyderabad, Telangana jurisdiction only. E. & O.E.",
].join("\n");

export const EMPTY_PROFILE: InvoiceProfile = {
  email: "",
  website: "",
  gstin: "",
  pan: "",
  iec: "",
  bankAccountName: "MSB Pharmachem",
  bankName: "",
  bankAccountNo: "",
  bankIfsc: "",
  bankAccountType: "",
  defaultTerms: DEFAULT_INVOICE_TERMS,
};

export function parseInvoiceProfile(json: string | null | undefined): InvoiceProfile {
  try {
    const raw = json ? (JSON.parse(json) as Partial<InvoiceProfile>) : {};
    const out = { ...EMPTY_PROFILE };
    for (const k of Object.keys(EMPTY_PROFILE) as (keyof InvoiceProfile)[]) {
      if (typeof raw[k] === "string") out[k] = (raw[k] as string).slice(0, k === "defaultTerms" ? 3000 : 200);
    }
    if (!out.defaultTerms.trim()) out.defaultTerms = DEFAULT_INVOICE_TERMS;
    return out;
  } catch {
    return { ...EMPTY_PROFILE };
  }
}
