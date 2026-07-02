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
```

## Local Test Accounts

- Admin: `admin@brwlegacy.rw` / `Admin@12345`
- Worker: `worker@brwlegacy.rw` / `Worker@12345`

## Database

Create a PostgreSQL database, set `DATABASE_URL`, then run:

```bash
npm run db:push
npm run prisma:seed
```

If `npm run db:push` shows `P1001: Can't reach database server at localhost:5432`, PostgreSQL is not running or `DATABASE_URL` points to the wrong host, port, database, user or password.

For production migrations:

```bash
npx prisma migrate dev --name initial
```

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
