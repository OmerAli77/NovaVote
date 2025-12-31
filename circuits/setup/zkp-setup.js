#!/usr/bin/env node

/**
 * ZK-SNARK Setup Script
 * 
 * This script performs the complete trusted setup for the voting circuit:
 * 1. Compiles the Circom circuit to R1CS constraint system
 * 2. Generates witness calculation program
 * 3. Performs Powers of Tau ceremony (trusted setup)
 * 4. Generates proving key and verification key
 * 5. Exports Solidity verifier contract
 * 
 * This only needs to be run once during initial deployment.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const CIRCUIT_NAME = 'vote';
const CIRCUITS_DIR = path.join(__dirname, '..');
const BUILD_DIR = path.join(CIRCUITS_DIR, 'build');
const PTAU_FILE = path.join(BUILD_DIR, 'powersOfTau28_hez_final_14.ptau');

async function runCommand(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    const { stdout, stderr } = await execPromise(command, {
      cwd: CIRCUITS_DIR,
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    if (stderr && !stderr.includes('Everything went okay')) {
      console.log('⚠️  Warning:', stderr);
    }
    console.log('✅ Complete');
    return stdout;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    throw error;
  }
}

async function setupZKCircuit() {
  console.log('\n' + '='.repeat(80));
  console.log('🔐 ZK-SNARK TRUSTED SETUP FOR VOTING CIRCUIT');
  console.log('='.repeat(80));
  
  // Create build directory
  if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
    console.log('✅ Created build directory');
  }
  
  // =====================================================
  // STEP 1: Compile Circuit
  // =====================================================
  await runCommand(
    `circom vote.circom --r1cs --wasm --sym -o build`,
    'Compiling Circom circuit to R1CS constraint system'
  );
  
  const r1csPath = path.join(BUILD_DIR, `${CIRCUIT_NAME}.r1cs`);
  const wasmDir = path.join(BUILD_DIR, `${CIRCUIT_NAME}_js`);
  
  if (!fs.existsSync(r1csPath)) {
    throw new Error('R1CS file not generated. Circuit compilation failed.');
  }
  
  // =====================================================
  // STEP 2: Print Circuit Info
  // =====================================================
  const snarkjs = require('snarkjs');
  const r1csInfo = await snarkjs.r1cs.info(r1csPath);
  
  console.log('\n📊 Circuit Information:');
  console.log(`   Constraints: ${r1csInfo.nConstraints.toLocaleString()}`);
  console.log(`   Variables: ${r1csInfo.nVars.toLocaleString()}`);
  console.log(`   Private inputs: ${r1csInfo.nPrvInputs}`);
  console.log(`   Public inputs: ${r1csInfo.nPubInputs}`);
  console.log(`   Labels: ${r1csInfo.nLabels.toLocaleString()}`);
  
  // =====================================================
  // STEP 3: Download Powers of Tau (if not exists)
  // =====================================================
  if (!fs.existsSync(PTAU_FILE)) {
    console.log('\n📥 Downloading Powers of Tau file (trusted setup ceremony)...');
    console.log('   This is a one-time download (~22MB)...');
    
    const https = require('https');
    const file = fs.createWriteStream(PTAU_FILE);
    
    await new Promise((resolve, reject) => {
      https.get('https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau', (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log('✅ Downloaded Powers of Tau file');
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(PTAU_FILE, () => {});
        reject(err);
      });
    });
  } else {
    console.log('✅ Powers of Tau file already exists');
  }
  
  // =====================================================
  // STEP 4: Generate Proving Key (zkey)
  // =====================================================
  const zkeyPath = path.join(BUILD_DIR, `${CIRCUIT_NAME}.zkey`);
  
  console.log('\n🔑 Generating proving key (this may take 1-2 minutes)...');
  await snarkjs.zKey.newZKey(r1csPath, PTAU_FILE, zkeyPath);
  console.log('✅ Proving key generated');
  
  // =====================================================
  // STEP 5: Export Verification Key
  // =====================================================
  const vkeyPath = path.join(BUILD_DIR, `${CIRCUIT_NAME}_vkey.json`);
  const vKey = await snarkjs.zKey.exportVerificationKey(zkeyPath);
  fs.writeFileSync(vkeyPath, JSON.stringify(vKey, null, 2));
  console.log('✅ Verification key exported');
  
  // =====================================================
  // STEP 6: Generate Solidity Verifier
  // =====================================================
  const verifierPath = path.join(CIRCUITS_DIR, '..', 'blockchain', 'contracts', 'VoteVerifier.sol');
  const verifierCode = await snarkjs.zKey.exportSolidityVerifier(zkeyPath);
  
  // Customize the verifier contract
  const customVerifier = verifierCode.replace(
    'contract Groth16Verifier',
    'contract VoteVerifier'
  );
  
  fs.writeFileSync(verifierPath, customVerifier);
  console.log('✅ Solidity verifier contract generated');
  
  // =====================================================
  // STEP 7: Create README
  // =====================================================
  const readme = `# ZK-SNARK Circuit Build Artifacts

This directory contains the compiled zero-knowledge proof circuit for NovaVote.

## Files

- **${CIRCUIT_NAME}.r1cs**: Rank-1 Constraint System (compiled circuit)
- **${CIRCUIT_NAME}.wasm**: WebAssembly witness calculator
- **${CIRCUIT_NAME}.zkey**: Proving key (used to generate proofs)
- **${CIRCUIT_NAME}_vkey.json**: Verification key (used to verify proofs)
- **powersOfTau28_hez_final_14.ptau**: Trusted setup parameters

## Circuit Statistics

- **Constraints**: ${r1csInfo.nConstraints.toLocaleString()}
- **Variables**: ${r1csInfo.nVars.toLocaleString()}
- **Private Inputs**: voterSecret, candidateId, merkleProof, merkleIndices
- **Public Inputs**: nullifierHash, merkleRoot, voteCommitment

## Security

The Powers of Tau file is from the Hermez trusted setup ceremony,
which had 340+ participants. As long as ONE participant destroyed
their toxic waste, the setup is secure.

## Usage

To generate a proof:
\`\`\`javascript
const proof = await generateVoteProof({
  voterSecret,
  candidateId,
  merkleProof,
  merkleIndices
});
\`\`\`

To verify a proof:
\`\`\`javascript
const isValid = await verifyVoteProof(proof, publicSignals);
\`\`\`

## Re-compilation

If you modify vote.circom, run:
\`\`\`bash
node circuits/setup/zkp-setup.js
\`\`\`
`;
  
  fs.writeFileSync(path.join(BUILD_DIR, 'README.md'), readme);
  
  // =====================================================
  // SUMMARY
  // =====================================================
  console.log('\n' + '='.repeat(80));
  console.log('✅ ZK-SNARK SETUP COMPLETE');
  console.log('='.repeat(80));
  console.log('\n📄 Generated Files:');
  console.log(`   ${r1csPath}`);
  console.log(`   ${wasmDir}/`);
  console.log(`   ${zkeyPath}`);
  console.log(`   ${vkeyPath}`);
  console.log(`   ${verifierPath}`);
  console.log('\n💡 Next Steps:');
  console.log('   1. Deploy VoteVerifier.sol contract');
  console.log('   2. Update VoteCommitment.sol to call verifier');
  console.log('   3. Use zkp-service.js to generate/verify proofs\n');
}

// Run setup
setupZKCircuit().catch(error => {
  console.error('\n❌ Setup failed:', error);
  process.exit(1);
});
