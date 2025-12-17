# NovaVote - Deployment Guide

This guide covers deploying NovaVote for access from any device on your local network or to the cloud.

---

## 🌐 Option 1: Local Network Deployment (Recommended for Testing)

Access the voting system from any device on your local network (phones, tablets, other computers).

### Prerequisites
- Windows PC connected to your local network (WiFi or Ethernet)
- All devices on the same network

### Step 1: Find Your Computer's IP Address

**Method 1 - PowerShell:**
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*"}
```

**Method 2 - Command Prompt:**
```cmd
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually starts with 192.168.x.x or 10.x.x.x)

**Example IP:** `192.168.1.100` (yours will be different)

### Step 2: Configure Windows Firewall

Allow incoming connections on ports 3000 (backend), 5173 (frontend), and 8545 (blockchain):

**PowerShell (Run as Administrator):**
```powershell
New-NetFirewallRule -DisplayName "NovaVote Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "NovaVote Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "NovaVote Blockchain" -Direction Inbound -LocalPort 8545 -Protocol TCP -Action Allow
```

### Step 3: Update Environment Configuration

**Backend (.env already configured):**
The backend is already set to `HOST=0.0.0.0` which allows network access.

**Frontend - Update if needed:**
If accessing from other devices, edit `frontend\.env`:
```env
VITE_API_URL=http://YOUR_IP_ADDRESS:3000
VITE_BLOCKCHAIN_RPC_URL=http://YOUR_IP_ADDRESS:8545
```
Replace `YOUR_IP_ADDRESS` with your actual IP (e.g., `192.168.1.100`)

### Step 4: Start the Application

**Option A - Use the batch files:**
```powershell
.\START-ALL.bat
```

**Option B - Manual start (3 separate terminals):**

**Terminal 1 - Blockchain:**
```powershell
cd blockchain
npx hardhat node --hostname 0.0.0.0
```

**Terminal 2 - Deploy Contracts (wait for blockchain to start):**
```powershell
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

**Terminal 3 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 4 - Frontend:**
```powershell
cd frontend
npm run dev
```

### Step 5: Access from Other Devices

**From the host computer:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`

**From other devices on the network:**
- Frontend: `http://YOUR_IP_ADDRESS:5173` (e.g., `http://192.168.1.100:5173`)
- Backend API: `http://YOUR_IP_ADDRESS:3000/api`

**Testing from a mobile device:**
1. Connect your phone/tablet to the same WiFi network
2. Open browser and navigate to `http://YOUR_IP_ADDRESS:5173`
3. You should see the NovaVote interface

### Troubleshooting Local Network Access

**Problem: Can't access from other devices**
- ✅ Verify all devices are on the same network
- ✅ Check Windows Firewall rules are active
- ✅ Confirm your IP address hasn't changed (use `ipconfig` again)
- ✅ Try disabling Windows Firewall temporarily to test (not recommended for production)

**Problem: Backend connection errors**
- ✅ Verify backend is running on `0.0.0.0:3000`
- ✅ Check `frontend\.env` has correct IP address
- ✅ Clear browser cache and reload

---

## ☁️ Option 2: Cloud Deployment (Production)

Deploy to cloud providers for internet-wide access.

### Option 2A: Deploy to Render (Free Tier Available)

**Prerequisites:**
- GitHub account
- Render account (render.com)

**Steps:**

1. **Push code to GitHub**
2. **Deploy Backend on Render:**
   - Create new "Web Service"
   - Connect GitHub repository
   - Build command: `cd backend && npm install`
   - Start command: `cd backend && npm start`
   - Add environment variables (from `.env`)

