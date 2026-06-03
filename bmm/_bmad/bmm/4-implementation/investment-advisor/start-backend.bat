@echo off
REM Start backend in development mode (with hot reload)

cd backend

echo.
echo ========================================
echo Starting Investment Advisor Backend
echo ========================================
echo.
echo API will be available at:
echo   http://localhost:5000
echo   http://localhost:5000/health
echo.

npm run dev

pause
