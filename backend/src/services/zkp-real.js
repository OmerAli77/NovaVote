/**
 * Real Zero-Knowledge Proof Service using snarkjs
 * 
 * This replaces the simulated ZKP with actual Groth16 ZK-SNARKs.
 * 
 * The circuit proves:
 * - Voter is registered (Merkle proof)
 * - Vote is for valid candidate (1-10)
 * - Nullifier prevents double voting
 * 
 * WITHOUT revealing:
 * - Voter identity (voterSecret)
 * - Vote choice (candidateId)
 */

const snarkjs = require('snarkjs');
const { buildPoseidon } = require('circomlibjs');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class RealZKPService {
  constructor() {
    this.poseidon = null;
    this.wasmPath = path.join(__dirname, '../../circuits/build/vote_js/vote.wasm');
    this.zkeyPath = path.join(__dirname, '../../circuits/build/vote.zkey');
    this.vkeyPath = path.join(__dirname, '../../circuits/build/vote_vkey.json');
    
    // Voter registry (electionId => Map of voterSecret => data)
    this.voterRegistry = new Map();
    this.merkleTrees = new Map();
    this.nullifiers = new Map();
    
    // Initialize Poseidon hash
    this.initPoseidon();
  }
  
  async initPoseidon() {
    this.poseidon = await buildPoseidon();
  }
  
  /**
   * Hash using Poseidon (ZK-friendly hash function)
   */
  hash(inputs) {
    if (!this.poseidon) {
      throw new Error('Poseidon not initialized');
    }
    
    const hash = this.poseidon(inputs);
    return this.poseidon.F.toString(hash);
  }
  
  /**
   * Generate voter credential (secret)
   */
  generateVoterSecret() {
    // Generate random 31-byte value (safe for BN254 curve)
    const bytes = crypto.randomBytes(31);
    return BigInt('0x' + bytes.toString('hex')).toString();
  }
  
  /**
   * Register voter and build Merkle tree
   */
  async registerVoters(electionId, voterCount) {
    const voters = [];
    const secrets = [];
    
    // Generate voter secrets
    for (let i = 0; i < voterCount; i++) {
      const secret = this.generateVoterSecret();
      const commitment = this.hash([BigInt(secret)]);
      
      voters.push({
        index: i,
        secret,
        commitment
      });
      secrets.push(commitment);
    }
    
    // Build Merkle tree
    const tree = this.buildMerkleTree(secrets);
    
    this.voterRegistry.set(electionId, new Map(
      voters.map(v => [v.commitment, v])
    ));
    this.merkleTrees.set(electionId, tree);
    this.nullifiers.set(electionId, new Set());
    
    return {
      root: tree.root,
      voters: voters.map(v => ({
        commitment: v.commitment,
        index: v.index
      })),
      secrets: voters.map(v => v.secret) // Return for testing only!
    };
  }
  
  /**
   * Build Merkle tree from commitments
   */
  buildMerkleTree(leaves) {
    const depth = 20; // Support up to 2^20 = 1M voters
    const tree = {
      depth,
      leaves,
      layers: []
    };
    
    // Pad to power of 2
    const paddedLeaves = [...leaves];
    while (paddedLeaves.length < Math.pow(2, depth)) {
      paddedLeaves.push('0');
    }
    
    tree.layers[0] = paddedLeaves;
    
    // Build tree bottom-up
    for (let level = 1; level <= depth; level++) {
      const prevLayer = tree.layers[level - 1];
      const currentLayer = [];
      
      for (let i = 0; i < prevLayer.length; i += 2) {
        const left = BigInt(prevLayer[i]);
        const right = BigInt(prevLayer[i + 1]);
        const parent = this.hash([left, right]);
        currentLayer.push(parent);
      }
      
      tree.layers[level] = currentLayer;
    }
    
    tree.root = tree.layers[depth][0];
    return tree;
  }
  
  /**
   * Get Merkle proof for a leaf
   */
  getMerkleProof(tree, leafIndex) {
    const proof = [];
    const indices = [];
    let index = leafIndex;
    
    for (let level = 0; level < tree.depth; level++) {
      const layer = tree.layers[level];
      const isLeft = index % 2 === 0;
      const siblingIndex = isLeft ? index + 1 : index - 1;
      
      proof.push(layer[siblingIndex]);
      indices.push(isLeft ? 0 : 1);
      
      index = Math.floor(index / 2);
    }
    
    return { proof, indices };
  }
  
  /**
   * Generate ZK proof for a vote
   * 
   * @param {Object} inputs
   * @param {string} inputs.voterSecret - Private voter credential
   * @param {number} inputs.candidateId - Candidate being voted for (1-10)
   * @param {string} inputs.electionId - Election identifier
   * @param {number} inputs.voterIndex - Index in voter registry
   * @returns {Object} { proof, publicSignals }
   */
  async generateVoteProof({ voterSecret, candidateId, electionId, voterIndex }) {
    await this.ensurePoseidon();
    
    // Get Merkle tree and proof
    const tree = this.merkleTrees.get(electionId);
    if (!tree) {
      throw new Error('Election not found or voters not registered');
    }
    
    const { proof: merkleProof, indices: merkleIndices } = this.getMerkleProof(tree, voterIndex);
    
    // Compute public signals
    const nullifierHash = this.hash([BigInt(voterSecret)]);
    const voteCommitment = this.hash([BigInt(voterSecret), BigInt(candidateId)]);
    const merkleRoot = tree.root;
    
    // Check nullifier hasn't been used
    const nullifierSet = this.nullifiers.get(electionId);
    if (nullifierSet.has(nullifierHash)) {
      throw new Error('Vote already cast (nullifier already used)');
    }
    
    // Circuit inputs
    const input = {
      // Public
      nullifierHash,
      merkleRoot,
      voteCommitment,
      
      // Private
      voterSecret,
      candidateId,
      merkleProof,
      merkleIndices
    };
    
    console.log('🔐 Generating ZK-SNARK proof...');
    const startTime = Date.now();
    
    // Generate actual proof using snarkjs
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      this.wasmPath,
      this.zkeyPath
    );
    
    const proofTime = Date.now() - startTime;
    console.log(`✅ Proof generated in ${proofTime}ms`);
    
    // Mark nullifier as used
    nullifierSet.add(nullifierHash);
    
    return {
      proof,
      publicSignals,
      metadata: {
        proofTime,
        constraints: 'Real Groth16 ZK-SNARK',
        curve: 'BN254'
      }
    };
  }
  
  /**
   * Verify ZK proof
   * 
   * @param {Object} proof - snarkjs proof object
   * @param {Array} publicSignals - Public inputs [nullifierHash, merkleRoot, voteCommitment]
   * @returns {boolean} - True if proof is valid
   */
  async verifyVoteProof(proof, publicSignals) {
    await this.ensurePoseidon();
    
    console.log('🔍 Verifying ZK-SNARK proof...');
    const startTime = Date.now();
    
    // Load verification key
    const vKey = JSON.parse(fs.readFileSync(this.vkeyPath, 'utf8'));
    
    // Verify using snarkjs
    const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    
    const verifyTime = Date.now() - startTime;
    console.log(`✅ Proof verified in ${verifyTime}ms: ${isValid ? 'VALID' : 'INVALID'}`);
    
    return isValid;
  }
  
  /**
   * Export proof for Solidity verifier
   */
  formatProofForSolidity(proof, publicSignals) {
    return {
      a: [proof.pi_a[0], proof.pi_a[1]],
      b: [[proof.pi_b[0][1], proof.pi_b[0][0]], [proof.pi_b[1][1], proof.pi_b[1][0]]],
      c: [proof.pi_c[0], proof.pi_c[1]],
      input: publicSignals
    };
  }
  
  async ensurePoseidon() {
    if (!this.poseidon) {
      await this.initPoseidon();
    }
  }
}

module.exports = new RealZKPService();
