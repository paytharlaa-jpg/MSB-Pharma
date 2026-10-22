import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface DocumentParty {
  name: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  gstin?: string | null;
  pan?: string | null;
}

interface DocumentLineItem {
  srNo: number;
  description: string;
  batchOrCas?: string;
  quantity: number | string;
  unit: string;
  unitPrice?: number | string;
  lineTotal?: number | string;
}

interface DocumentPdfData {
  title: string; // e.g. "TAX INVOICE", "QUOTATION", "DELIVERY CHALLAN", "PURCHASE ORDER", "GOODS RECEIPT NOTE"
  documentNumber: string;
  documentDate: string;
  dueDateOrExpiry?: string;
  partyTitle: string; // "Billed To" or "Issued To" or "Supplier"
  party: DocumentParty;
  items: DocumentLineItem[];
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  discountAmount?: number;
  grandTotal?: number;
  paidAmount?: number;
  balanceAmount?: number;
  notes?: string | null;
  terms?: string | null;
  showPricing?: boolean;
}

export function generateDocumentPdf(data: DocumentPdfData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  type RGB = [number, number, number];
  const primaryBlue: RGB = [0, 72, 143]; // #00488F
  const darkNavy: RGB = [11, 31, 51]; // #0B1F33
  const brandGreen: RGB = [22, 163, 74]; // #16A34A
  const slateGrey: RGB = [100, 116, 139];

  // Header Bar
  doc.setFillColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.rect(0, 0, 210, 36, "F");

  // Accent Line
  doc.setFillColor(brandGreen[0], brandGreen[1], brandGreen[2]);
  doc.rect(0, 36, 210, 2, "F");

  // Company Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("MSB PHARMACHEM", 14, 16);

  // Tagline & Address
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(220, 230, 242);
  doc.text("Quality • Reliability • Trust | Pharmaceutical APIs, Intermediates & Fine Chemicals", 14, 22);
  doc.text("Plot No. 128, Kamala Prasanna Nagar, Allwyn Colony, Kukatpally, Hyderabad – 500072, India", 14, 27);
  doc.text("Phone: +91 8008335333 | Email: mohank9@gmail.com | Web: msbpharmachem.com", 14, 32);

  // Document Badge (Right Side)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(data.title, 196, 18, { align: "right" });

  doc.setFontSize(9);
  doc.setTextColor(200, 240, 200);
  doc.text(data.documentNumber, 196, 25, { align: "right" });
  doc.setTextColor(220, 230, 242);
  doc.text(`Date: ${data.documentDate}`, 196, 31, { align: "right" });

  // Details Section (Party Details & Meta)
  let y = 46;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 90, 40, 2, 2, "F");
  doc.roundedRect(108, y, 88, 40, 2, 2, "F");

  // Left Box: Party Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text(data.partyTitle.toUpperCase(), 18, y + 6);

  doc.setFontSize(10);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(data.party.name, 18, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(slateGrey[0], slateGrey[1], slateGrey[2]);
  let partyY = y + 17;
  if (data.party.contactPerson) {
    doc.text(`Attn: ${data.party.contactPerson}`, 18, partyY);
    partyY += 4;
  }
  if (data.party.phone || data.party.email) {
    doc.text(`${data.party.phone || ""} ${data.party.email ? `| ${data.party.email}` : ""}`, 18, partyY);
    partyY += 4;
  }
  if (data.party.address) {
    const splitAddr = doc.splitTextToSize(data.party.address, 80);
    doc.text(splitAddr, 18, partyY);
    partyY += splitAddr.length * 4;
  }
  if (data.party.gstin) {
    doc.text(`GSTIN: ${data.party.gstin}`, 18, partyY);
  }

  // Right Box: Document Metadata & Statutory Placeholders
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text("DOCUMENT DETAILS", 112, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text(`Doc Ref No: ${data.documentNumber}`, 112, y + 13);
  doc.text(`Doc Date: ${data.documentDate}`, 112, y + 18);
  if (data.dueDateOrExpiry) {
    doc.text(`Due / Valid Until: ${data.dueDateOrExpiry}`, 112, y + 23);
  }
  doc.text(`GSTIN (Supplier): 36AAAAA0000A1Z5 [PlaceHolder]`, 112, y + 28);
  doc.text(`Jurisdiction: Hyderabad, Telangana`, 112, y + 33);

  // Items Table
  y += 46;
  const showPricing = data.showPricing !== false;

  const tableHeaders = showPricing
    ? ["#", "Item Description", "Qty", "Unit", "Rate (INR)", "Amount (INR)"]
    : ["#", "Item Description", "Batch / Ref", "Qty", "Unit", "Remarks"];

  const tableRows = data.items.map((item) => {
    if (showPricing) {
      return [
        item.srNo,
        item.description,
        item.quantity,
        item.unit,
        item.unitPrice !== undefined ? Number(item.unitPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "-",
        item.lineTotal !== undefined ? Number(item.lineTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "-",
      ];
    } else {
      return [
        item.srNo,
        item.description,
        item.batchOrCas || "-",
        item.quantity,
        item.unit,
        "Verified",
      ];
    }
  });

  autoTable(doc, {
    startY: y,
    head: [tableHeaders],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: primaryBlue,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkNavy,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: showPricing
      ? {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 85 },
          2: { cellWidth: 20, halign: "right" },
          3: { cellWidth: 15, halign: "center" },
          4: { cellWidth: 25, halign: "right" },
          5: { cellWidth: 27, halign: "right" },
        }
      : {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 80 },
          2: { cellWidth: 40 },
          3: { cellWidth: 20, halign: "right" },
          4: { cellWidth: 15, halign: "center" },
          5: { cellWidth: 17, halign: "center" },
        },
  });

  // Calculate final Y after table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let finalY = (doc as any).lastAutoTable.finalY + 8;

  // Pricing Totals (if applicable)
  if (showPricing && data.grandTotal !== undefined) {
    if (finalY > 230) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(120, finalY, 76, 42, 2, 2, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(slateGrey[0], slateGrey[1], slateGrey[2]);

    doc.text("Subtotal:", 124, finalY + 7);
    doc.text(`₹${Number(data.subtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 192, finalY + 7, { align: "right" });

    doc.text(`GST (${data.taxRate || 18}%):`, 124, finalY + 14);
    doc.text(`₹${Number(data.taxAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 192, finalY + 14, { align: "right" });

    if (data.discountAmount) {
      doc.text("Discount:", 124, finalY + 21);
      doc.text(`- ₹${Number(data.discountAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 192, finalY + 21, { align: "right" });
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text("Grand Total:", 124, finalY + 28);
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.text(`₹${Number(data.grandTotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 192, finalY + 28, { align: "right" });

    if (data.paidAmount !== undefined && data.balanceAmount !== undefined) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(brandGreen[0], brandGreen[1], brandGreen[2]);
      doc.text("Amount Paid:", 124, finalY + 34);
      doc.text(`₹${Number(data.paidAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 192, finalY + 34, { align: "right" });

      doc.setFont("helvetica", "bold");
      doc.setTextColor(data.balanceAmount > 0 ? 180 : 22, data.balanceAmount > 0 ? 40 : 163, 24);
      doc.text("Balance Due:", 124, finalY + 39);
      doc.text(`₹${Number(data.balanceAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 192, finalY + 39, { align: "right" });
    }

    finalY += 46;
  }

  // Terms and Bank Details (Left side or Bottom)
  if (finalY > 240) {
    doc.addPage();
    finalY = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.text("TERMS & CONDITIONS", 14, finalY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(slateGrey[0], slateGrey[1], slateGrey[2]);
  const termsText =
    data.terms ||
    "1. Payment due as per agreed terms.\n2. Goods once sold will not be accepted without valid technical COA discrepancy report within 7 days.\n3. Subject to Hyderabad jurisdiction.";
  const splitTerms = doc.splitTextToSize(termsText, 110);
  doc.text(splitTerms, 14, finalY + 4);

  // Authorized Signatory
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
  doc.text("For MSB PHARMACHEM", 155, finalY + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("Authorized Signatory", 155, finalY + 22);

  // Footer line
  doc.setFillColor(slateGrey[0], slateGrey[1], slateGrey[2]);
  doc.rect(14, 282, 182, 0.2, "F");
  doc.setFontSize(7);
  doc.setTextColor(slateGrey[0], slateGrey[1], slateGrey[2]);
  doc.text("This is a computer-generated business document from MSB PHARMACHEM.", 14, 286);
  doc.text(`Page 1 of 1`, 196, 286, { align: "right" });

  return doc;
}
