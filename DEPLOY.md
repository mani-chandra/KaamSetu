# Deploying KaamSetu to Production

## 1. PostgreSQL database

Create a database on [Neon](https://neon.tech), [Supabase](https://supabase.com), or run locally:

```bash
docker compose up -d
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kaamsetu
```

## 2. Switch Prisma to PostgreSQL

In `prisma/schema.prisma`, change the datasource:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Push schema and seed (run once from your machine or CI):

```bash
export DATABASE_URL="postgresql://..."
npm run db:push
npm run db:seed
```

> Switch back to `provider = "sqlite"` for local file-based dev if preferred.

## 3. Deploy on Vercel

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new)
2. Set environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random 32+ char secret |
| `AUTH_URL` | `https://your-domain.vercel.app` |
| `RAZORPAY_KEY_ID` | From Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | From Razorpay dashboard |
| `RESEND_API_KEY` | From resend.com |
| `EMAIL_FROM` | Verified sender |

3. Deploy — `vercel.json` runs `npm run vercel-build`

## 4. File uploads on Vercel

Local uploads (`/public/uploads`) are ephemeral on serverless. For production, configure Cloudinary env vars or migrate to S3/R2.

## 5. Post-deploy checklist

- [ ] Admin login works (`admin@kaamsetu.com` after seed)
- [ ] Pro registration with document upload
- [ ] Booking respects pro availability
- [ ] Razorpay test payment
- [ ] Email notifications (Resend)
- [ ] Terms & Privacy pages load at `/terms` and `/privacy`

## 6. Merge to main

```bash
gh pr create --base main --head cursor/kaamsetu-platform-blueprint
```

Review and merge when CI/build passes.
