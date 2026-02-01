# CivicLens Fresh Setup Script
# Run this after deleting .venv to set everything up cleanly

Write-Host "`n" -ForegroundColor Green
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         CivicLens Fresh Environment Setup                 ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create virtual environment
Write-Host "Step 1: Creating Python virtual environment..." -ForegroundColor Yellow
python -m venv .venv
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create virtual environment" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Virtual environment created" -ForegroundColor Green

# Step 2: Activate virtual environment
Write-Host "`nStep 2: Activating virtual environment..." -ForegroundColor Yellow
& .\.venv\Scripts\Activate.ps1
Write-Host "✅ Virtual environment activated" -ForegroundColor Green

# Step 3: Upgrade pip and install uv
Write-Host "`nStep 3: Installing uv package manager..." -ForegroundColor Yellow
python -m pip install --upgrade pip uv
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install uv" -ForegroundColor Red
    exit 1
}
Write-Host "✅ uv installed" -ForegroundColor Green

# Step 4: Install core requirements
Write-Host "`nStep 4: Installing core requirements..." -ForegroundColor Yellow
uv pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install core requirements" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Core requirements installed" -ForegroundColor Green

# Step 5: Install AI requirements (optional, with error handling)
Write-Host "`nStep 5: Installing AI requirements (optional)..." -ForegroundColor Yellow
uv pip install -r requirements-ai.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  AI requirements installation had issues (this is OK)" -ForegroundColor Yellow
    Write-Host "   The system will work without AI features" -ForegroundColor Yellow
} else {
    Write-Host "✅ AI requirements installed" -ForegroundColor Green
}

# Step 6: Verify installation
Write-Host "`nStep 6: Verifying installati