# KaamSetu

India's trusted platform for local services — connecting customers with verified professionals for plumbing, electrical work, cleaning, tutoring, and every service they need.

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **PostgreSQL** + Prisma ORM
- **NextAuth.js v5** (role-based auth: Customer, Professional, Admin)
- **Tailwind CSS** + shadcn/ui components
- **Razorpay** (payments — demo mode without keys)

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (optional, for PostgreSQL in production)

### Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Push schema and seed demo data (uses SQLite locally)
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

For PostgreSQL production setup, update `prisma/schema.prisma` provider to `postgresql`, set `DATABASE_URL` in `.env`, and run `docker compose up -d`.

Open [http://localhost:3000](http://localhost:3000).

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kaamsetu.com | admin123 |
| Customer | customer@demo.com | customer123 |
| Professional | pro@demo.com | pro123 |

## Features

### Customer
- Browse service categories and search with filters
- View professional profiles with reviews and badges
- Instant booking or quote-based requests
- Track bookings, pay, and leave reviews
- Save favorite professionals

### Professional
- Multi-step registration with admin approval
- Digital business card (public profile)
- Manage bookings (accept/decline, send quotes)
- View earnings and respond to reviews
- Achievement badges

### Admin
- Approve/reject professional registrations
- Manage users, bookings, categories, banners
- Platform analytics and reports

### Platform
- In-app notifications
- Razorpay payment integration (demo fallback)
- Membership plans (customer + professional)
- Multi-city support
- Recommendation engine

## Project Structure

```
src/
├── app/              # Next.js pages and API routes
├── components/       # UI and feature components
└── lib/              # Auth, Prisma, payments, notifications
prisma/
├── schema.prisma     # Full data model
└── seed.ts           # Demo data
```

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run db:push` — Push schema to database
- `npm run db:seed` — Seed demo data
- `npm run db:studio` — Open Prisma Studio
