// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title VoteCommitment
 * @dev Stores cryptographic commitments of votes without revealing actual votes
 * @notice Uses zero-knowledge proofs to ensure vote validity without exposing choice
 */
contract VoteCommitment {
    
    struct Commitment {
        bytes32 voteHash;        // Hash of encrypted vote
        bytes32 proofHash;       // Hash of ZK proof
        uint256 timestamp;
        bool exists;
    }
    
    // Election ID => Voter credential hash => Commitment
    mapping(uint256 => mapping(bytes32 => Commitment)) public commitments;
    
    // Election ID => Total vote count
    mapping(uint256 => uint256) public electionVoteCounts;
    
    // Election ID => List of all receipt hashes (for audit)
    mapping(uint256 => bytes32[]) public electionCommitments;
    
    // Election ID => List of credential hashes (for retrieving commitments)
    mapping(uint256 => bytes32[]) public electionCredentials;
    
    address public electionManager;
    
    event VoteCommitted(
        uint256 indexed electionId,
        bytes32 indexed voterCredentialHash,
        bytes32 voteHash,
        bytes32 receiptHash,
        uint256 timestamp
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
     * @dev Submits a vote commitment
     * @param electionId The ID of the election
     * @param voterCredentialHash Hash of the voter's credential (prevents double voting)
     * @param voteHash Hash of the encrypted vote
     * @param proofHash Hash of the ZK proof
     * @return receiptHash A unique receipt hash for verification
     */
    function submitVoteCommitment(
        uint256 electionId,
        bytes32 voterCredentialHash,
        bytes32 voteHash,
        bytes32 proofHash
    ) external returns (bytes32 receiptHash) {
        require(electionId > 0, "Invalid election ID");
        require(voterCredentialHash != bytes32(0), "Invalid voter credential");
        require(voteHash != bytes32(0), "Invalid vote hash");
        require(proofHash != bytes32(0), "Invalid proof hash");
        
        // Prevent double voting
        require(
            !commitments[electionId][voterCredentialHash].exists,
            "Vote already submitted for this credential"
        );
        
        // Create commitment
        Commitment storage commitment = commitments[electionId][voterCredentialHash];
        commitment.voteHash = voteHash;
        commitment.proofHash = proofHash;
        commitment.timestamp = block.timestamp;
        commitment.exists = true;
        
        // Generate unique receipt hash
        receiptHash = keccak256(
            abi.encodePacked(
                electionId,
                voterCredentialHash,
                voteHash,
                proofHash,
                block.timestamp,
                block.number
            )
        );
        
        // Add to election commitments list
        electionCommitments[electionId].push(receiptHash);
        
        // Add credential to credentials list (for audit trail retrieval)
        electionCredentials[electionId].push(voterCredentialHash);
        
        // Increment vote count
        electionVoteCounts[electionId]++;
        
        emit VoteCommitted(
            electionId,
            voterCredentialHash,
            voteHash,
            receiptHash,
            block.timestamp
        );
        
        return receiptHash;
    }
    
    /**
     * @dev Verifies if a vote commitment exists (for voter verification)
     * @param electionId The ID of the election
     * @param voterCredentialHash Hash of the voter's credential
     * @return exists Whether the commitment exists
     * @return timestamp When the vote was committed
     */
    function verifyVoteCommitment(
        uint256 electionId,
        bytes32 voterCredentialHash
    ) external view returns (bool exists, uint256 timestamp) {
        Commitment storage commitment = commitments[electionId][voterCredentialHash];
        return (commitment.exists, commitment.timestamp);
    }
    
    /**
     * @dev Gets the total number of votes for an election
     * @param electionId The ID of the election
     */
    function getVoteCount(uint256 electionId) external view returns (uint256) {
        return electionVoteCounts[electionId];
    }
    
    /**
     * @dev Gets all receipt hashes for an election (for verification)
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
     * @dev Gets all credential hashes for an election (for audit trail)
     * @param electionId The ID of the election
     */
    function getElectionCredentials(uint256 electionId) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return electionCredentials[electionId];
    }
    
    /**
     * @dev Gets commitment details
     * @param electionId The ID of the election
     * @param voterCredentialHash Hash of the voter's credential
     */
    function getCommitment(uint256 electionId, bytes32 voterCredentialHash)
        external
        view
        returns (
            bytes32 voteHash,
            bytes32 proofHash,
            uint256 timestamp,
            bool exists
        )
    {
        Commitment storage commitment = commitments[electionId][voterCredentialHash];
        return (
            commitment.voteHash,
            commitment.proofHash,
            commitment.timestamp,
            commitment.exists
        );
    }
    
    /**
     * @dev Checks if a voter has already voted
     * @param electionId The ID of the election
     * @param voterCredentialHash Hash of the voter's credential
     */
    function hasVoted(uint256 electionId, bytes32 voterCredentialHash) 
        external 
        view 
        returns (bool) 
    {
        return commitments[electionId][voterCredentialHash].exists;
    }
}
