/**
 * Test voter registration with ZKP credentials
 */

const zkpSystem = require('./backend/src/services/zk-proof-system');

async function testVoterRegistration() {
  console.log('='.repeat(80));
  console.log('🧪 TESTING VOTER REGISTRATION WITH ZKP');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Test voter registration
    const electionId = 'test-election-001';
    const voterIds = ['voter001', 'voter002', 'voter003', 'voter004', 'voter005'];

    console.log(`📝 Registering ${voterIds.length} voters...`);
    console.log(`Election ID: ${electionId}`);
    console.log(`Voter IDs: ${voterIds.join(', ')}`);
    console.log('');

    const startTime = Date.now();
    const result = await zkpSystem.registerVoters(electionId, voterIds);
    const duration = Date.now() - startTime;

    console.log('✅ Registration successful!');
    console.log('');
    console.log('📊 RESULTS:');
    console.log('-'.repeat(80));
    console.log(`Merkle Root: ${result.merkleRoot.substring(0, 50)}...`);
    console.log(`Voters Registered: ${result.voters.length}`);
    console.log(`Processing Time: ${duration}ms`);
    console.log('');

    console.log('👥 VOTER CREDENTIALS:');
    console.log('-'.repeat(80));
    result.voters.forEach((voter, idx) => {
      console.log(`\nVoter ${idx + 1}: ${voter.voterId}`);
      console.log(`  Secret: ${voter.secret.substring(0, 40)}...`);
      console.log(`  Commitment: ${voter.commitment.substring(0, 40)}...`);
    });

    console.log('');
    console.log('='.repeat(80));
    console.log('✅ TEST PASSED - Voter registration working correctly!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('');
    console.error('❌ TEST FAILED');
    console.error('='.repeat(80));
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('='.repeat(80));
    process.exit(1);
  }
}

testVoterRegistration();
