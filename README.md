# MSB PHARMACHEM — Unified Website & Business Management Platform

Production-ready web application and internal business management platform for **MSB PHARMACHEM**, a premier pharmaceutical raw materials and chemical trading business based in Kukatpally, Hyderabad, India.

---

## 1. Project Overview

This unified system connects two essential parts under a single codebase and database:

1. **Internal Business Management Application (Primary Priority)**
   - Secure staff authentication with role-based permissions (Super Admin, Sales, Accounts, Inventory).
   - Commercial enquiry and lead management with status workflow, follow-up timeline, and WhatsApp integration.
   - Master records for products, customers, and vetted suppliers.
   - Batch-aware inventory register with **strict manual stock update policy** and expiry alerts (< 90 days).
   - Purchase Orders (PO) and Goods Receipt Notes (GRN) with non-mutating stock safety rules.
   - Formal Quotations with dynamic item pricing and branded PDF generation.
   - Tax Invoices with decimal-safe payment tracking (Unpaid, Partially Paid, Paid) and UTR logs.
   - Delivery Challans for transporter dispatch and logistics acknowledgement.
   - Date-filtered operational reporting with CSV and Excel exports protected against spreadsheet formula injection.
   - Complete immutable audit logging for security and compliance.

2. **Public-Facing Website (Secondary Priority)**
   - Cinematic homepage featuring scientific molecular visuals and verified brand positioning.
   - Company profile page based directly on the verified official company document.
   - Searchable, categorized product catalogue featuring master APIs, intermediates, and CAS numbers.
   - Logistics and facility gallery showcasing air freight and quality testing capabilities.
   - Technical industry blog with pre-seeded editorial articles.
   - Interactive Request for Quotation (RFQ) and contact form with immediate WhatsApp click-to-chat.
   - Complete SEO foundations, XML sitemap (`/sitemap.xml`), and robots configuration (`/robots.txt`).

---

## 2. Verified Business Identity

- **Brand Name**: MSB PHARMACHEM
- **Domain**: `msbpharmachem.com`
- **Tagline**: Quality • Reliability • Trust
- **Location**: Plot No. 128, Kamala Prasanna Nagar, Allwyn Colony, Kukatpally, Hyderabad – 500072, Telangana, India
- **Confirmed Business Phone**: `+91 8008335333`
- **Confirmed Business Email**: `mohank9@gmail.com`

---

## 3. Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS with custom brand design tokens
- **Database**: SQLite (Local Zero-Dependency Dev) / PostgreSQL (Production)
- **ORM**: Prisma 6
- **Icons**: Lucide React
- **Documents & PDF**: jsPDF & jsPDF-AutoTable
- **Spreadsheet & Data Export**: SheetJS (XLSX)
- **Security & Authentication**: Bcrypt.js & JSON Web Tokens (JWT) in secure HttpOnly cookies

---

## 4. Quick Start & Setup

### Install Dependencies
```bash
npm install
```

### Configure Environment
```bash
cp .env.example .env
```

### Initialize Database & Master Data Seed
```bash
npm run prisma:push
npm run prisma:seed
```

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the public site, or [http://localhost:3000/login](http://localhost:3000/login) for the staff portal.

---

## 5. Pre-configured Staff Accounts

| Role | Email | Password | Scope |
|---|---|---|---|
| **Super Admin** | `admin@msbpharmachem.com` | `Password@123` | Full system access, audit logs, user management, settings |
| **Sales** | `sales@msbpharmachem.com` | `Password@123` | Leads, enquiries, customers, quotations |
| **Accounts** | `accounts@msbpharmachem.com` | `Password@123` | Invoices, payments, financial reports |
| **Inventory** | `inventory@msbpharmachem.com` | `Password@123` | Batches, expiry alerts, manual stock updates, GRN, challans |

---

## 6. Architecture & Documentation Directory

- [`docs/setup.md`](./docs/setup.md): Local installation and execution guide.
- [`docs/hosting-compatibility.md`](./docs/hosting-compatibility.md): Hosting prerequisites, Node.js runtime, and domain preservation.
- [`docs/user-roles.md`](./docs/user-roles.md): RBAC permissions matrix.
- [`docs/database-backup-restore.md`](./docs/database-backup-restore.md): Backup schedule and disaster recovery steps.
- [`docs/document-templates.md`](./docs/document-templates.md): Document numbering patterns and PDF design specifications.
- [`docs/product-import.md`](./docs/product-import.md): Spreadsheet bulk import guide.
- [`docs/asset-manifest.md`](./docs/asset-manifest.md): Manifest of user-supplied and generated visual assets.
