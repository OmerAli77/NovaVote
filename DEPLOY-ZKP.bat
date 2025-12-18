@echo off
setlocal enabledelayedexpansion
color 0B
title Zero-Knowledge Proof Blockchain Deployment

echo.
echo ========================================
echo  ZERO-KNOWLEDGE PROOF VOTING SYSTEM
echo  Complete Deployment Script
echo ========================================
echo.

echo [1/5] Cleaning old deployments...
cd blockchain
if exist artifacts\ rd /s /q artifacts
if exist cache\ rd /s /q cache
if exist deployments.json del /f deployments.json

echo [2/5] Installing blockchain dependencies...
call npm install

echo [3/5] Compiling smart contracts with ZKP features...
call npx hardhat compile

echo [4/5] Deploying contracts to local blockchain...
call npx hardhat run scripts/deploy.js --network localhost

echo [5/5] Copying deployments to frontend and backend...
copy deployments.json ..\backend\deployments.json
copy deployments.json ..\frontend\src\deployments.json

cd ..

echo.
echo ========================================
echo  DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Smart Contracts Deployed:
echo  - ElectionManager (with Merkle root support)
echo  - VoteCommitment (with nullifiers)
echo  - TallyManager
echo.
echo ZKP Features:
echo  [*] Nullifier-based double-vote prevention
echo  [*] Merkle tree voter registry
echo  [*] Zero-knowledge proof verification
echo  [*] Anonymous voting with eligibility proofs
echo.
echo Next Steps:
echo  1. Start backend:   cd backend ^&^& npm start
echo  2. Start frontend:  cd frontend ^&^& npm run dev
echo  3. Register voters in Admin panel
echo  4. Distribute credentials to voters
echo  5. Test anonymous voting!
echo.
pause
