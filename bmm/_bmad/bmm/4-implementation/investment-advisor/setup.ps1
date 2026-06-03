# Investment Advisor - Quick Setup PowerShell Script
# Run with: powershell -ExecutionPolicy Bypass -File setup.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Investment Advisor - Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found! Download from https://nodejs.org" -ForegroundColor Red
    exit
}

# Backend setup
Write-Host ""
Write-Host "Setting up Backend..." -ForegroundColor Yellow
Push-Location backend

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Gray
    npm install
} else {
    Write-Host "Backend dependencies already installed" -ForegroundColor Gray
}

# Create .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local..." -ForegroundColor Gray
    @"
# Database - SQLite (no installation needed!)
DATABASE_URL=file:./dev.db

# Server
PORT=5000
NODE_ENV=development
LOG_LEVEL=debug

# JWT
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Features
ENABLE_CSV_IMPORT=true
ENABLE_TAX_OPTIMIZATION=true
ENABLE_REBALANCING_ALERTS=true
"@ | Out-File -Encoding UTF8 .env.local
    Write-Host "✓ .env.local created" -ForegroundColor Green
} else {
    Write-Host "✓ .env.local already exists" -ForegroundColor Green
}

# Setup database
Write-Host "Setting up database..." -ForegroundColor Gray
npm run db:generate 2>$null
npm run db:migrate 2>$null
Write-Host "✓ Database setup complete" -ForegroundColor Green

Pop-Location

# Frontend setup
Write-Host ""
Write-Host "Setting up Frontend..." -ForegroundColor Yellow
Push-Location frontend

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Gray
    npm install
} else {
    Write-Host "Frontend dependencies already installed" -ForegroundColor Gray
}

Pop-Location

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Run .\start-servers.ps1" -ForegroundColor Yellow
Write-Host ""
