# PowerShell script to get your local IP address and configure for network access
# Run as Administrator for automatic firewall configuration

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   NovaVote - Network Setup Wizard" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get local IP address
Write-Host "[1/3] Detecting Network Configuration..." -ForegroundColor Yellow
Write-Host "" 
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*"} | Select-Object -First 1).IPAddress

if ($ipAddress) {
    Write-Host "   Your Local IP Address: $ipAddress" -ForegroundColor Green
    Write-Host "   Network Type: Local Area Network" -ForegroundColor Gray
} else {
    Write-Host "   Could not automatically detect IP address" -ForegroundColor Red
    Write-Host "   Run 'ipconfig' manually to find it" -ForegroundColor Yellow
    $ipAddress = "YOUR_IP_ADDRESS"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Configuration Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

Write-Host ""
Write-Host "[2/3] Configuring Windows Firewall..." -ForegroundColor Yellow
Write-Host ""
if ($isAdmin) {
    Write-Host "   Running as Administrator - Configuring firewall..." -ForegroundColor Gray
    
    try {
        $rules = @(
            @{Name="NovaVote Backend"; Port=3000},
            @{Name="NovaVote Frontend"; Port=5173},
            @{Name="NovaVote Blockchain"; Port=8545}
        )
        
        foreach ($rule in $rules) {
            New-NetFirewallRule -DisplayName $rule.Name -Direction Inbound -LocalPort $rule.Port -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null
            Write-Host "   ✓ Port $($rule.Port) - $($rule.Name)" -ForegroundColor Green
        }
        Write-Host ""
        Write-Host "   Firewall configuration complete!" -ForegroundColor Green
    } catch {
        Write-Host "   Firewall rules may already exist" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠ Not running as Administrator" -ForegroundColor Red
    Write-Host ""
    Write-Host "   To enable network access, run PowerShell as Administrator and execute:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   New-NetFirewallRule -DisplayName 'NovaVote Backend' -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow" -ForegroundColor Gray
    Write-Host "   New-NetFirewallRule -DisplayName 'NovaVote Frontend' -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow" -ForegroundColor Gray
    Write-Host "   New-NetFirewallRule -DisplayName 'NovaVote Blockchain' -Direction Inbound -LocalPort 8545 -Protocol TCP -Action Allow" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""
Write-Host "[3/3] Environment Configuration (Optional)" -ForegroundColor Yellow
Write-Host ""
Write-Host "   For network access, create 'frontend\.env' with:" -ForegroundColor Gray
Write-Host ""
Write-Host "   VITE_API_URL=http://$ipAddress:3000" -ForegroundColor Cyan
Write-Host "   VITE_BLOCKCHAIN_RPC_URL=http://$ipAddress:8545" -ForegroundColor Cyan
Write-Host ""
Write-Host "   (This is optional - defaults work for localhost)" -ForegroundColor DarkGray

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Access Information" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "FROM THIS COMPUTER (localhost):" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Frontend:   http://localhost:5173" -ForegroundColor White
Write-Host "   Backend:    http://localhost:3000/api" -ForegroundColor White
Write-Host "   Blockchain: http://localhost:8545" -ForegroundColor White
Write-Host ""
Write-Host "FROM OTHER DEVICES (same WiFi/network):" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Frontend:   http://$ipAddress:5173" -ForegroundColor Green
Write-Host "   Backend:    http://$ipAddress:3000/api" -ForegroundColor Green
Write-Host "   Blockchain: http://$ipAddress:8545" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   How to Start NovaVote" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "OPTION 1: Quick Start (Recommended)" -ForegroundColor Green
Write-Host ""
Write-Host "   .\START-ALL.bat" -ForegroundColor White
Write-Host ""
Write-Host "   This starts everything automatically!" -ForegroundColor Gray
Write-Host ""
Write-Host "OPTION 2: Manual Start (Advanced)" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Step 1: .\1-start-blockchain.bat" -ForegroundColor Gray
Write-Host "   Step 2: .\2-deploy-contracts.bat" -ForegroundColor Gray
Write-Host "   Step 3: .\3-start-backend.bat" -ForegroundColor Gray
Write-Host "   Step 4: .\4-start-frontend.bat" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Important Security Notes" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   ℹ Admin Panel: Only accessible from localhost" -ForegroundColor Cyan
Write-Host "   ℹ Voting: Available from any device on network" -ForegroundColor Cyan
Write-Host "   ℹ Firewall: Must allow ports 3000, 5173, 8545" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ready to start! Run: .\START-ALL.bat" -ForegroundColor Green
Write-Host ""
