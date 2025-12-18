const CryptoJS = require('crypto-js');
const fs = require('fs');
const path = require('path');

/**
 * Zero-Knowledge Proof Service
 * Implements ZKP components for anonymous voting:
 * - Nullifiers (prevent double voting)
 * - Merkle tree membership proofs (prove voter eligibility)
 * - Vote commitments (encrypted votes with validity proofs)
 */
class ZKPService {
  constructor() {
    // Merkle tree for voter registry
    this.voterTrees = new Map(); // electionId => Merkle tree
    this.nullifiers = new Map(); // electionId => Set of used nullifiers
    this.voterRegistry = new Map(); // electionId => Map(credential => voterData)
    this.dataFile = path.join(__dirname, '..', '..', 'voter-registry.json');
    
    // Load persisted data
    this.loadRegistry();
  }

  /**
   * Load voter registry from disk
   */
  loadRegistry() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
        
        // Restore voter trees
        if (data.voterTrees) {
          this.voterTrees = new Map(Object.entries(data.voterTrees));
        }
        
        // Restore voter registry
        if (data.voterRegistry) {
          Object.entries(data.voterRegistry).forEach(([electionId, voters]) => {
            const voterMap = new Map(Object.entries(voters));
            this.voterRegistry.set(electionId, voterMap);
          });
        }
        
