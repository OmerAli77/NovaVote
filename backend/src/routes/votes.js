const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchain');
const zkpSystem = require('../services/zk-proof-system');
const { ethers } = require('ethers');

// In-memory storage for vote data (in production, use encrypted database)
const voteStore = new Map();

/**
 * Submit a vote with Zero-Knowledge Proof
 */
router.post('/submit', async (req, res) => {
  try {
    await blockchainService.ensureInitialized();

    const { 
      electionId, 
      candidateId, 
      voterSecret,
      voterIndex
    } = req.body;

    if (!electionId || candidateId === undefined || !voterSecret || voterIndex === undefined) {
      return res.status(400).json({
        error: 'Election ID, candidate ID, voter secret, and voter index are required'
      });
    }

    // Get election details to verify candidate validity
    const electionManager = blockchainService.getContract('electionManager');
    const election = await electionManager.getElection(electionId);
    
    const candidateCount = Number(election.candidateCount);
    
    if (candidateId < 0 || candidateId >= candidateCount) {
      return res.status(400).json({
        error: 'Invalid candidate ID'
      });
    }

    // Get Merkle root for voter verification
    const voteCommitment = blockchainService.getContract('voteCommitment');
    const merkleRoot = await voteCommitment.voterRegistryRoots(electionId);
    
    if (merkleRoot === ethers.ZeroHash) {
      return res.status(400).json({
        error: 'Voter registry not set for this election'
      });
    }

    console.log('Starting real ZK proof generation:', {
      electionId,
      candidateId,
      voterIndex
    });

    // Generate ZK Proof using real cryptography (Poseidon hash + Merkle proof)
    let zkProof;
    try {
      zkProof = await zkpSystem.generateVoteProof({
        electionId: electionId.toString(),
        voterSecret,
        candidateId,
        voterIndex: parseInt(voterIndex)
      });
      console.log('✓ Real ZK proof generated successfully');
    } catch (error) {
      console.error('ZK proof generation error:', error.message);
      return res.status(400).json({
        error: 'ZK proof generation failed',
        details: error.message
      });
    }

    // Extract public signals: [nullifierHash, merkleRoot, voteCommitment]
    const nullifierHash = zkProof.publicSignals[0];
    const voteCommitmentHash = zkProof.publicSignals[2];

    // Verify ZK Proof before submission
    console.log('Verifying ZK proof...');
    const isValid = zkpSystem.verifyVoteProof(
      electionId.toString(), 
      zkProof.proof, 
      zkProof.publicSignals
    );

    if (!isValid) {
      console.error('ZK proof verification failed');
      return res.status(400).json({
        error: 'ZK proof verification failed'
      });
    }
    console.log('✓ ZK proof verified');

    // Convert to bytes32 for blockchain
    const nullifierBytes32 = '0x' + BigInt(nullifierHash).toString(16).padStart(64, '0');
    const voteCommitmentBytes32 = '0x' + BigInt(voteCommitmentHash).toString(16).padStart(64, '0');
    
    // Create proof hash from the ZK proof data (hash of the proof components)
    const proofData = JSON.stringify({
      pi_a: zkProof.proof.pi_a,
      pi_b: zkProof.proof.pi_b,
      pi_c: zkProof.proof.pi_c,
      protocol: zkProof.proof.protocol
    });
    
    // Hash the proof to create a unique proof hash
    const crypto = require('crypto');
    const proofHashHex = crypto.createHash('sha256').update(proofData).digest('hex');
    const proofHashBytes32 = '0x' + proofHashHex.padStart(64, '0');

    console.log('Submitting to blockchain:', {
      electionId,
      nullifier: nullifierBytes32.substring(0, 16) + '...',
      voteCommitment: voteCommitmentBytes32.substring(0, 16) + '...',
      merkleRoot: merkleRoot.substring(0, 16) + '...'
    });

    // Submit to blockchain
    let receipt;
    try {
      const tx = await voteCommitment.submitVoteCommitment(
        electionId,
        nullifierBytes32,
        voteCommitmentBytes32,
        proofHashBytes32,
        merkleRoot
      );

      console.log('✓ Transaction sent:', tx.hash);
      receipt = await tx.wait();
      console.log('✓ Transaction confirmed in block:', receipt.blockNumber);
    } catch (blockchainError) {
      console.error('Blockchain transaction failed:', {
        error: blockchainError.message,
        reason: blockchainError.reason
      });
      
      return res.status(400).json({
        error: 'Blockchain verification failed',
        details: blockchainError.reason || blockchainError.message,
        hint: 'Check if Merkle root matches registered voters'
      });
    }

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

    // Store vote data (for tallying)
    const voteKey = `${electionId}-${nullifierHash}`;
    voteStore.set(voteKey, {
      electionId,
      candidateId,
      voteCommitment: voteCommitmentHash,
      nullifierHash: nullifierHash,
      proofHash: zkProof.proof.merkleProof[0] || '0',
      receiptHash,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      receiptHash,
      transactionHash: receipt.hash,
      zkProof: {
        nullifierHash: zkProof.nullifierHash,
        voteCommitment: zkProof.voteCommitment,
        merkleProof: zkProof.merkleProof
      },
      message: 'Vote submitted successfully with real ZK proof (Poseidon hash)'
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

    const { electionId, receiptHash } = req.body;

    if (!electionId || !receiptHash) {
      return res.status(400).json({
        error: 'Election ID and receipt hash are required'
      });
    }

    console.log('Verifying receipt:', {
      electionId,
      receiptHash: receiptHash.substring(0, 20) + '...'
    });

    const voteCommitment = blockchainService.getContract('voteCommitment');

    // Call the contract's verifyReceipt function
    const result = await voteCommitment.verifyReceipt(
      electionId,
      receiptHash
    );

    console.log('Verification result:', {
      exists: result.exists,
      hasEncryptedVote: result.encryptedVote !== '0x0000000000000000000000000000000000000000000000000000000000000000',
      timestamp: result.timestamp.toString()
    });

    res.json({
      verified: result.exists,
      encryptedVote: result.encryptedVote,
      nullifier: result.nullifier,
      proofHash: result.proofHash,
      timestamp: result.exists ? new Date(Number(result.timestamp) * 1000).toISOString() : null,
      message: result.exists ? 'Vote receipt verified on blockchain ✓' : 'Vote receipt not found'
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
