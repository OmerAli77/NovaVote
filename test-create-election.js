/**
 * Test election creation
 */

async function testCreateElection() {
  console.log('='.repeat(80));
  console.log('📋 TESTING ELECTION CREATION');
  console.log('='.repeat(80));
  console.log('');

  try {
    const electionData = {
      title: 'Test Election 2025',
      description: 'Testing election creation with ZKP',
      startTime: new Date(Date.now() + 60000).toISOString(), // Start in 1 minute
      endTime: new Date(Date.now() + 3600000).toISOString(), // End in 1 hour
      candidates: ['Alice', 'Bob', 'Charlie']
    };

    console.log('📡 Sending POST request to create election...');
    console.log(`URL: http://localhost:3000/api/elections/create`);
    console.log(`Data:`, JSON.stringify(electionData, null, 2));
    console.log('');

    const response = await fetch(`http://localhost:3000/api/elections/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(electionData)
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

testCreateElection();
