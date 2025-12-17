const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const cryptoService = require('../services/crypto');

// In-memory storage for demo (in production, use a database)
const voters = new Map();
const sessions = new Map();

/**
 * Mock voter login
 */
router.post('/login', async (req, res) => {
  try {
    const { voterId, electionId } = req.body;

    if (!voterId || !electionId) {
      return res.status(400).json({
        error: 'Voter ID and Election ID are required'
      });
    }

    // Check if voter already has a credential for this election
    const existingKey = `${voterId}-${electionId}`;
    if (voters.has(existingKey)) {
      return res.status(400).json({
        error: 'Credential already issued for this voter in this election'
      });
    }

    // Generate credential
    const credential = cryptoService.generateCredentialHash(voterId, electionId);
    const credentialHash = cryptoService.stringToBytes32(credential);

    // Store voter info
    voters.set(existingKey, {
      voterId,
      electionId,
      credential,
      credentialHash,
      issuedAt: new Date().toISOString(),
      hasVoted: false
    });

    // Create session
    const sessionId = uuidv4();
    sessions.set(sessionId, {
      voterId,
      electionId,
      credential,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    });

    res.json({
      success: true,
      sessionId,
      credential,
      credentialHash,
      message: 'Credential issued successfully'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Failed to issue credential'
    });
  }
});

/**
 * Verify session
 */
router.post('/verify', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Session ID is required'
      });
    }

    const session = sessions.get(sessionId);

    if (!session) {
      return res.status(401).json({
        error: 'Invalid session'
      });
    }

    // Check if session expired
    if (new Date(session.expiresAt) < new Date()) {
      sessions.delete(sessionId);
      return res.status(401).json({
        error: 'Session expired'
      });
    }

    res.json({
      valid: true,
      voterId: session.voterId,
      electionId: session.electionId,
      credential: session.credential
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      error: 'Failed to verify session'
    });
  }
});

/**
 * Logout (invalidate session)
 */
router.post('/logout', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (sessionId && sessions.has(sessionId)) {
      sessions.delete(sessionId);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Failed to logout'
    });
  }
});

/**
 * Get voter info
 */
router.get('/voter/:voterId/:electionId', async (req, res) => {
  try {
    const { voterId, electionId } = req.params;
    const key = `${voterId}-${electionId}`;

    const voter = voters.get(key);

    if (!voter) {
      return res.status(404).json({
        error: 'Voter not found'
      });
    }

    res.json({
      voterId: voter.voterId,
      electionId: voter.electionId,
      credentialHash: voter.credentialHash,
      hasVoted: voter.hasVoted,
      issuedAt: voter.issuedAt
    });
  } catch (error) {
    console.error('Get voter error:', error);
    res.status(500).json({
      error: 'Failed to get voter info'
    });
  }
});

module.exports = router;
