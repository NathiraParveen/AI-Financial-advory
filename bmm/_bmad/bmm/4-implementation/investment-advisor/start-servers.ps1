# Investment Advisor - Start Servers PowerShell Script
# Run with: powershell -ExecutionPolicy Bypass -File start-servers.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Investment Advisor" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path "backend\.env.local")) {
    Write-Host "✗ backend\.env.local not found!" -ForegroundColor Red
    Write-Host "Please run setup.ps1 first" -ForegroundColor Yellow
    exit
}

Write-Host "Starting Backend (port 5000)..." -ForegroundColor Yellow
Write-Host "Starting Frontend (port 3000)..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Servers opening in new windows..." -ForegroundColor Gray
Write-Host ""

# Start Backend
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$PSScriptRoot\backend' ; npm run dev`"" -WindowStyle Normal -PassThru | Out-Null

# Wait for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$PSScriptRoot\frontend' ; npm run dev`"" -WindowStyle Normal -PassThru | Out-Null

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Servers Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "API: http://localhost:5000/api/v1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Close the server windows to stop" -ForegroundColor Gray
Write-Host ""
