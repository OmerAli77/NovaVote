@echo off
cd /d "%~dp0backend"
echo Starting Backend Server...
call npm run dev
pause
