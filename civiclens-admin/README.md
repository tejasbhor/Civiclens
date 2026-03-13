# CivicLens Admin Dashboard

Next.js admin dashboard for the CivicLens platform. Provides administrators with report management, officer oversight, analytics, and system configuration.

## Setup

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL if backend is not on localhost:8000
npm run dev                  # http://localhost:3000
```

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts (analytics)
- shadcn/ui components

## Structure

```
src/
├── app/              Next.js app router pages
├── components/       UI components (reports, officers, modals, layout)
├── lib/              API clients, utilities, config
│   ├── api/          API service modules (reports, media, users)
│   └── utils/        Helpers (media URL handling, formatting)
├── hooks/            Custom React hooks
└── types/            TypeScript type definitions
```

## Production

Built as a standalone Next.js app in Docker. Build args inject API URLs at build time via `docker-compose.yml`.
