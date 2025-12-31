/**
 * Full end-to-end test: Create election → Register voters → Submit vote
 */

async function fullVotingFlowTest() {
  console.log('='.repeat(80));
  console.log('🔄 FULL VOTING FLOW TEST');
  console.log('='.repeat(80));
  console.log('');

  try {
    // STEP 1: Create Election
    console.log('📋 STEP 1: Creating election...');
    const electionData = {
      title: 'E2E Test Election',
      description: 'End-to-end test with ZKP',
      startTime: new Date(Date.now() - 60000).toISOString(), // Started 1 min ago
      endTime: new Date(Date.now() + 3600000).toISOString(), // Ends in 1 hour
      candidates: ['Alice', 'Bob', 'Charlie']
    };

    const createRes = await fetch('http://localhost:3000/api/elections/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(electionData)
    });

    if (!createRes.ok) {
      const error = await createRes.json();
      throw new Error(`Election creation failed: ${error.details || error.error}`);
    }

    const election = await createRes.json();
    const electionId = election.electionId;
    console.log(`✅ Election created: ID ${electionId}`);
    console.log('');

    // STEP 2: Start Election
    console.log('📋 STEP 2: Starting election...');
    const startRes = await fetch(`http://localhost:3000/api/elections/${electionId}/start`, {
      method: 'POST'
    });

    if (!startRes.ok) {
      const error = await startRes.json();
      console.log(`⚠️  Start election warning: ${error.error || error.details}`);
    } else {
      console.log('✅ Election started');
    }
    console.log('');

    // STEP 3: Register Voters
    console.log('📋 STEP 3: Registering voters...');
    const voterIds = ['voter001', 'voter002', 'voter003'];
    
    const registerRes = await fetch(`http://localhost:3000/api/elections/${electionId}/register-voters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voterIds })
    });

    if (!registerRes.ok) {
      const error = await registerRes.json();
      throw new Error(`Voter registration failed: ${error.details || error.error}`);
    }

    const registration = await registerRes.json();
    console.log(`✅ Registered ${registration.votersRegistered} voters`);
    console.log(`   Merkle root: ${registration.merkleRoot.substring(0, 30)}...`);
    
    const voter1 = registration.voterData[0];
    console.log('');
    console.log('Voter 1 Credentials:');
    console.log(`  voterId: ${voter1.voterId}`);
    console.log(`  voterSecret: ${voter1.voterSecret.substring(0, 30)}...`);
    console.log(`  commitment: ${voter1.commitment.substring(0, 30)}...`);
    console.log(`  voterIndex: ${voter1.voterIndex}`);
    console.log('');

    // STEP 4: Submit Vote
    console.log('📋 STEP 4: Submitting vote...');
    const voteData = {
      electionId: parseInt(electionId),
      candidateId: 0, // Alice (0-indexed)
      voterSecret: voter1.voterSecret,
      voterIndex: voter1.voterIndex
    };

    const voteRes = await fetch('http://localhost:3000/api/votes/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voteData)
    });

    if (!voteRes.ok) {
      const error = await voteRes.json();
      console.error('❌ Vote submission failed:');
      console.error('   Error:', error.error);
      console.error('   Details:', error.details);
      if (error.hint) console.error('   Hint:', error.hint);
      throw new Error(`Vote submission failed: ${error.details || error.error}`);
    }

    const vote = await voteRes.json();
    console.log('✅ Vote submitted successfully!');
    console.log(`   Receipt hash: ${vote.receiptHash}`);
    console.log(`   Transaction: ${vote.transactionHash}`);
    console.log('');

    console.log('='.repeat(80));
    console.log('✅ FULL VOTING FLOW TEST PASSED!');
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

fullVotingFlowTest();
