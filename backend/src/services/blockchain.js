const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Connect to local Hardhat node
      const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      // Get signer (using first account from Hardhat)
      const accounts = await this.provider.listAccounts();
      if (accounts.length === 0) {
        throw new Error('No accounts available');
      }
      this.signer = await this.provider.getSigner(0);

      // Load contract addresses
      const deploymentsPath = path.join(__dirname, '..', '..', 'deployments.json');
      if (!fs.existsSync(deploymentsPath)) {
        throw new Error('Deployments file not found. Please deploy contracts first.');
      }

      const deployments = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));

      // Load contract ABIs
      const artifactsPath = path.join(__dirname, '..', '..', '..', 'blockchain', 'artifacts', 'contracts');

      const electionManagerArtifact = require(path.join(artifactsPath, 'ElectionManager.sol', 'ElectionManager.json'));
      const voteCommitmentArtifact = require(path.join(artifactsPath, 'VoteCommitment.sol', 'VoteCommitment.json'));
      const tallyManagerArtifact = require(path.join(artifactsPath, 'TallyManager.sol', 'TallyManager.json'));

      // Initialize contracts
      this.contracts.electionManager = new ethers.Contract(
        deployments.contracts.ElectionManager,
        electionManagerArtifact.abi,
        this.signer
      );

      this.contracts.voteCommitment = new ethers.Contract(
        deployments.contracts.VoteCommitment,
        voteCommitmentArtifact.abi,
        this.signer
      );

      this.contracts.tallyManager = new ethers.Contract(
        deployments.contracts.TallyManager,
        tallyManagerArtifact.abi,
        this.signer
      );

      this.initialized = true;
      console.log('✅ Blockchain service initialized');
      console.log('📋 ElectionManager:', deployments.contracts.ElectionManager);
      console.log('🗳️  VoteCommitment:', deployments.contracts.VoteCommitment);
      console.log('📊 TallyManager:', deployments.contracts.TallyManager);
    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error.message);
      throw error;
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  getContract(name) {
    if (!this.initialized) {
      throw new Error('Blockchain service not initialized');
    }
    return this.contracts[name];
  }

  getProvider() {
    return this.provider;
  }

  getSigner() {
    return this.signer;
  }
}

// Singleton instance
const blockchainService = new BlockchainService();

module.exports = blockchainService;
