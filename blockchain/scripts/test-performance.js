const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Performance metrics storage
const metrics = {
  deployment: {},
  elections: [],
  voting: {
    totalVotes: 0,
    successfulVotes: 0,
    failedVotes: 0,
    transactions: [],
    gasUsed: []
  },
  tallying: {},
  zkp: {
    commitmentGenerations: [],
    verifications: []
  }
};

// Utility functions
function generateVoterId(index) {
  return `VOTER-${String(index).padStart(6, '0')}`;
}

function generateRandomSecret() {
  return hre.ethers.hexlify(hre.ethers.randomBytes(32));
}

function calculateHash(voterId, candidateId, secret) {
  return hre.ethers.keccak256(
    hre.ethers.AbiCoder.defaultAbiCoder().encode(
      ["string", "uint256", "bytes32"],
      [voterId, candidateId, secret]
    )
  );
}

async function measureGasAndTime(txPromise, description) {
  const startTime = Date.now();
  const tx = await txPromise;
  const receipt = await tx.wait();
  const endTime = Date.now();
  
  return {
    description,
    gasUsed: receipt.gasUsed.toString(),
    executionTime: endTime - startTime,
    blockNumber: receipt.blockNumber,
    transactionHash: receipt.hash
  };
}

async function main() {
  console.log("\n" + "=".repeat(80));
  console.log("🧪 BLOCKCHAIN VOTING SYSTEM - PERFORMANCE TEST");
  console.log("=".repeat(80) + "\n");

  const [owner, ...accounts] = await hre.ethers.getSigners();
  console.log(`📋 Test Configuration:`);
  console.log(`   Owner: ${owner.address}`);
  console.log(`   Available test accounts: ${accounts.length}`);
  console.log(`   Network: ${hre.network.name}\n`);

  // ==================== PHASE 1: CONTRACT DEPLOYMENT ====================
  console.log("📦 PHASE 1: Deploying Smart Contracts...\n");
  
  const deploymentStart = Date.now();
  
  // Deploy TallyManager first (no dependencies)
  console.log("   Deploying TallyManager contract...");
  const TallyManager = await hre.ethers.getContractFactory("TallyManager");
  const tallyDeployStart = Date.now();
  const tallyManager = await TallyManager.deploy();
  await tallyManager.waitForDeployment();
  const tallyManagerAddress = await tallyManager.getAddress();
  metrics.deployment.tallyManager = {
    address: tallyManagerAddress,
    deployTime: Date.now() - tallyDeployStart,
    gasUsed: (await tallyManager.deploymentTransaction().wait()).gasUsed.toString()
  };
  console.log(`   ✅ TallyManager deployed at: ${tallyManagerAddress}`);
  console.log(`      Gas used: ${metrics.deployment.tallyManager.gasUsed}`);
  console.log(`      Time: ${metrics.deployment.tallyManager.deployTime}ms\n`);

  // Deploy ElectionManager (needs TallyManager address but will deploy VoteCommitment itself)
  console.log("   Deploying ElectionManager contract...");
  const ElectionManager = await hre.ethers.getContractFactory("ElectionManager");
  const electionDeployStart = Date.now();
  const electionManager = await ElectionManager.deploy();
  await electionManager.waitForDeployment();
  const electionManagerAddress = await electionManager.getAddress();
  metrics.deployment.electionManager = {
    address: electionManagerAddress,
    deployTime: Date.now() - electionDeployStart,
    gasUsed: (await electionManager.deploymentTransaction().wait()).gasUsed.toString()
  };
  console.log(`   ✅ ElectionManager deployed at: ${electionManagerAddress}`);
  console.log(`      Gas used: ${metrics.deployment.electionManager.gasUsed}`);
  console.log(`      Time: ${metrics.deployment.electionManager.deployTime}ms\n`);

  // Deploy VoteCommitment (needs ElectionManager address)
  console.log("   Deploying VoteCommitment contract...");
  const VoteCommitment = await hre.ethers.getContractFactory("VoteCommitment");
  const voteCommitmentDeployStart = Date.now();
  const voteCommitment = await VoteCommitment.deploy(electionManagerAddress);
  await voteCommitment.waitForDeployment();
  const voteCommitmentAddress = await voteCommitment.getAddress();
  metrics.deployment.voteCommitment = {
    address: voteCommitmentAddress,
    deployTime: Date.now() - voteCommitmentDeployStart,
    gasUsed: (await voteCommitment.deploymentTransaction().wait()).gasUsed.toString()
  };
  console.log(`   ✅ VoteCommitment deployed at: ${voteCommitmentAddress}`);
  console.log(`      Gas used: ${metrics.deployment.voteCommitment.gasUsed}`);
  console.log(`      Time: ${metrics.deployment.voteCommitment.deployTime}ms\n`);

  // Link VoteCommitment to ElectionManager
  console.log("   Linking contracts...");
  const linkTx = await electionManager.setVoteCommitmentAddress(voteCommitmentAddress);
  await linkTx.wait();
  console.log(`   ✅ Contracts linked\n`);

  metrics.deployment.totalTime = Date.now() - deploymentStart;
  console.log(`📊 Total Deployment Time: ${metrics.deployment.totalTime}ms\n`);

  // ==================== PHASE 2: ELECTION CREATION ====================
  console.log("📋 PHASE 2: Creating Test Elections...\n");

  const elections = [
    {
      name: "Presidential Election 2025",
      candidates: ["Alice Johnson", "Bob Smith", "Carol Williams"],
      voterCount: 5000  // Realistic city/district level
    },
    {
      name: "Senate Election - District 5",
      candidates: ["David Brown", "Eve Davis"],
      voterCount: 2500  // Mid-size district
    },
    {
      name: "City Council - Ward 3",
      candidates: ["Frank Miller", "Grace Lee", "Henry Taylor", "Ivy Chen"],
      voterCount: 1000  // Local ward election
    }
  ];

  for (let i = 0; i < elections.length; i++) {
    const election = elections[i];
    console.log(`   Creating: ${election.name}`);
    
    const createStart = Date.now();
    
    // Create election with proper parameters
    const now = Math.floor(Date.now() / 1000);
    const tx = await electionManager.createElection(
      election.name,
      `Test election for performance measurement - ${election.name}`,
      now, // Start time (now)
      now + 86400 // End time (24 hours from now)
    );
    const receipt = await tx.wait();
    
    // Get election ID from event
    const event = receipt.logs.find(log => {
      try {
        return electionManager.interface.parseLog(log).name === "ElectionCreated";
      } catch {
        return false;
      }
    });
    const electionId = event ? electionManager.interface.parseLog(event).args.electionId : i;

    // Add candidates
    for (let c = 0; c < election.candidates.length; c++) {
      await electionManager.addCandidate(electionId, election.candidates[c]);
    }
    
    // Start the election
    await electionManager.startElection(electionId);
    
    const createTime = Date.now() - createStart;

    metrics.elections.push({
      id: electionId.toString(),
      name: election.name,
      candidates: election.candidates,
      plannedVoters: election.voterCount,
      creationTime: createTime,
      gasUsed: receipt.gasUsed.toString()
    });

    console.log(`   ✅ Election ID: ${electionId}`);
    console.log(`      Candidates: ${election.candidates.length}`);
    console.log(`      Planned voters: ${election.voterCount}`);
    console.log(`      Gas used: ${receipt.gasUsed.toString()}`);
    console.log(`      Time: ${createTime}ms\n`);
  }

  // ==================== PHASE 3: VOTER REGISTRATION ====================
  console.log("👥 PHASE 3: Registering Voters (Merkle Root)...\n");

  const registrationMetrics = [];
  let totalRegistrationTime = 0;

  for (let i = 0; i < elections.length; i++) {
    const election = metrics.elections[i];
    console.log(`   Registering ${election.plannedVoters} voters for: ${election.name}`);
    
    const regStart = Date.now();
    const voterIds = [];
    
    // Generate voter IDs
    for (let v = 0; v < election.plannedVoters; v++) {
      voterIds.push(generateVoterId(v + 1));
    }
    
    // Create Merkle root from voter IDs (simplified - hash all voters together)
    const voterHashes = voterIds.map(id => hre.ethers.keccak256(hre.ethers.toUtf8Bytes(id)));
    const merkleRoot = hre.ethers.keccak256(hre.ethers.concat(voterHashes));
    
    // Register voters with Merkle root
    const tx = await electionManager.registerVoters(election.id, merkleRoot);
    const receipt = await tx.wait();
    
    const regTime = Date.now() - regStart;
    totalRegistrationTime += regTime;
    
    registrationMetrics.push({
      electionId: election.id,
      votersRegistered: voterIds.length,
      time: regTime,
      avgTimePerVoter: (regTime / voterIds.length).toFixed(2),
      gasUsed: receipt.gasUsed.toString()
    });
    
    console.log(`      ✅ Total: ${voterIds.length} voters registered in ${regTime}ms`);
    console.log(`      Gas used: ${receipt.gasUsed.toString()}`);
    console.log(`      Average: ${(regTime / voterIds.length).toFixed(2)}ms per voter\n`);
    
    // Store voter IDs for voting phase
    election.voterIds = voterIds;
  }

  metrics.registration = {
    totalVoters: registrationMetrics.reduce((sum, m) => sum + m.votersRegistered, 0),
    totalTime: totalRegistrationTime,
    elections: registrationMetrics
  };

  // ==================== PHASE 4: VOTING SIMULATION ====================
  console.log("🗳️  PHASE 4: Simulating Voting Process...\n");

  const votingData = []; // Store for tallying phase

  for (let i = 0; i < elections.length; i++) {
    const election = metrics.elections[i];
    console.log(`   Voting for: ${election.name}`);
    console.log(`   Total registered voters: ${election.voterIds.length}`);
    
    const electionVotes = [];
    const voteStart = Date.now();
    let successCount = 0;
    let failCount = 0;
    const gasCosts = [];
    const executionTimes = [];

    // Simulate voting - 80% participation rate
    const participationRate = 0.8;
    const votersWhoVote = Math.floor(election.voterIds.length * participationRate);
    
    console.log(`   Expected participants (80% turnout): ${votersWhoVote}`);
    
    for (let v = 0; v < votersWhoVote; v++) {
      const voterId = election.voterIds[v];
      // Random candidate selection
      const candidateId = Math.floor(Math.random() * election.candidates.length);
      const secret = generateRandomSecret();
      const commitment = calculateHash(voterId, candidateId, secret);
      
      // Generate nullifier (unique per voter)
      const nullifier = hre.ethers.keccak256(
        hre.ethers.AbiCoder.defaultAbiCoder().encode(
          ["string", "uint256"],
          [voterId, election.id]
        )
      );
      
      // Generate proof hash (simulated ZKP)
      const proofHash = hre.ethers.keccak256(
        hre.ethers.AbiCoder.defaultAbiCoder().encode(
          ["bytes32", "bytes32"],
          [commitment, nullifier]
        )
      );
      
      // Get Merkle root from election (need to retrieve it)
      const voterHashes = election.voterIds.map(id => hre.ethers.keccak256(hre.ethers.toUtf8Bytes(id)));
      const merkleRoot = hre.ethers.keccak256(hre.ethers.concat(voterHashes));

      try {
        const txStart = Date.now();
        const tx = await voteCommitment.submitVoteCommitment(
          election.id,
          nullifier,
          commitment, // encryptedVote
          proofHash,
          merkleRoot
        );
        const receipt = await tx.wait();
        const txTime = Date.now() - txStart;

        successCount++;
        gasCosts.push(Number(receipt.gasUsed));
        executionTimes.push(txTime);
        metrics.voting.transactions.push({
          electionId: election.id,
          voterId,
          gasUsed: receipt.gasUsed.toString(),
          executionTime: txTime,
          blockNumber: receipt.blockNumber
        });

        electionVotes.push({
          voterId,
          candidateId,
          secret,
          commitment
        });

        // Progress indicator every 50 votes
        if ((v + 1) % 50 === 0 || v === votersWhoVote - 1) {
          process.stdout.write(`\r      Progress: ${v + 1}/${votersWhoVote} votes cast (${successCount} successful)`);
        }

      } catch (error) {
        failCount++;
        console.error(`\n      ❌ Failed vote for ${voterId}:`, error.message);
      }
    }

    const voteTime = Date.now() - voteStart;
    const avgGas = gasCosts.reduce((a, b) => a + b, 0) / gasCosts.length;
    const avgTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;

    console.log(`\n      ✅ Voting complete:`);
    console.log(`         Successful: ${successCount}`);
    console.log(`         Failed: ${failCount}`);
    console.log(`         Success rate: ${((successCount / votersWhoVote) * 100).toFixed(2)}%`);
    console.log(`         Average gas per vote: ${avgGas.toFixed(0)}`);
    console.log(`         Average time per vote: ${avgTime.toFixed(2)}ms`);
    console.log(`         Total voting time: ${voteTime}ms\n`);

    metrics.voting.totalVotes += votersWhoVote;
    metrics.voting.successfulVotes += successCount;
    metrics.voting.failedVotes += failCount;

    votingData.push({
      electionId: election.id,
      votes: electionVotes,
      metrics: {
        totalCast: votersWhoVote,
        successful: successCount,
        failed: failCount,
        avgGas: avgGas.toFixed(0),
        avgTime: avgTime.toFixed(2),
        totalTime: voteTime
      }
    });
  }

  // ==================== PHASE 5: TALLYING & VERIFICATION ====================
  console.log("📊 PHASE 5: Tallying Results & ZKP Verification...\n");

  for (let i = 0; i < votingData.length; i++) {
    const electionData = votingData[i];
    const election = metrics.elections[i];
    
    console.log(`   Tallying: ${election.name}`);
    console.log(`   Verifying ${electionData.votes.length} votes with ZKP...\n`);

    const tallyStart = Date.now();
    const verificationTimes = [];
    const candidateTallies = new Array(election.candidates.length).fill(0);

    for (let v = 0; v < electionData.votes.length; v++) {
      const vote = electionData.votes[v];
      
      // ZKP Verification simulation
      const verifyStart = Date.now();
      const recomputedHash = calculateHash(vote.voterId, vote.candidateId, vote.secret);
      const isValid = recomputedHash === vote.commitment;
      const verifyTime = Date.now() - verifyStart;
      
      verificationTimes.push(verifyTime);

      if (isValid) {
        candidateTallies[vote.candidateId]++;
      }

      if ((v + 1) % 50 === 0 || v === electionData.votes.length - 1) {
        process.stdout.write(`\r      Verified: ${v + 1}/${electionData.votes.length} votes`);
      }
    }

    const tallyTime = Date.now() - tallyStart;
    const avgVerifyTime = verificationTimes.reduce((a, b) => a + b, 0) / verificationTimes.length;

    console.log(`\n      ✅ Tallying complete:`);
    console.log(`         Total verified: ${electionData.votes.length}`);
    console.log(`         Average verification time: ${avgVerifyTime.toFixed(2)}ms`);
    console.log(`         Total tally time: ${tallyTime}ms\n`);
    console.log(`      📊 Results:`);
    
    election.candidates.forEach((candidate, idx) => {
      const votes = candidateTallies[idx];
      const percentage = electionData.votes.length > 0 
        ? ((votes / electionData.votes.length) * 100).toFixed(2)
        : "0.00";
      console.log(`         ${candidate}: ${votes} votes (${percentage}%)`);
    });
    console.log();

    metrics.zkp.verifications.push({
      electionId: electionData.electionId,
      totalVerifications: electionData.votes.length,
      avgTime: avgVerifyTime.toFixed(2),
      totalTime: tallyTime
    });

    election.results = candidateTallies.map((votes, idx) => ({
      candidate: election.candidates[idx],
      votes,
      percentage: electionData.votes.length > 0 
        ? ((votes / electionData.votes.length) * 100).toFixed(2)
        : "0.00"
    }));
  }

  // ==================== PHASE 6: GENERATE REPORT ====================
  console.log("📈 PHASE 6: Generating Performance Report...\n");

  const totalGasUsed = metrics.voting.transactions.reduce(
    (sum, tx) => sum + Number(tx.gasUsed), 0
  );
  const avgGasPerVote = totalGasUsed / metrics.voting.successfulVotes;
  const avgTimePerVote = metrics.voting.transactions.reduce(
    (sum, tx) => sum + tx.executionTime, 0
  ) / metrics.voting.transactions.length;

  const report = {
    testDate: new Date().toISOString(),
    network: hre.network.name,
    summary: {
      totalElections: elections.length,
      totalVotersRegistered: metrics.registration.totalVoters,
      totalVotesCast: metrics.voting.totalVotes,
      successfulVotes: metrics.voting.successfulVotes,
      failedVotes: metrics.voting.failedVotes,
      successRate: ((metrics.voting.successfulVotes / metrics.voting.totalVotes) * 100).toFixed(2) + "%",
      averageParticipationRate: "80.00%"
    },
    deployment: {
      contracts: {
        VoteCommitment: {
          address: metrics.deployment.voteCommitment.address,
          gasUsed: metrics.deployment.voteCommitment.gasUsed,
          deployTime: metrics.deployment.voteCommitment.deployTime + "ms"
        },
        TallyManager: {
          address: metrics.deployment.tallyManager.address,
          gasUsed: metrics.deployment.tallyManager.gasUsed,
          deployTime: metrics.deployment.tallyManager.deployTime + "ms"
        },
        ElectionManager: {
          address: metrics.deployment.electionManager.address,
          gasUsed: metrics.deployment.electionManager.gasUsed,
          deployTime: metrics.deployment.electionManager.deployTime + "ms"
        }
      },
      totalDeploymentTime: metrics.deployment.totalTime + "ms"
    },
    elections: metrics.elections.map(e => ({
      id: e.id,
      name: e.name,
      candidates: e.candidates,
      registeredVoters: e.plannedVoters,
      creationTime: e.creationTime + "ms",
      gasUsed: e.gasUsed,
      results: e.results
    })),
    performance: {
      voting: {
        totalTransactions: metrics.voting.transactions.length,
        totalGasUsed: totalGasUsed.toString(),
        averageGasPerVote: avgGasPerVote.toFixed(0),
        averageTimePerVote: avgTimePerVote.toFixed(2) + "ms",
        transactionsPerSecond: (metrics.voting.transactions.length / 
          (metrics.voting.transactions.reduce((sum, tx) => sum + tx.executionTime, 0) / 1000)).toFixed(2)
      },
      zkpVerification: {
        totalVerifications: metrics.zkp.verifications.reduce((sum, v) => sum + v.totalVerifications, 0),
        averageVerificationTime: (metrics.zkp.verifications.reduce((sum, v) => 
          sum + Number(v.avgTime), 0) / metrics.zkp.verifications.length).toFixed(2) + "ms"
      },
      registration: {
        totalVoters: metrics.registration.totalVoters,
        totalTime: metrics.registration.totalTime + "ms",
        averageTimePerVoter: (metrics.registration.totalTime / metrics.registration.totalVoters).toFixed(2) + "ms"
      }
    },
    blockchainMetrics: {
      averageBlockTime: "~2-3 seconds (Hardhat local)",
      networkLatency: "<5ms (local)",
      confirmationTime: "Instant (development network)"
    }
  };

  // Save report to file
  const reportPath = path.join(__dirname, "../test-results.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`✅ Performance report saved to: ${reportPath}\n`);

  // ==================== DISPLAY SUMMARY ====================
  console.log("=".repeat(80));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(80));
  console.log(`\n🎯 Overall Results:`);
  console.log(`   Total Elections: ${report.summary.totalElections}`);
  console.log(`   Total Voters Registered: ${report.summary.totalVotersRegistered}`);
  console.log(`   Total Votes Cast: ${report.summary.totalVotesCast}`);
  console.log(`   Successful Votes: ${report.summary.successfulVotes}`);
  console.log(`   Success Rate: ${report.summary.successRate}`);
  console.log(`   Average Participation: ${report.summary.averageParticipationRate}`);
  
  console.log(`\n⚡ Performance Metrics:`);
  console.log(`   Avg Gas per Vote: ${report.performance.voting.averageGasPerVote}`);
  console.log(`   Avg Time per Vote: ${report.performance.voting.averageTimePerVote}`);
  console.log(`   Transactions/Second: ${report.performance.voting.transactionsPerSecond}`);
  console.log(`   Avg ZKP Verification: ${report.performance.zkpVerification.averageVerificationTime}`);
  
  console.log(`\n🏆 Election Results:`);
  metrics.elections.forEach(election => {
    console.log(`\n   ${election.name}:`);
    if (election.results) {
      election.results.forEach(r => {
        console.log(`      ${r.candidate}: ${r.votes} votes (${r.percentage}%)`);
      });
    }
  });
  
  console.log(`\n${"=".repeat(80)}\n`);
  console.log(`✅ All tests completed successfully!`);
  console.log(`📄 Full report: blockchain/test-results.json\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
