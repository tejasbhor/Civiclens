# CivicLens

**A full-stack civic issue management platform connecting citizens, field officers, and administrators.**

CivicLens bridges the gap between residents and their municipal governments. Citizens file infrastructure complaints — potholes, broken streetlights, water leaks, drainage failures — directly from a mobile app or web portal. An on-device AI engine classifies each report, routes it to the correct municipal department, and assigns it to a field officer. The entire lifecycle from submission to resolution is fully tracked, audited, and visualized on an administrator dashboard.

Built as a production-grade monorepo spanning a FastAPI backend, a React + Vite citizen portal, a Next.js admin dashboard, and a React Native mobile application.

---

## Live Demo

The platform is deployed on **Oracle Cloud Infrastructure (OCI ARM64)** with auto-provisioned TLS via Caddy:

| Surface | URL |
|---|---|
| Citizen Portal | [https://civiclens.space](https://civiclens.space) |
| Admin Dashboard | [https://admin.civiclens.space](https://admin.civiclens.space) |
| REST API (Swagger) | [https://api.civiclens.space/docs](https://api.civiclens.space/docs) |

> **Demo OTP:** Set `ENABLE_DEMO_OTP=true` on the server to display the OTP inline for presentation purposes. In production this is always `false`.

---

## Mobile App

**One APK, two roles.** CivicLens ships as a single Android application that serves both citizens and field officers in the same binary. On first launch the user selects their role — the entire navigation structure, UI, and feature set branch from that single selection. A citizen sees a reporting-focused home screen and personal report history; an officer sees an interactive task map, their assigned workflow queue, and an analytics dashboard. Both roles share the same biometric lock, push notification system, and offline-first data layer.

### Download

| Build | Platform | Download |
|---|---|---|
| Preview (latest) | Android | [**Download APK**](https://expo.dev/accounts/tejas.dev/projects/civiclens-mobile/builds/e9fd74ca-7303-480e-af32-52c7df458c92) |

> Once the EAS build finishes, visit the link above and click **Download build artifact** to get the `.apk`. The app connects directly to the production API at `https://api.civiclens.space` — no local backend needed.

### Install Instructions (Android Sideload)

1. **Download** the `.apk` from the link above.
2. On your Android device, go to **Settings → Apps → Special App Access → Install Unknown Apps**.
3. Grant install permission to your browser or file manager.
4. Open the downloaded `.apk` and tap **Install**.
5. Launch **CivicLens** from the app drawer.
6. Select your role — **Citizen** or **Officer** — then register or sign in.

> The app is not Play Store-signed for this preview build. Android will show an "Install anyway" prompt — this is expected.

### Citizen Features

| Feature | Details |
|---|---|
| **Report Submission** | Submit issues with title, description, category, severity, up to 5 photos, and auto-detected GPS location |
| **Offline-First Queue** | Reports saved locally when offline and auto-synced transparently when connectivity returns |
| **AI Auto-Classification** | Category, subcategory, and responsible department suggested automatically on submission |
| **Status Timeline** | Full history of every transition from Received through Resolved |
| **Push Notifications** | Real-time alerts at each lifecycle stage — assignment, progress updates, resolution |
| **Appeals** | Dispute a rejected or closed report with a formal appeal directly from the app |
| **Feedback & Rating** | Rate the resolution and provide officer feedback after a report is closed |
| **Interactive Map** | Native map view showing all submitted reports in the user's area |
| **Biometric Lock** | Fingerprint / Face ID lock screen protecting the citizen session |

### Officer Features

| Feature | Details |
|---|---|
| **Task Dashboard + Map** | All assigned tasks overlaid on an interactive map with status markers |
| **Offline Task Actions** | Acknowledge, Start Work, and Add Update are queued locally and synced when back online |
| **Acknowledge Task** | Record receipt of assignment; citizen is notified immediately |
| **Start Work** | Mark work as in-progress; starts the SLA timer |
| **Submit Verification** | Upload before/after photo evidence, work duration, materials used, and completion notes |
| **Progress Updates** | Add mid-task notes that are visible to citizens and admins in the timeline |
| **Reject / Hold** | Reject an inappropriate assignment or place complex tasks on administrative hold |
| **Analytics Dashboard** | Personal performance metrics, task breakdown by status, and category distribution |
| **Biometric Lock** | Same fingerprint / Face ID protection, configured from the officer profile screen |
| **OTP Login** | Officer accounts require a two-factor email OTP for sign-in |

### Building from Source

```bash
cd civiclens-mobile
npm install
cp .env.example .env
# Set EXPO_PUBLIC_API_BASE_URL to your machine's local IP for dev
# (the phone needs LAN reachability, not "localhost")

# Run on device / emulator with live reload
npx expo start --clear

# Build a sideloadable preview APK via EAS cloud
eas build --profile preview --platform android

# Build a production AAB for the Google Play Store
eas build --profile production --platform android
```

Production API URLs, keystore credentials, and feature flags are managed through `eas.json` and EAS Secrets — nothing sensitive lives on the local machine or in version control.

---

## Repository Structure

```
civiclens-backend/        FastAPI service, AI classification engine, async ORM, migrations
civiclens-client/         Citizen & officer web portal (React 18 + Vite + shadcn/ui)
civiclens-admin/          Admin dashboard (Next.js 14 + Tailwind + Recharts)
civiclens-mobile/         Cross-platform mobile app (React Native / Expo SDK 54)
docs/                     Architecture, database schema, deployment & security guides
scripts/                  Server bootstrap, CI deploy, automated backup scripts
docker-compose.yml        Production orchestration (7 services)
Caddyfile                 Reverse proxy configuration with auto-HTTPS
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.11, FastAPI, SQLAlchemy 2.0 (async), Alembic |
| **Database** | PostgreSQL 15 + PostGIS extension |
| **Cache** | Redis 7 |
| **Object Storage** | MinIO (S3-compatible, self-hosted) |
| **AI / ML** | scikit-learn, pandas — multi-label issue classifier |
| **Admin Dashboard** | Next.js 14, Tailwind CSS, Recharts |
| **Citizen Portal** | React 18 (Vite), Tailwind CSS, shadcn/ui, React Query |
| **Mobile App** | React Native (Expo SDK 54), SQLite (expo-sqlite), Zustand |
| **Reverse Proxy** | Caddy 2 (automatic HTTPS via Let's Encrypt) |
| **CI/CD** | GitHub Actions — builds ARM64 Docker images, deploys via SSH |
| **Hosting** | Oracle Cloud Infrastructure VM.Standard.A1.Flex (Always Free) |

---

## Architecture

```
                            Internet
                               │
┌──────────────────────────────┴──────────────────────────────┐
│                           Caddy 2                           │
│           (auto-HTTPS · rate limiting · routing)            │
└──────┬───────────────────────┬──────────────────────┬───────┘
       │                       │                      │
 civiclens.space       admin.civiclens.space   api.civiclens.space
       │                       │                      │
 ┌─────┴──────┐         ┌──────┴──────┐       ┌──────┴──────┐
 │  Client    │         │    Admin    │       │   Backend   │
 │  (nginx)   │         │   (node)    │       │  (uvicorn)  │
 └────────────┘         └─────────────┘       └──────┬──────┘
                                                      │
                      ┌───────────┬──────────┬────────┴───────┐
                      │           │          │                │
                  PostgreSQL    Redis      MinIO          AI Engine
                  (PostGIS)   (cache)   (media/S3)   (sklearn model)
```

MinIO is not publicly exposed. Media files are proxied through Caddy at `api.civiclens.space/civiclens-media/*`.

---

## Key Features

### Citizen Application
- **Report Submission** — Submit civic issues with structured form, multi-photo upload (up to 5 images with automatic compression), GPS location auto-detection, and optional landmark annotation.
- **Offline-First Architecture** — Reports created without internet connectivity are persisted to a local SQLite database and uploaded transparently when connectivity returns, including compressed media. A background submission queue handles exponential-backoff retries.
- **Real-Time Tracking** — Citizens follow a full status timeline: Received → Classified → Assigned → In Progress → Pending Verification → Resolved.
- **Push Notifications** — Automated notifications at each lifecycle transition using Expo Push Notification infrastructure.
- **Biometric Authentication** — Local fingerprint / Face ID lock screen (via `expo-local-authentication`) protecting the citizen portal session.
- **Appeals System** — Citizens can file a formal appeal against rejected or inappropriately closed reports.
- **Feedback & Rating** — Post-resolution satisfaction rating and officer feedback submission.
- **Interactive Map** — Native MapView displaying all submitted reports in the user's vicinity.

### Officer Portal (Mobile + Web)
- **Task Dashboard** — Officers see exclusively their assigned reports with severity, SLA deadline, and status indicators.
- **Workflow Actions** — Acknowledge → Start Work → Submit Verification. Each action updates the citizen-facing status in real time.
- **Submit Verification Screen** — Officers upload before/after photographic evidence, a work completion summary, materials used, and time spent. Evidence is uploaded sequentially to avoid race conditions.
- **Offline Task Actions** — Acknowledge, Start Work, and Add Update are queued locally in SQLite and synced through the `SyncManager` when connectivity is restored. The sync queue is strictly scoped to the logged-in officer's ID to prevent cross-user data bleed.
- **Analytics Dashboard** — Performance metrics, task breakdown by status, category distribution, and SLA compliance visualized with custom chart components.
- **Biometric Session Lock** — Officers can enable biometric protection from their profile screen, securing access to the entire officer portal.
- **Officer Login with OTP** — Two-factor authentication (email OTP) for officer accounts, with full validation and resend capability.

### Admin Dashboard
- **System-Wide Analytics** — Report volume trends, category heat maps, department performance, SLA compliance rates, and officer workload distribution.
- **Department Management** — CRUD interface for municipal departments, with report-routing configuration.
- **User Management** — Role assignment (Citizen, Nodal Officer, Admin, Auditor), account moderation, and activity logs.
- **AI Insights** — Cluster analysis of report patterns, geographic hotspot detection, and automated re-classification suggestions.
- **Hold Approvals** — Officers can place high-complexity tasks on hold pending administrative approval.
- **Escalations & Audit Log** — Full immutable audit trail of every status change, assignment, and action across the system.

### Backend API
- **61 REST Endpoints** — Versioned at `/api/v1`, covering auth, users, reports, tasks, departments, media, notifications, analytics, AI insights, appeals, feedback, escalations, hold approvals, sync, and audit.
- **AI Classification Pipeline** — A scikit-learn multi-label classifier trained on civic complaints automatically assigns category, subcategory, and suggested department on report ingestion.
- **Async I/O** — All database interactions are fully async via SQLAlchemy 2.0 + asyncpg, enabling high concurrency without blocking.
- **Geographic Queries** — PostGIS extension powers proximity lookups, ward detection, and geo-clustering.
- **Background Workers** — Celery-compatible worker architecture for deferred tasks (image processing, notification dispatch, AI re-classification).
- **Security** — JWT authentication with refresh tokens, bcrypt password hashing, role-based access control enforced at the route level, input sanitization, and configurable rate limiting via Caddy.

---

## Local Development Setup

### Prerequisites

- Python 3.11+ with [uv](https://docs.astral.sh/uv/) (replaces pip/virtualenv)
- Node.js 18+ with npm
- PostgreSQL 14+ with the PostGIS extension enabled
- Docker (for Redis and MinIO)

### Step 1 — Infrastructure (Redis + MinIO)

```bash
# Option A: Docker one-liners
docker run -d --name redis -p 6379:6379 redis:7-alpine

docker run -d --name minio -p 9000:9000 -p 9090:9090 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9090"

# Option B: PowerShell helper (starts everything in one shot)
.\START-ALL.ps1
```

### Step 2 — Backend

```bash
cd civiclens-backend

# Install all Python dependencies into an isolated virtual environment
uv sync

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL to point to your local PostgreSQL instance

# Start development server
# Auto-initializes PostGIS, runs Alembic migrations, starts uvicorn with reload
uv run dev
```

- Interactive API docs: [http://localhost:8000/docs](http://localhost:8000/docs)
- OpenAPI schema: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

**Seed the database with demo data:**

```bash
uv run python scripts/seed_all.py
```

**Full clean reset on a fresh machine:**

```bash
rm -rf .venv          # remove existing environment
uv sync               # recreate environment and install dependencies
uv run dev            # server auto-detects empty DB, runs PostGIS setup & migrations
uv run python scripts/seed_all.py
```

### Step 3 — Admin Dashboard

```bash
cd civiclens-admin
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL if needed
npm run dev                   # http://localhost:3000
```

### Step 4 — Citizen & Officer Web Portal

```bash
cd civiclens-client
npm install
cp .env.example .env          # set VITE_API_URL if needed
npm run dev                   # http://localhost:5173
```

### Step 5 — Mobile App

```bash
cd civiclens-mobile
npm install
cp .env.example .env
# Set EXPO_PUBLIC_API_BASE_URL to your machine's LAN IP (e.g. http://192.168.1.x:8000/api/v1)
# The phone cannot reach "localhost" — it needs the actual network IP.

npx expo start --clear        # development build with Metro bundler
```

Scan the QR code with the **Expo Go** app (development) or a custom EAS development build. Use your machine's local IP address, not `localhost`, since the phone communicates over the LAN.

---

## Production Deployment

The full production stack runs on a single **OCI ARM64 instance** (VM.Standard.A1.Flex, 4 OCPU / 24 GB RAM) orchestrated with Docker Compose.

For a complete walk-through of the OCI-specific configuration, see [docs/OCI_PRODUCTION_SETUP.md](docs/OCI_PRODUCTION_SETUP.md).

### Key Infrastructure Files

| File | Purpose |
|---|---|
| `docker-compose.yml` | Defines all 7 production services with health checks, restart policies, and shared named volumes |
| `Caddyfile` | Reverse proxy routing, automatic TLS, media file proxying |
| `.env.production.example` | Template for production secrets — never commit the real `.env` |
| `scripts/init-server.sh` | One-time server bootstrap: installs Docker, sets up swap, configures UFW firewall |
| `scripts/deploy.sh` | Deployment script: pulls latest images, recreates containers, runs DB migrations |
| `scripts/backup.sh` | Automated PostgreSQL dump + Redis RDB backup (designed for cron) |
| `.github/workflows/deploy.yml` | CI/CD pipeline: lint → test → build multi-arch images → SSH deploy |

### Deployment Procedure

```bash
# 1. Provision an OCI ARM64 instance (Always Free tier works)
# 2. Point DNS A records for all three sub-domains to the server's public IP
#    civiclens.space → <server-ip>
#    admin.civiclens.space → <server-ip>
#    api.civiclens.space → <server-ip>

# 3. SSH in and bootstrap the server
bash scripts/init-server.sh

# 4. Create the production environment file
cp .env.production.example .env
# Fill in: database credentials, JWT secret, MinIO secret, SMTP settings, OTP key

# 5. Configure GitHub repository secrets:
#    OCI_HOST  — server public IP or hostname
#    OCI_USER  — SSH username (typically "ubuntu" or "opc")
#    OCI_SSH_KEY — private key content (no passphrase)

# 6. Push to main branch — CI/CD handles the rest automatically
git push origin main
```

### Mobile App Distribution

```bash
cd civiclens-mobile

# Internal testing APK (sideloadable)
eas build --profile preview --platform android

# Production AAB for the Google Play Store
eas build --profile production --platform android
```

Production API URLs are injected at build time via `eas.json`, so the APK always points to the live backend regardless of developer machine configuration.

---

## Environment Variables

| File | Scope | Notes |
|---|---|---|
| `civiclens-backend/.env.example` | Backend dev | PostgreSQL, Redis, MinIO, JWT, SMTP, AI model |
| `.env.production.example` | Production | Same keys, real domains, strong secrets |
| `civiclens-mobile/.env.example` | Mobile dev | Expo dev server IP, feature flags |
| `civiclens-mobile/eas.json` | Mobile builds | Production API URL embedded in binary |
| `civiclens-client/.env.example` | Web client dev | Vite `VITE_API_URL` override |
| `civiclens-admin/.env.example` | Admin dev | Next.js `NEXT_PUBLIC_API_URL` override |

---

## Mobile App Architecture

The mobile application follows a strict **offline-first** design pattern:

```
civiclens-mobile/src/
├── features/
│   ├── auth/                 Role selection, citizen login, officer OTP login
│   ├── citizen/              Home, new report wizard, my reports, report detail,
│   │                         profile, edit profile, notifications
│   └── officer/              Dashboard + map, task list, task detail,
│                             submit verification, analytics, profile, notifications
└── shared/
    ├── components/           TopNavbar, NativeMap, BiometricSettings, SyncStatusIndicator,
    │                         OfflineIndicator, ImageGallery, RoleGuard, ...
    ├── database/             SQLite schema, migrations, typed query helpers
    ├── hooks/                useOfficerTasks, useCompleteReportSubmission,
    │                         useOfficerAnalytics, useNetwork, useBiometric, ...
    ├── services/
    │   ├── api/              apiClient (axios), offlineFirstApi (cache-first wrapper)
    │   ├── sync/             SyncManager — processes sync_queue for offline actions
    │   ├── queue/            SubmissionQueue — offline report queuing with retry
    │   ├── biometric/        LocalAuthentication integration
    │   ├── cache/            CacheService wrapping AsyncStorage
    │   └── network/          NetworkService with reachability detection
    ├── store/                Zustand stores: authStore, reportStore
    └── theme/                Color tokens, typography, spacing constants
```

**Offline-first data flow:**

1. On report submission, data is immediately saved to SQLite and an entry added to the `submission_queue`.
2. The `SubmissionQueue` service processes pending items using exponential backoff, scoped to the currently authenticated user.
3. On officer action (acknowledge, start work, add update), if offline, the action is serialized into the `sync_queue` SQLite table.
4. When connectivity is restored (detected via `NetInfo`), the `SyncManager` replays queued operations against the live API.
5. All sync operations are strictly filtered by the logged-in user's ID to prevent cross-account data bleed.

---

## Data Model Overview

The core entity relationships:

```
User (role: citizen | nodal_officer | admin | auditor)
 └── Report (category, severity, status, location[PostGIS])
      ├── Media (photos, officer before/after proofs)
      ├── Task (assigned_to: officer, SLA deadline, checklist)
      │    └── SyncQueue (offline officer actions pending upload)
      ├── StatusHistory (immutable audit trail)
      ├── Appeal (citizen dispute against closure)
      ├── Feedback (post-resolution rating)
      └── Escalation (supervisory flag)

Department (maps to report categories)
 └── User (officers belong to departments)

Notification (push + in-app, polymorphic recipient)
HoldApproval (officer pause-work request → admin review)
AIInsight (cluster analysis, hotspot, re-classification suggestions)
```

Full schema documentation: [docs/DATABASE_SCHEMA_SUMMARY.md](docs/DATABASE_SCHEMA_SUMMARY.md)

---

## Documentation

| Document | Description |
|---|---|
| [Database Schema](docs/DATABASE_SCHEMA_SUMMARY.md) | Full entity model with column types and relationships |
| [Database Setup](docs/SETUP_DATABASE.md) | PostgreSQL + PostGIS local setup guide |
| [OCI Production Setup](docs/OCI_PRODUCTION_SETUP.md) | Oracle Cloud deployment step-by-step |
| [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) | Generic cloud deployment reference |
| [Security Guide](docs/SECURITY_TESTING_GUIDE.md) | Auth model, RBAC, rate limiting, input validation |
| [AI Pipeline Setup](docs/AI_SETUP_STEPS.md) | Training and deploying the issue classifier |

---

## Development Notes

### Running Tests

```bash
# Backend
cd civiclens-backend
uv run pytest app/tests/ -v

# Mobile (TypeScript type checking)
cd civiclens-mobile
npx tsc --noEmit
```

### Code Quality

```bash
# Backend — Ruff linting + formatting
uv run ruff check .
uv run ruff format .

# Mobile — ESLint
npx eslint src/
```

### Database Migrations

```bash
cd civiclens-backend

# Generate a new migration after model changes
uv run alembic revision --autogenerate -m "description"

# Apply pending migrations
uv run alembic upgrade head

# Roll back one step
uv run alembic downgrade -1
```

---

## Reflections & Learnings

This project was an end-to-end exercise in building a complex production system from scratch — navigating the real tensions between architectural idealism and practical delivery.

A few things that stood out across the journey:

**Offline-first is non-trivial.** Designing a mobile app that works seamlessly without internet —  queuing submissions, replaying actions, resolving conflicts, keeping the UI consistently correct across online/offline transitions — required thinking about data at multiple layers simultaneously (SQLite, Zustand memory, remote API, sync queue). The complexity compounds quickly.

**The stack choices held up well.** FastAPI's async-first design paired with SQLAlchemy 2.0 and asyncpg made the backend genuinely fast and ergonomic. Expo simplified a great deal of the cross-platform friction. Caddy eliminated the TLS headache entirely.

**Feature scope vs. quality is a constant trade-off.** Building a real-world platform means every feature has edge cases: What happens if report upload partially fails? What if an officer's session resumes mid-sync? What if two officers are assigned the same report? Working through those edges — even imperfectly — taught more than writing greenfield code ever could.

**OCI Always Free is genuinely viable.** Running a multi-service stack (PostgreSQL, Redis, MinIO, two Node.js frontends, a Python backend, and Caddy) on a free-tier ARM64 VM — with auto-renewed TLS and a GitHub Actions deploy pipeline — is entirely doable and a great way to keep a side project alive without recurring cost.

---

## License

MIT — see [LICENSE](LICENSE).

---

*CivicLens was designed and built as a learning project, with the goal of exploring full-stack production patterns across backend APIs, web portals, mobile applications, AI integration, DevOps, and cloud deployment — from the first commit to a live multi-service deployment.*
