# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

Monorepo of four independently deployed apps (`civiclens-backend`, `-client`, `-admin`, `-mobile`) sharing a root `docker-compose.yml` (production) and `.env`. Each app has its own `README.md` and `.env.example`. `scripts/` is for the OCI production host.

## Commands

### Backend (`civiclens-backend/`)

```bash
uv sync                                          # install deps
cp .env.example .env                             # then set DATABASE_URL, MinIO keys, etc.
uv run alembic upgrade head                      # run migrations
uv run python scripts/seed_all.py                # seed departments/admin users
uv run uvicorn app.main:app --reload --port 8000 # dev server (http://localhost:8000/docs)

uv run python -m app.workers.ai_worker           # AI classification worker (separate process)

uv run pytest app/tests/ -v                      # all tests
uv run pytest app/tests/test_foo.py::test_bar -v # single test

uv run ruff check .                              # lint
uv run ruff format .                             # format

uv run alembic revision --autogenerate -m "msg"  # new migration after model changes
uv run alembic downgrade -1                      # roll back one migration
```

Note: the root README references `uv run dev`, but no such script is defined in `pyproject.toml` — use the `uvicorn` command above instead.

### Admin / Client / Mobile

Standard npm scripts (see each `package.json`). Mobile: `EXPO_PUBLIC_API_BASE_URL` must be a LAN IP, not localhost; `eas build --profile preview` gives a sideloadable APK, `--profile production` a Play Store AAB.

### Local infra

Backend needs PostgreSQL (with PostGIS) running locally, plus Redis and MinIO — either via Docker one-liners in the root README or `./START-ALL.ps1`.

## Architecture

### Backend layout (`civiclens-backend/app/`)

- `api/v1/` — route handlers, one file per resource (auth, reports, tasks, media, users, departments, appeals, escalations, audit, analytics, sync, notifications, ai_insights, hold_approvals, feedback). All mounted under `/api/v1` in `main.py`; routers are wired in individually near the bottom of `main.py`, not auto-discovered.
- `core/` — DB engine/session (`database.py`), RBAC (`rbac.py`), rate limiting, session management, audit logging, security headers middleware
- `crud/` — DB access functions, one per model, built on `crud/base.py`
- `models/` — SQLAlchemy ORM models
- `schemas/` — Pydantic request/response models
- `services/` — business logic; `services/ai/` holds the classification pipeline (category classifier, duplicate detector, urgency scorer, department router)
- `workers/` — standalone long-running processes, not part of the FastAPI process: `ai_worker.py` (polls Redis for new reports, classifies, scores urgency, detects duplicates, routes to department), `sla_monitor.py`, `stale_task_monitor.py`, `metrics_calculator.py`. These must be started separately from `uvicorn`.

App startup (`main.py` lifespan) hard-checks PostgreSQL, Redis, and MinIO connectivity and will refuse to serve if DB or MinIO are unreachable — check the startup console output first when the backend "won't start."

RBAC has 7 tiers: Citizen → Contributor → Moderator → Nodal Officer → Auditor → Admin → Super Admin. Auth is OTP-based (phone + Redis-backed OTP) for citizens, password-based for officers/admins, with JWT access+refresh tokens.

Full schema: `docs/DATABASE_SCHEMA_SUMMARY.md`.

### Mobile app (`civiclens-mobile/src/`)

Single APK, role-branched at first launch (citizen vs. officer share one binary — see `features/auth/` role selection). Strict offline-first design.

Offline-first flow: report submissions and officer actions (acknowledge/start-work/add-update) write to local SQLite (`submission_queue` / `sync_queue`) immediately; `SyncManager` replays them against the API when `NetInfo` reports connectivity restored. All sync operations are scoped to the logged-in user's ID — don't remove that filter when touching sync code, it's what prevents cross-account data bleed on shared devices.

### Deployment

Production is a single OCI ARM64 VM running all services via `docker-compose.yml` (7 services: Caddy, backend, AI worker, admin, client, Postgres+PostGIS, Redis, MinIO), fronted by Caddy for automatic HTTPS and routing across `civiclens.space` / `admin.civiclens.space` / `api.civiclens.space`. MinIO is not publicly exposed — media is proxied through Caddy at `api.civiclens.space/civiclens-media/*`. CI/CD is GitHub Actions (`.github/workflows/deploy.yml`): lint → test → build multi-arch images → SSH deploy on push to `main`.
