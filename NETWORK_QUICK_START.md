# NovaVote - Quick Network Access Guide

## 🚀 Quick Start (Access from Any Device)

### Step 1: Find Your IP Address
Run this in PowerShell:
```powershell
.\setup-network.ps1
```

Or manually:
```powershell
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

### Step 2: Configure Firewall (Run as Administrator)
```powershell
New-NetFirewallRule -DisplayName "NovaVote Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "NovaVote Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "NovaVote Blockchain" -Direction Inbound -LocalPort 8545 -Protocol TCP -Action Allow
```

### Step 3: Start Application
```powershell
.\START-ALL.bat
```

Or manually (4 separate terminals):
```powershell
# Terminal 1
cd blockchain
npx hardhat node --hostname 0.0.0.0

# Terminal 2 (after blockchain starts)
cd blockchain
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3
cd backend
npm run dev

# Terminal 4
cd frontend
npm run dev
```

### Step 4: Access from Any Device

**From this computer:**
- Frontend: http://localhost:5173

**From phone/tablet/other computer (same WiFi):**
- Frontend: http://YOUR_IP:5173 (e.g., http://192.168.1.100:5173)

## 📱 Mobile Access
1. Connect phone to same WiFi
2. Open browser
3. Go to http://YOUR_IP:5173
4. Start voting! 🗳️

## 🔧 Troubleshooting
- Can't access? Check firewall settings
- Wrong IP? Run `ipconfig` again
- Still issues? See DEPLOYMENT.md

## ☁️ Cloud Deployment
For internet access (not just local network):
- See CLOUD_DEPLOYMENT.md for Render, Railway, AWS, Azure

## 📚 Full Documentation
- **DEPLOYMENT.md** - Complete deployment guide
- **CLOUD_DEPLOYMENT.md** - Cloud provider guides
- **README.md** - Project overview
