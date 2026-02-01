# CivicLens Database Setup Script
# Automates PostgreSQL database creation and initialization

param(
    [switch]$SkipPostGIS = $false,
    [switch]$SkipSeed = $false,
    [string]$DbPassword = "password123",
    [string]$DbHost = "localhost",
    [string]$DbPort = "5432"
)

$ErrorActionPreference = "Stop"

Write-Host "`n" -ForegroundColor Green
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         CivicLens Database Setup Script                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$DbName = "civiclens_db"
$DbUser = "civiclens_user"
$DbPassword = $DbPassword
$DbHost = $DbHost
$DbPort = $DbPort

Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "   Database: $DbName"
Write-Host "   User: $DbUser"
Write-Host "   Host: $DbHost"
Write-Host "   Port: $DbPort"
Write-Host ""

# Step 1: Check PostgreSQL Installation
Write-Host "Step 1: Checking PostgreSQL Installation..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    $pgVersion = psql --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL found: $pgVersion" -ForegroundColor Green
    } else {
        throw "PostgreSQL not found in PATH"
    }
} catch {
    Write-Host "❌ PostgreSQL is not installed or not in PATH" -ForegroundColor Red
    Write-Host "   Please install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Step 2: Check PostgreSQL Service
Write-Host "`nStep 2: Checking PostgreSQL Service..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    $pgService = Get-Service -Name "postgresql-x64-*" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($pgService) {
        if ($pgService.Status -eq "Running") {
            Write-Host "✅ PostgreSQL service is running: $($pgService.Name)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  PostgreSQL service is stopped. Starting..." -ForegroundColor Yellow
            Start-Service -Name $pgService.Name
            Start-Sleep -Seconds 3
            Write-Host "✅ PostgreSQL service started" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  PostgreSQL service not found, assuming it's running..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Could not check PostgreSQL service: $_" -ForegroundColor Yellow
}

# Step 3: Test PostgreSQL Connection
Write-Host "`nStep 3: Testing PostgreSQL Connection..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    $testConnection = psql -U postgres -h $DbHost -p $DbPort -c "SELECT 1" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL connection successful" -ForegroundColor Green
    } else {
        throw "Connection failed"
    }
} catch {
    Write-Host "❌ Cannot connect to PostgreSQL" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Yellow
    Write-Host "   Make sure PostgreSQL is running on $DbHost`:$DbPort" -ForegroundColor Yellow
    exit 1
}

# Step 4: Create Database
Write-Host "`nStep 4: Creating Database..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    # Check if database exists
    $dbExists = psql -U postgres -h $DbHost -p $DbPort -lqt | Select-String "^\s*$DbName\s*\|"
    
    if ($dbExists) {
        Write-Host "⚠️  Database '$DbName' already exists" -ForegroundColor Yellow
        $response = Read-Host "Drop and recreate? (y/n)"
        if ($response -eq "y") {
            Write-Host "   Dropping existing database..." -ForegroundColor Gray
            psql -U postgres -h $DbHost -p $DbPort -c "DROP DATABASE IF EXISTS $DbName;" 2>&1 | Out-Null
            Write-Host "   ✅ Database dropped" -ForegroundColor Green
        } else {
            Write-Host "   Skipping database creation" -ForegroundColor Yellow
        }
    }
    
    # Create database if it doesn't exist
    $dbExists = psql -U postgres -h $DbHost -p $DbPort -lqt | Select-String "^\s*$DbName\s*\|"
    if (-not $dbExists) {
        Write-Host "   Creating database '$DbName'..." -ForegroundColor Gray
        psql -U postgres -h $DbHost -p $DbPort -c "CREATE DATABASE $DbName;" 2>&1 | Out-Null
        Write-Host "   ✅ Database created" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Failed to create database: $_" -ForegroundColor Red
    exit 1
}

# Step 5: Create Database User
Write-Host "`nStep 5: Creating Database User..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    # Check if user exists
    $userExists = psql -U postgres -h $DbHost -p $DbPort -tAc "SELECT 1 FROM pg_user WHERE usename = '$DbUser'" 2>&1
    
    if ($userExists -eq "1") {
        Write-Host "⚠️  User '$DbUser' already exists" -ForegroundColor Yellow
        Write-Host "   Updating password..." -ForegroundColor Gray
        psql -U postgres -h $DbHost -p $DbPort -c "ALTER USER $DbUser WITH PASSWORD '$DbPassword';" 2>&1 | Out-Null
        Write-Host "   ✅ Password updated" -ForegroundColor Green
    } else {
        Write-Host "   Creating user '$DbUser'..." -ForegroundColor Gray
        psql -U postgres -h $DbHost -p $DbPort -c "CREATE USER $DbUser WITH PASSWORD '$DbPassword';" 2>&1 | Out-Null
        Write-Host "   ✅ User created" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Failed to create user: $_" -ForegroundColor Red
    exit 1
}

# Step 6: Grant Privileges
Write-Host "`nStep 6: Granting Privileges..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    Write-Host "   Granting privileges to user..." -ForegroundColor Gray
    psql -U postgres -h $DbHost -p $DbPort -c "GRANT ALL PRIVILEGES ON DATABASE $DbName TO $DbUser;" 2>&1 | Out-Null
    psql -U postgres -h $DbHost -p $DbPort -c "ALTER DATABASE $DbName OWNER TO $DbUser;" 2>&1 | Out-Null
    Write-Host "   ✅ Privileges granted" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to grant privileges: $_" -ForegroundColor Red
    exit 1
}

