const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');
const zkpService = require('../services/zkp');
const { ethers } = require('ethers');
const { isLocalhost, checkAdminAccess } = require('../middleware/adminAccess');

/**
 * Create a new election (ADMIN ONLY - localhost access required)
 */
router.post('/create', isLocalhost, async (req, res) => {
  try {
    await blockchainService.ensureInitialized();

    const { title, description, startTime, endTime, candidates } = req.body;

    if (!title || !startTime || !endTime || !candidates || candidates.length === 0) {
      return res.status(400).json({
        error: 'Title, start time, end time, and candidates are required'
      });
    }

    const electionManager = blockchainService.getContract('electionManager');

    // Create election
    const tx = await electionManager.createElection(
      title,
      description || '',
      Math.floor(new Date(startTime).getTime() / 1000),
      Math.floor(new Date(endTime).getTime() / 1000)
    );

    const receipt = await tx.wait();

    // Get election ID from event
    const event = receipt.logs.find(log => {
      try {
        return electionManager.interface.parseLog(log).name === 'ElectionCreated';
      } catch {
        return false;
      }
    });

    const parsedEvent = electionManager.interface.parseLog(event);
    const electionId = parsedEvent.args.electionId;

    // Add candidates
    for (const candidate of candidates) {
      const addTx = await electionManager.addCandidate(electionId, candidate);
      await addTx.wait();
    }

    res.json({
      success: true,
      electionId: electionId.toString(),
      transactionHash: receipt.hash,
      message: 'Election created successfully'
    });
  } catch (error) {
    console.error('Create election error:', error);
    res.status(500).json({
      error: 'Failed to create election',
      details: error.message
    });
  }
});

/**
 * Get election details
 */
router.get('/:electionId', async (req, res) => {
  try {
    await blockchainService.ensureInitialized();

    const { electionId } = req.params;
    const electionManager = blockchainService.getContract('electionManager');

    const election = await electionManager.getElection(electionId);

    // Get candidates
    const candidateCount = Number(election.candidateCount);
    const candidates = [];

    for (let i = 0; i < candidateCount; i++) {
      const candidate = await electionManager.getCandidate(electionId, i);
      candidates.push({
        id: i,
        name: candidate
      });
    }

    res.json({
      id: election.id.toString(),
      title: election.title,
      description: election.description,
      startTime: new Date(Number(election.startTime) * 1000).toISOString(),
      endTime: new Date(Number(election.endTime) * 1000).toISOString(),
      status: ['Created', 'Active', 'Ended', 'Tallied'][election.status],
      creator: election.creator,
      candidates
    });
  } catch (error) {
    console.error('Get election error:', error);
    res.status(500).json({
      error: 'Failed to get election',
      details: error.message
    });
  }
});

/**
 * Get all elections
 */
router.get('/', async (req, res) => {
  try {
    await blockchainService.ensureInitialized();

    const electionManager = blockchainService.getContract('electionManager');
    const count = await electionManager.getElectionCount();

    const elections = [];

    for (let i = 1; i <= Number(count); i++) {
      try {
        const election = await electionManager.getElection(i);
        elections.push({
          id: election.id.toString(),
          title: election.title,
          description: election.description,
          startTime: new Date(Number(election.startTime) * 1000).toISOString(),
          endTime: new Date(Number(election.endTime) * 1000).toISOString(),
          status: ['Created', 'Active', 'Ended', 'Tallied'][election.status]
        });
      } catch (err) {
        console.error(`Error fetching election ${i}:`, err.message);
      }
    }

    res.json(elections);
  } catch (error) {
    console.error('Get elections error:', error);
    res.status(500).json({
      error: 'Failed to get elections',
      details: error.message
    });
  }
});

/**
 * Start an election (ADMIN ONLY - localhost access required)
 */
router.post('/:electionId/start', isLocalhost, async (req, res) => {
  try {
    await blockchainService.ensureInitialized();

    const { electionId } = req.params;
    const electionManager = blockchainService.getContract('electionManager');

    const tx = await electionManager.startElection(electionId);
    const receipt = await tx.wait();

    res.json({
      success: true,
      transactionHash: receipt.hash,
      message: 'Election started successfully'
    });
  } catch (error) {
    console.error('Start election error:', error);
    res.status(500).json({
      error: 'Failed to start election',
      details: error.message
    });
  }
});

/**
 * End an election (ADMIN ONLY - localhost access required)
 */
router.post('/:electionId/end', isLocalhost, async (req, res) => {
  try {
    await blockchainService.ensureInitialized();

    const { electionId } = req.params;
    const electionManager = blockchainService.getContract('electionManager');

    const tx = await electionManager.endElection(electionId);
    const receipt = await tx.wait();

    res.json({
      success: true,
      transactionHash: receipt.hash,
      message: 'Election ended successfully'
    });
  } catch (error) {
    console.error('End election error:', error);
    res.status(500).json({
      error: 'Failed to end election',
      details: error.message
    });
  }
});

/**
 * Register voters for an election (ADMIN ONLY - localhost access required)
 * Creates Merkle tree of eligible voters
 */
router.post('/:electionId/register-voters', isLocalhost, async (req, res) => {
  try {
    await blockchainService.ensureInitialized();

    const { electionId } = req.params;
    const { voterIds } = req.body;

    if (!voterIds || !Array.isArray(voterIds) || voterIds.length === 0) {
      return res.status(400).json({
        error: 'Voter IDs array is required'
      });
    }

    // Generate credentials for all voters
    const voterCredentials = voterIds.map(voterId => 
      zkpService.generateVoterCredential(voterId, electionId)
    );

    // Build Merkle tree and register voters
    const merkleRoot = zkpService.registerVoters(electionId, voterCredentials);

    // Set voter registry on blockchain
    const voteCommitment = blockchainService.getContract('voteCommitment');
    const merkleRootBytes32 = '0x' + merkleRoot;
    
    const tx = await voteCommitment.setVoterRegistry(electionId, merkleRootBytes32);
    const receipt = await tx.wait();

    // Return credentials to voters (in production, send securely via email/secure channel)
    const voterData = voterCredentials.map(vc => ({
      voterId: vc.voterId,
      credential: vc.credential,
      secret: vc.secret  // ⚠️ CRITICAL: In production, send this privately to each voter
    }));

    res.json({
      success: true,
      merkleRoot,
      transactionHash: receipt.hash,
      votersRegistered: voterIds.length,
      voterCredentials: voterData,  // ⚠️ In production, distribute these securely!
      message: 'Voters registered successfully with ZK credentials'
    });
  } catch (error) {
    console.error('Register voters error:', error);
    res.status(500).json({
      error: 'Failed to register voters',
      details: error.message
    });
  }
});

/**
 * Get voter credential and Merkle proof (for voting)
 */
router.post('/:electionId/get-voter-proof', async (req, res) => {
  try {
    await blockchainService.ensureInitialized();

    const { electionId } = req.params;
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        error: 'Credential is required'
      });
    }

    // Get Merkle proof for voter
    const merkleProof = zkpService.getVoterMerkleProof(electionId, credential);
    const merkleRoot = zkpService.getMerkleRoot(electionId);

    res.json({
      merkleProof,
      merkleRoot
    });
  } catch (error) {
    console.error('Get voter proof error:', error);
    res.status(500).json({
      error: 'Failed to get voter proof',
      details: error.message
    });
  }
});

module.exports = router;
