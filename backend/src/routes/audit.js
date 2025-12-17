const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');

/**
 * Get audit trail for an election
 */
router.get('/:electionId/trail', async (req, res) => {
  try {
    await blockchainService.ensureInitialized();

    const { electionId } = req.params;
    const voteCommitment = blockchainService.getContract('voteCommitment');

    // Get vote count first
    const voteCount = await voteCommitment.getVoteCount(electionId);

    // Get all VoteCommitted events for this election
    const filter = voteCommitment.filters.VoteCommitted(electionId);
    const events = await voteCommitment.queryFilter(filter);

    // Get detailed commitment data from events
    const detailedCommitments = [];
    for (const event of events) {
      const credHash = event.args.voterCredentialHash;
      const commitment = await voteCommitment.getCommitment(electionId, credHash);
      
      detailedCommitments.push({
        credentialHash: credHash,
        voteHash: commitment.voteHash,
        proofHash: commitment.proofHash,
        timestamp: commitment.timestamp.toString(),
        exists: commitment.exists
      });
    }

    res.json({
      electionId,
      totalCommitments: detailedCommitments.length,
      voteCount: voteCount.toString(),
      commitments: detailedCommitments
    });
  } catch (error) {
    console.error('Get audit trail error:', error);
    res.status(500).json({
      error: 'Failed to get audit trail',
      details: error.message
    });
  }
});

/**
 * Verify election integrity
 */
router.get('/:electionId/verify', async (req, res) => {
  try {
    await blockchainService.ensureInitialized();

    const { electionId } = req.params;

    const voteCommitment = blockchainService.getContract('voteCommitment');
    const electionManager = blockchainService.getContract('electionManager');

    // Get election info
    const election = await electionManager.getElection(electionId);

    // Get vote count
    const voteCount = await voteCommitment.getVoteCount(electionId);

    // Get commitments
    const commitments = await voteCommitment.getElectionCommitments(electionId);

    // Verify integrity
    const integrity = {
      electionId,
      electionTitle: election.title,
      status: ['Created', 'Active', 'Ended', 'Tallied'][election.status],
      voteCount: voteCount.toString(),
      commitmentCount: commitments.length,
      integrity: voteCount.toString() === commitments.length.toString(),
      message: voteCount.toString() === commitments.length.toString() 
        ? 'Election integrity verified' 
        : 'Integrity check failed: vote count mismatch'
    };

    res.json(integrity);
  } catch (error) {
    console.error('Verify integrity error:', error);
    res.status(500).json({
      error: 'Failed to verify integrity',
      details: error.message
    });
  }
});

/**
 * Get public statistics
 */
router.get('/:electionId/stats', async (req, res) => {
  try {
    await blockchainService.ensureInitialized();

    const { electionId } = req.params;

    const voteCommitment = blockchainService.getContract('voteCommitment');
    const electionManager = blockchainService.getContract('electionManager');
    const tallyManager = blockchainService.getContract('tallyManager');

    // Get election info
    const election = await electionManager.getElection(electionId);

    // Get vote count
    const voteCount = await voteCommitment.getVoteCount(electionId);

    // Try to get tally info
    let tallyInfo = null;
    try {
      tallyInfo = await tallyManager.getTallyInfo(electionId);
    } catch {
      // Tally not initiated yet
    }

    res.json({
      electionId,
      title: election.title,
      description: election.description,
      status: ['Created', 'Active', 'Ended', 'Tallied'][election.status],
      startTime: new Date(Number(election.startTime) * 1000).toISOString(),
      endTime: new Date(Number(election.endTime) * 1000).toISOString(),
      candidateCount: election.candidateCount.toString(),
      voteCount: voteCount.toString(),
      tallyFinalized: tallyInfo ? tallyInfo.finalized : false
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      error: 'Failed to get statistics',
      details: error.message
    });
  }
});

module.exports = router;
