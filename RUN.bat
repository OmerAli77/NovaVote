@echo off
echo ========================================
echo NovaVote - Blockchain Voting System
echo ========================================
echo.
echo Starting all components...
echo.

echo [1/4] Starting Blockchain Node...
start "NovaVote - Blockchain" cmd /k "cd /d %~dp0blockchain && npx hardhat node"
timeout /t 8 >nul

echo [2/4] Deploying Smart Contracts...
start "NovaVote - Deploy" cmd /k "cd /d %~dp0blockchain && npx hardhat run scripts/deploy.js --network localhost && echo. && echo ✓ Deployment complete! && timeout /t 3"
timeout /t 12 >nul

echo [3/4] Starting Backend Server...
start "NovaVote - Backend" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 5 >nul

echo [4/4] Starting Frontend...
start "NovaVote - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo   All components started successfully!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3000
echo Blockchain: http://localhost:8545
echo.
echo Check the opened windows for logs.
echo Close those windows to stop the services.
echo.
