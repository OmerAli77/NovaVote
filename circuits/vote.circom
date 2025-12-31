pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

/**
 * VoteCircuit - Zero-Knowledge Proof for Anonymous Voting
 * 
 * Public Inputs:
 *   - nullifierHash: Unique identifier preventing double voting
 *   - merkleRoot: Root of voter registry Merkle tree
 *   - voteCommitment: Commitment to the vote choice
 * 
 * Private Inputs:
 *   - voterSecret: Secret credential known only to voter
 *   - candidateId: The candidate being voted for (1-10)
 *   - merkleProof[20]: Path through Merkle tree proving voter eligibility
 *   - merkleIndices[20]: Binary path (0=left, 1=right) through tree
 * 
 * Circuit proves:
 *   1. Voter is in the registry (Merkle proof verifies)
 *   2. Nullifier is correctly computed from voter secret
 *   3. Vote commitment matches the candidate choice
 *   4. Candidate ID is valid (between 1 and 10)
 * 
 * WITHOUT revealing:
 *   - Who the voter is (voterSecret stays private)
 *   - Which candidate they voted for (candidateId stays private)
 */
template VoteCircuit() {
    // Public inputs (visible on blockchain)
    signal input nullifierHash;
    signal input merkleRoot;
    signal input voteCommitment;
    
    // Private inputs (known only to voter)
    signal input voterSecret;
    signal input candidateId;
    signal input merkleProof[20];     // Merkle tree path (20 levels = 1M voters)
    signal input merkleIndices[20];   // 0 or 1 for left/right
    
    // Intermediate signals
    signal voterCommitment;
    signal computedNullifier;
    signal computedVoteCommit;
    
    // =====================================================
    // 1. COMPUTE VOTER COMMITMENT (leaf in Merkle tree)
    // =====================================================
    component voterHasher = Poseidon(1);
    voterHasher.inputs[0] <== voterSecret;
    voterCommitment <== voterHasher.out;
    
    // =====================================================
    // 2. VERIFY MERKLE PROOF (voter is registered)
    // =====================================================
    component merkleHashers[20];
    component selectors[20];
    
    signal merkleHashes[21];
    merkleHashes[0] <== voterCommitment;
    
    for (var i = 0; i < 20; i++) {
        // Select left or right based on index
        selectors[i] = Selector();
        selectors[i].index <== merkleIndices[i];
        selectors[i].left <== merkleHashes[i];
        selectors[i].right <== merkleProof[i];
        
        // Hash current level
        merkleHashers[i] = Poseidon(2);
        merkleHashers[i].inputs[0] <== selectors[i].outLeft;
        merkleHashers[i].inputs[1] <== selectors[i].outRight;
        
        merkleHashes[i + 1] <== merkleHashers[i].out;
    }
    
    // Root must match public input
    merkleRoot === merkleHashes[20];
    
    // =====================================================
    // 3. COMPUTE AND VERIFY NULLIFIER
    // =====================================================
    component nullifierHasher = Poseidon(1);
    nullifierHasher.inputs[0] <== voterSecret;
    computedNullifier <== nullifierHasher.out;
    
    // Nullifier must match public input
    nullifierHash === computedNullifier;
    
    // =====================================================
    // 4. VALIDATE CANDIDATE ID (1-10)
    // =====================================================
    component candidateGTE = GreaterEqThan(8);
    candidateGTE.in[0] <== candidateId;
    candidateGTE.in[1] <== 1;
    candidateGTE.out === 1;
    
    component candidateLTE = LessEqThan(8);
    candidateLTE.in[0] <== candidateId;
    candidateLTE.in[1] <== 10;
    candidateLTE.out === 1;
    
    // =====================================================
    // 5. COMPUTE AND VERIFY VOTE COMMITMENT
    // =====================================================
    component voteHasher = Poseidon(2);
    voteHasher.inputs[0] <== voterSecret;
    voteHasher.inputs[1] <== candidateId;
    computedVoteCommit <== voteHasher.out;
    
    // Vote commitment must match public input
    voteCommitment === computedVoteCommit;
}

/**
 * Helper: Selector component for Merkle tree traversal
 * Based on index (0 or 1), outputs left and right in correct order
 */
template Selector() {
    signal input index;
    signal input left;
    signal input right;
    signal output outLeft;
    signal output outRight;
    
    // index must be 0 or 1
    index * (1 - index) === 0;
    
    // If index = 0: outLeft = left, outRight = right
    // If index = 1: outLeft = right, outRight = left
    outLeft <== left + index * (right - left);
    outRight <== right - index * (right - left);
}

// Main component
component main {public [nullifierHash, merkleRoot, voteCommitment]} = VoteCircuit();
