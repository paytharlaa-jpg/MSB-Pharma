# MSB PHARMACHEM — Role-Based Access Control (RBAC) Matrix

## 1. Role Definitions

### 1.1 Super Admin (`SUPER_ADMIN`)
- **Responsibility**: System oversight, staff provisioning, legal/statutory configuration, security review.
- **Access Scope**: Full access to all modules:
  - Enquiries & Leads management
  - Product Master & Spreadsheet Bulk Import
  - Inventory, Batches & Manual Stock Adjustments
  - Customer & Supplier Master Records
  - Purchase Orders (PO) & Goods Receipt Notes (GRN)
  - Quotations, Invoices, Payments, Delivery Challans
  - Reports & CSV/Excel exports
  - Audit logs viewer
  - System Settings & Integrations

### 1.2 Sales (`SALES`)
- **Responsibility**: Inbound enquiry qualification, customer communication, quotation drafting.
- **Access Scope**:
  - Enquiries & Leads (assign, update status, add follow-up notes, WhatsApp link)
  - Customer records (view & create)
  - Product catalog (view approved specifications)
  - Stock availability (view current batch balances)
  - Quotations (draft, finalize, and download PDFs)
  - Reports (enquiries & quotations exports)
  - *Restricted*: Cannot view supplier purchase pricing, cannot adjust stock, cannot record invoice payments.

### 1.3 Accounts (`ACCOUNTS`)
- **Responsibility**: Invoicing, payment recording, receivables tracking, financial reporting.
- **Access Scope**:
  - Invoices (issue, view, download PDF)
  - Payment tracking (record payments with UTR, update balance)
  - Quotations & Purchase Orders (view)
  - Customers & Suppliers (view)
  - Reports (financial & outstanding balances export)
  - *Restricted*: Cannot alter system permissions, cannot adjust warehouse stock.

### 1.4 Inventory (`INVENTORY`)
- **Responsibility**: Physical stock ledger, batch tracking, expiry monitoring, receiving and dispatch.
- **Access Scope**:
  - Products & Batches (view)
  - Manual Stock Adjustments (Opening balance, Increase, Decrease, Reconciliation with mandatory reason)
  - Purchase Orders (view)
  - Goods Receipt Notes (GRN - record material inspection, batch, expiry, store location)
  - Delivery Challans (create dispatch notes, vehicle records, download PDF)
  - *Restricted*: Cannot issue customer invoices or record payment receipts.

---

## 2. Server-Side Enforcement

All permissions are strictly enforced on the server in `/src/lib/permissions.ts` and in every API route handler. Client-side hiding of buttons is only an ergonomic layer; unauthorized API requests are rejected with `401 Unauthorized` or `403 Forbidden`.
