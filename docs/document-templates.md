# MSB PHARMACHEM — Document Templates & Numbering Convention

## 1. Document Numbering Pattern

Document numbers are dynamically generated per Indian Financial Year (FY: April 1 to March 31):

`MSB/{DOCUMENT_TYPE}/{FINANCIAL_YEAR}/{SEQUENCE}`

### Document Type Identifiers:
- `ENQ`: Commercial Enquiry / Request for Quotation (e.g. `MSB/ENQ/26-27/001`)
- `PO`: Purchase Order to Approved Vendor (e.g. `MSB/PO/26-27/001`)
- `GRN`: Goods Receipt Note for Warehouse Inward (e.g. `MSB/GRN/26-27/001`)
- `QTN`: Formal Commercial Quotation to Buyer (e.g. `MSB/QTN/26-27/001`)
- `INV`: Commercial Tax Invoice (e.g. `MSB/INV/26-27/001`)
- `DC`: Delivery Challan for Logistics Dispatch (e.g. `MSB/DC/26-27/001`)

## 2. Concurrency Safety
The document sequence generator executes within a Prisma transaction (`$transaction`) with row locking, preventing duplicate numbers under simultaneous staff requests.

## 3. PDF Layout Structure
Generated PDFs use `jspdf` and `jspdf-autotable`:
1. **Header**: Deep Navy (`#0B1F33`) header banner with vibrant emerald green accent line (`#16A34A`).
2. **Branding**: Full company title, address in Kukatpally, phone, email, and website.
3. **Party Box**: Consignee or Supplier details including GSTIN, PAN, and contact person.
4. **Metadata Box**: Document number, issue date, due/validity date, and place of supply.
5. **Table**: Striped rows with bold headers, right-aligned monetary values, and explicit units.
6. **Financial Summary**: Subtotal, GST (18%), discount, grand total, paid amount, and balance due.
7. **Statutory Footer**: Standard terms and conditions, authorized signatory, and computer-generated document declaration.
