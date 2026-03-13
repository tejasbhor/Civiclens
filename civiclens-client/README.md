# CivicLens Citizen & Officer Web Portal

React + Vite web application for citizens to report civic issues and officers to manage assigned tasks.

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL if backend is not on localhost:8000
npm run dev            # http://localhost:5173
```

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui (Radix-based components)
- React Router
- Axios

## Structure

```
src/
├── pages/
│   ├── citizen/       Citizen portal (report submission, tracking, profile)
│   └── officer/       Officer portal (task management, work completion)
├── components/        Reusable UI components (media viewer, layout, modals)
├── services/          API client and service modules
├── hooks/             Custom React hooks (auth, connection status)
├── lib/               Utilities (media URL handling, logging)
├── contexts/          React contexts (auth)
└── App.tsx            Main app with routing
```

## Production

Built as a static SPA and served by nginx inside Docker. Build args inject API URLs at build time via `docker-compose.yml`. The `nginx.conf` handles SPA routing (all paths → `index.html`).
