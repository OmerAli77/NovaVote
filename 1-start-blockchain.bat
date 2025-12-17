@echo off
cd /d "%~dp0blockchain"
echo Starting Hardhat Blockchain Node...
call npx hardhat node
pause
