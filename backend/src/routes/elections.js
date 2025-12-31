const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');
const zkpSystem = require('../services/zk-proof-system');
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
        error: 'Missing required fields',
        details: 'Title, start time, end time, and at least one candidate are required'
      });
    }

    if (candidates.length < 2) {
      return res.status(400).json({
        error: 'Not enough candidates',
        details: 'At least 2 candidates are required for an election'
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
    
    let errorMessage = 'Failed to create election';
    let errorDetails = error.message;
    
    // Provide specific error messages
    if (error.message.includes('network')) {
      errorMessage = 'Blockchain connection error';
      errorDetails = 'Make sure the Hardhat node is running';
    } else if (error.message.includes('contract')) {
      errorMessage = 'Smart contract error';
      errorDetails = 'Contracts may not be deployed. Run deployment script.';
    } else if (error.code === 'CALL_EXCEPTION') {
      errorMessage = 'Transaction failed';
      errorDetails = error.reason || 'Smart contract rejected the transaction';
    }
    
    res.status(500).json({
      error: errorMessage,
      details: errorDetails,
      hint: 'Check that blockchain node is running and contracts are deployed'
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
 * Creates Merkle tree of eligible voters using Poseidon hash
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

    // Check if voters are already registered on blockchain
    const electionManager = blockchainService.getContract('electionManager');
    const voteCommitment = blockchainService.getContract('voteCommitment');
    
    try {
      const existingRoot = await voteCommitment.voterRegistryRoots(electionId);
      if (existingRoot !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        return res.status(400).json({
          error: 'Voters already registered for this election',
          message: 'Cannot re-register voters. Voter registry is immutable once set.',
          merkleRoot: existingRoot
        });
      }
    } catch (error) {
      console.error('Error checking existing registry:', error);
    }

    // Register voters using real ZKP system (Poseidon hash + Merkle tree)
    const result = await zkpSystem.registerVoters(electionId, voterIds);

    // Set voter registry on blockchain via ElectionManager
    
    // Convert Merkle root from decimal to bytes32 hex format
    const merkleRootBigInt = BigInt(result.merkleRoot);
    const merkleRootHex = '0x' + merkleRootBigInt.toString(16).padStart(64, '0');
    
    const tx = await electionManager.registerVoters(electionId, merkleRootHex);
    const receipt = await tx.wait();

    // Return voter secrets (in production, send securely via email/secure channel)
    const voterData = result.voters.map((voter, idx) => ({
      voterId: voter.voterId,
      voterSecret: voter.secret,  // ⚠️ CRITICAL: In production, send this privately to each voter
      commitment: voter.commitment,
      voterIndex: idx
    }));

    res.json({
      success: true,
      merkleRoot: result.merkleRoot,
      transactionHash: receipt.hash,
      votersRegistered: voterIds.length,
      voterData: voterData,  // ⚠️ In production, distribute these securely!
      message: `Successfully registered ${voterIds.length} voters with Poseidon Merkle tree`
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
    const { voterSecret } = req.body;

    if (!voterSecret) {
      return res.status(400).json({
        error: 'Voter secret is required'
      });
    }

    // Get Merkle tree data for this election
    const voters = zkpSystem.voterRegistries.get(electionId.toString());
    const merkleTree = zkpSystem.merkleTrees.get(electionId.toString());
    
    if (!voters || !merkleTree) {
      return res.status(400).json({
        error: 'Voter not registered for this election'
      });
    }

    // Find voter by secret
    const voterIndex = voters.findIndex(v => v.secret === voterSecret);

    if (voterIndex === -1) {
      return res.status(400).json({
        error: 'Invalid voter secret'
      });
    }

    // Get Merkle proof
    const merkleProof = zkpSystem.getMerkleProof(merkleTree, voterIndex);
    const voter = voters[voterIndex];

    res.json({
      merkleProof,
      merkleRoot: merkleTree.root,
      voterIndex: voterIndex,
      commitment: voter.commitment
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
