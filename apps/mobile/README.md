# KaamSetu Mobile

Customer mobile app for the KaamSetu platform, built with Expo Router.

## Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Set `EXPO_PUBLIC_API_URL` to your KaamSetu backend URL.

3. Install dependencies and start the app:

```bash
npm install
npm start
```

## Features

- Browse service categories on Home
- Search approved professionals
- Sign in with email/password (Bearer JWT)
- View and create bookings
- Profile and notifications

## API

The app talks to the KaamSetu Next.js backend:

- `POST /api/mobile/auth/login`
- `GET /api/mobile/auth/me`
- `GET /api/mobile/search`
- `GET /api/categories`
- `GET/POST /api/bookings`
- `GET /api/bookings/:id`
- `GET /api/account`
- `GET /api/notifications`

Authenticated requests send `Authorization: Bearer <token>`.
