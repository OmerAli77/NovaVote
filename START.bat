@echo off
echo ========================================
echo NovaVote - Starting All Services
echo ========================================
echo.

REM Start Blockchain Node
echo [1/3] Starting Hardhat Blockchain Node...
start "Blockchain Node" cmd /k "cd /d blockchain && npx hardhat node"
timeout /t 8 /nobreak >nul

REM Deploy Contracts
echo [2/3] Deploying Smart Contracts...
cd blockchain
call npx hardhat run scripts/deploy.js --network localhost
cd ..
timeout /t 2 /nobreak >nul

REM Start Backend
echo [3/3] Starting Backend Server...
start "Backend Server" cmd /k "cd /d backend && npm run dev"
timeout /t 5 /nobreak >nul

REM Start Frontend
echo [4/4] Starting Frontend...
start "Frontend" cmd /k "cd /d frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo All Services Started!
echo ========================================
echo.
echo Frontend:  http://localhost:5173
echo Backend:   http://localhost:3000
echo Blockchain: http://localhost:8545
echo.
echo Press any key to open the application...
pause >nul
start http://localhost:5173
