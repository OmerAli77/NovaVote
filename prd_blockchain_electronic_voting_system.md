# Product Requirements Document (PRD)

## Project Title
**NovaVote** – A Privacy-Preserving, Blockchain-Based Electronic Voting System

---

## 1. Purpose of This Document

This PRD is written **specifically to be fed into GitHub Copilot (Claude Sonnet)** to generate an efficient, production-grade implementation of a **novel blockchain-based electronic voting system**.

The document:
- Defines *what* to build, *why* it exists, and *how* it should be implemented
- Contains **explicit architectural novelty** beyond generic blockchain voting
- Specifies **frontend UI/UX expectations**, backend, smart contracts, and cryptography
- Includes **exact installation requirements** and **step-by-step implementation flow**
- Uses **clear, unambiguous instructions** optimized for AI-assisted coding

This is a **realistic academic + industry-grade project**, suitable for:
- Final year projects
- Research-backed prototypes
- Portfolio / system design interviews

---

## 2. Problem Statement

Traditional electronic voting systems suffer from:
- Centralized trust (single authority can manipulate results)
- Poor end-to-end verifiability for voters
- Weak transparency vs privacy trade-offs
- Low public trust due to unverifiable tallies

Existing blockchain voting systems often:
- Overexpose data (privacy leakage)
- Ignore usability and UI/UX
- Fail to scale realistically
- Lack architectural novelty

---

## 3. Core Idea & Novelty

### 3.1 Architectural Novelty

NovaVote introduces a **3-layer hybrid architecture**:

1. **Off-chain Vote Casting Layer** (UI + ZK Proof Generation)
2. **On-chain Commitment Layer** (Minimal blockchain writes)
3. **Decentralized Audit Layer** (Independent verifiers + public proofs)

### 3.2 Key Innovations

- **Vote-as-a-ZK-Commitment** (only cryptographic commitments stored on-chain)
- **Receipt-Based Voter Verification** without revealing vote choice
- **Ephemeral Voter Keys** (auto-expire after election)
- **Threshold Decryption** for final tally
- **Separation of Identity, Vote, and Verification** (no single layer can deanonymize voters)

---

## 4. Target Users

- **Voters** (non-technical, mobile-first)
- **Election Administrators**
- **Auditors / Observers**
- **Researchers / Verifiers**

---

## 5. Functional Requirements

### 5.1 Voter Flow

1. Secure login (mock national ID / university ID)
2. One-time cryptographic credential issued
3. Ballot rendered dynamically
4. Vote selected
5. Vote encrypted + ZK proof generated
6. Commitment submitted to blockchain
7. Receipt hash returned to voter
8. Voter can verify inclusion later

### 5.2 Admin Flow

- Create election
- Define candidates
- Set start/end time
- Monitor participation
- Trigger tally phase

### 5.3 Verification Flow

- Public audit dashboard
- Independent verification of:
  - Total votes
  - No double voting
  - Integrity of commitments

---

## 6. Non-Functional Requirements

- **Privacy**: No vote choice ever stored in plaintext
- **Transparency**: All commitments publicly verifiable
- **Scalability**: Minimal on-chain transactions
- **Usability**: Simple, clean UI (non-technical users)
- **Security**: Defense against double voting, replay attacks

---

## 7. Tech Stack (MANDATORY)

### 7.1 Frontend

- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Vite

### 7.2 Backend

- Node.js (v18+)
- Express.js
- PostgreSQL (voter registry, elections metadata)
- Redis (temporary session + rate limiting)

### 7.3 Blockchain Layer

- Ethereum (local Hardhat network)
- Solidity ^0.8.x
- Hardhat
- Ethers.js

### 7.4 Cryptography

- Circom (ZK circuits)
- SnarkJS
- Poseidon hash
- Elliptic curve signatures

---

## 8. Smart Contract Design

### Contracts

1. **ElectionManager.sol**
   - Create elections
   - Store metadata

2. **VoteCommitment.sol**
   - Accept vote commitments
   - Enforce one-vote-per-credential

3. **TallyManager.sol**
   - Accept threshold decryption shares
   - Publish final result

Constraints:
- No voter identity on-chain
- No plaintext vote on-chain

---

## 9. UI / UX Requirements

### Design Language

- Dark theme
- Neutral colors + subtle accent (blue/purple)
- High contrast
- Mobile-first

### Pages

- Landing Page
- Login Page
- Voting Page
- Receipt Verification Page
- Admin Dashboard
- Public Audit Dashboard

UX Rules:
- Max 2 clicks per critical action
- Clear progress indicators
- Zero blockchain jargon visible to voters

---

## 10. Installation Requirements

### System Requirements

- Node.js >= 18
- npm >= 9
- Docker (optional but recommended)
- Git

### Install Dependencies

```bash
npm install -g hardhat
npm install -g circom
```

---

## 11. Step-by-Step Implementation Plan

### Phase 1: Project Setup

1. Initialize monorepo
2. Setup frontend with Vite + React + Tailwind
3. Setup backend Express server
4. Setup Hardhat Ethereum environment

### Phase 2: Smart Contracts

1. Write ElectionManager.sol
2. Write VoteCommitment.sol
3. Write TallyManager.sol
4. Add tests using Hardhat + Chai

### Phase 3: Cryptography

1. Design vote ZK circuit in Circom
2. Compile circuit
3. Generate proving & verification keys
4. Integrate SnarkJS in backend

### Phase 4: Backend Logic

1. Voter authentication mock
2. Credential issuance
3. Vote proof verification
4. Blockchain submission

### Phase 5: Frontend Integration

1. Wallet abstraction (no MetaMask required)
2. Vote UI
3. Receipt display
4. Verification page

### Phase 6: Admin & Audit

1. Admin dashboard
2. Election lifecycle management
3. Public audit interface

### Phase 7: Testing & Hardening

- Unit tests
- ZK proof verification tests
- Security edge cases

---

## 12. Explicit Copilot / Claude Prompt

**Use the following prompt inside GitHub Copilot Chat:**

> You are building a production-grade blockchain-based electronic voting system following this PRD. Follow the architecture strictly. Prioritize security, privacy, clean UI, and minimal on-chain data. Implement step by step. Do not simplify cryptographic logic. Comment code clearly.

---

## 13. Success Criteria

- Voter can verify vote inclusion without revealing choice
- No duplicate votes possible
- All votes auditable publicly
- Clean, usable UI
- Complete end-to-end demo on local blockchain

---

## 14. Future Extensions

- Post-quantum cryptography
- Mobile app
- National ID integration
- Layer-2 deployment

---

## End of PRD

