# ============================================================================
# CIVICLENS - COMPLETE STOP SCRIPT
# ============================================================================
# Stops all local processes and Docker infrastructure
# Releases all ports (5432, 6379, 9000, 9001)
# ============================================================================

$ErrorActionPreference = "Continue"
Clear-Host

Write-Host "`n" -NoNewline
Write-Host "============================================================================" -ForegroundColor Red
Write-Host "  CIVICLENS - STOPPING ALL SERVICES" -ForegroundColor Red
Write-Host "============================================================================" -ForegroundColor Red
Write-Host ""

# ============================================================================
# STEP 1: Stop Docker Infrastructure
# ============================================================================
Write-Host "[1/2] Stopping Docker Infrastructure (Postgres, Redis, MinIO)..." -ForegroundColor Yellow

# Check if Docker is available
docker ps >$null 2>&1
if ($LASTEXITCODE -eq 0) {
    # Use 'down' to fully release networks and ports
    # Note: This does NOT delete persistent volumes/folders
    docker compose down
    Write-Host "      ✅ Docker containers removed and networks cleaned." -ForegroundColor Green
} else {
    Write-Host "      ⚠️  Docker not running or accessible. Skipping container shutdown." -ForegroundColor Gray
}

# Extra safety: Ensure all infra ports are actually freed on Windows
$ports = @(5432, 6379, 9000, 9001)
foreach ($port in $ports) {
    $proc = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
    if ($proc) {
        $procName = (Get-Process -Id $proc -ErrorAction SilentlyContinue).Name
        Write-Host "      Killing process '$procName' ($proc) holding port $port..." -ForegroundColor Gray
        Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "      ✅ Infrastructure ports fully released" -ForegroundColor Green

# ============================================================================
# STEP 2: Kill Local Application Processes
# ============================================================================
Write-Host "`n[2/2] Stopping local processes..." -ForegroundColor Yellow

Write-Host "      Stopping Node.js (Frontends)..." -ForegroundColor Gray
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) { $nodeProcesses | Stop-Process -Force }

Write-Host "      Stopping Python/Uvicorn (Backend & Worker)..." -ForegroundColor Gray
$pythonProcesses = Get-Process -Name python, uvicorn -ErrorAction SilentlyContinue
if ($pythonProcesses) { $pythonProcesses | Stop-Process -Force }

Write-Host "`n============================================================================" -ForegroundColor Red
Write-Host "  STOPPED - ALL SERVICES DISCONNECTED" -ForegroundColor Red
Write-Host "============================================================================" -ForegroundColor Red
Write-Host "`n"
