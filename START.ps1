# NovaVote Startup Script
# Run this in PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " NovaVote - Starting All Services" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Start Blockchain Node
Write-Host "[1/4] Starting Hardhat Blockchain Node..." -ForegroundColor Yellow
Set-Location "c:\Users\omera\Desktop\Blockchain\blockchain"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'BLOCKCHAIN NODE - Keep this window open!' -ForegroundColor Green ; npx hardhat node"

Write-Host "Waiting for blockchain to start..." -ForegroundColor Gray
Start-Sleep -Seconds 12

# Step 2: Deploy Contracts
Write-Host "[2/4] Deploying Smart Contracts..." -ForegroundColor Yellow
Set-Location "c:\Users\omera\Desktop\Blockchain\blockchain"
npx hardhat run scripts/deploy.js --network localhost

Write-Host ""
Start-Sleep -Seconds 2

# Step 3: Start Backend
Write-Host "[3/4] Starting Backend Server..." -ForegroundColor Yellow
Set-Location "c:\Users\omera\Desktop\Blockchain\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'BACKEND SERVER - Keep this window open!' -ForegroundColor Blue ; npm run dev"

Start-Sleep -Seconds 6

# Step 4: Start Frontend
Write-Host "[4/4] Starting Frontend..." -ForegroundColor Yellow
Set-Location "c:\Users\omera\Desktop\Blockchain\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'FRONTEND - Keep this window open!' -ForegroundColor Magenta ; npm run dev"

Start-Sleep -Seconds 4

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " All Services Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend:   http://localhost:5173" -ForegroundColor White
Write-Host "Backend:    http://localhost:3000" -ForegroundColor White
Write-Host "Blockchain: http://localhost:8545" -ForegroundColor White
Write-Host ""
Write-Host "Opening application in browser..." -ForegroundColor Gray
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "Press any key to exit this window (other windows will stay open)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
