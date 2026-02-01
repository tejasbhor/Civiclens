# 🗄️ CivicLens Database Setup - Complete Summary

## Overview

CivicLens uses **PostgreSQL** with **PostGIS** extension for geospatial features. The database is automatically initialized when the backend starts.

---

## Quick Start (Choose One)

### Option A: Automated Setup (Recommended)

**Windows PowerShell:**
```powershell
.\setup-database.ps1
```

**Windows CMD:**
```cmd
setup-database.bat
```

This will:
- ✅ Check PostgreSQL installation
- ✅ Create database and user
- ✅ Install PostGIS extension
- ✅ Update .env configuration
- ✅ Initialize database tables

### Option B: Manual Setup

See [SETUP_DATABASE.md](SETUP_DATABASE.md) for step-by-step instructions.

---

## Database Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Core Tables                                    │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  • users (Citizens, Officers, Admins)          │   │
│  │  • reports (Civic issues)                       │   │
│  │  • tasks (Officer assignments)                  │   │
│  │  • departments (Government departments)         │   │
│  │  • media (Photos, videos, audio)                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Supporting Tables                              │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  • appeals & escalations                        │   │
│  │  • notifications                                │   │
│  │  • audit_logs (Activity tracking)               │   │
│  │  • sessions (User sessions)                     │   │
│  │  • role_history (Role changes)                  │   │
│  │  • feedback (User feedback)                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Extensions                                     │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  • PostGIS (Geospatial queries)                 │   │
│  │  • UUID (Unique identifiers)                    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Key Features

- **Async Support**: Uses `asyncpg` for high-performance async queries
- **Connection Pooling**: Configurable pool size (default: 20 connections)
- **Geospatial**: PostGIS for GPS-based queries and location tracking
- **Audit Logging**: Complete activity tracking with 365-day retention
- **Role-Based Access**: 7-tier user hierarchy with permissions

---

## Configuration

### Environment Variables (.env)

```env
# Database Connection
DATABASE_URL=postgresql+asyncpg://civiclens_user:password123@localhost:5432/civiclens_db
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10

# Redis (for OTP, caching, rate limiting)
REDIS_URL=redis://localhost:6379/0
REDIS_PASSWORD=

# MinIO (for file storage)
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=civiclens-media
MINIO_USE_SSL=false
```

### Connection String Format

```
postgresql+asyncpg://[user]:[password]@[host]:[port]/[database]
```

**Example:**
```
postgresql+asyncpg://civiclens_user:password123@localhost:5432/civiclens_db
```

---

## Database Initialization Process

### Automatic Initialization (On Backend Startup)

When you start the backend with:
```bash
uv run uvicorn app.main:app --reload
```

The application automatically:

1. **Checks PostgreSQL Connection**
   - Verifies database is accessible
   - Logs connection status

2. **Installs PostGIS Extension**
   - Creates PostGIS extension if not exists
   - Enables geospatial queries

3. **Creates All Tables**
   - Imports all model definitions
   - Creates tables from SQLAlchemy models
   - Sets up indexes and constraints

4. **Verifies Services**
   - Checks Redis connection
   - Checks MinIO connection
   - Reports status for each service

### Startup Output Example

```
🚀 Starting CivicLens API...

============================================================
Checking vital services...
============================================================

📊 Checking PostgreSQL connection...
✅ PostgreSQL - Connected
✅ Database tables initialized

🔴 Checking Redis connection...
✅ Redis - Connected and responding

📦 Checking MinIO connection...
✅ MinIO - Connected (bucket 'civiclens-media' exists)

============================================================
Service Status Summary:
============================================================
PostgreSQL: ✅ Ready
Redis:      ✅ Ready
MinIO:      ✅ Ready
============================================================

✅ All critical services are ready!

🎉 CivicLens API startup complete!
```

---

## Database Tables Overview

### Users Table
- Stores all user accounts (citizens, officers, admins)
- Supports 7-tier role hierarchy
- Includes authentication and security fields
- Tracks user status and activity

### Reports Table
- Civic issue reports submitted by citizens
- Includes GPS location, category, severity, status
- Tracks creation, updates, and resolution
- Linked to media files and tasks

### Tasks Table
- Officer assignments for report resolution
- Tracks progress, status, and completion
- Includes before/after photos
- Performance metrics

### Departments Table
- Government departments managing reports
- Area assignments and officer allocation
- Performance metrics and statistics

### Media Table
- Photos, videos, and audio files
- Metadata stored in database
- Actual files stored in MinIO
- Linked to reports and tasks

### Audit Logs Table
- Complete activity tracking
- User actions, changes, and access logs
- Retention: 365 days (configurable)
- Used for compliance and security

### Additional Tables
- **Appeals & Escalations**: Issue escalation workflow
- **Notifications**: User notifications and alerts
- **Sessions**: User session management
- **Role History**: Track role changes
- **Feedback**: User feedback and ratings
- **Officer Metrics**: Performance tracking

---

## Troubleshooting

### PostgreSQL Connection Failed

**Error**: `psycopg2.OperationalError: could not connect to server`

**Solution**:
```powershell
# 1. Check if PostgreSQL is running
Get-Service postgresql-x64-*

# 2. Start PostgreSQL if stopped
Start-Service postgresql-x64-14

# 3. Verify connection string in .env
# Should be: postgresql+asyncpg://civiclens_user:password123@localhost:5432/civiclens_db

# 4. Test connection manually
psql -U civiclens_user -d civiclens_db -c "SELECT 1"
```

