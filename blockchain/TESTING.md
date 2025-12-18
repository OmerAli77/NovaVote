# Performance Testing Guide

## Overview

This document explains how to run comprehensive performance tests for the NovaVote blockchain voting system.

## Test Script

The performance test simulates real-world election scenarios with multiple concurrent elections, voter registration, vote casting, and result tallying.

### What It Tests

1. **Smart Contract Deployment**
   - TallyManager contract
   - ElectionManager contract
   - VoteCommitment contract
   - Contract linking

2. **Election Creation**
   - Multiple concurrent elections
   - Candidate management
   - Election lifecycle

3. **Voter Registration**
   - Merkle root-based registration
   - Batch efficiency
   - Gas optimization

4. **Voting Process**
   - Vote commitment submission
   - ZKP proof generation
   - Nullifier tracking
   - Transaction throughput

5. **Result Tallying**
   - Vote verification
   - Result calculation
   - Data integrity checks

## Running the Tests

### Prerequisites

1. **Start Hardhat Local Blockchain**
   
   In a separate terminal, run:
   ```bash
   cd blockchain
   npx hardhat node
   ```
   
   Keep this terminal running - it acts as your local Ethereum network.

2. **Ensure Dependencies Are Installed**
   ```bash
   cd blockchain
   npm install
   ```

### Execute Performance Test

In a new terminal:

```bash
cd blockchain
npx hardhat run scripts/test-performance.js --network localhost
```

### Expected Output

```
================================================================================
🧪 BLOCKCHAIN VOTING SYSTEM - PERFORMANCE TEST
================================================================================

📋 Test Configuration:
   Owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
   Available test accounts: 19
   Network: localhost

📦 PHASE 1: Deploying Smart Contracts...
   ✅ TallyManager deployed at: 0x...
   ✅ ElectionManager deployed at: 0x...
   ✅ VoteCommitment deployed at: 0x...

📋 PHASE 2: Creating Test Elections...
   ✅ Presidential Election 2025 (3 candidates, 100 voters)
   ✅ Senate Election - District 5 (2 candidates, 75 voters)
   ✅ City Council - Ward 3 (4 candidates, 50 voters)

👥 PHASE 3: Registering Voters...
   ✅ 225 voters registered via Merkle roots

🗳️  PHASE 4: Simulating Voting Process...
   ✅ 180 votes cast (80% turnout, 100% success rate)

📊 PHASE 5: Tallying Results & ZKP Verification...
   ✅ All votes verified and tallied

📈 PHASE 6: Generating Performance Report...
   ✅ Report saved to: blockchain/test-results.json

================================================================================
📊 TEST SUMMARY
================================================================================

🎯 Overall Results:
   Total Elections: 3
   Total Voters Registered: 225
   Total Votes Cast: 180
   Success Rate: 100.00%

⚡ Performance Metrics:
   Avg Gas per Vote: 194,745
   Avg Time per Vote: 9.64ms
   Transactions/Second: 103.69
   
✅ All tests completed successfully!
```

## Test Results

After running the test, detailed results are saved to:

```
blockchain/test-results.json
```

This JSON file contains:

- Deployment metrics (gas costs, timing)
- Election creation details
- Voter registration statistics
- Voting performance data
- ZKP verification metrics
- Complete election results
- Performance benchmarks

## Interpreting Results

### Key Metrics

| Metric | What It Means | Good Value |
|--------|---------------|------------|
| **Success Rate** | % of transactions that succeeded | 100% |
| **TPS** | Transactions per second | >50 |
| **Avg Time per Vote** | How long voters wait | <20ms |
| **Avg Gas per Vote** | Cost per vote | <200,000 |
| **ZKP Verification** | Proof check speed | <1ms |

### Performance Indicators

✅ **Excellent Performance:**
- 100% success rate
- TPS > 100
- Vote time < 10ms
- Zero failed transactions

⚠️ **Acceptable Performance:**
- 95%+ success rate
- TPS > 20
- Vote time < 50ms
- < 1% failed transactions

❌ **Needs Investigation:**
- Success rate < 95%
- TPS < 10
- Vote time > 100ms
- > 5% failed transactions

## Customizing Tests

### Modify Voter Count

Edit `scripts/test-performance.js`:

```javascript
const elections = [
  {
    name: "Presidential Election 2025",
    candidates: ["Alice Johnson", "Bob Smith", "Carol Williams"],
    voterCount: 500  // Change this number
  },
  // ... more elections
];
```

### Modify Turnout Rate

Edit the participation rate (default: 80%):

```javascript
const participationRate = 0.8; // 80% turnout
const votersWhoVote = Math.floor(election.voterIds.length * participationRate);
```

### Add More Elections

Add to the elections array:

```javascript
const elections = [
  // ... existing elections
  {
    name: "School Board Election",
    candidates: ["Teacher A", "Teacher B", "Teacher C"],
    voterCount: 200
  }
];
```

## Performance Benchmarks

Based on test results with 225 voters and 180 votes:

| Phase | Time | Gas | Notes |
|-------|------|-----|-------|
| Deployment | 174ms | 2,586,700 | One-time cost |
| Election Creation | 57ms avg | ~287K | Per election |
| Voter Registration | 95ms total | 177,639 | All elections |
| Voting (180 votes) | 4.2s | 35M | ~9.64ms per vote |
| Verification | 62ms | 0 | Off-chain |

## Troubleshooting

### Error: "Cannot connect to network"

**Solution:** Make sure Hardhat node is running:
```bash
npx hardhat node
```

### Error: "Insufficient funds"

**Solution:** Restart Hardhat node to reset test accounts:
```bash
# Kill existing node (Ctrl+C)
npx hardhat node
```

### Error: "Contract deployment failed"

**Solution:** Clean and recompile contracts:
```bash
npx hardhat clean
npx hardhat compile
```

### Slow Performance

**Causes:**
- Other applications using CPU
- Antivirus scanning node_modules
- Low system resources

**Solutions:**
- Close unnecessary applications
- Add node_modules to antivirus exclusions
- Reduce voter count in test configuration

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Performance Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd blockchain && npm install
      - run: cd blockchain && npx hardhat node &
      - run: sleep 5  # Wait for node to start
      - run: cd blockchain && npx hardhat run scripts/test-performance.js --network localhost
      - uses: actions/upload-artifact@v2
        with:
          name: test-results
          path: blockchain/test-results.json
```

## Best Practices

1. **Run tests before major releases**
   - Catch performance regressions early
   - Validate gas optimizations

2. **Compare results over time**
   - Track performance trends
   - Identify degradation

3. **Test on clean blockchain**
   - Restart Hardhat node between runs
   - Ensures consistent state

4. **Save test results**
   - Commit test-results.json to git
   - Document performance baselines

5. **Monitor gas costs**
   - Track changes in gas usage
   - Optimize expensive operations

## Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethereum Gas Optimization](https://ethereum.org/en/developers/docs/gas/)
- [Main README](../README.md)
- [Presentation Guide](../PRESENTATION_GUIDE.md)

## Support

For issues or questions:
1. Check console output for error messages
2. Review [troubleshooting section](#troubleshooting)
3. Check blockchain node logs
4. Verify all dependencies are installed

---

**Last Updated:** December 18, 2025  
**Test Version:** 1.0  
**Compatible With:** NovaVote v1.0
