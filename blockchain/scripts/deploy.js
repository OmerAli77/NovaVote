const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying NovaVote contracts...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString(), "\n");

  // Deploy ElectionManager
  console.log("📋 Deploying ElectionManager...");
  const ElectionManager = await hre.ethers.getContractFactory("ElectionManager");
  const electionManager = await ElectionManager.deploy();
  await electionManager.waitForDeployment();
  const electionManagerAddress = await electionManager.getAddress();
  console.log("✅ ElectionManager deployed to:", electionManagerAddress, "\n");

  // Deploy VoteCommitment
  console.log("🗳️  Deploying VoteCommitment...");
  const VoteCommitment = await hre.ethers.getContractFactory("VoteCommitment");
  const voteCommitment = await VoteCommitment.deploy(electionManagerAddress);
  await voteCommitment.waitForDeployment();
  const voteCommitmentAddress = await voteCommitment.getAddress();
  console.log("✅ VoteCommitment deployed to:", voteCommitmentAddress, "\n");

  // Deploy TallyManager
  console.log("📊 Deploying TallyManager...");
  const TallyManager = await hre.ethers.getContractFactory("TallyManager");
  const tallyManager = await TallyManager.deploy();
  await tallyManager.waitForDeployment();
  const tallyManagerAddress = await tallyManager.getAddress();
  console.log("✅ TallyManager deployed to:", tallyManagerAddress, "\n");

  // Link ElectionManager to VoteCommitment
  console.log("🔗 Linking ElectionManager to VoteCommitment...");
  const tx = await electionManager.setVoteCommitmentAddress(voteCommitmentAddress);
  await tx.wait();
  console.log("✅ ElectionManager linked to VoteCommitment\n");

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    contracts: {
      ElectionManager: electionManagerAddress,
      VoteCommitment: voteCommitmentAddress,
      TallyManager: tallyManagerAddress
    },
    timestamp: new Date().toISOString()
  };

  const deploymentPath = path.join(__dirname, "..", "deployments.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to deployments.json\n");

  // Copy deployment info to backend
  const backendPath = path.join(__dirname, "..", "..", "backend", "deployments.json");
  try {
    fs.writeFileSync(backendPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info copied to backend/deployments.json\n");
  } catch (error) {
    console.log("⚠️  Could not copy to backend (folder may not exist yet)\n");
  }

  // Copy deployment info to frontend
  const frontendPath = path.join(__dirname, "..", "..", "frontend", "src", "deployments.json");
  try {
    fs.mkdirSync(path.dirname(frontendPath), { recursive: true });
    fs.writeFileSync(frontendPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info copied to frontend/src/deployments.json\n");
  } catch (error) {
    console.log("⚠️  Could not copy to frontend (folder may not exist yet)\n");
  }

  console.log("✨ Deployment complete!\n");
  console.log("Contract Addresses:");
  console.log("-------------------");
  console.log("ElectionManager:", electionManagerAddress);
  console.log("VoteCommitment:", voteCommitmentAddress);
  console.log("TallyManager:", tallyManagerAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
