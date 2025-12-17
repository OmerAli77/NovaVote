const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');
const cryptoService = require('../services/crypto');
const { ethers } = require('ethers');

// In-memory storage for vote data (in production, use encrypted database)
const voteStore = new Map();

/**
 * Submit a vote
 */
router.post('/submit', async (req, res) => {
  try {
    await blockchainService.ensureInitialized();

    const { electionId, candidateId, credential } = req.body;

    if (!electionId || candidateId === undefined || !credential) {
      return res.status(400).json({
        error: 'Election ID, candidate ID, and credential are required'
      });
    }

    // Generate vote hash and proof
    const voteHash = cryptoService.generateVoteHash(candidateId, credential);
    const proofHash = cryptoService.generateProofHash(voteHash, credential);

    // Verify proof (simplified)
    if (!cryptoService.verifyProof(proofHash)) {
      return res.status(400).json({
        error: 'Invalid proof'
      });
    }

    // Convert to bytes32
    const credentialHash = cryptoService.stringToBytes32(credential);
    const voteHashBytes32 = '0x' + voteHash;
    const proofHashBytes32 = '0x' + proofHash;

    // Submit to blockchain
    const voteCommitment = blockchainService.getContract('voteCommitment');

    const tx = await voteCommitment.submitVoteCommitment(
      electionId,
      credentialHash,
      voteHashBytes32,
      proofHashBytes32
    );

    const receipt = await tx.wait();

    // Get receipt hash from event
    const event = receipt.logs.find(log => {
      try {
        return voteCommitment.interface.parseLog(log).name === 'VoteCommitted';
      } catch {
        return false;
      }
    });

    const parsedEvent = voteCommitment.interface.parseLog(event);
    const receiptHash = parsedEvent.args.receiptHash;

    // Store vote data encrypted (for tallying)
    const voteKey = `${electionId}-${credential}`;
    voteStore.set(voteKey, {
      electionId,
      candidateId,
      voteHash,
      proofHash,
      receiptHash,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      receiptHash,
      transactionHash: receipt.hash,
      message: 'Vote submitted successfully'
    });
  } catch (error) {
    console.error('Submit vote error:', error);
    res.status(500).json({
      error: 'Failed to submit vote',
      details: error.message
    });
  }
});

/**
 * Verify vote receipt
 */
router.post('/verify', async (req, res) => {
  try {
    await blockchainService.ensureInitialized();

    const { electionId, credential } = req.body;

    if (!electionId || !credential) {
      return res.status(400).json({
        error: 'Election ID and credential are required'
      });
    }

    const credentialHash = cryptoService.stringToBytes32(credential);
    const voteCommitment = blockchainService.getContract('voteCommitment');

    const result = await voteCommitment.verifyVoteCommitment(
      electionId,
      credentialHash
    );

    res.json({
      verified: result.exists,
      timestamp: result.exists ? new Date(Number(result.timestamp) * 1000).toISOString() : null,
      message: result.exists ? 'Vote found on blockchain' : 'Vote not found'
    });
  } catch (error) {
    console.error('Verify vote error:', error);
    res.status(500).json({
      error: 'Failed to verify vote',
      details: error.message
    });
  }
});

/**
 * Get vote count for an election
 */
router.get('/:electionId/count', async (req, res) => {
  try {
    await blockchainService.ensureInitialized();

    const { electionId } = req.params;
    const voteCommitment = blockchainService.getContract('voteCommitment');

    const count = await voteCommitment.getVoteCount(electionId);

    res.json({
      electionId,
      voteCount: count.toString()
    });
  } catch (error) {
    console.error('Get vote count error:', error);
    res.status(500).json({
      error: 'Failed to get vote count',
      details: error.message
    });
  }
});

/**
 * Tally votes for an election
 */
router.post('/:electionId/tally', async (req, res) => {
  try {
    await blockchainService.ensureInitialized();

    const { electionId } = req.params;

    // Count votes from voteStore
    const voteCounts = new Map();

    for (const [key, vote] of voteStore.entries()) {
      if (vote.electionId === electionId) {
        const candidateId = vote.candidateId;
        voteCounts.set(candidateId, (voteCounts.get(candidateId) || 0) + 1);
      }
    }

    // Initialize tally on blockchain
    const tallyManager = blockchainService.getContract('tallyManager');

    const initTx = await tallyManager.initiateTally(electionId);
    await initTx.wait();

    // Submit decryption share
    const shareTx = await tallyManager.submitDecryptionShare(electionId);
    await shareTx.wait();

    // Record candidate votes
    for (const [candidateId, count] of voteCounts.entries()) {
      const recordTx = await tallyManager.recordCandidateVotes(
        electionId,
        candidateId,
        count
      );
      await recordTx.wait();
    }

    // Finalize tally
    const finalizeTx = await tallyManager.finalizeTally(electionId);
    const receipt = await finalizeTx.wait();

    // Mark election as tallied
    const electionManager = blockchainService.getContract('electionManager');
    const markTx = await electionManager.markAsTallied(electionId);
    await markTx.wait();

    res.json({
      success: true,
      electionId,
      results: Array.from(voteCounts.entries()).map(([candidateId, count]) => ({
        candidateId,
        voteCount: count
      })),
      transactionHash: receipt.hash,
      message: 'Tally completed successfully'
    });
  } catch (error) {
    console.error('Tally error:', error);
    res.status(500).json({
      error: 'Failed to tally votes',
      details: error.message
    });
  }
});

/**
 * Get tally results
 */
router.get('/:electionId/results', async (req, res) => {
  try {
    await blockchainService.ensureInitialized();

    const { electionId } = req.params;

    const tallyManager = blockchainService.getContract('tallyManager');
    const electionManager = blockchainService.getContract('electionManager');

    // Check if tally exists
    const tallyInfo = await tallyManager.getTallyInfo(electionId);

    if (!tallyInfo.finalized) {
      return res.status(400).json({
        error: 'Tally not finalized yet'
      });
    }

    // Get election info to know candidate count
    const election = await electionManager.getElection(electionId);
    const candidateCount = Number(election.candidateCount);

    // Get results for each candidate
    const results = [];
    for (let i = 0; i < candidateCount; i++) {
      const candidate = await electionManager.getCandidate(electionId, i);
      const votes = await tallyManager.getCandidateVotes(electionId, i);

      results.push({
        candidateId: i,
        candidateName: candidate,
        voteCount: votes.toString()
      });
    }

    res.json({
      electionId,
      totalVotes: tallyInfo.totalVotes.toString(),
      finalized: tallyInfo.finalized,
      timestamp: new Date(Number(tallyInfo.timestamp) * 1000).toISOString(),
      results
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({
      error: 'Failed to get results',
      details: error.message
    });
  }
});

module.exports = router;
