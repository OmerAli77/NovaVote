@echo off
cd /d "%~dp0blockchain"
echo Waiting for blockchain to start...
timeout /t 5
echo Deploying Smart Contracts...
call npx hardhat run scripts/deploy.js --network localhost
echo.
echo Deployment complete!
pause