        console.log('✓ Voter registry loaded from disk');
      }
    } catch (error) {
      console.error('Failed to load voter registry:', error.message);
    }
  }

  /**
   * Save voter registry to disk
   */
  saveRegistry() {
    try {
      const data = {
        voterTrees: Object.fromEntries(this.voterTrees),
        voterRegistry: {}
      };
      
      // Convert voter registry Maps to objects
      this.voterRegistry.forEach((voterMap, electionId) => {
        data.voterRegistry[electionId] = Object.fromEntries(voterMap);
      });
      
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
      console.log('✓ Voter registry saved to disk');
    } catch (error) {
      console.error('Failed to save voter registry:', error.message);
    }
  }

  /**
   * 1️⃣ VOTER REGISTRATION - Generate voter credential
   * Creates cryptographic credential that proves eligibility without revealing identity
   * 
   * @param {string} voterId - Unique voter identifier
   * @param {string} electionId - Election ID
   * @returns {Object} { credential, secret, leafHash }
   */
  generateVoterCredential(voterId, electionId) {
    // Generate voter secret (never shared, only known to voter)
    const secret = CryptoJS.SHA256(`${voterId}-secret-${Date.now()}`).toString();
    
    // Generate public credential (hash of secret + voterId)
    const credential = CryptoJS.SHA256(`${secret}-${voterId}`).toString();
    
    // Generate Merkle tree leaf (hash of credential)
    const leafHash = CryptoJS.SHA256(`leaf-${credential}`).toString();
    
    return {
      credential,
      secret,
      leafHash,
      voterId
    };
  }

  /**
   * Build Merkle tree from voter credentials
   * Tree proves voter is in registered set without revealing which voter
   * 
   * @param {Array} leafHashes - Array of voter leaf hashes
   * @returns {Object} { root, tree, leaves }
   */
  buildMerkleTree(leafHashes) {
    if (!leafHashes || leafHashes.length === 0) {
      throw new Error('Cannot build Merkle tree with no leaves');
    }

    let currentLevel = [...leafHashes];
    const tree = [currentLevel];

    // Build tree bottom-up
    while (currentLevel.length > 1) {
      const nextLevel = [];
      
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length 
          ? currentLevel[i + 1] 
          : currentLevel[i]; // Duplicate if odd number
        
        const parent = CryptoJS.SHA256(`${left}${right}`).toString();
        nextLevel.push(parent);
      }
      
      tree.push(nextLevel);
      currentLevel = nextLevel;
    }

    return {
      root: currentLevel[0],
      tree,
      leaves: leafHashes
    };
  }

  /**
   * Generate Merkle proof for voter eligibility
   * Proves voter is in tree without revealing which leaf
   * 
   * @param {Array} tree - Merkle tree
   * @param {number} leafIndex - Index of voter's leaf
   * @returns {Array} Merkle proof path
   */
  getMerkleProof(tree, leafIndex) {
    const proof = [];
    let index = leafIndex;

    for (let level = 0; level < tree.length - 1; level++) {
      const currentLevel = tree[level];
      const isRightNode = index % 2 === 1;
      
      const siblingIndex = isRightNode ? index - 1 : index + 1;
      
      if (siblingIndex < currentLevel.length) {
        proof.push({
          hash: currentLevel[siblingIndex],
          position: isRightNode ? 'left' : 'right'
        });
      }
      
      index = Math.floor(index / 2);
    }

    return proof;
  }

  /**
   * Verify Merkle proof
   * 
   * @param {string} leaf - Leaf hash to verify
   * @param {Array} proof - Merkle proof
   * @param {string} root - Merkle root
   * @returns {boolean} True if proof is valid
   */
  verifyMerkleProof(leaf, proof, root) {
    // If proof is empty and leaf equals root, this is valid (single voter case)
    if (!proof || proof.length === 0) {
      return leaf === root;
    }

    let computedHash = leaf;

    for (const { hash, position } of proof) {
      if (position === 'left') {
        computedHash = CryptoJS.SHA256(`${hash}${computedHash}`).toString();
      } else {
        computedHash = CryptoJS.SHA256(`${computedHash}${hash}`).toString();
      }
    }

    console.log('Merkle verification:', {
      leaf: leaf.substring(0, 16) + '...',
      computedRoot: computedHash.substring(0, 16) + '...',
      expectedRoot: root.substring(0, 16) + '...',
      match: computedHash === root
    });

    return computedHash === root;
  }

  /**
   * 3️⃣ NULLIFIER GENERATION - Prevent double voting
   * Generates deterministic nullifier from voter secret
   * Same voter = same nullifier for same election
   * Cannot derive identity from nullifier
   * 
   * @param {string} secret - Voter's secret
   * @param {string} electionId - Election ID
   * @returns {string} Nullifier hash
   */
  generateNullifier(secret, electionId) {
    // Nullifier = hash(secret + electionId)
    return CryptoJS.SHA256(`nullifier-${secret}-${electionId}`).toString();
  }

  /**
   * Check if nullifier has been used (double voting check)
   * 
   * @param {string} electionId - Election ID
   * @param {string} nullifier - Nullifier to check
   * @returns {boolean} True if already used
   */
  isNullifierUsed(electionId, nullifier) {
    if (!this.nullifiers.has(electionId)) {
      this.nullifiers.set(electionId, new Set());
    }
    return this.nullifiers.get(electionId).has(nullifier);
  }

  /**
   * Mark nullifier as used
   * 
   * @param {string} electionId - Election ID
   * @param {string} nullifier - Nullifier to mark
   */
  markNullifierUsed(electionId, nullifier) {
    if (!this.nullifiers.has(electionId)) {
      this.nullifiers.set(electionId, new Set());
    }
    this.nullifiers.get(electionId).add(nullifier);
  }

  /**
   * 2️⃣ VOTE ENCRYPTION - Encrypt vote with credential
   * 
   * @param {number} candidateId - Selected candidate
   * @param {string} credential - Voter credential
   * @returns {string} Encrypted vote hash
   */
  encryptVote(candidateId, credential) {
    const voteData = {
      candidateId,
      timestamp: Date.now(),
      nonce: CryptoJS.lib.WordArray.random(16).toString()
    };
    
    // Encrypt with credential as key
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(voteData),
      credential
    ).toString();
    
    // Return hash of encrypted vote
    return CryptoJS.SHA256(encrypted).toString();
  }

  /**
   * 2️⃣ GENERATE ZK-SNARK PROOF (Simulated)
   * In production, this would use a real ZK-SNARK library like snarkjs
   * 
   * Proves:
   * - Vote is valid (candidate exists)
   * - Voter is eligible (Merkle proof)
   * - Voter hasn't voted (nullifier unused)
   * 
   * Without revealing:
   * - Which candidate was chosen
   * - Who the voter is
   * - Which voter in the tree
   * 
   * @param {Object} params - Proof parameters
   * @returns {Object} ZK proof components
   */
  generateZKProof({
    candidateId,
    credential,
    secret,
    electionId,
    merkleProof,
    merkleRoot,
    validCandidates
  }) {
    // Validate inputs
    if (!validCandidates.includes(candidateId)) {
      throw new Error('Invalid candidate ID');
    }

    console.log('Generating ZK proof:', {
      candidateId,
      credential: credential.substring(0, 16) + '...',
      secret: secret.substring(0, 16) + '...',
      electionId,
      merkleRoot: merkleRoot.substring(0, 16) + '...',
      proofLength: merkleProof ? merkleProof.length : 0
    });

    // Generate nullifier
    const nullifier = this.generateNullifier(secret, electionId);

    // Check double voting
    if (this.isNullifierUsed(electionId, nullifier)) {
      throw new Error('Vote already submitted (nullifier used)');
    }

    // Verify Merkle proof (voter eligibility)
    const leafHash = CryptoJS.SHA256(`leaf-${credential}`).toString();
    console.log('Verifying voter eligibility:', {
      leafHash: leafHash.substring(0, 16) + '...',
      merkleRoot: merkleRoot.substring(0, 16) + '...',
      proofSteps: merkleProof ? merkleProof.length : 0
    });

    if (!this.verifyMerkleProof(leafHash, merkleProof, merkleRoot)) {
      throw new Error('Invalid Merkle proof - voter not eligible');
    }

    console.log('✓ Voter eligibility verified');

    // Encrypt vote
    const encryptedVote = this.encryptVote(candidateId, credential);

    // Generate proof components (simulated zk-SNARK)
    // In real implementation, this would be computed by a circuit
    const proofData = {
      encryptedVote,
      nullifier,
      merkleRoot,
      timestamp: Date.now()
    };

    // Simulate zk-SNARK proof structure (pi_a, pi_b, pi_c components)
    const pi_a = CryptoJS.SHA256(`pi_a-${JSON.stringify(proofData)}-${secret}`).toString();
    const pi_b = CryptoJS.SHA256(`pi_b-${JSON.stringify(proofData)}-${credential}`).toString();
    const pi_c = CryptoJS.SHA256(`pi_c-${JSON.stringify(proofData)}-${electionId}`).toString();

    // Public signals (visible on-chain)
    const publicSignals = {
      nullifier,           // Prevents double voting
      merkleRoot,          // Proves voter in registry
      electionId          // Binds to specific election
    };

    return {
      proof: {
        pi_a: [pi_a.substring(0, 64), pi_a.substring(64, 128) || '0'.repeat(64)],
        pi_b: [[pi_b.substring(0, 64), pi_b.substring(64, 128) || '0'.repeat(64)], 
               [pi_b.substring(0, 64), pi_b.substring(64, 128) || '0'.repeat(64)]],
        pi_c: [pi_c.substring(0, 64), pi_c.substring(64, 128) || '0'.repeat(64)],
        protocol: 'groth16'
      },
      publicSignals,
      encryptedVote,
      nullifier
    };
  }

  /**
   * Verify ZK proof (simulated)
   * Smart contract would verify this on-chain
   * 
   * @param {Object} proof - ZK proof
   * @param {Object} publicSignals - Public signals
   * @returns {boolean} True if proof is valid
   */
  verifyZKProof(proof, publicSignals) {
    // In production, this would verify the zk-SNARK cryptographically
    // Using verification key and elliptic curve pairings
    
    try {
      // Check proof structure
      if (!proof.pi_a || !proof.pi_b || !proof.pi_c) {
        return false;
      }

      // Check public signals
      if (!publicSignals.nullifier || !publicSignals.merkleRoot) {
        return false;
      }

      // Check nullifier hasn't been used
      if (this.isNullifierUsed(publicSignals.electionId, publicSignals.nullifier)) {
        return false;
      }

      // Simulated verification (in real system, uses pairing check)
      return true;
    } catch (error) {
      console.error('ZK proof verification failed:', error);
      return false;
    }
  }

  /**
   * Register voters for an election
   * Builds Merkle tree of eligible voters
   * 
   * @param {string} electionId - Election ID
   * @param {Array} voterCredentials - Array of voter credential objects
   */
  registerVoters(electionId, voterCredentials) {
    const leafHashes = voterCredentials.map(vc => vc.leafHash);
    const tree = this.buildMerkleTree(leafHashes);
    
    this.voterTrees.set(electionId, {
      tree,
      credentials: voterCredentials
    });

    // Store voter registry for proof generation
    if (!this.voterRegistry.has(electionId)) {
      this.voterRegistry.set(electionId, new Map());
    }
    
    const registry = this.voterRegistry.get(electionId);
    voterCredentials.forEach((vc, index) => {
      registry.set(vc.credential, {
        voterId: vc.voterId,
        leafHash: vc.leafHash,
        leafIndex: index,
        merkleProof: this.getMerkleProof(tree.tree, index)
      });
    });

    // Persist to disk
    this.saveRegistry();

    return tree.root;
  }

  /**
   * Get voter data including Merkle proof
   * 
   * @param {string} electionId - Election ID
   * @param {string} credential - Voter credential
   * @returns {Object} Voter data with Merkle proof
   */
  getVoterData(electionId, credential) {
    const registry = this.voterRegistry.get(electionId);
    if (!registry) {
      return null;
    }
    return registry.get(credential);
  }

  /**
   * Get Merkle root for election
   * 
   * @param {string} electionId - Election ID
   * @returns {string} Merkle root
   */
  getMerkleRoot(electionId) {
    const voterTree = this.voterTrees.get(electionId);
    if (!voterTree) {
      throw new Error('Voter tree not found for election');
    }
    return voterTree.tree.root;
  }

  /**
   * Get Merkle proof for voter
   * 
   * @param {string} electionId - Election ID
   * @param {string} credential - Voter credential
   * @returns {Array} Merkle proof
   */
  getVoterMerkleProof(electionId, credential) {
    const voterTree = this.voterTrees.get(electionId);
    if (!voterTree) {
      throw new Error('Voter tree not found for election');
    }

    const leafHash = CryptoJS.SHA256(`leaf-${credential}`).toString();
    const leafIndex = voterTree.tree.leaves.indexOf(leafHash);
    
    if (leafIndex === -1) {
      throw new Error('Voter not found in registry');
    }

    return this.getMerkleProof(voterTree.tree.tree, leafIndex);
  }
}

module.exports = new ZKPService();
