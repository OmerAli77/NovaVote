const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n" + "=".repeat(80));
  console.log("🚀 DEPLOYING BATCH VOTING SYSTEM");
  console.log("=".repeat(80) + "\n");

  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;
  
  console.log("📋 Deployment Configuration:");
  console.log(`   Network: ${network}`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH\n`);

  const deploymentInfo = {
    network,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {}
  };

  // ==================== DEPLOY TALLYMANAGER ====================
  console.log("📦 Deploying TallyManager...");
  const TallyManager = await hre.ethers.getContractFactory("TallyManager");
  const tallyManager = await TallyManager.deploy();
  await tallyManager.waitForDeployment();
  const tallyAddress = await tallyManager.getAddress();
  
  console.log(`   ✅ TallyManager deployed to: ${tallyAddress}`);
  deploymentInfo.contracts.TallyManager = tallyAddress;

  // ==================== DEPLOY ELECTIONMANAGER ====================
  console.log("\n📦 Deploying ElectionManager...");
  const ElectionManager = await hre.ethers.getContractFactory("ElectionManager");
  const electionManager = await ElectionManager.deploy();
  await electionManager.waitForDeployment();
  const electionAddress = await electionManager.getAddress();
  
  console.log(`   ✅ ElectionManager deployed to: ${electionAddress}`);
  deploymentInfo.contracts.ElectionManager = electionAddress;

  // ==================== DEPLOY BATCHVOTECOMMITMENT ====================
  console.log("\n📦 Deploying BatchVoteCommitment (Optimized)...");
  const BatchVoteCommitment = await hre.ethers.getContractFactory("BatchVoteCommitment");
  const batchVoteCommit = await BatchVoteCommitment.deploy(electionAddress);
  await batchVoteCommit.waitForDeployment();
  const batchAddress = await batchVoteCommit.getAddress();
  
  console.log(`   ✅ BatchVoteCommitment deployed to: ${batchAddress}`);
  deploymentInfo.contracts.BatchVoteCommitment = batchAddress;

  // ==================== DEPLOY VOTECOMMITMENT (Legacy) ====================
  console.log("\n📦 Deploying VoteCommitment (Legacy/Fallback)...");
  const VoteCommitment = await hre.ethers.getContractFactory("VoteCommitment");
  const voteCommitment = await VoteCommitment.deploy(electionAddress);
  await voteCommitment.waitForDeployment();
  const voteAddress = await voteCommitment.getAddress();
  
  console.log(`   ✅ VoteCommitment deployed to: ${voteAddress}`);
  deploymentInfo.contracts.VoteCommitment = voteAddress;

  // ==================== LINK CONTRACTS ====================
  console.log("\n🔗 Linking contracts...");
  const linkTx = await electionManager.setVoteCommitmentAddress(voteAddress);
  await linkTx.wait();
  console.log("   ✅ Contracts linked successfully");

  // ==================== SAVE DEPLOYMENT INFO ====================
  console.log("\n💾 Saving deployment information...");
  
  // Save to blockchain/deployments.json
  const blockchainDeployPath = path.join(__dirname, "../deployments.json");
  fs.writeFileSync(blockchainDeployPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`   ✅ Saved to: ${blockchainDeployPath}`);

  // Save to backend/deployments.json
  const backendDeployPath = path.join(__dirname, "../../backend/deployments.json");
  if (fs.existsSync(path.dirname(backendDeployPath))) {
    fs.writeFileSync(backendDeployPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`   ✅ Saved to: ${backendDeployPath}`);
  }

  // Save to frontend/src/deployments.json
  const frontendDeployPath = path.join(__dirname, "../../frontend/src/deployments.json");
  if (fs.existsSync(path.dirname(frontendDeployPath))) {
    fs.writeFileSync(frontendDeployPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`   ✅ Saved to: ${frontendDeployPath}`);
  }

  // ==================== VERIFICATION INFO ====================
  console.log("\n" + "=".repeat(80));
  console.log("✅ DEPLOYMENT COMPLETE");
  console.log("=".repeat(80) + "\n");

  console.log("📄 Deployed Contracts:");
  console.log(`   TallyManager:        ${tallyAddress}`);
  console.log(`   ElectionManager:     ${electionAddress}`);
  console.log(`   BatchVoteCommitment: ${batchAddress} (Use for >1000 voters)`);
  console.log(`   VoteCommitment:      ${voteAddress} (Legacy/individual votes)`);

  if (network !== "localhost" && network !== "hardhat") {
    console.log("\n🔍 Verify contracts on block explorer:");
    console.log(`   npx hardhat verify --network ${network} ${tallyAddress}`);
    console.log(`   npx hardhat verify --network ${network} ${electionAddress}`);
    console.log(`   npx hardhat verify --network ${network} ${batchAddress} ${electionAddress}`);
    console.log(`   npx hardhat verify --network ${network} ${voteAddress} ${electionAddress}`);
  }

  console.log("\n💡 Next Steps:");
  console.log("   1. Update your frontend to use the new contract addresses");
  console.log("   2. Configure backend to connect to the deployed contracts");
  console.log("   3. For elections >1,000 voters, use BatchVoteCommitment");
  console.log("   4. For smaller elections, use regular VoteCommitment");

  console.log("\n📊 Gas Usage Recommendations:");
  console.log("   - Elections <1,000 voters: Use VoteCommitment");
  console.log("   - Elections 1,000-10,000 voters: Use BatchVoteCommitment (batch size: 50)");
  console.log("   - Elections >10,000 voters: Use BatchVoteCommitment (batch size: 100)");
  
  console.log("\n" + "=".repeat(80) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
