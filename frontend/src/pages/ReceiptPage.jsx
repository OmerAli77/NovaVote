import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { votesAPI } from '../services/api'

export default function ReceiptPage() {
  const navigate = useNavigate()
  const [verifying, setVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState(null)

  const receiptHash = localStorage.getItem('receiptHash')
  const transactionHash = localStorage.getItem('transactionHash')
  const credential = localStorage.getItem('credential')
  const voterId = localStorage.getItem('voterId')
  const zkProof = JSON.parse(localStorage.getItem('zkProof') || 'null')
  const votedCandidate = localStorage.getItem('votedCandidate')

  const handleVerify = async () => {
    setVerifying(true)
    try {
      const electionId = new URLSearchParams(window.location.search).get('electionId') || '1'
      
      if (!receiptHash) {
        setVerificationResult({ 
          verified: false, 
          message: 'No receipt hash found. Please vote first.' 
        })
        return
      }

      const response = await votesAPI.verify(electionId, receiptHash)
      setVerificationResult(response.data)
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationResult({ 
        verified: false, 
        message: error.response?.data?.details || 'Verification failed' 
      })
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="card text-center space-y-4">
          <div className="w-14 h-14 bg-[var(--accent-primary)]/10 rounded-xl mx-auto flex items-center justify-center">
            <svg className="w-7 h-7 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Vote Receipt</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Your cryptographic proof of voting
          </p>
        </div>

        <div className="card space-y-6">
          {/* ZK Proof Verification Section */}
          {zkProof && (
            <div className="bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">Zero-Knowledge Proof</h3>
                </div>
                <span className="flex items-center text-emerald-400 text-xs">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Valid
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* What You Know */}
                <div className="bg-emerald-500/5 rounded-lg p-4 border border-emerald-500/20">
                  <div className="flex items-center space-x-2 mb-3">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="font-medium text-emerald-400 text-xs">Your Private Info</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[var(--text-muted)]">Your Vote:</span>
                      <div className="font-medium text-emerald-400 text-base mt-1">{votedCandidate}</div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Voter ID:</span>
                      <span className="font-mono text-emerald-400">{voterId}</span>
                    </div>
                  </div>
                </div>

                {/* What's On Blockchain */}
                <div className="bg-blue-500/5 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-center space-x-2 mb-3">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    <span className="font-medium text-blue-400 text-xs">On Blockchain (Public)</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[var(--text-muted)]">Vote Commitment:</span>
                      <div className="font-mono text-blue-400 text-[10px] break-all bg-[var(--bg-primary)] p-2 rounded mt-1">
                        {zkProof.commitment.substring(0, 40)}...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="label">Voter ID</label>
              <div className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg p-3 font-mono text-sm text-[var(--text-secondary)]">
                {voterId || 'Not available'}
              </div>
            </div>

            <div>
              <label className="label">Receipt Hash</label>
              <div className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg p-3 font-mono text-xs break-all text-[var(--text-secondary)]">
                {receiptHash || 'Not available'}
              </div>
            </div>

            <div>
              <label className="label">Transaction Hash</label>
              <div className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg p-3 font-mono text-xs break-all text-[var(--text-secondary)]">
                {transactionHash || 'Not available'}
              </div>
            </div>

            <div>
              <label className="label">Credential Hash</label>
              <div className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg p-3 font-mono text-xs break-all text-[var(--text-secondary)]">
                {credential ? credential.substring(0, 40) + '...' : 'Not available'}
              </div>
            </div>
          </div>

          <button
            onClick={handleVerify}
            disabled={verifying || !credential}
            className="btn-primary w-full"
          >
            {verifying ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify on Blockchain'
            )}
          </button>

          {verificationResult && (
            <div
              className={`p-4 rounded-lg border ${
                verificationResult.verified
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : 'bg-red-500/10 border-red-500/20'
              }`}
            >
              <div className="flex items-start space-x-3">
                {verificationResult.verified ? (
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <div>
                  <p className={`font-medium text-sm ${verificationResult.verified ? 'text-emerald-400' : 'text-red-400'}`}>
                    {verificationResult.verified ? 'Vote Verified' : 'Verification Failed'}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {verificationResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-medium text-[var(--text-primary)] mb-3 text-sm flex items-center">
            <svg className="w-4 h-4 mr-2 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            What is this receipt?
          </h3>
          <ul className="space-y-2 text-xs text-[var(--text-muted)]">
            <li className="flex items-start space-x-2">
              <span className="text-[var(--accent-primary)]">•</span>
              <span>This receipt proves your vote was recorded on the blockchain</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-[var(--accent-primary)]">•</span>
              <span>It does NOT reveal which candidate you voted for</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-[var(--accent-primary)]">•</span>
              <span>You can verify your vote was counted without compromising privacy</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-4">
          <button onClick={() => navigate('/')} className="btn-outline flex-1">
            Back to Home
          </button>
          <button
            onClick={() => {
              const text = `Receipt Hash: ${receiptHash}\nTransaction: ${transactionHash}`
              navigator.clipboard.writeText(text)
              alert('Receipt copied to clipboard!')
            }}
            className="btn-primary flex-1"
          >
            Copy Receipt
          </button>
        </div>
      </div>
    </div>
  )
}
