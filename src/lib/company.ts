/**
 * Company identity printed on GRN / invoice PDFs and used for GST place-of-supply logic.
 * Fill in EMAIL and GSTIN once confirmed by the client — blank values print as "______" lines,
 * matching the supplied GRN report format.
 */
export const COMPANY = {
  name: "MSB PHARMACHEM",
  tagline: "Quality Products, Global Supply",
  motto: "Quality  •  Reliability  •  Trust",
  address: "Plot No. 128, Kamala Prasanna Nagar, Allwyn Colony, Kukatpally, Hyderabad - 500072, Telangana, India",
  phone: "+91 90639 22242",
  email: "",
  gstin: "",
  stateCode: "36",
  stateName: "Telangana",
  bankDetails: "",
};

/** GST state codes in the "NN-State" form used by the Sales Register "Place of Supply" column. */
export const GST_STATES = [
  "01-Jammu and Kashmir", "02-Himachal Pradesh", "03-Punjab", "04-Chandigarh", "05-Uttarakhand",
  "06-Haryana", "07-Delhi", "08-Rajasthan", "09-Uttar Pradesh", "10-Bihar", "11-Sikkim",
  "12-Arunachal Pradesh", "13-Nagaland", "14-Manipur", "15-Mizoram", "16-Tripura", "17-Meghalaya",
  "18-Assam", "19-West Bengal", "20-Jharkhand", "21-Odisha", "22-Chhattisgarh", "23-Madhya Pradesh",
  "24-Gujarat", "26-Dadra and Nagar Haveli and Daman and Diu", "27-Maharashtra", "29-Karnataka",
  "30-Goa", "31-Lakshadweep", "32-Kerala", "33-Tamil Nadu", "34-Puducherry",
  "35-Andaman and Nicobar Islands", "36-Telangana", "37-Andhra Pradesh", "38-Ladakh",
  "96-Foreign Country", "97-Other Territory",
];

/** Dropdown values copied from the client's Sales Register template. */
export const INVOICE_CATEGORIES = ["B2B", "B2CL", "B2CS", "Export"];
export const INVOICE_TYPES = [
  "Regular",
  "SEZ supplies with payment",
  "SEZ supplies without payment",
  "Deemed Export",
  "Intra-State supplies attracting IGST",
];
export const UQC_OPTIONS = ["KGS", "GMS", "LTR", "MLT", "MTS", "TON", "NOS", "PCS", "BOX", "OTH"];
export const GST_RATES = [0, 0.1, 0.25, 1.5, 3, 5, 6, 7.5, 12, 18, 28, 40];

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function supplyTypeFor(placeOfSupply: string): "Intra-State" | "Inter-State" {
  return placeOfSupply.slice(0, 2) === COMPANY.stateCode ? "Intra-State" : "Inter-State";
}

export interface GstLineInput {
  quantity: number;
  unitPrice: number;
  discount?: number;
  gstRate: number;
  cess?: number;
}

/** Same arithmetic as the Sales Register formulas (columns P, S, T, U, W). */
export function computeGstLine(line: GstLineInput, placeOfSupply: string) {
  const taxableValue = r2(line.quantity * line.unitPrice - (line.discount || 0));
  const inter = supplyTypeFor(placeOfSupply) === "Inter-State";
  const igst = inter ? r2((taxableValue * line.gstRate) / 100) : 0;
  const cgst = inter ? 0 : r2((taxableValue * line.gstRate) / 200);
  const sgst = cgst;
  const cess = r2(line.cess || 0);
  return { taxableValue, igst, cgst, sgst, cess, lineTotal: r2(taxableValue + igst + cgst + sgst + cess) };
}

export { r2 };

export interface InvoiceLineInput {
  quantity: number;
  unitPrice: number;
  gstRate: number;
  cess?: number;
}

/**
 * Tax-invoice arithmetic shared by the form preview and the server.
 * Amount = qty × rate. Invoice-level discount and freight/packing are spread over the lines in
 * proportion to their amount, so each line's taxable value (and the Sales Register) stays exact.
 * GST is then charged per line; the grand total is rounded to the nearest rupee.
 */
export function computeInvoiceTotals(lines: InvoiceLineInput[], discount: number, freight: number, placeOfSupply: string) {
  const amounts = lines.map((l) => r2((l.quantity || 0) * (l.unitPrice || 0)));
  const gross = r2(amounts.reduce((a, b) => a + b, 0));
  const d = Math.max(0, r2(discount || 0));
  const f = Math.max(0, r2(freight || 0));

  let dLeft = d;
  let fLeft = f;
  const computed = lines.map((l, i) => {
    const last = i === lines.length - 1;
    const share = gross > 0 ? amounts[i] / gross : last ? 1 : 0;
    const dShare = last ? dLeft : r2(d * share);
    const fShare = last ? fLeft : r2(f * share);
    dLeft = r2(dLeft - dShare);
    fLeft = r2(fLeft - fShare);
    // "discount" is the net adjustment to this line's amount (discount share minus freight share)
    const adj = r2(dShare - fShare);
    const t = computeGstLine({ quantity: l.quantity, unitPrice: l.unitPrice, discount: adj, gstRate: l.gstRate, cess: l.cess }, placeOfSupply);
    return { amount: amounts[i], discount: adj, ...t };
  });

  const sum = (k: "taxableValue" | "igst" | "cgst" | "sgst" | "cess") => r2(computed.reduce((s, c) => s + c[k], 0));
  const taxable = sum("taxableValue");
  const igst = sum("igst");
  const cgst = sum("cgst");
  const sgst = sum("sgst");
  const cess = sum("cess");
  const beforeRound = r2(taxable + igst + cgst + sgst + cess);
  const grandTotal = Math.round(beforeRound);
  return {
    lines: computed,
    gross,
    discount: d,
    freight: f,
    taxable,
    igst,
    cgst,
    sgst,
    cess,
    tax: r2(igst + cgst + sgst + cess),
    roundOff: r2(grandTotal - beforeRound),
    grandTotal,
  };
}
