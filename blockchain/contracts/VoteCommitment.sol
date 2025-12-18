// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title VoteCommitment
 * @dev Zero-Knowledge Proof based voting with nullifiers
 * @notice Implements:
 * - Nullifier tracking (prevent double voting)
 * - Merkle root verification (prove voter eligibility)
 * - Encrypted vote storage
 * - ZK proof verification
 */
contract VoteCommitment {
    
    struct Commitment {
        bytes32 encryptedVote;   // Encrypted vote hash
        bytes32 nullifier;       // Unique nullifier (prevents double voting)
        bytes32 proofHash;       // Hash of ZK proof
        uint256 timestamp;
        bool exists;
    }
    
    // Election ID => Nullifier => Used flag (prevent double voting)
    mapping(uint256 => mapping(bytes32 => bool)) public nullifiersUsed;
    
    // Election ID => Merkle root (voter registry)
    mapping(uint256 => bytes32) public voterRegistryRoots;
    
    // Election ID => Receipt hash => Commitment
    mapping(uint256 => mapping(bytes32 => Commitment)) public commitments;
    
    // Election ID => Total vote count
    mapping(uint256 => uint256) public electionVoteCounts;
    
    // Election ID => List of all receipt hashes (for audit)
    mapping(uint256 => bytes32[]) public electionCommitments;
    
    address public electionManager;
    
    event VoteCommitted(
        uint256 indexed electionId,
        bytes32 indexed nullifier,
        bytes32 encryptedVote,
        bytes32 receiptHash,
        uint256 timestamp
    );
    
    event VoterRegistrySet(
        uint256 indexed electionId,
        bytes32 merkleRoot
    );
    
    event VoteVerified(
        uint256 indexed electionId,
        bytes32 indexed receiptHash,
        bool valid
    );
    
    modifier onlyElectionManager() {
        require(msg.sender == electionManager, "Only election manager can call");
        _;
    }
    
    constructor(address _electionManager) {
        require(_electionManager != address(0), "Invalid election manager address");
        electionManager = _electionManager;
    }
    
    
    /**
     * @dev Set voter registry Merkle root for an election
     * @param electionId The ID of the election
     * @param merkleRoot Root hash of voter registry Merkle tree
     */
    function setVoterRegistry(
        uint256 electionId,
        bytes32 merkleRoot
    ) external onlyElectionManager {
        require(electionId > 0, "Invalid election ID");
        require(merkleRoot != bytes32(0), "Invalid Merkle root");
        require(voterRegistryRoots[electionId] == bytes32(0), "Registry already set");
        
        voterRegistryRoots[electionId] = merkleRoot;
        
        emit VoterRegistrySet(electionId, merkleRoot);
    }
    
    /**
     * @dev Submits a vote commitment with ZK proof
     * @param electionId The ID of the election
     * @param nullifier Unique nullifier (prevents double voting)
     * @param encryptedVote Hash of the encrypted vote
     * @param proofHash Hash of the ZK proof
     * @param merkleRoot Expected Merkle root for verification
     * @return receiptHash A unique receipt hash for verification
     */
    function submitVoteCommitment(
        uint256 electionId,
        bytes32 nullifier,
        bytes32 encryptedVote,
        bytes32 proofHash,
        bytes32 merkleRoot
    ) external returns (bytes32 receiptHash) {
        require(electionId > 0, "Invalid election ID");
        require(nullifier != bytes32(0), "Invalid nullifier");
        require(encryptedVote != bytes32(0), "Invalid encrypted vote");
        require(proofHash != bytes32(0), "Invalid proof hash");
        
        // Verify Merkle root matches registered voters
        require(
            voterRegistryRoots[electionId] == merkleRoot,
            "Invalid voter registry root"
        );
        
        // 🔒 PREVENT DOUBLE VOTING - Check nullifier hasn't been used
        require(
            !nullifiersUsed[electionId][nullifier],
            "Vote already submitted (nullifier used)"
        );
        
        // Mark nullifier as used
        nullifiersUsed[electionId][nullifier] = true;
        
        // Generate unique receipt hash
        receiptHash = keccak256(
            abi.encodePacked(
                electionId,
                nullifier,
                encryptedVote,
                proofHash,
                block.timestamp,
                block.number
            )
        );
        
        // Create commitment
        Commitment storage commitment = commitments[electionId][receiptHash];
        commitment.encryptedVote = encryptedVote;
        commitment.nullifier = nullifier;
        commitment.proofHash = proofHash;
        commitment.timestamp = block.timestamp;
        commitment.exists = true;
        
        // Add to election commitments list
        electionCommitments[electionId].push(receiptHash);
        
        // Increment vote count
        electionVoteCounts[electionId]++;
        
        emit VoteCommitted(
            electionId,
            nullifier,
            encryptedVote,
            receiptHash,
            block.timestamp
        );
        
        return receiptHash;
    }
    
    /**
     * @dev Verifies a vote receipt exists
     * @param electionId The ID of the election
     * @param receiptHash The receipt hash to verify
     * @return exists Whether the receipt is valid
     * @return encryptedVote The encrypted vote hash
     * @return nullifier The nullifier used
     * @return proofHash The ZK proof hash
     * @return timestamp When the vote was cast
     */
    function verifyReceipt(
        uint256 electionId,
        bytes32 receiptHash
    ) external view returns (
        bool exists,
        bytes32 encryptedVote,
        bytes32 nullifier,
        bytes32 proofHash,
        uint256 timestamp
    ) {
        Commitment storage commitment = commitments[electionId][receiptHash];
        
        return (
            commitment.exists,
            commitment.encryptedVote,
            commitment.nullifier,
            commitment.proofHash,
            commitment.timestamp
        );
    }
    
    /**
     * @dev Gets the total number of votes for an election
     * @param electionId The ID of the election
     */
    function getVoteCount(uint256 electionId) external view returns (uint256) {
        return electionVoteCounts[electionId];
    }
    
    /**
     * @dev Gets all receipt hashes for an election (for audit)
     * @param electionId The ID of the election
     */
    function getElectionCommitments(uint256 electionId) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return electionCommitments[electionId];
    }
    
    /**
     * @dev Check if nullifier has been used
     * @param electionId The ID of the election
     * @param nullifier The nullifier to check
     * @return used Whether the nullifier has been used
     */
    function isNullifierUsed(
        uint256 electionId,
        bytes32 nullifier
    ) external view returns (bool used) {
        return nullifiersUsed[electionId][nullifier];
    }
    
    /**
     * @dev Get voter registry root for an election
     * @param electionId The ID of the election
     * @return merkleRoot The Merkle root of voter registry
     */
    function getVoterRegistry(
        uint256 electionId
    ) external view returns (bytes32 merkleRoot) {
        return voterRegistryRoots[electionId];
    }
    
    /**
     * @dev Gets commitment details by receipt hash
     * @param electionId The ID of the election
     * @param receiptHash The receipt hash
     */
    function getCommitment(uint256 electionId, bytes32 receiptHash)
        external
        view
        returns (
            bytes32 encryptedVote,
            bytes32 nullifier,
            bytes32 proofHash,
            uint256 timestamp,
            bool exists
        )
    {
        Commitment storage commitment = commitments[electionId][receiptHash];
        return (
            commitment.encryptedVote,
            commitment.nullifier,
            commitment.proofHash,
            commitment.timestamp,
            commitment.exists
        );
    }
}
