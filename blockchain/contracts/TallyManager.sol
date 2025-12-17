// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TallyManager
 * @dev Manages the tallying process using threshold decryption
 * @notice Accepts decryption shares and publishes final results
 */
contract TallyManager is Ownable {
    
    struct TallyResult {
        uint256 electionId;
        mapping(uint256 => uint256) candidateVotes; // candidateId => vote count
        uint256 totalVotes;
        bool finalized;
        uint256 timestamp;
    }
    
    mapping(uint256 => TallyResult) public tallyResults;
    mapping(uint256 => bool) public tallyExists;
    
    // For threshold decryption (simplified version)
    mapping(uint256 => mapping(address => bool)) public decryptionShareSubmitted;
    mapping(uint256 => uint256) public decryptionShareCount;
    
    uint256 public constant REQUIRED_SHARES = 1; // Simplified for demo
    
    event TallyInitiated(uint256 indexed electionId, uint256 timestamp);
    
    event DecryptionShareSubmitted(
        uint256 indexed electionId,
        address indexed submitter,
        uint256 shareCount
    );
    
    event TallyFinalized(
        uint256 indexed electionId,
        uint256 totalVotes,
        uint256 timestamp
    );
    
    event CandidateVotesRecorded(
        uint256 indexed electionId,
        uint256 indexed candidateId,
        uint256 voteCount
    );
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Initiates the tally process for an election
     * @param electionId The ID of the election
     */
    function initiateTally(uint256 electionId) external onlyOwner {
        require(!tallyExists[electionId], "Tally already exists");
        
        TallyResult storage tally = tallyResults[electionId];
        tally.electionId = electionId;
        tally.totalVotes = 0;
        tally.finalized = false;
        tally.timestamp = block.timestamp;
        
        tallyExists[electionId] = true;
        
        emit TallyInitiated(electionId, block.timestamp);
    }
    
    /**
     * @dev Submits a decryption share (simplified for demo)
     * @param electionId The ID of the election
     */
    function submitDecryptionShare(uint256 electionId) external onlyOwner {
        require(tallyExists[electionId], "Tally not initiated");
        require(!tallyResults[electionId].finalized, "Tally already finalized");
        require(
            !decryptionShareSubmitted[electionId][msg.sender],
            "Share already submitted"
        );
        
        decryptionShareSubmitted[electionId][msg.sender] = true;
        decryptionShareCount[electionId]++;
        
        emit DecryptionShareSubmitted(
            electionId,
            msg.sender,
            decryptionShareCount[electionId]
        );
    }
    
    /**
     * @dev Records votes for a candidate
     * @param electionId The ID of the election
     * @param candidateId The ID of the candidate
     * @param voteCount The number of votes
     */
    function recordCandidateVotes(
        uint256 electionId,
        uint256 candidateId,
        uint256 voteCount
    ) external onlyOwner {
        require(tallyExists[electionId], "Tally not initiated");
        require(!tallyResults[electionId].finalized, "Tally already finalized");
        
        TallyResult storage tally = tallyResults[electionId];
        tally.candidateVotes[candidateId] = voteCount;
        tally.totalVotes += voteCount;
        
        emit CandidateVotesRecorded(electionId, candidateId, voteCount);
    }
    
    /**
     * @dev Finalizes the tally
     * @param electionId The ID of the election
     */
    function finalizeTally(uint256 electionId) external onlyOwner {
        require(tallyExists[electionId], "Tally not initiated");
        require(!tallyResults[electionId].finalized, "Tally already finalized");
        require(
            decryptionShareCount[electionId] >= REQUIRED_SHARES,
            "Insufficient decryption shares"
        );
        
        TallyResult storage tally = tallyResults[electionId];
        tally.finalized = true;
        tally.timestamp = block.timestamp;
        
        emit TallyFinalized(electionId, tally.totalVotes, block.timestamp);
    }
    
    /**
     * @dev Gets the vote count for a candidate
     * @param electionId The ID of the election
     * @param candidateId The ID of the candidate
     */
    function getCandidateVotes(uint256 electionId, uint256 candidateId)
        external
        view
        returns (uint256)
    {
        require(tallyExists[electionId], "Tally not initiated");
        return tallyResults[electionId].candidateVotes[candidateId];
    }
    
    /**
     * @dev Gets the total votes for an election
     * @param electionId The ID of the election
     */
    function getTotalVotes(uint256 electionId) external view returns (uint256) {
        require(tallyExists[electionId], "Tally not initiated");
        return tallyResults[electionId].totalVotes;
    }
    
    /**
     * @dev Checks if tally is finalized
     * @param electionId The ID of the election
     */
    function isTallyFinalized(uint256 electionId) external view returns (bool) {
        require(tallyExists[electionId], "Tally not initiated");
        return tallyResults[electionId].finalized;
    }
    
    /**
     * @dev Gets complete tally information
     * @param electionId The ID of the election
     */
    function getTallyInfo(uint256 electionId)
        external
        view
        returns (
            uint256 totalVotes,
            bool finalized,
            uint256 timestamp,
            uint256 shareCount
        )
    {
        require(tallyExists[electionId], "Tally not initiated");
        TallyResult storage tally = tallyResults[electionId];
        
        return (
            tally.totalVotes,
            tally.finalized,
            tally.timestamp,
            decryptionShareCount[electionId]
        );
    }
}
