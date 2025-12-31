# Blockchain Deployment Instructions

## 🎯 Quick Start

You just ran the deployment script successfully on localhost! Here's how to deploy to actual networks.

---

## 📋 Prerequisites

1. **Node.js & npm** (already installed ✅)
2. **Hardhat** (already installed ✅)
3. **MetaMask wallet** with MATIC tokens
4. **Environment variables** (see setup below)

---

## 🔧 Environment Setup

### Step 1: Create .env file

```bash
# In the blockchain directory
cp .env.example .env
```

### Step 2: Configure .env

Open `.env` and fill in:

```bash
# Your MetaMask private key (Account Details > Export Private Key)
PRIVATE_KEY=abc123...your_64_character_private_key...xyz789

# Optional: Custom RPC endpoints
POLYGON_MUMBAI_RPC=https://rpc-mumbai.maticvigil.com
POLYGON_MAINNET_RPC=https://polygon-rpc.com

# Optional: For contract verification
POLYGONSCAN_API_KEY=your_api_key_from_polygonscan
```

⚠️ **SECURITY WARNING**: 
- NEVER commit your `.env` file to Git
- NEVER share your private key
- Use a separate wallet for testing (don't use your main wallet)

### Step 3: Add .env to .gitignore

```bash
# Check if .env is ignored
cat .gitignore | Select-String ".env"

# If not present, add it
echo ".env" | Out-File -Append .gitignore
```

---

## 🌐 Network Deployments

### Option 1: Polygon Mumbai Testnet (Recommended for Testing)

**Prerequisites:**
- Get free testnet MATIC: https://faucet.polygon.technology/
- Connect MetaMask to Mumbai testnet
- Verify you have testnet MATIC in your wallet

**Deploy:**
```powershell
cd blockchain
npx hardhat run scripts/deploy-batch.js --network mumbai
```

**Expected output:**
```
🚀 DEPLOYING BATCH VOTING SYSTEM
Network: mumbai
Deployer: 0xYourAddress
Balance: 1.0 ETH (testnet MATIC)
✅ TallyManager deployed to: 0x...
✅ ElectionManager deployed to: 0x...
✅ BatchVoteCommitment deployed to: 0x...
✅ VoteCommitment deployed to: 0x...
```

**Verify contracts:**
```powershell
npx hardhat verify --network mumbai <CONTRACT_ADDRESS>
```

---

### Option 2: Polygon Mainnet (Production)

⚠️ **WARNING**: This costs real MATIC tokens!

**Prerequisites:**
- Purchase MATIC tokens (estimate: 5-10 MATIC for deployment)
- Connect MetaMask to Polygon mainnet
- Double-check all contract code
- Test thoroughly on Mumbai first

**Deploy:**
```powershell
cd blockchain
npx hardhat run scripts/deploy-batch.js --network polygon
```

**Costs (estimated):**
- TallyManager: ~0.5 MATIC
- ElectionManager: ~1.0 MATIC
- BatchVoteCommitment: ~0.7 MATIC
- VoteCommitment: ~0.6 MATIC
- **Total: ~2.8 MATIC** (~$2.50 at $0.90/MATIC)

---

### Option 3: Localhost (Already Working ✅)

For local development and testing:

```powershell
# Terminal 1: Start local blockchain
cd blockchain
npx hardhat node

# Terminal 2: Deploy contracts
cd blockchain
npx hardhat run scripts/deploy-batch.js --network localhost
```

---

## 📊 Deployment Results

After successful deployment, you'll get:

### Files Created:
- `blockchain/deployments.json` - Contract addresses and metadata
- `backend/deployments.json` - Backend configuration
- `frontend/src/deployments.json` - Frontend configuration

### Contract Addresses:
```json
{
  "network": "mumbai",
  "deployer": "0xYourAddress",
  "timestamp": "2025-12-18T...",
  "contracts": {
    "TallyManager": "0x...",
    "ElectionManager": "0x...",
    "BatchVoteCommitment": "0x...",
    "VoteCommitment": "0x..."
  }
}
```

---

## 🔍 Contract Verification

Make sure your contracts are verified on PolygonScan for transparency:

```powershell
# Verify TallyManager
npx hardhat verify --network mumbai 0xTallyManagerAddress

# Verify ElectionManager
npx hardhat verify --network mumbai 0xElectionManagerAddress

# Verify BatchVoteCommitment (with constructor argument)
npx hardhat verify --network mumbai 0xBatchVoteAddress 0xElectionManagerAddress

# Verify VoteCommitment (with constructor argument)
npx hardhat verify --network mumbai 0xVoteCommitmentAddress 0xElectionManagerAddress
```

**View verified contracts:**
- Mumbai: https://mumbai.polygonscan.com/address/0xYourContractAddress
- Mainnet: https://polygonscan.com/address/0xYourContractAddress

---

## 🧪 Post-Deployment Testing

### 1. Verify deployment info files
```powershell
Get-Content blockchain/deployments.json | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### 2. Test contract interaction
```powershell
npx hardhat run scripts/test-large-scale.js --network mumbai
```

### 3. Start backend with new addresses
```powershell
cd ../backend
npm start
```

### 4. Start frontend
```powershell
cd ../frontend
npm run dev
```

---

## 🎛️ Contract Selection Guide

Your deployment includes TWO voting contracts:

### VoteCommitment (Legacy)
- **Use for:** Elections with <1,000 voters
- **Pros:** Simple, individual vote tracking
- **Cons:** Higher gas costs at scale
- **Gas per vote:** ~195,000

### BatchVoteCommitment (Optimized)
- **Use for:** Elections with >1,000 voters
- **Pros:** 13x cheaper, supports batches of 100
- **Cons:** Requires batch aggregation logic
- **Gas per vote:** ~26,000

**Recommendation:**
- Small elections (1-1,000 voters): Use VoteCommitment
- Medium elections (1,000-10,000 voters): Use BatchVoteCommitment with 50-vote batches
- Large elections (10,000+ voters): Use BatchVoteCommitment with 100-vote batches

---

## 🚨 Troubleshooting

### Error: "You are not inside a Hardhat project"
```powershell
# Solution: Always run from blockchain directory
cd blockchain
npx hardhat run scripts/deploy-batch.js --network polygon
```

### Error: "missing private key"
```powershell
# Solution: Check your .env file
Get-Content .env | Select-String "PRIVATE_KEY"
# Should show: PRIVATE_KEY=abc123...
```

### Error: "insufficient funds"
```powershell
# Solution: Add MATIC to your wallet
# Mumbai testnet: https://faucet.polygon.technology/
# Mainnet: Buy MATIC on exchange (Coinbase, Binance, etc.)
```

### Error: "nonce too high"
```powershell
# Solution: Reset MetaMask account
# Settings > Advanced > Clear activity tab data
```

### Error: "gas required exceeds allowance"
```powershell
# Solution: Increase gas limit in hardhat.config.js
# Add to network config: gas: 8000000
```

---

## 📈 Monitoring & Analytics

### Check deployment status:
```powershell
# Mumbai
Start-Process "https://mumbai.polygonscan.com/address/0xYourContractAddress"

# Mainnet
Start-Process "https://polygonscan.com/address/0xYourContractAddress"
```

### Monitor gas prices:
- Mumbai: Usually 1-5 gwei
- Mainnet: Check https://polygonscan.com/gastracker

### Transaction explorer:
```powershell
# View transaction
Start-Process "https://mumbai.polygonscan.com/tx/0xYourTxHash"
```

---

## 🔄 Redeployment

If you need to redeploy (e.g., after contract changes):

```powershell
# 1. Update contracts
# Edit files in blockchain/contracts/

# 2. Recompile
npx hardhat compile

# 3. Redeploy
npx hardhat run scripts/deploy-batch.js --network mumbai

# 4. Update frontend/backend
# deployments.json files are automatically updated
```

---

## 📚 Additional Resources

- **Hardhat Docs:** https://hardhat.org/getting-started/
- **Polygon Docs:** https://docs.polygon.technology/
- **Mumbai Faucet:** https://faucet.polygon.technology/
- **PolygonScan:** https://polygonscan.com/
- **Gas Tracker:** https://polygonscan.com/gastracker
- **RPC Endpoints:** https://chainlist.org/?search=polygon

---

## ✅ Deployment Checklist

Before deploying to mainnet:

- [ ] ✅ Tested on localhost
- [ ] ✅ Tested on Mumbai testnet
- [ ] ✅ All contracts compiled without warnings
- [ ] ✅ All tests passing (npm test)
- [ ] ✅ Contracts verified on PolygonScan
- [ ] ✅ Frontend connected to testnet contracts
- [ ] ✅ Backend connected to testnet contracts
- [ ] ✅ End-to-end voting test successful
- [ ] ✅ Security audit completed (for production)
- [ ] ✅ Sufficient MATIC in deployer wallet
- [ ] ✅ .env file properly configured
- [ ] ✅ .env file NOT in Git repository
- [ ] ✅ Backup of private key stored securely
- [ ] ✅ Emergency contact/support plan in place

---

## 🎯 Next Steps After Deployment

1. **Update Documentation:**
   - Record contract addresses
   - Document deployment date/network
   - Note gas costs and transaction hashes

2. **Configure Application:**
   - Update frontend environment variables
   - Configure backend blockchain service
   - Test all API endpoints

3. **Security:**
   - Enable contract ownership controls
   - Set up monitoring/alerts
   - Plan upgrade strategy if needed

4. **Launch:**
   - Announce deployment
   - Provide user documentation
   - Monitor first few elections closely

---

## 💡 Pro Tips

1. **Use Mumbai extensively** - It's free and identical to mainnet
2. **Verify contracts ASAP** - Easier to debug with verified source
3. **Monitor gas prices** - Deploy during low-traffic times
4. **Keep deployment logs** - Save terminal output for records
5. **Test with real users** - Beta test on Mumbai before mainnet
6. **Plan for upgrades** - Consider proxy patterns for future updates
7. **Budget extra MATIC** - Always have 2x estimated gas costs

---

**Questions?** Check SCALING_GUIDE.md for production deployment strategies.
