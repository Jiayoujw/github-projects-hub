@echo off
echo ============================================
echo  GitHub Open Source Hub - Development Mode
echo ============================================
echo.

echo [1/2] Starting Backend (port 3001)...
start "Backend" cmd /k "cd /d %~dp0backend && pnpm run start:dev"

echo [2/2] Starting Frontend (port 3000)...
start "Frontend" cmd /k "cd /d %~dp0frontend && pnpm run dev"

echo.
echo Both servers are starting...
echo Backend:  http://localhost:3001
echo Swagger:  http://localhost:3001/api/docs
echo Frontend: http://localhost:3000
echo.
pause
