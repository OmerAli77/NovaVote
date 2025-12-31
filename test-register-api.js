/**
 * Test voter registration API endpoint
 */

async function testRegisterAPI() {
  console.log('='.repeat(80));
  console.log('🧪 TESTING VOTER REGISTRATION API');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Test data - use election ID 2 since 1 is already registered
    const electionId = 2;
    const voterIds = ['voter001', 'voter002', 'voter003', 'voter004', 'voter005'];

    console.log('📡 Sending POST request to register voters...');
    console.log(`URL: http://localhost:3000/api/elections/${electionId}/register-voters`);
    console.log(`Voter IDs: ${voterIds.join(', ')}`);
    console.log('');

    const response = await fetch(`http://localhost:3000/api/elections/${electionId}/register-voters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ voterIds })
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

testRegisterAPI();
