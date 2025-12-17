@echo off
echo ========================================
echo    Restarting Backend Server Only
echo ========================================
echo.
echo Finding and stopping backend process...

:: Kill node processes on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul

timeout /t 2 /nobreak >nul

echo.
echo Starting backend server...
cd /d %~dp0backend
start "Backend Server" cmd /k "color 09 && echo Starting Express API Server... && npm run dev"

echo.
echo Backend restarted!
echo.
pause