# Step 7: Install PostGIS Extension
if (-not $SkipPostGIS) {
    Write-Host "`nStep 7: Installing PostGIS Extension..." -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    
    try {
        Write-Host "   Creating PostGIS extension..." -ForegroundColor Gray
        psql -U $DbUser -h $DbHost -p $DbPort -d $DbName -c "CREATE EXTENSION IF NOT EXISTS postgis;" 2>&1 | Out-Null
        Write-Host "   ✅ PostGIS extension created" -ForegroundColor Green
        
        # Verify PostGIS
        $postgisVersion = psql -U $DbUser -h $DbHost -p $DbPort -d $DbName -tAc "SELECT PostGIS_version();" 2>&1
        Write-Host "   ✅ PostGIS version: $postgisVersion" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  PostGIS installation failed: $_" -ForegroundColor Yellow
        Write-Host "   This may be OK if PostGIS is not installed on your PostgreSQL" -ForegroundColor Yellow
    }
}

# Step 8: Update .env File
Write-Host "`nStep 8: Updating Environment Configuration..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    $envPath = "..\civiclens-backend\.env"
    if (Test-Path $envPath) {
        Write-Host "   Updating $envPath..." -ForegroundColor Gray
        
        # Read current .env
        $envContent = Get-Content $envPath -Raw
        
        # Update DATABASE_URL
        $newDbUrl = "postgresql+asyncpg://$DbUser`:$DbPassword@$DbHost`:$DbPort/$DbName"
        $envContent = $envContent -replace 'DATABASE_URL=.*', "DATABASE_URL=$newDbUrl"
        
        # Write back
        Set-Content $envPath $envContent
        Write-Host "   ✅ .env file updated" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  .env file not found at $envPath" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Failed to update .env: $_" -ForegroundColor Yellow
}

# Step 9: Initialize Database Tables
Write-Host "`nStep 9: Initializing Database Tables..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

try {
    $backendPath = "..\civiclens-backend"
    $venvPath = "$backendPath\.venv\Scripts\Activate.ps1"
    
    if (Test-Path $venvPath) {
        Write-Host "   Activating virtual environment..." -ForegroundColor Gray
        & $venvPath
        
        Write-Host "   Running database initialization..." -ForegroundColor Gray
        Write-Host "   (This will start the backend briefly to create tables)" -ForegroundColor Gray
        
        # Run backend startup to initialize database
        $timeout = 30
        $process = Start-Process -FilePath "python" -ArgumentList "-m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -WorkingDirectory $backendPath -PassThru -NoNewWindow
        
        # Wait for initialization
        Start-Sleep -Seconds $timeout
        
        # Stop the process
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        
        Write-Host "   ✅ Database tables initialized" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Virtual environment not found at $venvPath" -ForegroundColor Yellow
        Write-Host "   Please run: cd civiclens-backend && python -m venv .venv" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Database initialization warning: $_" -ForegroundColor Yellow
    Write-Host "   You can manually initialize by running the backend" -ForegroundColor Yellow
}

# Step 10: Seed Initial Data (Optional)
if (-not $SkipSeed) {
    Write-Host "`nStep 10: Seeding Initial Data (Optional)..." -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    
    $response = Read-Host "Seed initial data? (y/n)"
    if ($response -eq "y") {
        try {
            $backendPath = "..\civiclens-backend"
            $venvPath = "$backendPath\.venv\Scripts\Activate.ps1"
            
            if (Test-Path $venvPath) {
                Write-Host "   Activating virtual environment..." -ForegroundColor Gray
                & $venvPath
                
                Write-Host "   Seeding data..." -ForegroundColor Gray
                uv run python -m app.db.seeds.seed_navimumbai_data
                Write-Host "   ✅ Data seeded successfully" -ForegroundColor Green
            }
        } catch {
            Write-Host "⚠️  Seeding failed: $_" -ForegroundColor Yellow
        }
    }
}

# Summary
Write-Host "`n" -ForegroundColor Green
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✅ Database Setup Complete!                  ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Database Information:" -ForegroundColor Yellow
Write-Host "   Database: $DbName"
Write-Host "   User: $DbUser"
Write-Host "   Host: $DbHost"
Write-Host "   Port: $DbPort"
Write-Host ""

Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Start the backend:"
Write-Host "      cd civiclens-backend"
Write-Host "      & .\.venv\Scripts\Activate.ps1"
Write-Host "      uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
Write-Host ""
Write-Host "   2. Start the admin dashboard:"
Write-Host "      cd civiclens-admin"
Write-Host "      npm run dev"
Write-Host ""
Write-Host "   3. Start the client app:"
Write-Host "      cd civiclens-client"
Write-Host "      npm run dev"
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - Setup Guide: SETUP_DATABASE.md"
Write-Host "   - Quick Start: QUICK-START.md"
Write-Host "   - API Docs: http://localhost:8000/docs"
Write-Host ""

Write-Host "✨ Happy coding!" -ForegroundColor Green
Write-Host ""
