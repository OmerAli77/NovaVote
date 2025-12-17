# NovaVote - Blockchain-Based Electronic Voting System

A privacy-preserving, blockchain-based electronic voting system with zero-knowledge proofs.

## Features

- **Privacy-First**: Vote choices encrypted with zero-knowledge proofs
- **Transparent & Verifiable**: Public audit trail without exposing votes
- **Secure**: Prevents double voting and tampering
- **User-Friendly**: Clean UI designed for non-technical users
- **Decentralized**: Built on Ethereum blockchain

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, PostgreSQL, Redis
- **Blockchain**: Ethereum (Hardhat), Solidity, Ethers.js
- **Cryptography**: Circom, SnarkJS, Poseidon hash

## Prerequisites

- Node.js >= 18
- npm >= 9
- PostgreSQL
- Redis (optional)

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   npm run install:all
   ```

2. **Start blockchain node**:
   ```bash
   npm run blockchain
   ```

3. **Deploy contracts** (in new terminal):
   ```bash
   npm run deploy
   ```

4. **Start backend** (in new terminal):
   ```bash
   npm run backend
   ```

5. **Start frontend** (in new terminal):
   ```bash
   npm run frontend
   ```

6. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Project Structure

```
novavote/
├── frontend/          # React frontend
├── backend/           # Express backend
├── blockchain/        # Smart contracts & Hardhat config
└── package.json       # Root package
```

## Architecture

NovaVote uses a 3-layer hybrid architecture:

1. **Off-chain Vote Casting Layer**: UI + ZK Proof Generation
2. **On-chain Commitment Layer**: Minimal blockchain writes
3. **Decentralized Audit Layer**: Independent verification

## License

MIT