### PostGIS Extension Not Found

**Error**: `ERROR: could not open extension control file`

**Solution**:
```powershell
# 1. Verify PostGIS is installed
psql -U postgres -c "SELECT * FROM pg_available_extensions WHERE name LIKE 'postgis%'"

# 2. If not installed, install PostGIS
# Use PostgreSQL installer and select PostGIS during installation

# 3. After installation, create extension
psql -U civiclens_user -d civiclens_db -c "CREATE EXTENSION postgis"
```

### Redis Connection Failed

**Error**: `ConnectionError: Error 111 connecting to localhost:6379`

**Solution**:
```powershell
# 1. Check if Redis is running (via Docker)
docker ps | findstr redis

# 2. Start Redis container
docker run -d -p 6379:6379 --name redis redis:latest

# 3. Verify connection
docker exec redis redis-cli ping
```

### MinIO Connection Failed

**Error**: `ConnectionError: Failed to connect to MinIO`

**Solution**:
```powershell
# 1. Check if MinIO is running
docker ps | findstr minio

# 2. Start MinIO container
docker run -d -p 9000:9000 -p 9001:9001 `
  -e MINIO_ROOT_USER=minioadmin `
  -e MINIO_ROOT_PASSWORD=minioadmin `
  --name minio minio/minio server /data --console-address ":9001"

# 3. Access MinIO console
# URL: http://localhost:9001
# Username: minioadmin
# Password: minioadmin
```

### Database Tables Not Created

**Error**: Tables don't exist after starting backend

**Solution**:
```powershell
# 1. Check backend logs for errors
# Look for "✅ Database tables initialized" message

# 2. Manually create tables using Alembic
cd civiclens-backend
& .\.venv\Scripts\Activate.ps1
uv run alembic upgrade head

# 3. Verify tables were created
psql -U civiclens_user -d civiclens_db -c "\dt"
```

---

## Backup & Restore

### Backup Database

```powershell
# Full backup
pg_dump -U civiclens_user -d civiclens_db > backup.sql

# Compressed backup
pg_dump -U civiclens_user -d civiclens_db | gzip > backup.sql.gz

# With custom format (faster restore)
pg_dump -U civiclens_user -d civiclens_db -Fc > backup.dump
```

### Restore Database

```powershell
# From SQL file
psql -U civiclens_user -d civiclens_db < backup.sql

# From compressed file
gunzip -c backup.sql.gz | psql -U civiclens_user -d civiclens_db

# From custom format
pg_restore -U civiclens_user -d civiclens_db backup.dump
```

---

## Performance Optimization

### Connection Pool Tuning

```env
# In .env
DATABASE_POOL_SIZE=20        # Connections to keep open
DATABASE_MAX_OVERFLOW=10     # Additional connections when needed
```

### Add Indexes

```sql
-- Report queries
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_category ON reports(category);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_location ON reports USING GIST(location);

-- Task queries
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_report_id ON tasks(report_id);

-- User queries
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
```

---

## Security Best Practices

### 1. Change Default Passwords

```powershell
# Change PostgreSQL user password
psql -U postgres -c "ALTER USER civiclens_user WITH PASSWORD 'your_secure_password';"

# Update .env
# DATABASE_URL=postgresql+asyncpg://civiclens_user:your_secure_password@localhost:5432/civiclens_db
```

### 2. Restrict Database Access

Edit PostgreSQL `pg_hba.conf`:
```
local   all             civiclens_user                          md5
host    all             civiclens_user  127.0.0.1/32            md5
```

### 3. Enable SSL for Remote Connections

```env
# For production with SSL
DATABASE_URL=postgresql+asyncpg://civiclens_user:password@remote-host:5432/civiclens_db?ssl=require
```

### 4. Regular Backups

```powershell
# Automated daily backup (Windows Task Scheduler)
# Create backup script: backup-db.ps1
pg_dump -U civiclens_user -d civiclens_db | gzip > "backups/backup-$(Get-Date -Format 'yyyy-MM-dd').sql.gz"
```

---

## Next Steps

After database setup:

1. **Start Backend**
   ```bash
   cd civiclens-backend
   & .\.venv\Scripts\Activate.ps1
   uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Seed Initial Data** (Optional)
   ```bash
   uv run python -m app.db.seeds.seed_navimumbai_data
   ```

3. **Start Admin Dashboard**
   ```bash
   cd civiclens-admin
   npm run dev
   ```

4. **Start Client App**
   ```bash
   cd civiclens-client
   npm run dev
   ```

---

## Support & Documentation

- **Setup Guide**: [SETUP_DATABASE.md](SETUP_DATABASE.md)
- **Quick Start**: [QUICK-START.md](QUICK-START.md)
- **Database Schema**: [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)
- **API Documentation**: http://localhost:8000/docs
- **Issues**: Check logs in backend terminal

---

## Summary

✅ **Database setup is automated** - Just run the setup script or start the backend
✅ **All tables created automatically** - No manual SQL needed
✅ **PostGIS enabled** - Geospatial queries work out of the box
✅ **Connection pooling configured** - High performance by default
✅ **Audit logging enabled** - Complete activity tracking
✅ **Production ready** - Secure, scalable, and reliable

**Happy coding! 🚀**
