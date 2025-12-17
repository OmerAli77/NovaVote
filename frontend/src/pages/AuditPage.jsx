import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { auditAPI, votesAPI, electionsAPI } from '../services/api'
import deployments from '../deployments.json'

export default function AuditPage() {
  const { electionId } = useParams()
  const navigate = useNavigate()
  const [election, setElection] = useState(null)
  const [stats, setStats] = useState(null)
  const [integrity, setIntegrity] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('audit')
  const [blockchainData, setBlockchainData] = useState([])
  const [selectedBlock, setSelectedBlock] = useState(null)

  // Helper to check if hash is empty/zero
  const isEmptyHash = (hash) => {
    return !hash || hash === '0x0000000000000000000000000000000000000000000000000000000000000000' || 
           hash === '0x' || hash.replace(/0x?0*/g, '') === ''
  }

  useEffect(() => {
    loadAuditData()
  }, [electionId])

  const loadAuditData = async () => {
    setLoading(true)
    try {
      const [electionRes, statsRes, integrityRes] = await Promise.all([
        electionsAPI.getById(electionId),
        auditAPI.getStats(electionId),
        auditAPI.verify(electionId)
      ])

      setElection(electionRes.data)
      setStats(statsRes.data)
      setIntegrity(integrityRes.data)

      try {
        const auditTrailRes = await auditAPI.getTrail(electionId)
        const commitments = auditTrailRes.data.commitments || []
        
        const blocks = commitments.map((commitment, index) => ({
          blockNumber: index + 1,
          timestamp: parseInt(commitment.timestamp),
          commitment: commitment.voteHash,
          credentialHash: commitment.credentialHash,
          proofHash: commitment.proofHash,
          previousHash: index === 0 ? '0x0000000000000000000000000000000000000000' : commitments[index - 1].voteHash
        }))
        
        setBlockchainData(blocks)
      } catch (err) {
        console.log('Could not load blockchain data:', err)
      }

      if (statsRes.data.tallyFinalized) {
        try {
          const resultsRes = await votesAPI.getResults(electionId)
          setResults(resultsRes.data)
        } catch (err) {
          console.log('Results not available yet')
        }
      }
    } catch (error) {
      console.error('Failed to load audit data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-primary)] border-t-transparent"></div>
        <p className="mt-4 text-[var(--text-muted)] text-sm">Loading audit data...</p>
      </div>
    )
  }

  if (!election) {
    return (
      <div className="card text-center py-16">
        <p className="text-red-400">Election not found</p>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-1">Election Audit</h1>
            <p className="text-[var(--text-muted)]">{election.title}</p>
          </div>
          <button onClick={() => navigate('/')} className="btn-outline text-sm">
            ← Back
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-6 border-b border-[var(--border-primary)]">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
              activeTab === 'audit'
                ? 'text-[var(--accent-primary)] border-[var(--accent-primary)]'
                : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'
            }`}
          >
            Audit Results
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
              activeTab === 'architecture'
                ? 'text-[var(--accent-primary)] border-[var(--accent-primary)]'
                : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'
            }`}
          >
            Blockchain & Architecture
          </button>
        </div>
      </div>

      {activeTab === 'audit' ? (
        <>
          {/* What is Vote Commitment Explanation */}
          <div className="card border-indigo-500/30 bg-indigo-500/5">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-base font-semibold text-indigo-300 mb-2">What is a Vote Commitment?</h2>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-3">
                  A <strong className="text-indigo-300">Vote Commitment</strong> is a cryptographic hash (SHA-256) that represents an encrypted vote stored on the blockchain. 
                  Think of it as a sealed envelope - it proves a vote exists without revealing the actual choice.
                </p>
                <div className="grid md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-indigo-500/20">
                    <div className="font-medium text-indigo-300 mb-1">🔒 Privacy Protected</div>
                    <div className="text-[var(--text-muted)]">Your vote choice is never stored or revealed</div>
                  </div>
                  <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-indigo-500/20">
                    <div className="font-medium text-indigo-300 mb-1">✓ Verifiable</div>
                    <div className="text-[var(--text-muted)]">Anyone can verify votes were counted correctly</div>
                  </div>
                  <div className="bg-[var(--bg-secondary)] rounded-lg p-3 border border-indigo-500/20">
                    <div className="font-medium text-indigo-300 mb-1">⚡ Immutable</div>
                    <div className="text-[var(--text-muted)]">Once committed, cannot be changed or deleted</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Integrity Check */}
          {integrity && (
            <div
              className={`card ${
                integrity.integrity
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-red-500/30 bg-red-500/5'
              }`}
            >
          <div className="flex items-center space-x-4">
            {integrity.integrity ? (
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            ) : (
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            )}
            <div>
              <h2 className={`text-lg font-medium ${integrity.integrity ? 'text-emerald-400' : 'text-red-400'}`}>
                {integrity.integrity ? 'Integrity Verified' : 'Integrity Check Failed'}
              </h2>
              <p className="text-[var(--text-muted)] text-sm mt-0.5">{integrity.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Status" value={stats.status} />
          <StatCard label="Total Votes" value={stats.voteCount} />
          <StatCard label="Candidates" value={stats.candidateCount} />
          <StatCard
            label="Tally Status"
            value={stats.tallyFinalized ? 'Finalized' : 'Pending'}
          />
        </div>
      )}

      {/* Election Details */}
      <div className="card">
        <h2 className="text-base font-medium text-[var(--text-primary)] mb-4">Election Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[var(--text-muted)] text-xs">Title</p>
            <p className="text-[var(--text-primary)] font-medium">{election.title}</p>
          </div>
          <div>
            <p className="text-[var(--text-muted)] text-xs">Description</p>
            <p className="text-[var(--text-secondary)]">{election.description || 'N/A'}</p>
          </div>
          <div>
            <p className="text-[var(--text-muted)] text-xs">Start Time</p>
            <p className="text-[var(--text-secondary)]">{new Date(election.startTime).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[var(--text-muted)] text-xs">End Time</p>
            <p className="text-[var(--text-secondary)]">{new Date(election.endTime).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Election Results</h2>
          
          <div className="space-y-4">
            {results.results.map((result, index) => {
              const percentage = results.totalVotes > 0
                ? ((parseInt(result.voteCount) / parseInt(results.totalVotes)) * 100).toFixed(1)
                : 0

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{result.candidateName}</span>
                    <span className="text-gray-400">
                      {result.voteCount} votes ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
                    <div
                      style={{ width: `${percentage}%` }}
                      className="h-full bg-gradient-to-r from-primary-500 to-purple-600 transition-all duration-1000"
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-dark-700">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total Votes</span>
              <span className="text-primary-400">{results.totalVotes}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Finalized at: {new Date(results.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Blockchain Info */}
      <div className="card border-blue-500/20 bg-gradient-to-br from-blue-900/20 to-slate-900">
        <h3 className="font-semibold mb-3 text-blue-300 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          How Vote Commitments Protect Your Privacy
        </h3>
        <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
          <li className="flex items-start space-x-3">
            <span className="text-emerald-400 flex-shrink-0">✓</span>
            <span><strong className="text-[var(--text-primary)]">Encrypted Storage:</strong> Each vote is hashed using SHA-256 before being stored on-chain. The original vote is never recorded.</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-emerald-400 flex-shrink-0">✓</span>
            <span><strong className="text-[var(--text-primary)]">Zero-Knowledge Proofs:</strong> ZK proofs verify your vote is valid without revealing your choice. Only proof hashes are stored.</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-emerald-400 flex-shrink-0">✓</span>
            <span><strong className="text-[var(--text-primary)]">Public Auditability:</strong> Anyone can count the total commitments and verify the election result is accurate.</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-emerald-400 flex-shrink-0">✓</span>
            <span><strong className="text-[var(--text-primary)]">Double-Vote Prevention:</strong> Each voter's credential hash can only create one commitment per election.</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-emerald-400 flex-shrink-0">✓</span>
            <span><strong className="text-[var(--text-primary)]">Anonymity Guaranteed:</strong> No voter identity or choice is ever stored - only cryptographic commitments exist on the blockchain.</span>
          </li>
        </ul>
      </div>

      {/* Blockchain Visualization */}
      <div className="card bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 border-2 border-blue-700/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h2 className="text-2xl font-bold text-blue-200">Vote Blockchain Explorer</h2>
          </div>
          <div className="text-sm text-gray-400">
            {blockchainData.length} blocks
          </div>
        </div>

        <p className="text-gray-300 mb-6 text-sm">
          Click on any block to see the encryption details and cryptographic proof
        </p>

        {blockchainData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p>No votes cast yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blockchainData.map((block, index) => (
              <div
                key={block.blockNumber}
                onClick={() => setSelectedBlock(selectedBlock?.blockNumber === block.blockNumber ? null : block)}
                className={`cursor-pointer transition-all duration-300 rounded-xl border-2 ${
                  selectedBlock?.blockNumber === block.blockNumber
                    ? 'border-cyan-500 bg-cyan-900/30 shadow-lg shadow-cyan-500/20'
                    : 'border-slate-700 bg-slate-800/50 hover:border-blue-600 hover:bg-slate-800'
                }`}
              >
                {/* Block Header */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">#{block.blockNumber}</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-white">Block {block.blockNumber}</h3>
                          <span className="px-2 py-1 bg-green-600/20 border border-green-600 rounded text-green-300 text-xs">
                            Confirmed
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(block.timestamp * 1000).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Commitment Hash</div>
                      <code className={`text-xs font-mono ${isEmptyHash(block.commitment) ? 'text-yellow-400' : 'text-blue-300'}`}>
                        {isEmptyHash(block.commitment) 
                          ? '[Empty - No vote data]' 
                          : `${block.commitment.slice(0, 10)}...${block.commitment.slice(-8)}`
                        }
                      </code>
                    </div>
                  </div>

                  {/* Chain Link Visualization */}
                  {index < blockchainData.length - 1 && (
                    <div className="flex items-center justify-center my-2">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <div className="w-3 h-3 border-2 border-gray-600 rounded-full"></div>
                        <div className="w-16 h-0.5 bg-gradient-to-r from-gray-600 to-transparent"></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded Details */}
                {selectedBlock?.blockNumber === block.blockNumber && (
                  <div className="border-t-2 border-cyan-600/50 bg-slate-900/80 p-6 space-y-6">
                    {/* Block Details Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left Column - Block Metadata */}
                      <div className="space-y-4">
                        <h4 className="text-cyan-300 font-semibold flex items-center text-sm">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Block Information
                        </h4>
                        <div className="bg-dark-800 rounded-lg p-4 space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Block Number:</span>
                            <span className="text-white font-mono">#{block.blockNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Timestamp:</span>
                            <span className="text-white font-mono text-xs">
                              {new Date(block.timestamp * 1000).toISOString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">ZK Proof Hash:</span>
                            <code className="text-purple-300 font-mono text-xs">
                              {block.proofHash.slice(0, 10)}...{block.proofHash.slice(-8)}
                            </code>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Previous Hash:</span>
                            <code className={`font-mono text-xs ${index === 0 ? 'text-gray-500' : 'text-blue-300'}`}>
                              {index === 0 ? '[Genesis Block]' : `${block.previousHash.slice(0, 10)}...${block.previousHash.slice(-8)}`}
                            </code>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Cryptographic Data */}
                      <div className="space-y-4">
                        <h4 className="text-cyan-300 font-semibold flex items-center text-sm">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Encrypted Data
                        </h4>
                        <div className="bg-dark-800 rounded-lg p-4 space-y-3">
                          <div>
                            <span className="text-gray-400 text-sm">Vote Commitment:</span>
                            <div className="mt-2 bg-dark-900 rounded p-3 break-all">
                              {isEmptyHash(block.commitment) ? (
                                <div className="text-yellow-400 text-xs">
                                  ⚠️ No vote hash recorded (possible data issue)
                                </div>
                              ) : (
                                <code className="text-green-300 font-mono text-xs">
                                  {block.commitment}
                                </code>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400 text-sm">Credential Hash:</span>
                            <div className="mt-2 bg-dark-900 rounded p-3 break-all">
                              {isEmptyHash(block.credentialHash) ? (
                                <div className="text-yellow-400 text-xs">
                                  ⚠️ No credential hash recorded
                                </div>
                              ) : (
                                <code className="text-purple-300 font-mono text-xs">
                                  {block.credentialHash}
                                </code>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Encryption Process Visualization */}
                    <div className="border-t border-cyan-700/30 pt-6">
                      <h4 className="text-cyan-300 font-semibold mb-4 flex items-center text-sm">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        How This Vote Was Encrypted
                      </h4>
                      
                      <div className="grid md:grid-cols-3 gap-4">
                        {/* Step 1: Private Input */}
                        <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 border border-green-700 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              1
                            </div>
                            <h5 className="font-semibold text-green-300 text-sm">Private Input</h5>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="bg-dark-900 rounded p-2">
                              <div className="text-gray-400">Voter Choice:</div>
                              <div className="text-green-300 font-mono mt-1 flex items-center space-x-2">
                                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span className="text-yellow-300">[ENCRYPTED - Hidden]</span>
                              </div>
                              <div className="text-gray-500 text-[10px] mt-1 italic">
                                Only the voter knows their choice
                              </div>
                            </div>
                            <div className="bg-dark-900 rounded p-2">
                              <div className="text-gray-400">Voter Credential:</div>
                              <div className="text-green-300 font-mono mt-1 break-all">
                                {block.credentialHash.slice(0, 20)}...
                              </div>
                            </div>
                            <div className="bg-dark-900 rounded p-2">
                              <div className="text-gray-400">Timestamp:</div>
                              <div className="text-green-300 font-mono mt-1">{block.timestamp}</div>
                            </div>
                          </div>
                        </div>

                        {/* Step 2: Hash Function */}
                        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-700 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              2
                            </div>
                            <h5 className="font-semibold text-blue-300 text-sm">Encryption</h5>
                          </div>
                          <div className="space-y-3 text-xs">
                            <div className="bg-dark-900 rounded p-3">
                              <div className="text-blue-200 font-mono mb-2">SHA-256 Hash:</div>
                              <div className="text-gray-400 text-[10px] leading-relaxed">
                                Hash(<br/>
                                &nbsp;&nbsp;vote +<br/>
                                &nbsp;&nbsp;credential +<br/>
                                &nbsp;&nbsp;timestamp<br/>
                                )
                              </div>
                            </div>
                            <div className="flex items-center justify-center">
                              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </div>
                            <div className="text-center text-gray-400">
                              One-way function
                              <br/>
                              <span className="text-[10px]">(Irreversible)</span>
                            </div>
                          </div>
                        </div>

                        {/* Step 3: Public Output */}
                        <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 border border-purple-700 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              3
                            </div>
                            <h5 className="font-semibold text-purple-300 text-sm">Public Output</h5>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="bg-dark-900 rounded p-2">
                              <div className="text-gray-400 mb-1">Commitment (on blockchain):</div>
                              <div className="text-purple-300 font-mono text-[10px] break-all">
                                {block.commitment}
                              </div>
                            </div>
                            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded p-2 mt-3">
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span className="text-yellow-300 text-[10px]">
                                  Vote choice is permanently hidden
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Security Note */}
                      <div className="mt-4 bg-indigo-900/20 border border-indigo-700/50 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <svg className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <div className="flex-1">
                            <h5 className="font-semibold text-indigo-300 text-sm mb-2">Privacy Guarantee</h5>
                            <p className="text-gray-300 text-xs leading-relaxed">
                              This commitment is <strong className="text-indigo-200">mathematically impossible to reverse</strong>. 
                              The SHA-256 hash function has 2^256 possible outputs (≈ 1.16 × 10^77). 
                              Even with all the computing power in the world, the original vote cannot be recovered from this hash. 
                              Only the voter with their secret credential can prove what they voted for.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ZKP Vote Integrity Diagram */}
      <div className="card bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-blue-900/30 border-2 border-purple-700/50"> {/* Voting Process Flow */}
        <div className="space-y-6">
          {/* Step 1: Vote Casting */}
          <div className="relative">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-300 mb-2">Vote Casting (Private Layer)</h3>
                <div className="bg-dark-800/70 rounded-lg p-4 border border-green-700/30">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 mb-2">Voter's Device (Secret):</p>
                      <ul className="space-y-1 text-xs">
                        <li className="flex items-center space-x-2">
                          <span className="text-green-400">🔑</span>
                          <span>Voter ID: <code className="text-green-300">V001</code></span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="text-green-400">🗳️</span>
                          <span>Vote Choice: <code className="text-green-300">Alice Johnson</code></span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <span className="text-green-400">🔐</span>
                          <span>Credential: <code className="text-green-300 text-[10px]">a7f3c2e9d1...</code></span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-2">ZKP Generation:</p>
                      <div className="bg-dark-900 rounded p-3 font-mono text-[10px] text-purple-300">
                        <div>Hash = SHA256(</div>
                        <div className="ml-4">vote: "Alice",</div>
                        <div className="ml-4">credential: "a7f3...",</div>
                        <div className="ml-4">timestamp: 1702567890</div>
                        <div>)</div>
                        <div className="mt-2 text-blue-300">→ 0xe7f1725E...bb3F0512</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Arrow down */}
            <div className="ml-6 h-8 w-0.5 bg-gradient-to-b from-purple-500 to-transparent"></div>
          </div>

          {/* Step 2: Blockchain Storage */}
          <div className="relative">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-300 mb-2">Blockchain Storage (Public Layer)</h3>
                <div className="bg-dark-800/70 rounded-lg p-4 border border-blue-700/30">
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-400 mb-2">What's Stored On-Chain (Everyone Can See):</p>
                      <div className="bg-dark-900 rounded p-3 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Vote Commitment:</span>
                          <code className="text-blue-300 font-mono text-[10px]">0xe7f1725E...bb3F0512</code>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Election ID:</span>
                          <code className="text-blue-300">1</code>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Timestamp:</span>
                          <code className="text-blue-300">1702567890</code>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Credential Hash:</span>
                          <code className="text-blue-300 font-mono text-[10px]">a7f3c2e9d1...</code>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-yellow-900/20 border border-yellow-700/30 rounded p-2">
                      <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-yellow-300 text-xs">❌ Vote choice "Alice" is NOT stored - Impossible to reverse the hash</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Arrow down */}
            <div className="ml-6 h-8 w-0.5 bg-gradient-to-b from-purple-500 to-transparent"></div>
          </div>

          {/* Step 3: Vote Verification */}
          <div className="relative">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-purple-300 mb-2">Individual Verification (Voter Can Prove)</h3>
                <div className="bg-dark-800/70 rounded-lg p-4 border border-purple-700/30">
                  <div className="space-y-3 text-sm">
                    <p className="text-gray-300">Voter proves they voted for Alice without revealing it:</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-green-900/20 border border-green-700/30 rounded p-3">
                        <p className="text-green-300 font-semibold text-xs mb-2">Voter Has:</p>
                        <ul className="space-y-1 text-xs text-gray-300">
                          <li>✓ Original vote: "Alice"</li>
                          <li>✓ Secret credential</li>
                          <li>✓ Can regenerate hash</li>
                        </ul>
                      </div>
                      <div className="bg-blue-900/20 border border-blue-700/30 rounded p-3">
                        <p className="text-blue-300 font-semibold text-xs mb-2">Blockchain Shows:</p>
                        <ul className="space-y-1 text-xs text-gray-300">
                          <li>✓ Commitment exists</li>
                          <li>✓ Hash matches</li>
                          <li>✓ Vote counted</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-purple-700/50 rounded p-3">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-purple-200 font-semibold text-xs">Proof Complete: Hash(Alice + Credential) = Blockchain Commitment ✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Arrow down */}
            <div className="ml-6 h-8 w-0.5 bg-gradient-to-b from-purple-500 to-transparent"></div>
          </div>

          {/* Step 4: Tallying */}
          <div className="relative">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-300 mb-2">Vote Tallying (Secure Counting)</h3>
                <div className="bg-dark-800/70 rounded-lg p-4 border border-orange-700/30">
                  <div className="space-y-3 text-sm">
                    <div className="bg-dark-900 rounded p-3">
                      <p className="text-gray-300 mb-2">Smart Contract Process:</p>
                      <ul className="space-y-2 text-xs">
                        <li className="flex items-start space-x-2">
                          <span className="text-orange-400">1.</span>
                          <span className="text-gray-300">Counts total commitments per candidate</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-orange-400">2.</span>
                          <span className="text-gray-300">Verifies no duplicate credentials (prevents double voting)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-orange-400">3.</span>
                          <span className="text-gray-300">Publishes aggregate results on-chain</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-orange-400">4.</span>
                          <span className="text-gray-300">Individual votes remain encrypted forever</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Guarantees */}
          <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-2 border-indigo-700/50 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold text-indigo-200 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Cryptographic Security Guarantees
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-green-300 text-sm">Privacy Preserved</p>
                    <p className="text-xs text-gray-400">Vote choices never exposed - mathematically impossible to reverse SHA-256 hash (2^256 possible combinations)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-300 text-sm">Verifiable by Voter</p>
                    <p className="text-xs text-gray-400">Each voter can prove their vote was counted by regenerating their unique commitment hash</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-purple-300 text-sm">Tamper-Proof</p>
                    <p className="text-xs text-gray-400">Blockchain immutability ensures votes cannot be altered after commitment</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-yellow-300 text-sm">No Double Voting</p>
                    <p className="text-xs text-gray-400">Credential uniqueness enforced by smart contract - each credential can only vote once</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-pink-300 text-sm">Publicly Auditable</p>
                    <p className="text-xs text-gray-400">Anyone can verify total count and election integrity without seeing individual votes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-indigo-300 text-sm">Decentralized Trust</p>
                    <p className="text-xs text-gray-400">No central authority needed - cryptography and blockchain consensus ensure fairness</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
      ) : (
        /* Architecture Tab */
        <div className="space-y-6">
          {/* System Architecture */}
          <div className="card bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <h2 className="text-2xl font-bold mb-6 text-cyan-300 flex items-center">
              <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              NovaVote System Architecture
            </h2>

            {/* Architecture Diagram */}
            <div className="space-y-8">
              {/* Layer 3: Frontend */}
              <div className="relative">
                <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/40 border-2 border-blue-600 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-blue-200">Frontend Layer</h3>
                        <p className="text-sm text-blue-300">React + Vite on port 5173</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">Running</span>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-dark-900/50 rounded-lg p-3">
                      <p className="text-gray-400 mb-2">Technologies:</p>
                      <ul className="space-y-1 text-blue-200">
                        <li>• React 18</li>
                        <li>• Vite Dev Server</li>
                        <li>• Tailwind CSS</li>
                        <li>• Framer Motion</li>
                      </ul>
                    </div>
                    <div className="bg-dark-900/50 rounded-lg p-3">
                      <p className="text-gray-400 mb-2">Pages:</p>
                      <ul className="space-y-1 text-blue-200">
                        <li>• Home / Login</li>
                        <li>• Voting Interface</li>
                        <li>• Admin Dashboard</li>
                        <li>• Audit & Receipt</li>
                      </ul>
                    </div>
                    <div className="bg-dark-900/50 rounded-lg p-3">
                      <p className="text-gray-400 mb-2">Features:</p>
                      <ul className="space-y-1 text-blue-200">
                        <li>• ZKP Visualization</li>
                        <li>• Real-time Updates</li>
                        <li>• Vote Verification</li>
                        <li>• Responsive UI</li>
                      </ul>
                    </div>
                  </div>
                </div>
                {/* Arrow */}
                <div className="flex justify-center my-4">
                  <svg className="w-8 h-8 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v10.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* Layer 2: Backend */}
              <div className="relative">
                <div className="bg-gradient-to-r from-green-900/40 to-green-800/40 border-2 border-green-600 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-200">Backend API Layer</h3>
                        <p className="text-sm text-green-300">Express.js on port 3000</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">Running</span>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-dark-900/50 rounded-lg p-3">
                      <p className="text-gray-400 mb-2">Technologies:</p>
                      <ul className="space-y-1 text-green-200">
                        <li>• Node.js 18+</li>
                        <li>• Express.js</li>
                        <li>• Ethers.js v6</li>
                        <li>• CryptoJS</li>
                      </ul>
                    </div>
                    <div className="bg-dark-900/50 rounded-lg p-3">
                      <p className="text-gray-400 mb-2">API Routes:</p>
                      <ul className="space-y-1 text-green-200">
                        <li>• /api/elections</li>
                        <li>• /api/votes</li>
                        <li>• /api/audit</li>
                        <li>• /api/credentials</li>
                      </ul>
                    </div>
                    <div className="bg-dark-900/50 rounded-lg p-3">
                      <p className="text-gray-400 mb-2">Services:</p>
                      <ul className="space-y-1 text-green-200">
                        <li>• Blockchain Service</li>
                        <li>• Crypto Service</li>
                        <li>• ZK Proof Gen</li>
                        <li>• Vote Validation</li>
                      </ul>
                    </div>
                  </div>
                </div>
                {/* Arrow */}
                <div className="flex justify-center my-4">
                  <svg className="w-8 h-8 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v10.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* Layer 1: Blockchain */}
              <div className="relative">
                <div className="bg-gradient-to-r from-purple-900/40 to-purple-800/40 border-2 border-purple-600 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-purple-200">Blockchain Layer</h3>
                        <p className="text-sm text-purple-300">Hardhat Ethereum Network on port 8545</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">Running</span>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-dark-900/50 rounded-lg p-3">
                      <p className="text-gray-400 mb-2">Platform:</p>
                      <ul className="space-y-1 text-purple-200">
                        <li>• Hardhat Network</li>
                        <li>• Ethereum Local</li>
                        <li>• Solidity ^0.8.24</li>
                        <li>• OpenZeppelin</li>
                      </ul>
                    </div>
                    <div className="bg-dark-900/50 rounded-lg p-3">
                      <p className="text-gray-400 mb-2">Smart Contracts:</p>
                      <ul className="space-y-1 text-purple-200">
                        <li>• ElectionManager</li>
                        <li>• VoteCommitment</li>
                        <li>• TallyManager</li>
                        <li>• Access Control</li>
                      </ul>
                    </div>
                    <div className="bg-dark-900/50 rounded-lg p-3">
                      <p className="text-gray-400 mb-2">Features:</p>
                      <ul className="space-y-1 text-purple-200">
                        <li>• Immutable Storage</li>
                        <li>• Event Emission</li>
                        <li>• State Management</li>
                        <li>• On-chain Validation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Flow Diagram */}
          <div className="card bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border-indigo-700">
            <h2 className="text-2xl font-bold mb-6 text-indigo-200 flex items-center">
              <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Vote Data Flow
            </h2>

            <div className="grid md:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div className="relative">
                <div className="bg-dark-800 border-2 border-blue-600 rounded-lg p-4 text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto flex items-center justify-center mb-3">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h4 className="font-semibold text-blue-300 mb-2">User Interface</h4>
                  <p className="text-xs text-gray-400">Voter selects candidate on React frontend</p>
                </div>
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 text-cyan-500 hidden md:block">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="bg-dark-800 border-2 border-green-600 rounded-lg p-4 text-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full mx-auto flex items-center justify-center mb-3">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h4 className="font-semibold text-green-300 mb-2">API Processing</h4>
                  <p className="text-xs text-gray-400">Backend generates ZK proof and commitment hash</p>
                </div>
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 text-cyan-500 hidden md:block">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="bg-dark-800 border-2 border-purple-600 rounded-lg p-4 text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-full mx-auto flex items-center justify-center mb-3">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h4 className="font-semibold text-purple-300 mb-2">Blockchain TX</h4>
                  <p className="text-xs text-gray-400">Commitment stored on-chain via smart contract</p>
                </div>
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 text-cyan-500 hidden md:block">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-dark-800 border-2 border-orange-600 rounded-lg p-4 text-center">
                <div className="w-16 h-16 bg-orange-600 rounded-full mx-auto flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-white">4</span>
                </div>
                <h4 className="font-semibold text-orange-300 mb-2">Confirmation</h4>
                <p className="text-xs text-gray-400">Receipt returned to user with proof hash</p>
              </div>
            </div>
          </div>

          {/* Technical Stack */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Frontend Stack */}
            <div className="card bg-dark-800 border-blue-700">
              <h3 className="text-lg font-bold text-blue-300 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Frontend Stack
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-dark-900 rounded">
                  <span className="text-gray-300">React</span>
                  <span className="text-blue-400 font-mono text-xs">v18.2.0</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-dark-900 rounded">
                  <span className="text-gray-300">Vite</span>
                  <span className="text-blue-400 font-mono text-xs">v5.x</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-dark-900 rounded">
                  <span className="text-gray-300">Tailwind CSS</span>
                  <span className="text-blue-400 font-mono text-xs">v3.x</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-dark-900 rounded">
                  <span className="text-gray-300">Framer Motion</span>
                  <span className="text-blue-400 font-mono text-xs">v11.x</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-dark-900 rounded">
                  <span className="text-gray-300">React Router</span>
                  <span className="text-blue-400 font-mono text-xs">v6.x</span>
                </div>
              </div>
            </div>

            {/* Backend Stack */}
            <div className="card bg-dark-800 border-green-700">
              <h3 className="text-lg font-bold text-green-300 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                Backend Stack
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-dark-900 rounded">
                  <span className="text-gray-300">Node.js</span>
                  <span className="text-green-400 font-mono text-xs">v18+</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-dark-900 rounded">
                  <span className="text-gray-300">Express.js</span>
                  <span className="text-green-400 font-mono text-xs">v4.x</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-dark-900 rounded">
                  <span className="text-gray-300">Ethers.js</span>
                  <span className="text-green-400 font-mono text-xs">v6.x</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-dark-900 rounded">
                  <span className="text-gray-300">CryptoJS</span>
                  <span className="text-green-400 font-mono text-xs">v4.x</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-dark-900 rounded">
                  <span className="text-gray-300">CORS</span>
                  <span className="text-green-400 font-mono text-xs">Enabled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Blockchain Details */}
          <div className="card bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-700">
            <h3 className="text-xl font-bold text-purple-200 mb-4 flex items-center">
              <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Blockchain Configuration
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-dark-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Network</p>
                <p className="text-lg font-semibold text-purple-300">Hardhat Local</p>
                <p className="text-xs text-gray-500 mt-1">localhost:8545</p>
              </div>
              <div className="bg-dark-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Chain ID</p>
                <p className="text-lg font-semibold text-purple-300">31337</p>
                <p className="text-xs text-gray-500 mt-1">Default Hardhat</p>
              </div>
              <div className="bg-dark-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Gas Price</p>
                <p className="text-lg font-semibold text-purple-300">Auto</p>
                <p className="text-xs text-gray-500 mt-1">Dynamic estimation</p>
              </div>
            </div>
            
            <div className="mt-6 bg-dark-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-300 mb-3">Deployed Smart Contracts:</h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center p-2 bg-dark-900 rounded">
                  <span className="text-gray-400">ElectionManager</span>
                  <code className="text-purple-300">{deployments.contracts.ElectionManager.slice(0, 10)}...{deployments.contracts.ElectionManager.slice(-8)}</code>
                </div>
                <div className="flex justify-between items-center p-2 bg-dark-900 rounded">
                  <span className="text-gray-400">VoteCommitment</span>
                  <code className="text-purple-300">{deployments.contracts.VoteCommitment.slice(0, 10)}...{deployments.contracts.VoteCommitment.slice(-8)}</code>
                </div>
                <div className="flex justify-between items-center p-2 bg-dark-900 rounded">
                  <span className="text-gray-400">TallyManager</span>
                  <code className="text-purple-300">{deployments.contracts.TallyManager.slice(0, 10)}...{deployments.contracts.TallyManager.slice(-8)}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Security Features */}
          <div className="card bg-dark-800 border-red-700">
            <h3 className="text-xl font-bold text-red-300 mb-4 flex items-center">
              <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Security Layers
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-red-200 mb-3">Cryptographic Security:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">SHA-256 hashing for commitments</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">Zero-Knowledge Proof generation</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">Credential-based authentication</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">One-way hash functions</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-200 mb-3">Smart Contract Security:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">OpenZeppelin access control</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">Double-vote prevention</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">State validation on-chain</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-300">Immutable vote storage</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Mathematical Proof */}
          <div className="bg-dark-800 border border-cyan-700/50 rounded-lg p-4">
            <h4 className="text-cyan-300 font-semibold mb-3 flex items-center text-sm">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Mathematical Security Formula
            </h4>
            <div className="bg-dark-900 rounded p-3 font-mono text-xs space-y-2">
              <div className="text-cyan-200">
                <span className="text-gray-400">Commitment:</span> C = Hash(vote || credential || timestamp)
              </div>
              <div className="text-cyan-200">
                <span className="text-gray-400">Verification:</span> Valid = (Hash(vote_claim || cred_claim) == C_blockchain)
              </div>
              <div className="text-cyan-200">
                <span className="text-gray-400">Security:</span> Brute Force = 2^256 ≈ 1.16 × 10^77 attempts (impossible)
              </div>
              <div className="text-cyan-200">
                <span className="text-gray-400">Privacy:</span> P(reveal_vote | C) = 0 (information-theoretically secure)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="card">
      <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
      <p className="text-xl font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  )
}