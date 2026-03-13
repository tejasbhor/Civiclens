# CivicLens Backend

FastAPI backend for the CivicLens civic issue management platform. Handles authentication, report lifecycle, task assignment, AI-powered classification, media uploads, notifications, and admin analytics.

## Prerequisites

- Python 3.11+
- [uv](https://docs.astral.sh/uv/) (package manager)
- PostgreSQL 14+ with PostGIS extension
- Redis
- MinIO (S3-compatible object storage)

In production, all of these run as Docker containers via the root `docker-compose.yml`. For local development, you need a local PostgreSQL instance and can run Redis/MinIO via Docker.

## Local Development

```bash
# Install dependencies
pip install uv
uv pip install -r requirements.txt

# Copy environment file and edit DATABASE_URL, MINIO keys etc.
cp .env.example .env

# Run database migrations
python -m alembic upgrade head

# Seed initial data (departments, admin user)
python scripts/seed_all.py

# Start the server
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API: `http://localhost:8000/api/v1`
- Swagger docs: `http://localhost:8000/docs`

## Project Structure

```
app/
├── api/v1/           Route handlers (auth, reports, tasks, media, users, etc.)
├── core/             Database engine, auth dependencies, RBAC, rate limiting,
│                     security, session management, audit logging
├── crud/             Database CRUD operations
├── db/seeds/         Database seed scripts (departments, admin users)
├── models/           SQLAlchemy ORM models (User, Report, Task, Media, etc.)
├── schemas/          Pydantic request/response schemas
├── services/         Business logic layer
│   ├── ai/           AI classification, duplicate detection, urgency scoring
│   ├── metrics/      Officer performance metrics
│   └── ...           Report service, notification service, storage, email
├── workers/          Background workers (AI pipeline, SLA monitor, metrics)
├── ml/               Model download utilities
└── main.py           FastAPI app entrypoint, middleware, startup events

alembic/              Database migration files
scripts/              Seed scripts, health checks, test data generators
```

## Key Components

### AI Pipeline

The AI engine runs as a background worker (`app/workers/ai_worker.py`) that:

1. Polls Redis for new reports (queued by the report submission endpoint)
2. Classifies the report category using TF-IDF + scikit-learn
3. Scores urgency based on keywords, severity, and location context
4. Detects duplicates by comparing against existing reports
5. Routes to the correct department based on classification
6. Updates the report with AI results

Start the AI worker separately:
```bash
uv run python -m app.workers.ai_worker
```

### Background Workers

| Worker | Purpose | Interval |
|--------|---------|----------|
| `ai_worker.py` | Report classification & routing | Continuous (polls Redis) |
| `sla_monitor.py` | SLA breach detection & alerts | Every 4 hours |
| `stale_task_monitor.py` | Stale task detection & escalation | Every 24 hours |
| `metrics_calculator.py` | Officer performance metrics | Every 6 hours |

### Authentication

- OTP-based login for citizens (phone number + OTP via Redis)
- Password-based login for officers and admins
- JWT access + refresh tokens
- Session management with concurrent session limits
- 7-tier RBAC: Citizen → Contributor → Moderator → Nodal Officer → Auditor → Admin → Super Admin

## Production Deployment

The backend runs in Docker. The `Dockerfile` uses a multi-stage build with `uv` for fast, reproducible installs:

```dockerfile
# Build: uv sync --frozen --no-dev
# Runtime: uvicorn with 2 workers (for 2-OCPU ARM instance)
```

Environment variables are injected via the root `.env` file and `docker-compose.yml`.

The production PostgreSQL + PostGIS runs as the `postgis/postgis:15-3.3-alpine` Docker image — no manual PostGIS installation needed.

## Running Tests

```bash
uv run pytest
```

Tests use an in-memory SQLite database (via `aiosqlite`) with PostgreSQL-specific types monkeypatched. Test config is in `pytest.ini`, fixtures in `app/tests/conftest.py`.
