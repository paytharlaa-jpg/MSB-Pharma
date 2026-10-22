# MSB PHARMACHEM — Hosting Compatibility & Architecture Assessment

## 1. Executive Summary

This unified web application and business management portal is engineered using **Next.js 15 (App Router)**, **TypeScript in strict mode**, and **Prisma ORM**.

To maintain production reliability, transactional safety, and high-performance server-side document rendering, the hosting platform must meet specific runtime prerequisites.

---

## 2. Technical Runtime Requirements

| Requirement | Specification | Compatibility Notes |
|---|---|---|
| **Node.js Runtime** | Node.js v20.x or v24.x LTS | Required for Next.js App Router and server route handlers. |
| **Relational Database** | PostgreSQL 15+ (Production) / SQLite (Dev) | Local development uses SQLite (`dev.db`). For production, managed PostgreSQL (Supabase, Neon, AWS RDS, or DigitalOcean) is recommended. |
| **Process Model** | Long-running Node.js process / Serverless Next.js container | Must support continuous execution or serverless execution with persistent database connection pooling. |
| **Environment Variables** | Secure vault or environment config | Needed for `DATABASE_URL`, `AUTH_SECRET`, and API tokens. |
| **File Storage** | Persistent local disk or S3-compatible bucket | Uploads (COAs, MSDS, batch reports) stored in `./public/uploads` or S3. |
| **SSL / HTTPS** | TLS 1.3 / Automated Let's Encrypt | Mandatory for secure staff authentication cookies (`HttpOnly; Secure`). |

---

## 3. Preserving Domain & Existing Services

- **Domain**: `msbpharmachem.com`
- **Existing Mail/MX Records**: Must **NOT** be disrupted. If the company uses existing business email (e.g. Google Workspace, Microsoft 365, or cPanel Webmail on `msbpharmachem.com`), DNS changes must be limited to the root `@` and `www` A/CNAME records.
- **Rule**: Never purchase a new domain, change nameservers, or transfer domain registration without explicit written authorization from the owner.

---

## 4. Recommended Production Deployment Paths

### Option A: Modern Node Container / VPS (Preserving existing cPanel / Host)
If existing hosting is cPanel or Linux VPS:
1. Ensure Node.js selector is enabled (v20+).
2. Set up reverse proxy (Nginx or Apache `mod_proxy`) pointing `msbpharmachem.com` to `localhost:3000`.
3. Provision managed PostgreSQL database.
4. Set `.env` and run `npm run build && npm run start`.

### Option B: Cloud Hosting (Vercel / Railway / AWS / Render)
1. Deploy Next.js repository to Vercel or Railway.
2. Connect to managed PostgreSQL database.
3. Configure DNS A record `@` and CNAME `www` pointing to the deployment without modifying MX/TXT email records.
