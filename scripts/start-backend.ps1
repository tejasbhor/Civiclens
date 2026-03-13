# Start CivicLens Backend on all network interfaces
Write-Host "`n🚀 Starting CivicLens Backend..." -ForegroundColor Cyan

# Get WiFi IP
$wifiIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Wireless*" } | Select-Object -First 1).IPAddress

if (-not $wifiIP) {
    # Fallback to first non-loopback IPv4
    $wifiIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne "127.0.0.1" } | Select-Object -First 1).IPAddress
}

Write-Host "📡 Your WiFi IP: $wifiIP" -ForegroundColor Green
Write-Host "🔗 Backend will be accessible at: http://${wifiIP}:8000" -ForegroundColor Green
Write-Host "📚 API Docs: http://${wifiIP}:8000/docs`n" -ForegroundColor Green

# Change to backend directory
Set-Location civiclens-backend

# Start uvicorn on all interfaces
Write-Host "🚀 Starting uvicorn server via uv...`n" -ForegroundColor Cyan
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
