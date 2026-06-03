@echo off
REM Investment Advisor - Automated Setup Script
REM Run this first to set everything up

echo.
echo ========================================
echo Investment Advisor - Setup Script
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please download and install from: https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js is installed

REM Backend setup
echo.
echo Setting up Backend...
cd backend

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies already installed
)

REM Create .env.local
if not exist ".env.local" (
    echo Creating .env.local...
    (
        echo # Database - SQLite (no installation needed^!
        echo DATABASE_URL=file:./dev.db
        echo.
        echo # Server
        echo PORT=5000
        echo NODE_ENV=development
        echo LOG_LEVEL=debug
        echo.
        echo # JWT
        echo JWT_SECRET=dev-secret-key-change-in-production
        echo JWT_EXPIRATION=7d
        echo.
        echo # CORS
        echo CORS_ORIGIN=http://localhost:3000
        echo.
        echo # File Upload
        echo MAX_FILE_SIZE=10485760
        echo UPLOAD_DIR=./uploads
        echo.
        echo # Features
        echo ENABLE_CSV_IMPORT=true
        echo ENABLE_TAX_OPTIMIZATION=true
        echo ENABLE_REBALANCING_ALERTS=true
    ) > .env.local
    echo [OK] .env.local created
) else (
    echo .env.local already exists
)

REM Setup database
echo.
echo Setting up Database...
call npm run db:generate
call npm run db:migrate

cd ..

REM Frontend setup
echo.
echo Setting up Frontend...
cd frontend

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies already installed
)

cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next: Run start-servers.bat to start the app
echo.
pause
