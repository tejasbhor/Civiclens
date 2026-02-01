# 🗄️ Database Quick Reference Card

## One-Command Setup

```powershell
# PowerShell
.\setup-database.ps1

# CMD
setup-database.bat
```

---

## Manual Setup (5 Steps)

### 1. Create Database
```sql
psql -U postgres
CREATE DATABASE civiclens_db;
CREATE USER civiclens_user WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE civiclens_db TO civiclens_user;
\q
```

### 2. Install PostGIS
```sql
psql -U civiclens_user -d civiclens_db
CREATE EXTENSION postgis;
\q
```

### 3. Update .env
```env
DATABASE_URL=postgresql+asyncpg://civiclens_user:password123@localhost:5432/civiclens_db
```

### 4. Start Backend
```bash
cd civiclens-backend
& .\.venv\Scripts\Activate.ps1
uv run uvicorn app.main:app --reload
```

### 5. Verify Setup
```bash
# Check database
psql -U civiclens_user -d civiclens_db -c "\dt"

# Check API
curl http://localhost:8000/health
```

---

## Connection Strings

### Development
```
postgresql+asyncpg://civiclens_user:password123@localhost:5432/civiclens_db
```

### Production (with SSL)
```
postgresql+asyncpg://civiclens_user:password@remote-host:5432/civiclens_db?ssl=require
```

---

## Common Commands

### Check Connection
```bash
psql -U civiclens_user -d civiclens_db -c "SELECT 1"
```

### List Tables
```bash
psql -U civiclens_user -d civiclens_db -c "\dt"
```

### Backup Database
```bash
pg_dump -U civiclens_user -d civiclens_db > backup.sql
```

### Restore Database
```bash
psql -U civiclens_user -d civiclens_db < backup.sql
```

### Change Password
```bash
psql -U postgres -c "ALTER USER civiclens_user WITH PASSWORD 'newpassword';"
```

### Drop Database
```bash
psql -U postgres -c "DROP DATABASE civiclens_db;"
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| PostgreSQL not found | Install from https://www.postgresql.org/download/windows/ |
| Connection refused | Start PostgreSQL service: `Start-Service postgresql-x64-14` |
| PostGIS not found | Install PostGIS via PostgreSQL installer |
| Redis connection failed | Start Redis: `docker run -d -p 6379:6379 redis` |
| MinIO connection failed | Start MinIO: `docker run -d -p 9000:9000 minio/minio` |
| Tables not created | Run backend: `uv run uvicorn app.main:app --reload` |

---

## Service Status

### Check All Services
```powershell
# PostgreSQL
psql -U postgres -c "SELECT 1"

# Redis
docker exec redis redis-cli ping

# MinIO
curl http://localhost:9000/minio/health/live

# Backend
curl http://localhost:8000/health
```

---

## Database Info

| Property | Value |
|----------|-------|
| Database | civiclens_db |
| User | civiclens_user |
| Host | localhost |
| Port | 5432 |
| Extension | PostGIS |
| Driver | asyncpg |
| Pool Size | 20 |

---

## Key Tables

| Table | Purpose |
|-------|---------|
| users | User accounts (citizens, officers, admins) |
| reports | Civic issue reports |
| tasks | Officer assignments |
| departments | Government departments |
| media | Photos, videos, audio |
| audit_logs | Activity tracking |
| appeals | Issue escalations |
| notifications | User alerts |

---

## Environment Variables

```env
# Required
DATABASE_URL=postgresql+asyncpg://user:pass@host:port/db

# Optional
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10
REDIS_URL=redis://localhost:6379/0
MINIO_ENDPOINT=localhost:9000
```

---

## Useful Links

- **Setup Guide**: [SETUP_DATABASE.md](SETUP_DATABASE.md)
- **Full Summary**: [DATABASE_SETUP_SUMMARY.md](DATABASE_SETUP_SUMMARY.md)
- **Quick Start**: [QUICK-START.md](QUICK-START.md)
- **API Docs**: http://localhost:8000/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **PostGIS Docs**: https://postgis.net/documentation/

---

## Quick Checklist

- [ ] PostgreSQL installed
- [ ] PostgreSQL service running
- [ ] Database created
- [ ] User created
- [ ] PostGIS installed
- [ ] .env configured
- [ ] Backend started
- [ ] Tables created
- [ ] API responding
- [ ] Ready to develop!

---

**Need help?** Check [SETUP_DATABASE.md](SETUP_DATABASE.md) for detailed instructions.
