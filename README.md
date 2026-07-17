# KaamSetu

India's trusted platform for local services — connecting customers with verified professionals for plumbing, electrical work, cleaning, tutoring, and every service they need.

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **SQLite** (local dev) / **PostgreSQL** (production) + Prisma ORM
- **NextAuth.js v5** (role-based auth: Customer, Professional, Admin)
- **Tailwind CSS** + shadcn/ui components
- **Razorpay** (payments — real checkout when keys are set)
- **Resend** (email notifications when API key is set)

## Getting Started

### Prerequisites

- Node.js 18+

### Local setup

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kaamsetu.com | admin123 |
| Customer | customer@demo.com | customer123 |
| Professional | pro@demo.com | pro123 |

## Production Deploy (Vercel + PostgreSQL)

See **[DEPLOY.md](./DEPLOY.md)** for the full step-by-step guide.

Quick summary:

1. Create PostgreSQL (Neon/Supabase/Docker)
2. Set `provider = "postgresql"` in `prisma/schema.prisma`
3. Run `npm run db:push && npm run db:seed`
4. Deploy to Vercel with env vars (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, etc.)
5. Merge PR to `main`

## Launch-Ready MVP Features

- **Pro profile editing** — bio, photo, skills, pricing, availability, portfolio
- **Pro registration** — document upload for verification, terms acceptance
- **Booking availability check** — bookings validated against pro working hours
- **Terms & Privacy** — `/terms` and `/privacy` pages
- **Quote accept/decline** — customers confirm quotes from dashboard
- **Razorpay checkout** — real payment modal with signature verification (demo mode without keys)
- **Email notifications** — booking events via Resend (console log in dev without key)
- **Admin CMS** — categories, banners, and pro option lists (skills, areas, languages)
- **File uploads** — profile photos, portfolio, and registration documents

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run db:push` — Push schema to database
- `npm run db:seed` — Seed demo data
- `npm run db:studio` — Open Prisma Studio
