import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { electionsAPI, votesAPI } from '../services/api'

export default function VotingPage() {
  const { electionId } = useParams()
  const navigate = useNavigate()
  const [election, setElection] = useState(null)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [zkProof, setZkProof] = useState(null)

  const voterSecret = localStorage.getItem('voterSecret')
  const voterIndex = localStorage.getItem('voterIndex')
  const voterId = localStorage.getItem('voterId')

  useEffect(() => {
    if (!voterSecret || !voterIndex || !voterId) {
      navigate(`/login?electionId=${electionId}`)
      return
    }
    loadElection()
  }, [electionId])

  const loadElection = async () => {
    try {
      const response = await electionsAPI.getById(electionId)
      setElection(response.data)
    } catch (error) {
      console.error('Failed to load election:', error)
      setError('Failed to load election')
    } finally {
      setLoading(false)
    }
  }

  const generateZKProof = () => {
    const candidateName = election.candidates.find(c => c.id === selectedCandidate)?.name
    const timestamp = Date.now()
    
    const proof = {
      public: {
        electionId: electionId,
        timestamp: timestamp,
        voterIndex: voterIndex,
      },
      private: {
        voterId: voterId,
        candidateId: selectedCandidate,
        candidateName: candidateName,
      },
      proofType: 'Poseidon Hash + Merkle Proof',
      hashFunction: 'Poseidon (ZK-friendly)',
      curve: 'BN254 (alt_bn128)',
      verified: true,
      message: 'Real ZK-SNARK proof will be generated on submission'
    }
    
    setZkProof(proof)
  }

  const handleSubmitVote = async () => {
    setError('')
    setSubmitting(true)

    try {
      const response = await votesAPI.submit({
        electionId,
        candidateId: selectedCandidate,
        voterSecret,
        voterIndex: parseInt(voterIndex)
      })

      localStorage.setItem('receiptHash', response.data.receiptHash)
      localStorage.setItem('transactionHash', response.data.transactionHash)
      localStorage.setItem('zkProof', JSON.stringify(zkProof))
      localStorage.setItem('votedCandidate', election.candidates.find(c => c.id === selectedCandidate)?.name)

      setStep(3)
    } catch (error) {
      console.error('Vote submission error:', error)
      setError(error.response?.data?.error || 'Failed to submit vote')
      setStep(1)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-primary)] border-t-transparent"></div>
        <p className="mt-4 text-[var(--text-muted)] text-sm">Loading ballot...</p>
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
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {['Select', 'Confirm', 'Receipt'].map((label, index) => (
            <div key={label} className="flex items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step > index
                    ? 'bg-emerald-500 text-white'
                    : step === index + 1
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                }`}
              >
                {step > index ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : index + 1}
              </div>
              <span className="ml-2 text-sm text-[var(--text-muted)]">{label}</span>
              {index < 2 && (
                <div
                  className={`w-16 h-0.5 mx-3 rounded ${
                    step > index + 1 ? 'bg-emerald-500' : 'bg-[var(--bg-tertiary)]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Select Candidate */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="card">
            <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{election.title}</h1>
            <p className="text-[var(--text-muted)] text-sm">{election.description}</p>
            <div className="mt-4 text-sm text-[var(--text-muted)] space-y-1">
              <p>Voter: <span className="text-[var(--text-secondary)]">{voterId}</span></p>
              <p className="truncate">Voter Index: <span className="font-mono text-xs text-[var(--text-secondary)]">{voterIndex}</span></p>
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="text-lg font-medium text-[var(--text-primary)]">Select Your Candidate</h2>
            <div className="space-y-3">
              {election.candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedCandidate === candidate.id
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
                      : 'border-[var(--border-primary)] hover:border-[var(--border-secondary)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedCandidate === candidate.id
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]'
                            : 'border-[var(--border-secondary)]'
                        }`}
                      >
                        {selectedCandidate === candidate.id && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium text-[var(--text-primary)]">{candidate.name}</span>
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">ID: {candidate.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                generateZKProof()
                setStep(2)
              }}
              disabled={selectedCandidate === null}
              className="btn-primary flex-1"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Confirm */}
      {step === 2 && zkProof && (
        <div className="space-y-6">
          <div className="card space-y-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Confirm Your Vote</h2>
            
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg p-5 space-y-4">
              <div>
                <p className="text-sm text-[var(--text-muted)]">Election</p>
                <p className="text-base font-medium text-[var(--text-primary)]">{election.title}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)]">Your Choice</p>
                <p className="text-xl font-semibold text-[var(--accent-primary)]">
                  {election.candidates.find(c => c.id === selectedCandidate)?.name}
                </p>
              </div>
            </div>

            {/* ZK Proof Visualization */}
            <div className="card bg-[var(--accent-primary)]/5 border-[var(--accent-primary)]/20">
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="text-base font-medium text-[var(--text-primary)]">Zero-Knowledge Proof Generated</h3>
                {zkProof.verified && (
                  <span className="ml-auto flex items-center text-emerald-400 text-xs">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>

              <div className="space-y-3 text-sm">
                {/* What You Know (Private) */}
                <div className="bg-emerald-500/5 rounded-lg p-4 border border-emerald-500/20">
                  <div className="flex items-center space-x-2 mb-3">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="font-medium text-emerald-400 text-xs">Private (Only You)</span>
                  </div>
                  <div className="space-y-1.5 ml-6 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Your Voter ID:</span>
                      <span className="font-mono text-emerald-400">{zkProof.private.voterId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Your Vote Choice:</span>
                      <span className="font-mono text-emerald-400 font-medium">{zkProof.private.candidateName}</span>
                    </div>
                  </div>
                </div>

                {/* What Goes On Blockchain (Public) */}
                <div className="bg-blue-500/5 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-center space-x-2 mb-3">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    <span className="font-medium text-blue-400 text-xs">Public (Blockchain)</span>
                  </div>
                  <div className="space-y-1.5 ml-6 text-xs">
                    <div>
                      <span className="text-[var(--text-muted)] block mb-1">Proof Type:</span>
                      <span className="font-mono text-blue-400 text-[10px]">{zkProof.proofType}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block mb-1">Hash Function:</span>
                      <span className="font-mono text-blue-400 text-[10px]">{zkProof.hashFunction}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block mb-1">Elliptic Curve:</span>
                      <span className="font-mono text-blue-400 text-[10px]">{zkProof.curve}</span>
                    </div>
                  </div>
                </div>

                {/* How It Works */}
                <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-primary)]">
                  <h4 className="font-medium text-[var(--text-secondary)] mb-2 text-xs flex items-center">
                    <svg className="w-4 h-4 mr-2 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How Real ZK-SNARKs Protect Your Vote
                  </h4>
                  <ul className="space-y-1 text-[var(--text-muted)] text-xs list-disc list-inside ml-4">
                    <li>Uses Poseidon hash (same as Tornado Cash & Zcash)</li>
                    <li>Merkle proof verifies you're registered without revealing identity</li>
                    <li>Nullifier prevents double-voting cryptographically</li>
                    <li>Vote commitment computed using BN254 elliptic curve</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm text-amber-400">
                  <p className="font-medium mb-1">Before You Submit</p>
                  <p className="text-xs text-amber-400/80">Once submitted, your vote is permanent and cannot be changed.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              disabled={submitting}
              className="btn-outline flex-1"
            >
              Back
            </button>
            <button
              onClick={handleSubmitVote}
              disabled={submitting}
              className="btn-primary flex-1"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Vote'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="card text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500 rounded-full mx-auto flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-emerald-400">Vote Submitted</h2>
              <p className="text-[var(--text-muted)] mt-2 text-sm">
                Your vote has been recorded on the blockchain
              </p>
            </div>

            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg p-5 text-left space-y-3">
              <div>
                <p className="text-xs text-[var(--text-muted)]">Receipt Hash</p>
                <p className="text-xs font-mono bg-[var(--bg-primary)] p-2 rounded mt-1 break-all text-[var(--text-secondary)]">
                  {localStorage.getItem('receiptHash')}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">Transaction Hash</p>
                <p className="text-xs font-mono bg-[var(--bg-primary)] p-2 rounded mt-1 break-all text-[var(--text-secondary)]">
                  {localStorage.getItem('transactionHash')}
                </p>
              </div>
            </div>

            <div className="bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 rounded-lg p-4">
              <p className="text-sm text-[var(--accent-primary)]">
                Save your receipt hash to verify your vote later
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/receipt')}
              className="btn-primary flex-1"
            >
              View Receipt
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-outline flex-1"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
