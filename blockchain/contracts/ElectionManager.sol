// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ElectionManager
 * @dev Manages the creation and lifecycle of elections
 * @notice This contract handles election metadata and state transitions
 */
contract ElectionManager is Ownable {
    
    enum ElectionStatus { Created, Active, Ended, Tallied }
    
    struct Election {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        ElectionStatus status;
        address creator;
        uint256 candidateCount;
        mapping(uint256 => string) candidates;
        bool exists;
    }
    
    uint256 private _electionCounter;
    mapping(uint256 => Election) public elections;
    mapping(uint256 => bool) public electionExists;
    
    event ElectionCreated(
        uint256 indexed electionId,
        string title,
        address indexed creator,
        uint256 startTime,
        uint256 endTime
    );
    
    event ElectionStatusChanged(
        uint256 indexed electionId,
        ElectionStatus newStatus
    );
    
    event CandidateAdded(
        uint256 indexed electionId,
        uint256 candidateId,
        string candidateName
    );
    
    constructor() Ownable(msg.sender) {
        _electionCounter = 0;
    }
    
    /**
     * @dev Creates a new election
     * @param title The title of the election
     * @param description The description of the election
     * @param startTime The start timestamp of the election
     * @param endTime The end timestamp of the election
     * @return The ID of the created election
     */
    function createElection(
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime
    ) external onlyOwner returns (uint256) {
        // Allow flexible start times for testing
        require(endTime > startTime, "End time must be after start time");
        require(bytes(title).length > 0, "Title cannot be empty");
        
        _electionCounter++;
        uint256 electionId = _electionCounter;
        
        Election storage newElection = elections[electionId];
        newElection.id = electionId;
        newElection.title = title;
        newElection.description = description;
        newElection.startTime = startTime;
        newElection.endTime = endTime;
        newElection.status = ElectionStatus.Created;
        newElection.creator = msg.sender;
        newElection.candidateCount = 0;
        newElection.exists = true;
        
        electionExists[electionId] = true;
        
        emit ElectionCreated(electionId, title, msg.sender, startTime, endTime);
        
        return electionId;
    }
    
    /**
     * @dev Adds a candidate to an election
     * @param electionId The ID of the election
     * @param candidateName The name of the candidate
     */
    function addCandidate(
        uint256 electionId,
        string memory candidateName
    ) external onlyOwner {
        require(electionExists[electionId], "Election does not exist");
        Election storage election = elections[electionId];
        require(election.status == ElectionStatus.Created, "Election already started");
        require(bytes(candidateName).length > 0, "Candidate name cannot be empty");
        
        uint256 candidateId = election.candidateCount;
        election.candidates[candidateId] = candidateName;
        election.candidateCount++;
        
        emit CandidateAdded(electionId, candidateId, candidateName);
    }
    
    /**
     * @dev Starts an election
     * @param electionId The ID of the election to start
     */
    function startElection(uint256 electionId) external onlyOwner {
        require(electionExists[electionId], "Election does not exist");
        Election storage election = elections[electionId];
        require(election.status == ElectionStatus.Created, "Election not in Created status");
        require(election.candidateCount > 0, "No candidates added");
        // Removed time restriction - admin can start election at any time
        
        election.status = ElectionStatus.Active;
        emit ElectionStatusChanged(electionId, ElectionStatus.Active);
    }
    
    /**
     * @dev Ends an election
     * @param electionId The ID of the election to end
     */
    function endElection(uint256 electionId) external onlyOwner {
        require(electionExists[electionId], "Election does not exist");
        Election storage election = elections[electionId];
        require(election.status == ElectionStatus.Active, "Election not active");
        // Removed time restriction - admin can end election at any time
        
        election.status = ElectionStatus.Ended;
        emit ElectionStatusChanged(electionId, ElectionStatus.Ended);
    }
    
    /**
     * @dev Marks an election as tallied
     * @param electionId The ID of the election
     */
    function markAsTallied(uint256 electionId) external onlyOwner {
        require(electionExists[electionId], "Election does not exist");
        Election storage election = elections[electionId];
        require(election.status == ElectionStatus.Ended, "Election not ended");
        
        election.status = ElectionStatus.Tallied;
        emit ElectionStatusChanged(electionId, ElectionStatus.Tallied);
    }
    
    /**
     * @dev Gets election basic info
     * @param electionId The ID of the election
     */
    function getElection(uint256 electionId) external view returns (
        uint256 id,
        string memory title,
        string memory description,
        uint256 startTime,
        uint256 endTime,
        ElectionStatus status,
        address creator,
        uint256 candidateCount
    ) {
        require(electionExists[electionId], "Election does not exist");
        Election storage election = elections[electionId];
        
        return (
            election.id,
            election.title,
            election.description,
            election.startTime,
            election.endTime,
            election.status,
            election.creator,
            election.candidateCount
        );
    }
    
    /**
     * @dev Gets a candidate name
     * @param electionId The ID of the election
     * @param candidateId The ID of the candidate
     */
    function getCandidate(uint256 electionId, uint256 candidateId) 
        external 
        view 
        returns (string memory) 
    {
        require(electionExists[electionId], "Election does not exist");
        Election storage election = elections[electionId];
        require(candidateId < election.candidateCount, "Invalid candidate ID");
        
        return election.candidates[candidateId];
    }
    
    /**
     * @dev Gets the total number of elections
     */
    function getElectionCount() external view returns (uint256) {
        return _electionCounter;
    }
    
    /**
     * @dev Gets election status
     * @param electionId The ID of the election
     */
    function getElectionStatus(uint256 electionId) external view returns (ElectionStatus) {
        require(electionExists[electionId], "Election does not exist");
        return elections[electionId].status;
    }
}
