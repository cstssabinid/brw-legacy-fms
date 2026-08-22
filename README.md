# BRW LEGACY CO. Ltd Financial Management System

Full-stack financial management system for **BRW LEGACY CO. Ltd** and the public **Berwa Photo Hub** photography brand.

## Features

- Public Berwa Photo Hub landing page with services, packages, gallery, contact links, WhatsApp buttons and booking form.
- Worker portal for assigned bookings, income, allowed expenses, own transactions, reports and Berwa Assistant help.
- Admin portal for dashboard analytics, transactions, bookings, reports, month closing, cash count, loans, budget, services, packages, blog, gallery, users, settings, audit logs and imports.
- Prisma schema covering users, roles, services, packages, clients, bookings, transactions, categories, accounts, periods, reports, cash count, loans, budgets, blog, gallery, chat, audit logs, attachments, notifications and settings.
- Role-protected admin and worker routes with NextAuth credentials login.
- Zod validation for bookings and transactions.
- Month closing rule: pending records block closing, counted balances are compared with expected closing balance, a difference requires a reason, audit logs are saved, and the new month opens with previous counted closing balance.
- Rule-based Berwa Assistant with public, worker and admin permission boundaries.
- CSV report export and CSV import preview for old monthly reports.
- Responsive UI with dark/light mode, dashboard charts and mobile-friendly navigation.

## Tech Stack

Next.js App Router, TypeScript, Tailwind CSS, Prisma, PostgreSQL, NextAuth, Zod, Recharts, Framer Motion-ready structure, Sonner toasts, PapaParse import preview and PWA manifest.

## Installation

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run db:push
npm run prisma:seed
npm run dev
```

Open `http://localhost:3000`.

Do not run `npm audit fix --force` on this project. It can downgrade Next.js and NextAuth to old incompatible major versions. If that happens, run `npm install` after restoring `next` to `^15.3.4` and `next-auth` to `^4.24.14`.

## Environment Variables

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/brw_legacy_fms?schema=public"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
UPLOAD_PROVIDER="local"
AI_API_KEY="optional_for_future_berwa_bot"
RUN_DATABASE_BOOTSTRAP="false"
SEED_ADMIN_EMAIL="admin@brwlegacy.rw"
SEED_ADMIN_PASSWORD="use-a-password-manager-generated-value"
SEED_WORKER_EMAIL="worker@brwlegacy.rw"
SEED_WORKER_PASSWORD="use-a-different-password-manager-generated-value"
```

`SEED_ADMIN_PASSWORD` is required whenever the seed runs. It must contain at least 16 characters, including uppercase, lowercase, number and symbol characters. `SEED_WORKER_PASSWORD` is optional; omit it to skip creating the worker account. Never commit real values.

## Local Seed Accounts

- Administrator email defaults to `admin@brwlegacy.rw`.
- Worker email defaults to `worker@brwlegacy.rw` when `SEED_WORKER_PASSWORD` is supplied.
- Passwords come only from the private seed environment variables above. There are no source-controlled default passwords.

## Database

Create a PostgreSQL database, set `DATABASE_URL`, then run:

```bash
npm run db:push
npm run prisma:seed
```

If `npm run db:push` shows `P1001: Can't reach database server at localhost:5432`, PostgreSQL is not running or `DATABASE_URL` points to the wrong host, port, database, user or password.

For production migrations:

```bash
npx prisma migrate deploy
```

### One-time Vercel/Neon bootstrap

For a new empty Neon database connected through Vercel:

1. Add `RUN_DATABASE_BOOTSTRAP=true` to the Production environment.
2. Add `SEED_ADMIN_PASSWORD` as a sensitive Production variable using a password-manager-generated value.
3. Optionally add a different sensitive `SEED_WORKER_PASSWORD` to create the initial worker.
4. Redeploy Production. Every Vercel build applies committed Prisma migrations; this one-time flag also adds the idempotent BRW seed data before building the app.
5. After the deployment is Ready and database routes are verified, remove `RUN_DATABASE_BOOTSTRAP`, `SEED_ADMIN_PASSWORD`, and `SEED_WORKER_PASSWORD`, then redeploy once more.

The migration history contains a complete baseline for a fresh PostgreSQL database. Future schema changes should be created with `prisma migrate dev` during development. Both `build` and `vercel-build` use the migration-aware build script, which automatically runs `prisma migrate deploy` in Vercel environments and explicitly verifies the required `CASHIER` enum value before building. Local builds skip database migration unless `RUN_DATABASE_BOOTSTRAP=true` is explicitly set.

## Brand Assets

Place real files here:

- `public/brand/logo.png`
- `public/brand/services-flyer.png`
- `public/brand/wedding-price-list.jpeg`
- `public/gallery/`

Placeholder SVGs are already included so the public pages render immediately.

## Importing Old Reports

Go to `/admin/import`, upload a CSV, preview rows, then map columns for date, item, service, amount and comments before saving. The current implementation includes preview and model support; production import saving should extend `/api/transactions` with duplicate fingerprints.

## Month Closing

Admin opens `/admin/month-closing`, enters cash, MoMo, bank, cheque and other balances, then confirms. The system calculates:

```text
Expected Closing Balance = Opening Balance + Confirmed Income - Confirmed Expenses + Adjustments
Difference = Total Counted Balance - Expected Closing Balance
```

If there is a difference, a reason is required. Closed months cannot be edited by workers.

## Deployment

Set environment variables on your host, provision PostgreSQL, run Prisma migrations, seed initial data if needed, then deploy with:

```bash
npm run build
npm run start
```
