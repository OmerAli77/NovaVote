/**
 * Check which elections have voter registries
 */

const { ethers } = require('ethers');

async function checkVoterRegistries() {
  console.log('🔍 Checking voter registries...\n');

  try {
    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    
    // Load contract
    const deployments = require('./frontend/src/deployments.json');
    const voteCommitmentABI = require('./blockchain/artifacts/contracts/VoteCommitment.sol/VoteCommitment.json').abi;
    const voteCommitment = new ethers.Contract(
      deployments.contracts.VoteCommitment,
      voteCommitmentABI,
      provider
    );

    // Check elections 1-10
    for (let electionId = 1; electionId <= 10; electionId++) {
      try {
        const merkleRoot = await voteCommitment.voterRegistryRoots(electionId);
        
        if (merkleRoot !== ethers.ZeroHash) {
          console.log(`✅ Election ${electionId}: HAS voter registry`);
          console.log(`   Merkle Root: ${merkleRoot.substring(0, 20)}...`);
        } else {
          console.log(`❌ Election ${electionId}: NO voter registry`);
        }
      } catch (error) {
        console.log(`❌ Election ${electionId}: Error - ${error.message}`);
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkVoterRegistries();
