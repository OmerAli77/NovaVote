/**
 * Check existing elections
 */

async function checkElections() {
  console.log('📋 Fetching existing elections...\n');

  try {
    const response = await fetch('http://localhost:3000/api/elections');
    const elections = await response.json();

    console.log(`Found ${elections.length} election(s):\n`);
    elections.forEach((election, idx) => {
      console.log(`${idx + 1}. ID: ${election.id} - "${election.title}"`);
      console.log(`   Status: ${election.status}`);
      console.log(`   Start: ${election.startTime}`);
      console.log(`   End: ${election.endTime}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkElections();
