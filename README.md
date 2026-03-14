# CivicLens

A civic issue management platform that connects citizens, field officers, and administrators. Citizens report infrastructure problems (potholes, broken streetlights, water leaks) through a mobile app or web portal. Reports are automatically classified by an AI engine, routed to the correct municipal department, assigned to field officers, and tracked through resolution. Administrators oversee the entire lifecycle from a dashboard with analytics and audit logs.

## Repository Structure

```
civiclens-backend/     FastAPI backend, AI classification engine, database models
civiclens-admin/       Admin dashboard (Next.js)
civiclens-client/      Citizen & officer web portal (React + Vite)
civiclens-mobile/      Mobile app for citizens & field officers (React Native / Expo)
scripts/               Server init, deployment, and backup scripts
docs/                  Database schema docs, security guide, deployment guide
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11, FastAPI, SQLAlchemy 2.0 (async), Alembic |
| Database | PostgreSQL 15 + PostGIS |
| Cache | Redis 7 |
| Object Storage | MinIO (S3-compatible) |
| AI/ML | scikit-learn, pandas |
| Admin Dashboard | Next.js 14, Tailwind CSS, Recharts |
| Citizen Portal | React 18 (Vite), Tailwind CSS, shadcn/ui |
| Mobile App | React Native (Expo SDK 54), Expo Camera, Expo Location |
| Reverse Proxy | Caddy (auto HTTPS via Let's Encrypt) |
| CI/CD | GitHub Actions → OCI ARM64 instance |

## 🌐 Live Demo

The platform is live and fully accessible on **Oracle Cloud Infrastructure (OCI ARM64)**:
- 🏛️ **Citizen Portal**: [https://civiclens.space](https://civiclens.space)
- 📊 **Admin Dashboard**: [https://admin.civiclens.space](https://admin.civiclens.space)
- 🔌 **API Documentation**: [https://api.civiclens.space/docs](https://api.civiclens.space/docs)

*(Note: Use **`ENABLE_DEMO_OTP=true`** in the server configuration to enable visual OTPs for presentation purposes.)*

## 🏗️ Architecture

The production stack runs on an **Oracle Cloud OCI (VM.Standard.A1.Flex)** instance using Docker Compose. Caddy terminates TLS and routes traffic:

```
                    Internet
                       │
                   ┌───┴───┐
                   │ Caddy │  (auto HTTPS)
                   └───┬───┘
          ┌────────────┼────────────┐
          │            │            │
   civiclens.space  admin.xxx   api.xxx
          │            │            │
      ┌───┴───┐   ┌───┴───┐   ┌───┴────┐
      │Client │   │ Admin │   │Backend │
      │(nginx)│   │(node) │   │(uvicorn│
      └───────┘   └───────┘   └───┬────┘
                                   │
                    ┌──────┬───────┼───────┐
                    │      │       │       │
                 Postgres Redis  MinIO  AI Engine
```

MinIO is not publicly exposed. Media files are served through Caddy's `/civiclens-media/*` proxy route at `api.civiclens.space`.

## Local Development Setup

### Prerequisites

- Python 3.11+ with [uv](https://docs.astral.sh/uv/)
- Node.js 18+ with npm
- PostgreSQL 14+ with the PostGIS extension
- Docker (for Redis and MinIO)

### 1. Infrastructure (Redis + MinIO)

```bash
# Start Redis and MinIO via Docker
docker run -d --name redis -p 6379:6379 redis:7-alpine
docker run -d --name minio -p 9000:9000 -p 9090:9090 \
  -e MINIO_ROOT_USER=minioadmin -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9090"
```

Or use the PowerShell helper: `.\START-ALL.ps1`

### 2. Backend

```bash
cd civiclens-backend

# Setup environment and install dependencies automatically with UV
uv sync

# Configure environment
cp .env.example .env   # edit DATABASE_URL to match your local Postgres

# Start the server (Auto-initializes Database & PostGIS)
uv run dev
```

- API: `http://localhost:8000/api/v1`
- Swagger docs: `http://localhost:8000/docs`

### 🛠️ Clean Reset & Fresh Setup

If you need to completely reset the project on a new device:

1.  **Clear All State**: Delete the `.venv` folder in `civiclens-backend`.
2.  **Initialize**: `cd civiclens-backend; uv sync`
3.  **Run**: `uv run dev`
    *   The app will automatically sense the fresh database, install **PostGIS**, and create all tables.
4.  **Seed Data**:
    ```bash
    uv run python scripts/seed_all.py
    ```

### 3. Admin Dashboard

```bash
cd civiclens-admin
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL if needed
npm run dev                  # http://localhost:3000
```

### 4. Citizen Portal

```bash
cd civiclens-client
npm install
cp .env.example .env         # set VITE_API_URL if needed
npm run dev                  # http://localhost:5173
```

### 5. Mobile App

```bash
cd civiclens-mobile
npm install
cp .env.example .env         # set EXPO_PUBLIC_API_BASE_URL to your local IP
npx expo start
```

Scan the QR code with Expo Go on your phone. Use your machine's local IP (not `localhost`) for the API URL since the phone needs to reach your dev server over the network.

## Production Deployment

The production setup is fully containerized with Docker Compose. For the specific Oracle Cloud (OCI ARM64) configuration used for the live demo, see the [OCI Production Setup Guide](docs/OCI_PRODUCTION_SETUP.md).

### Key Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Production orchestration (7 services) |
| `Caddyfile` | Reverse proxy + auto HTTPS |
| `.env.production.example` | Production env vars template |
| `scripts/init-server.sh` | One-time server bootstrap (Docker, swap, firewall) |
| `scripts/deploy.sh` | Pull images, recreate containers, run migrations |
| `scripts/backup.sh` | Automated PostgreSQL + Redis backups (cron) |
| `.github/workflows/deploy.yml` | CI/CD: lint → test → build ARM64 images → deploy via SSH |

### Deploy Steps

1. Provision an ARM64 instance (e.g., OCI Always Free, 12 GB RAM)
2. Point DNS A records for `civiclens.space`, `admin.civiclens.space`, `api.civiclens.space` to the server IP
3. SSH in and run `scripts/init-server.sh`
4. Copy `.env.production.example` to `.env`, fill in real credentials
5. Add GitHub secrets (`OCI_HOST`, `OCI_USER`, `OCI_SSH_KEY`)
6. Push to `main` — the CI/CD pipeline builds ARM64 images and deploys automatically

### Mobile App Builds

```bash
cd civiclens-mobile
eas build --profile preview --platform android     # APK for testing
eas build --profile production --platform android   # AAB for Play Store
```

Production API URLs are configured in `eas.json` and injected at build time.

## Environment Variables

| File | Scope | Description |
|------|-------|-------------|
| `.env.example` | Development | Local dev defaults (localhost URLs, no TLS) |
| `.env.production.example` | Production | Server config (real domains, strong passwords) |
| `civiclens-mobile/.env.example` | Mobile dev | Expo dev config (local IP for API) |
| `civiclens-mobile/eas.json` | Mobile builds | Production URLs baked into app binary |

## Project Documentation

- [Database Schema](docs/DATABASE_SCHEMA_SUMMARY.md)
- [Database Setup](docs/SETUP_DATABASE.md)
- [OCI Production Setup](docs/OCI_PRODUCTION_SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Security Guide](docs/SECURITY_TESTING_GUIDE.md)
- [AI Pipeline Setup](docs/AI_SETUP_STEPS.md)

## License

MIT — see [LICENSE](LICENSE).
