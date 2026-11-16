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
