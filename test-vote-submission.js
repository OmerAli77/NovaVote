/**
 * Test vote submission with real credentials
 */

async function testVoteSubmission() {
  console.log('='.repeat(80));
  console.log('🗳️  TESTING VOTE SUBMISSION');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Simulated voter credentials (these would come from the JSON file)
    const voteData = {
      electionId: 1,  // Use existing election
      candidateId: 0,  // First candidate (0-indexed in vote submission)
      voterSecret: '216570397994922002938117811661012543273449488796931206003551538721235225324',
      voterIndex: 0
    };

    console.log('📡 Sending POST request to submit vote...');
    console.log(`URL: http://localhost:3000/api/votes/submit`);
    console.log(`Data:`, voteData);
    console.log('');

    const response = await fetch(`http://localhost:3000/api/votes/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(voteData)
    });

    console.log(`Response Status: ${response.status} ${response.statusText}`);
    console.log('');

    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS!');
      console.log('');
      console.log('📊 Response Data:');
      console.log('-'.repeat(80));
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('❌ FAILED!');
      console.log('');
      console.log('Error Response:');
      console.log('-'.repeat(80));
      console.log(JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('');
    console.error('❌ REQUEST FAILED');
    console.error('='.repeat(80));
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }

  console.log('');
  console.log('='.repeat(80));
}

testVoteSubmission();
