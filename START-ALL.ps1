# ============================================================================
# CIVICLENS - COMPLETE STARTUP SCRIPT
# ============================================================================
# Starts all required services in order:
# 1. Docker Infrastructure (Postgres, Redis, MinIO)
# 2. Database Seeding (Smart Check)
# 3. Backend API Server (New Window)
# 4. AI Worker Engine (New Window)
# 5. Admin Dashboard (New Window)
# 6. Client App (New Window)
# ============================================================================

$ErrorActionPreference = "Stop"
Clear-Host

Write-Host "`n" -NoNewline
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  CIVICLENS - COMPLETE DEVELOPMENT ENVIRONMENT" -ForegroundColor Cyan
Write-Host "  Starting Infrastructure (Docker) & Apps (Local)..." -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# STEP 1: Launch Docker Infrastructure
# ============================================================================
Write-Host "[1/6] Launching Docker Infrastructure (Postgres, Redis, MinIO)..." -ForegroundColor Yellow

# Check if Docker is running
docker ps >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "      ❌ ERROR: Docker is not running!" -ForegroundColor Red
    Write-Host "      Please start Docker Desktop and wait for it to be ready." -ForegroundColor Yellow
    exit 1
}

# Start infrastructure services
# Running from root directory to use root docker-compose.yml and .env
docker compose up -d postgres redis minio
if ($LASTEXITCODE -ne 0) {
    Write-Host "      ❌ Failed to start Docker containers." -ForegroundColor Red
    exit 1
}

Write-Host "      ⏳ Waiting for Database to be ready..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Check DB health
$maxAttempts = 5
$attempt = 1
$dbReady = $false

while ($attempt -le $maxAttempts) {
    docker exec civiclens-postgres pg_isready -U civiclens_user -d civiclens_db >$null 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dbReady = $true
        break
    }
    Write-Host "      ⏳ Postgres is still starting (Attempt $attempt/$maxAttempts)..." -ForegroundColor Gray
    Start-Sleep -Seconds 3
    $attempt++
}

if (-not $dbReady) {
    Write-Host "      ⚠️  Postgres health check timed out. Proceeding anyway..." -ForegroundColor Yellow
} else {
    Write-Host "      ✅ Infrastructure: Ready" -ForegroundColor Green
}

# ============================================================================
# STEP 2: Start Backend API (with auto-seeding)
# ============================================================================
Write-Host "`n[2/6] Starting Backend API Server..." -ForegroundColor Yellow

$backendScript = @"
`$Host.UI.RawUI.WindowTitle = 'CivicLens: Backend API'
Write-Host '============================================================================' -ForegroundColor Cyan
Write-Host '  BACKEND API SERVER' -ForegroundColor Cyan
Write-Host '============================================================================' -ForegroundColor Cyan
Write-Host ''

Set-Location D:\Civiclens\civiclens-backend
Write-Host 'Verifying database data...' -ForegroundColor Yellow
# Running seed_all.py which now includes init_db() call
uv run python scripts/seed_all.py

if (`$LASTEXITCODE -eq 0) {
    Write-Host 'Starting FastAPI server...' -ForegroundColor Green
    uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
} else {
    Write-Host '❌ Database seeding failed. Press any key to close...' -ForegroundColor Red
    Read-Host
}
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript
Write-Host "      ✅ Backend window launched" -ForegroundColor Green

# ============================================================================
# STEP 3: Start AI Worker Engine
# ============================================================================
Write-Host "[3/6] Starting AI Worker Engine..." -ForegroundColor Yellow

$workerScript = @"
`$Host.UI.RawUI.WindowTitle = 'CivicLens: AI Worker'
Write-Host '============================================================================' -ForegroundColor Cyan
Write-Host '  AI WORKER ENGINE' -ForegroundColor Cyan
Write-Host '============================================================================' -ForegroundColor Cyan
Write-Host ''

Set-Location D:\Civiclens\civiclens-backend
Write-Host 'Initializing AI Pipeline (loading models)...' -ForegroundColor Green
uv run python -m app.workers.ai_worker
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $workerScript
Write-Host "      ✅ AI Worker window launched" -ForegroundColor Green

# ============================================================================
# STEP 4: Start Admin Dashboard
# ============================================================================
Write-Host "[4/6] Starting Admin Dashboard..." -ForegroundColor Yellow

$adminScript = @"
`$Host.UI.RawUI.WindowTitle = 'CivicLens: Admin Dashboard'
Write-Host '============================================================================' -ForegroundColor Cyan
Write-Host '  ADMIN DASHBOARD' -ForegroundColor Cyan
Write-Host '============================================================================' -ForegroundColor Cyan
Write-Host ''

Set-Location D:\Civiclens\civiclens-admin
npm run dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $adminScript
Write-Host "      ✅ Admin Dashboard window launched" -ForegroundColor Green

# ============================================================================
# STEP 5: Start Client Application
# ============================================================================
Write-Host "[5/6] Starting Client Application..." -ForegroundColor Yellow

$clientScript = @"
`$Host.UI.RawUI.WindowTitle = 'CivicLens: Citizen App'
Write-Host '============================================================================' -ForegroundColor Cyan
Write-Host '  CITIZEN CLIENT APP' -ForegroundColor Cyan
Write-Host '============================================================================' -ForegroundColor Cyan
Write-Host ''

Set-Location D:\Civiclens\civiclens-client
npm run dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $clientScript
Write-Host "      ✅ Client App window launched" -ForegroundColor Green

# ============================================================================
# SUMMARY
# ============================================================================
Write-Host "`n============================================================================" -ForegroundColor Cyan
Write-Host "  STARTUP COMPLETE" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "  - Backend API:    http://localhost:8000/docs" -ForegroundColor Gray
Write-Host "  - Admin Panel:    http://localhost:3000" -ForegroundColor Gray
Write-Host "  - Citizen App:    http://localhost:5173" -ForegroundColor Gray
Write-Host "  - MinIO Console:  http://localhost:9001" -ForegroundColor Gray
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "`n"
