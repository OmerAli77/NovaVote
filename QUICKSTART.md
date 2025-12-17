# NovaVote - Quick Start Guide

## 🚀 How to Start the Project

Follow these steps to get NovaVote running on your local machine:

### Step 1: Open Three PowerShell Windows

You'll need 3 separate terminal windows to run the blockchain, backend, and frontend.

### Step 2: Start the Blockchain Node

**In Terminal 1:**
```powershell
cd "c:\Users\omera\Desktop\Blockchain\blockchain"
npx hardhat node
```

This will:
- Start a local Ethereum blockchain on port 8545
- Create 20 test accounts with ETH
- Keep running (don't close this window)

### Step 3: Deploy Smart Contracts

**Open a new Terminal 2 while keeping Terminal 1 running:**
```powershell
cd "c:\Users\omera\Desktop\Blockchain\blockchain"
npx hardhat run scripts/deploy.js --network localhost
```

This will:
- Deploy ElectionManager, VoteCommitment, and TallyManager contracts
- Save contract addresses to `deployments.json`
- Copy deployment info to backend and frontend folders

### Step 4: Start the Backend Server

**In Terminal 2 (after deployment completes):**
```powershell
cd "c:\Users\omera\Desktop\Blockchain\backend"
npm run dev
```

This will:
- Start Express API server on port 3000
- Connect to the blockchain
- Load deployed contract addresses
- Keep running (don't close this window)

### Step 5: Start the Frontend

**Open Terminal 3:**
```powershell
cd "c:\Users\omera\Desktop\Blockchain\frontend"
npm run dev
```

This will:
- Start Vite dev server on port 5173
- Open the React application
- Keep running (don't close this window)

### Step 6: Access the Application

Open your browser and go to: **http://localhost:5173**

---

## ✅ System is Running!

Once all steps are complete, you'll have:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Blockchain RPC**: http://localhost:8545

## 📦 Quick Start (All-in-One Script)

**Alternative: Use the automated startup script:**

```powershell
cd "c:\Users\omera\Desktop\Blockchain"
.\START.ps1
```

This will automatically:
1. Start the blockchain node in a new window
2. Deploy contracts
3. Start backend in a new window
4. Start frontend in a new window
5. Open your browser to http://localhost:5173

---

## What's Running

1. ✅ **Hardhat Blockchain Node** - Local Ethereum network
2. ✅ **Smart Contracts Deployed**:
   - ElectionManager
   - VoteCommitment
### 2. Start the Election

1. Go to **"Manage Elections"** tab
2. Find your election
3. Click **"Start Election"**

### 1. Create an Election (Admin)

1. Go to **Admin** page
2. Click **"Create Election"** tab
3. Fill in:
   - Title: "Student Council Election 2025"
   - Description: "Vote for your student council president"
   - Start Time: Set to current time or future
   - End Time: Set to future time
   - Add at least 2 candidates (e.g., "Alice Johnson", "Bob Smith")
4. Click **"Create Election"**

### 2. Start the Election

1. Go to **"Manage Elections"** tab
2. Find your election
3. Click **"Start Election"** (only works if current time >= start time)

### 3. Vote as a User

1. Go back to **Home** page
2. Click **"Vote Now"** on the active election
3. Enter a Voter ID (e.g., `V001`, `V002`, etc.)
4. Click **"Get Credential & Continue"**
5. Select your candidate
6. Click **"Continue"** → **"Submit Vote"**
7. Save your receipt hash!

### 4. Verify Your Vote

1. After voting, you'll see your receipt
2. Click **"Verify on Blockchain"** to confirm your vote was recorded
3. Your vote choice is NEVER revealed, only the commitment

### 5. End Election and Tally

1. Go to **Admin** → **"Manage Elections"**
2. Click **"End Election"** (admin can end anytime)
3. Click **"Tally Votes"** to count all votes
4. Results will be published on the blockchain

### 6. View Results

1. Go to **Home** page
2. Click **"Audit"** on any election
3. View:
   - Election integrity verification
   - Vote statistics
   - Final results (if tallied)
   - Blockchain verification details

## Testing the System

Here's a complete test workflow:

```
1. Admin creates election with candidates: Alice, Bob, Carol
2. Admin starts the election
3. Voter V001 logs in and votes for Alice
4. Voter V002 logs in and votes for Bob  
5. Voter V003 logs in and votes for Alice
6. Each voter verifies their vote was recorded
7. Admin ends the election
8. Admin tallies the votes
9. Results show: Alice (2), Bob (1), Carol (0)
10. Anyone can audit the election integrity
```

## Important Notes

### Privacy & Security Features

- ✅ **Zero-Knowledge Proofs**: Vote choices are encrypted
  - **How it works:** See detailed explanation in `ZKP_EXPLANATION.md`
  - **Visual proof:** The voting page shows you BOTH your private vote AND the public commitment
  - **Verification:** You can prove you voted correctly without revealing your choice to anyone
- ✅ **No Double Voting**: Each credential can vote only once
- ✅ **Public Auditability**: Anyone can verify vote count
- ✅ **Receipt-Based Verification**: Voters can prove they voted
- ✅ **Blockchain Immutability**: All commitments are permanent

### 🔐 Understanding Zero-Knowledge Proofs

**Question:** "How do I know I'm voting for the right person?"

**Answer:** NovaVote shows you **side-by-side comparison**:

1. **What YOU see (Private):**
   - Your Vote: "Alice Johnson" ✅
   - Your Credential: [Your Secret Key]

2. **What goes on Blockchain (Public):**
   - Encrypted Commitment: 0xe7f1725E... 🔒
   - NO ONE can see which candidate this is

3. **The Proof:**
   - Hash(Alice + YourCredential) = 0xe7f1725E... ✓
   - Only YOU can recreate this hash
   - This proves you voted for Alice without revealing it!

**Read the full explanation:** Open `ZKP_EXPLANATION.md` for detailed walkthrough with diagrams!

### Current Limitations (Demo Version)

- Uses simplified cryptography (not full ZK-SNARKs with Circom)
- No real identity verification (mock voter IDs)
- Single admin account
- Local blockchain only
- In-memory vote storage (not PostgreSQL database)

## Troubleshooting

### "Failed to create election"

**Solution**: 
1. Check that blockchain node is running (should see accounts in terminal)
2. Make sure you added at least 2 candidates
3. Verify backend is connected to blockchain

### "Cannot connect to blockchain"

**Solution**:
```powershell
# Terminal 1: Start blockchain
cd "c:\Users\omera\Desktop\Blockchain\blockchain"
npx hardhat node

# Terminal 2: Deploy contracts
cd "c:\Users\omera\Desktop\Blockchain\blockchain"
npx hardhat run scripts/deploy.js --network localhost
```

### "Backend not responding"

**Solution**:
```powershell
# Check if blockchain is running first, then:
cd "c:\Users\omera\Desktop\Blockchain\backend"
npm run dev
```

### "Frontend not loading"

**Solution**:
```powershell
cd "c:\Users\omera\Desktop\Blockchain\frontend"
npm run dev
```

### Restart Everything

**If things get stuck, restart all services:**

```powershell
# Kill all node processes
Get-Process node | Stop-Process -Force

# Then follow Step 1-5 from the start guide above
```

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│           Frontend (React + Vite)            │
│         http://localhost:5173                │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│      Backend API (Express + Node.js)         │
│         http://localhost:3000                │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│    Blockchain (Hardhat + Ethereum)           │
│         http://localhost:8545                │
│                                              │
│  Smart Contracts:                            │
│  - ElectionManager.sol                       │
│  - VoteCommitment.sol                        │
│  - TallyManager.sol                          │
└─────────────────────────────────────────────┘
```

## File Structure

```
Blockchain/
├── blockchain/         # Smart contracts & Hardhat
│   ├── contracts/     # Solidity contracts
│   ├── scripts/       # Deployment scripts
│   └── deployments.json
├── backend/           # Express API server
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   └── services/ # Blockchain & crypto
│   └── deployments.json
├── frontend/          # React application
│   ├── src/
│   │   ├── pages/    # UI pages
│   │   ├── components/
│   │   └── services/ # API client
│   └── deployments.json
└── package.json       # Root package
```

## Next Steps (Future Enhancements)

1. **Implement Full ZK-SNARKs** with Circom and SnarkJS
2. **Add PostgreSQL Database** for persistent storage
3. **Implement Redis** for session management
4. **Add Real Identity Verification** (OAuth, SSO)
5. **Deploy to Testnet** (Sepolia, Goerli)
6. **Add Mobile App** using React Native
7. **Implement Multi-Admin** with role-based access
8. **Add Email Notifications** for voters
9. **Implement Results Visualization** with charts
10. **Add Export to PDF** for audit reports

## Support

For issues or questions about this implementation:
- Check the code comments in each file
- Review the PRD: `prd_blockchain_electronic_voting_system.md`
- Examine smart contract events in blockchain terminal
- Use browser DevTools to debug frontend issues

---

**Built with ❤️ following the PRD specifications**

System Status: ✅ **RUNNING**
