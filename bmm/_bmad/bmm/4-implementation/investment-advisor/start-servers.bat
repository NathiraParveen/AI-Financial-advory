@echo off
REM Investment Advisor - Start Servers Script
REM This starts both Backend and Frontend servers

echo.
echo ========================================
echo Starting Investment Advisor Servers
echo ========================================
echo.

REM Check if .env.local exists
if not exist "backend\.env.local" (
    echo ERROR: backend\.env.local not found!
    echo Please run setup.bat first
    pause
    exit /b 1
)

echo Starting Backend on port 5000...
echo Starting Frontend on port 3000...
echo.
echo Both servers will open in new windows
echo Close windows to stop servers
echo.

REM Start Backend in new window
start "Investment Advisor - Backend" cmd /k "cd backend && npm run dev"

REM Wait 3 seconds for backend to start
timeout /t 3 /nobreak

REM Start Frontend in new window
start "Investment Advisor - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✓ Servers started!
echo.
echo Frontend: http://localhost:3000
echo API: http://localhost:5000/api/v1
echo.
pause
