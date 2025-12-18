@echo off
color 0C
title Complete System Reset and Fix

echo ========================================
echo  COMPREHENSIVE SYSTEM FIX
echo ========================================
echo.

echo [1/6] Stopping all services...
echo -------------------------------------
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/6] Cleaning old artifacts...
echo -------------------------------------
cd blockchain
if exist artifacts\ rd /s /q artifacts
if exist cache\ rd /s /q cache
cd ..

echo [3/6] Starting blockchain...
echo -------------------------------------
start "Blockchain" cmd /k "color 0E && cd /d %~dp0blockchain && npx hardhat node"
timeout /t 8 /nobreak >nul

echo [4/6] Compiling and deploying contracts...
echo -------------------------------------
cd blockchain
call npx hardhat compile
call npx hardhat run scripts/deploy.js --network localhost
cd ..

echo [5/6] Copying deployments...
echo -------------------------------------
copy /Y blockchain\deployments.json backend\deployments.json
copy /Y blockchain\deployments.json frontend\src\deployments.json

echo [6/6] Starting services...
echo -------------------------------------
start "Backend" cmd /k "color 09 && cd /d %~dp0backend && npm run dev"
timeout /t 5 /nobreak >nul

start "Frontend" cmd /k "color 0D && cd /d %~dp0frontend && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo  SYSTEM READY!
echo ========================================
echo.
echo Frontend:   http://localhost:5173
echo Backend:    http://localhost:3000
echo Blockchain: http://localhost:8545
echo.
start http://localhost:5173
pause
