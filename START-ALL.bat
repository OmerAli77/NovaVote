@echo off
color 0A
echo ========================================
echo    NovaVote - Blockchain Voting System
echo ========================================
echo.
echo This will start all components:
echo  [1] Blockchain Node (Hardhat)
echo  [2] Smart Contract Deployment
echo  [3] Backend API Server
echo  [4] Frontend React App
echo.
echo Make sure Node.js and npm are installed!
echo.
echo Press any key to continue...
pause >nul
cls

echo [STEP 1/4] Starting Blockchain Node...
echo -------------------------------------
start "1. Blockchain Node" cmd /k "color 0E && cd /d %~dp0blockchain && echo Starting Hardhat Node... && npx hardhat node"

echo Waiting for blockchain to initialize (8 seconds)...
timeout /t 8 /nobreak >nul

echo.
echo [STEP 2/4] Deploying Smart Contracts...
echo -------------------------------------
start "2. Deploy Contracts" cmd /k "color 0B && cd /d %~dp0blockchain && echo Deploying contracts to localhost... && npx hardhat run scripts/deploy.js --network localhost && echo. && echo ========================================== && echo CONTRACT DEPLOYMENT COMPLETE! && echo ========================================== && echo. && pause"

echo Waiting for deployment to complete (10 seconds)...
timeout /t 10 /nobreak >nul

echo.
echo [STEP 3/4] Starting Backend Server...
echo -------------------------------------
start "3. Backend Server" cmd /k "color 09 && cd /d %~dp0backend && echo Starting Express API Server... && npm run dev"

echo Waiting for backend to start (5 seconds)...
timeout /t 5 /nobreak >nul

echo.
echo [STEP 4/4] Starting Frontend...
echo -------------------------------------
start "4. Frontend" cmd /k "color 0D && cd /d %~dp0frontend && echo Starting Vite Development Server... && npm run dev"

echo Waiting for frontend to compile (5 seconds)...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo       ALL COMPONENTS STARTED!
echo ========================================
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================
echo        ACCESS INFORMATION
echo ========================================
echo.
echo Frontend:   http://localhost:5173
echo Backend:    http://localhost:3000/api
echo Blockchain: http://localhost:8545
echo.
echo ========================================
echo        IMPORTANT NOTES
echo ========================================
echo.
echo - Admin panel only works on THIS computer (localhost)
echo - To access from other devices, run: setup-network.ps1
echo - Watch each terminal window for errors
echo - Press Ctrl+C in any window to stop that service
echo.
echo ========================================
echo.
echo Press any key to exit this control window.
echo (All services will continue running)
pause >nul