3. **Deploy Frontend on Render:**
   - Create new "Static Site"
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`
   - Add environment variables

4. **Blockchain:**
   - Use Sepolia testnet or deploy to Polygon Mumbai
   - Update `hardhat.config.js` with network settings
   - Update `.env` files with deployed contract addresses

### Option 2B: Deploy to Railway (Easy Setup)

**Prerequisites:**
- GitHub account
- Railway account (railway.app)

**Steps:**

1. **Push code to GitHub**
2. **Deploy on Railway:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Railway auto-detects the monorepo
   - Configure services:
     - Backend service: `backend` directory
     - Frontend service: `frontend` directory
   - Add environment variables
   - Railway provides public URLs automatically

### Option 2C: Deploy to AWS/Azure/GCP

For production deployment with custom domain:

**Architecture:**
- Frontend: S3 + CloudFront (AWS) or Azure Static Web Apps
- Backend: EC2/ECS or Azure App Service
- Blockchain: Connect to Ethereum mainnet or private consortium

See `CLOUD_DEPLOYMENT_DETAILED.md` for step-by-step cloud deployment guides.

---

## 🔒 Security Considerations

### For Local Network Deployment
- ✅ Only accessible within your local network
- ✅ Use strong session secrets (update `SESSION_SECRET` in `.env`)
- ✅ Don't expose to internet without additional security measures
- ⚠️ CORS is set to `*` for development (restrict for production)

### For Cloud Deployment
- ✅ Use HTTPS (SSL/TLS certificates)
- ✅ Set specific CORS origins (not `*`)
- ✅ Use environment variables for secrets (never commit `.env`)
- ✅ Implement rate limiting
- ✅ Use production blockchain network (mainnet/testnet)
- ✅ Enable authentication/authorization
- ✅ Regular security audits

---

## 📱 Mobile Access Tips

### Testing on Mobile Devices
1. Ensure mobile device is on same WiFi as your computer
2. Find your computer's IP address (e.g., `192.168.1.100`)
3. On mobile browser, go to `http://192.168.1.100:5173`
4. Add to home screen for app-like experience

### Responsive Design
The frontend uses Tailwind CSS and is mobile-responsive. Test on:
- Phone (portrait and landscape)
- Tablet
- Desktop browsers

---

## 🔧 Advanced Configuration

### Custom Port Configuration

**Backend Port:**
Edit `backend\.env`:
```env
PORT=8080
```

**Frontend Port:**
Edit `frontend\vite.config.js`:
```javascript
server: {
  port: 3001,  // Change from 5173
  // ...
}
```

### Database Setup (Optional)

For production, add PostgreSQL:

1. Install PostgreSQL
2. Update `backend\.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=novavote
DB_USER=postgres
DB_PASSWORD=your_password
```

3. Run migrations (if implemented)

---

## 📊 Monitoring & Logs

### Check Service Status

**Backend Health:**
```powershell
curl http://localhost:3000/api/health
```

**From network device:**
```
http://YOUR_IP:3000/api/health
```

### View Logs

Logs appear in the terminal windows where services are running.

---

## 🚀 Quick Commands Reference

**Get your IP:**
```powershell
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"}).IPAddress
```

**Start everything:**
```powershell
.\START-ALL.bat
```

**Stop services:**
Press `Ctrl+C` in each terminal window

**Restart a service:**
Stop with `Ctrl+C`, then run the start command again

---

## 📞 Need Help?

**Common URLs:**
- Local Frontend: `http://localhost:5173`
- Network Frontend: `http://<YOUR_IP>:5173`
- Backend API: `http://localhost:3000/api`
- Health Check: `http://localhost:3000/api/health`

**Check Firewall:**
```powershell
Get-NetFirewallRule -DisplayName "NovaVote*" | Select-Object DisplayName, Enabled, Direction
```

**Test Network Connectivity:**
From another device:
```bash
ping YOUR_IP_ADDRESS
curl http://YOUR_IP_ADDRESS:3000/api/health
```

---

## ✅ Deployment Checklist

### Local Network Deployment
- [ ] Found computer's IP address
- [ ] Configured Windows Firewall
- [ ] Updated `.env` files
- [ ] Started blockchain node
- [ ] Deployed smart contracts
- [ ] Started backend server
- [ ] Started frontend server
- [ ] Tested access from another device

### Cloud Deployment
- [ ] Code pushed to GitHub
- [ ] Chosen cloud provider
- [ ] Deployed backend service
- [ ] Deployed frontend service
- [ ] Configured environment variables
- [ ] Connected to blockchain network
- [ ] Tested public URL
- [ ] Configured custom domain (optional)
- [ ] Set up SSL/HTTPS
- [ ] Configured production security settings

---

*Last Updated: December 2025*
