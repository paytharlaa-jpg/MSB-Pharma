# MSB PHARMACHEM — Local Development & Setup Guide

## 1. Prerequisites
- **Node.js**: v20+ or v24+
- **Package Manager**: npm v10+
- **Operating System**: Windows / Linux / macOS

## 2. Quick Start

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default local settings use SQLite (`file:./dev.db`), which runs completely in-process with zero external service dependencies.

### Step 3: Initialize Database & Seed Master Data
```bash
# Push Prisma schema to local database
npm run prisma:push

# Run seed script to load master products from official catalog and test accounts
npm run prisma:seed
```

### Step 4: Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Pre-configured Staff Accounts (Development Seed)

| Role | Email | Password | Primary Module Access |
|---|---|---|---|
| **Super Admin** | `admin@msbpharmachem.com` | `Password@123` | Full system access, audit logs, user permissions, settings |
| **Sales** | `sales@msbpharmachem.com` | `Password@123` | Enquiries, leads, customers, quotations |
| **Accounts** | `accounts@msbpharmachem.com` | `Password@123` | Invoices, payment recording, receivables |
| **Inventory** | `inventory@msbpharmachem.com` | `Password@123` | Batches, expiry alerts, manual stock adjustments, GRN |

*All test accounts are pre-populated with bcrypt hashed passwords in the development database.*

---

## 4. Key Endpoints

- **Public Website**: `http://localhost:3000`
- **Product Catalog**: `http://localhost:3000/products`
- **About Us**: `http://localhost:3000/about`
- **Contact & RFQ Form**: `http://localhost:3000/contact`
- **Staff Login**: `http://localhost:3000/login`
- **Admin & Operations Dashboard**: `http://localhost:3000/dashboard`
- **Sitemap XML**: `http://localhost:3000/sitemap.xml`
- **Robots TXT**: `http://localhost:3000/robots.txt`
