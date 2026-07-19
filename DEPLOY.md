# Deploying KaamSetu to Production

Follow this order for a safe launch.

## Launch order

### Step 1 — Code on `main`

- Merge `cursor/kaamsetu-platform-blueprint` into `main` after review.
- Ensure the latest branch includes the registration prompt and PostgreSQL schema.

### Step 2 — PostgreSQL database

Create a database on [Neon](https://neon.tech), [Supabase](https://supabase.com), or run locally with Docker:

```bash
docker compose up -d
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kaamsetu
```

Copy the connection string for the next steps.

### Step 3 — Vercel environment variables

Import the repo at [vercel.com/new](https://vercel.com/new) and set:

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Random 32+ character secret |
| `AUTH_URL` | Yes | `https://your-domain.vercel.app` |
| `RAZORPAY_KEY_ID` | Yes (prod) | From Razorpay dashboard — demo payments are **disabled** in production without keys |
| `RAZORPAY_KEY_SECRET` | Yes (prod) | From Razorpay dashboard |
| `RESEND_API_KEY` | Recommended | Transactional email |
| `EMAIL_FROM` | Recommended | Verified sender, e.g. `KaamSetu <noreply@yourdomain.com>` |
| `CLOUDINARY_CLOUD_NAME` | Yes (prod) | Vercel filesystem is ephemeral — uploads need Cloudinary |
| `CLOUDINARY_UPLOAD_PRESET` | Yes (prod) | Unsigned upload preset |
| `MSG91_API_KEY` | Optional | SMS notifications |
| `MSG91_SENDER_ID` | Optional | SMS sender |
| `MSG91_TEMPLATE_ID` | Optional | SMS template |

### Step 4 — Database setup (run once)

From your machine with `DATABASE_URL` pointing at the **production** database:

```bash
export DATABASE_URL="postgresql://..."
npm run db:push
npm run db:seed
```

> **Security:** Change the seeded admin password immediately after first login. Demo accounts (`customer@demo.com`, `pro@demo.com`) are for testing only — disable or remove before public launch if desired.

### Step 5 — Deploy

Vercel runs `npm run vercel-build` (see `vercel.json`).

After deploy, confirm:

- [ ] Home page loads (cinematic journey + stream layout)
- [ ] Guest registration prompt appears for logged-out users
- [ ] Register / login works
- [ ] Pro registration with document upload (Cloudinary)
- [ ] Booking respects pro availability
- [ ] Razorpay test payment completes
- [ ] Email notifications (Resend)
- [ ] Terms & Privacy at `/terms` and `/privacy`
- [ ] Admin login works

### Step 6 — Merge to main & go live

```bash
gh pr create --base main --head cursor/kaamsetu-platform-blueprint
```

Review, merge, and point your custom domain in Vercel when ready.

---

## Local development (PostgreSQL)

Prisma is configured for PostgreSQL. Use Docker for a local database:

```bash
docker compose up -d
cp .env.example .env
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kaamsetu
npm run db:push
npm run db:seed
npm run dev
```

### Legacy SQLite (optional)

To use SQLite locally again, change `provider = "sqlite"` in `prisma/schema.prisma` and set `DATABASE_URL="file:./dev.db"`.

---

## File uploads on Vercel

Local uploads (`/public/uploads`) are ephemeral on serverless. Configure Cloudinary env vars before production launch.

---

## Demo accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@kaamsetu.com | admin123 |
| Customer | customer@demo.com | customer123 |
| Professional | pro@demo.com | pro123 |

Rotate these credentials before a public launch.
