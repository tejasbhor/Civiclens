# 🗄️ CivicLens Database Setup Guide

## Quick Setup (Recommended)

### Option 1: Automated Setup (Windows PowerShell)
```powershell
# Run the setup script
.\setup-database.ps1
```

This will:
- ✅ Check PostgreSQL installation
- ✅ Create database and user
- ✅ Install PostGIS extension
- ✅ Initialize database tables
- ✅ Seed initial data (optional)

### Option 2: Manual Setup

#### Step 1: Ensure PostgreSQL is Running
```powershell
# Check if PostgreSQL service is running
Get-Service postgresql-x64-*

# If not running, start it
Start-Service postgresql-x64-14  # Adjust version number as needed
```

#### Step 2: Create Database and User
```powershell
# Connect to PostgreSQL as superuser
psql -U postgres

# In psql prompt, run:
CREATE DATABASE civiclens_db;
CREATE USER civiclens_user WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE civiclens_db TO civiclens_user;
ALTER DATABASE civiclens_db OWNER TO civiclens_user;

# Exit psql
\q
```

#### Step 3: Install PostGIS Extension
```powershell
# Connect to the new database
psql -U civiclens_user -d civiclens_db

# In psql prompt, run:
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

# Verify installation
SELECT PostGIS_version();

# Exit psql
\q
```

#### Step 4: Initialize Database Tables
```powershell
# Navigate to backend directory
cd civiclens-backend

# Activate virtual environment
& .\.venv\Scripts\Activate.ps1

# Run the backend (tables auto-create on startup)
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will automatically:
- ✅ Create all database tables
- ✅ Install PostGIS extension
- ✅ Verify all connections

---

## Database Configuration

### Environment Variables (.env)

The backend uses these database settings from `.env`:

```env
# Database Connection
DATABASE_URL=postgresql+asyncpg://civiclens_user:password123@localhost:5432/civiclens_db
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10

# Redis (for OTP and caching)
REDIS_URL=redis://localhost:6379/0
REDIS_PASSWORD=

# MinIO (for file storage)
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=civiclens-media
MINIO_USE_SSL=false
```

### Verify Configuration

```powershell
# Check database connection
cd civiclens-backend
& .\.venv\Scripts\Activate.ps1
uv run python -c "from app.core.database import check_database_connection; import asyncio; print(asyncio.run(check_database_connection()))"

# Check Redis connection
uv run python -c "from app.core.database import check_redis_connection; import asyncio; print(asyncio.run(check_redis_connection()))"
```

---

## Database Schema

### Core Tables

**Users**
- Stores citizen, officer, and admin accounts
- Supports role-based access control (7 tiers)
- Includes authentication and security fields

**Reports**
- Civic issue reports submitted by citizens
- Includes location (GPS), category, severity, status
- Tracks creation, updates, and resolution

**Tasks**
- Officer assignments for report resolution
- Tracks progress, status, and completion
- Includes before/after photos

**Departments**
- Government departments managing reports
- Area assignments and officer allocation
- Performance metrics

**Media**
- Photos, videos, and audio files
- Linked to reports and tasks
- Stored in MinIO, metadata in database

**Audit Logs**
- Complete activity tracking
- User actions, changes, and access logs
- Retention: 365 days (configurable)

**Additional Tables**
- Appeals & Escalations
- Notifications
- Sessions & Sync
- Role History
- Feedback
- Officer Metrics

---

## Troubleshooting

### PostgreSQL Connection Failed

**Problem**: `psycopg2.OperationalError: could not connect to server`

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

**Problem**: `ERROR: could not open extension control file`

**Solution**:
```powershell
# 1. Verify PostGIS is installed
psql -U postgres -c "SELECT * FROM pg_available_extensions WHERE name LIKE 'postgis%'"

# 2. If not installed, install PostGIS
# On Windows: Use PostgreSQL installer and select PostGIS during installation

# 3. After installation, create extension
psql -U civiclens_user -d civiclens_db -c "CREATE EXTENSION postgis"
```

### Redis Connection Failed

**Problem**: `ConnectionError: Error 111 connecting to localhost:6379`

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

**Problem**: `ConnectionError: Failed to connect to MinIO`

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

**Problem**: Tables don't exist after starting backend

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

## Database Backup & Restore

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

### Connection Pool Tuning

```env
# In .env
DATABASE_POOL_SIZE=20        # Connections to keep open
DATABASE_MAX_OVERFLOW=10     # Additional connections when needed
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

```sql
-- Only allow local connections
-- Edit PostgreSQL pg_hba.conf:
-- local   all             civiclens_user                          md5
-- host    all             civiclens_user  127.0.0.1/32            md5
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

1. **Start Backend**: `uv run uvicorn app.main:app --reload`
2. **Seed Data**: `uv run python -m app.db.seeds.seed_navimumbai_data`
3. **Start Admin Dashboard**: `npm run dev` (in civiclens-admin)
4. **Start Client App**: `npm run dev` (in civiclens-client)

---

## Support

For issues or questions:
- Check logs in backend terminal
- Review error messages carefully
- Verify all services are running (PostgreSQL, Redis, MinIO)
- Consult [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) for schema details
