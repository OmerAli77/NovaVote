/**
 * Test voter registration scaling with ZKP credentials
 */

const zkpSystem = require('./backend/src/services/zk-proof-system');

async function testScaling() {
  console.log('='.repeat(80));
  console.log('📈 TESTING VOTER REGISTRATION SCALING');
  console.log('='.repeat(80));
  console.log('');

  const testSizes = [10, 50, 100, 500, 1000];

  for (const size of testSizes) {
    try {
      const electionId = `test-election-${size}`;
      const voterIds = Array.from({ length: size }, (_, i) => `voter${String(i + 1).padStart(5, '0')}`);

      console.log(`📝 Testing with ${size} voters...`);

      const startTime = Date.now();
      const result = await zkpSystem.registerVoters(electionId, voterIds);
      const duration = Date.now() - startTime;

      console.log(`   ✅ Registered ${result.voters.length} voters in ${duration}ms (${(duration / size).toFixed(2)}ms per voter)`);
      console.log(`   Root: ${result.merkleRoot.substring(0, 30)}...`);
      console.log('');

    } catch (error) {
      console.error(`   ❌ Failed with ${size} voters:`, error.message);
    }
  }

  console.log('='.repeat(80));
  console.log('✅ SCALING TEST COMPLETE');
  console.log('='.repeat(80));
}

testScaling();
