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

## Launch-Ready MVP Features

- **Pro profile editing** — bio, photo, skills, pricing, availability, portfolio
- **Quote accept/decline** — customers confirm quotes from dashboard
- **Razorpay checkout** — real payment modal with signature verification (demo mode without keys)
- **Email notifications** — booking events via Resend (console log in dev without key)
- **Admin CMS** — create/manage categories and promotional banners
- **File uploads** — profile photos and portfolio images (`/public/uploads`)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | `file:./dev.db` locally, PostgreSQL URL in production |
| `AUTH_SECRET` | Yes | Random secret for NextAuth sessions |
| `AUTH_URL` | Yes | App URL (e.g. `http://localhost:3000`) |
| `RAZORPAY_KEY_ID` | For payments | Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | For payments | Razorpay dashboard |
| `RESEND_API_KEY` | For emails | [resend.com](https://resend.com) |
| `EMAIL_FROM` | For emails | Verified sender address |

## Production Deploy (Vercel + PostgreSQL)

1. Push repo to GitHub
2. Create a PostgreSQL database ([Neon](https://neon.tech) or [Supabase](https://supabase.com))
3. In `prisma/schema.prisma`, set `provider = "postgresql"`
4. Deploy to [Vercel](https://vercel.com) and set all env variables
5. Run migrations: `npx prisma db push` (or add a build script)
6. Seed production once: `npm run db:seed`

Or use Docker locally for Postgres:

```bash
docker compose up -d
# Set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kaamsetu
```

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run db:push` — Push schema to database
- `npm run db:seed` — Seed demo data
- `npm run db:studio` — Open Prisma Studio
