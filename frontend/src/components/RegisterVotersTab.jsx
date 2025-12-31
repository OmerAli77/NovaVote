import { useState } from 'react'
import { electionsAPI } from '../services/api'

export default function RegisterVotersTab({ elections }) {
  const [selectedElection, setSelectedElection] = useState('')
  const [voterIds, setVoterIds] = useState('')
  const [registering, setRegistering] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState('')
  const [voterCredentials, setVoterCredentials] = useState(null)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(null)
    setVoterCredentials(null)
    setRegistering(true)

    try {
      // Parse voter IDs (one per line or comma-separated)
      const voterIdList = voterIds
        .split(/[\n,]+/)
        .map(id => id.trim())
        .filter(id => id.length > 0)

      if (voterIdList.length === 0) {
        throw new Error('Please enter at least one voter ID')
      }

      const response = await electionsAPI.registerVoters(selectedElection, voterIdList)
      
      setSuccess(`Successfully registered ${response.data.votersRegistered} voters with ZK credentials`)
      setVoterCredentials(response.data.voterData)
      setVoterIds('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register voters')
    } finally {
      setRegistering(false)
    }
  }

  const downloadCredentials = () => {
    const data = JSON.stringify(voterCredentials, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `voter-credentials-election-${selectedElection}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const activeElections = elections.filter(e => e.status === 'Created' || e.status === 'Active')

  return (
    <div className="space-y-6">
      <div className="card border-[var(--accent-primary)]/20">
        <div className="flex items-start space-x-4 mb-6">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Register Voters with Zero-Knowledge Credentials</h2>
            <p className="text-[var(--text-muted)] mb-4">
              Generate cryptographic credentials for eligible voters. Each voter receives a unique credential and secret that enables anonymous voting.
            </p>
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">🔐 ZKP Registration Process:</h3>
              <div className="space-y-2 text-sm text-[var(--text-muted)]">
                <div className="flex items-start space-x-2">
                  <span className="text-[var(--accent-primary)] font-bold">1️⃣</span>
                  <span><strong className="text-[var(--text-secondary)]">Credential Generation:</strong> Each voter receives unique credential + secret</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-[var(--accent-primary)] font-bold">2️⃣</span>
                  <span><strong className="text-[var(--text-secondary)]">Merkle Tree:</strong> All credentials form a tree proving voter eligibility</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-[var(--accent-primary)] font-bold">3️⃣</span>
                  <span><strong className="text-[var(--text-secondary)]">Nullifier System:</strong> Prevents double voting without revealing identity</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-[var(--accent-primary)] font-bold">4️⃣</span>
                  <span><strong className="text-[var(--text-secondary)]">Anonymous Voting:</strong> Voters prove eligibility without revealing who they are</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Select Election
            </label>
            <select
              value={selectedElection}
              onChange={(e) => setSelectedElection(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
            >
              <option value="">Choose an election...</option>
              {activeElections.map(election => (
                <option key={election.id} value={election.id}>
                  {election.title} ({election.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Voter IDs (one per line or comma-separated)
            </label>
            <textarea
              value={voterIds}
              onChange={(e) => setVoterIds(e.target.value)}
              placeholder="V001&#10;V002&#10;V003"
              rows={8}
              required
              className="w-full px-4 py-3 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] font-mono text-sm"
            />
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Enter voter IDs separated by new lines or commas
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="text-emerald-400 font-medium">{success}</p>
                    <p className="text-emerald-400/70 text-sm mt-1">Merkle root stored on blockchain</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-amber-400 font-medium mb-2">⚠️ CRITICAL: Distribute Credentials Securely!</p>
                    <p className="text-amber-400/70 text-sm mb-3">
                      Each voter needs their <strong>credential</strong> and <strong>secret</strong> to vote. 
                      In production, send these via secure email or encrypted channel.
                    </p>
                    <button
                      type="button"
                      onClick={downloadCredentials}
                      className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download Credentials (JSON)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={registering}
            className="w-full btn btn-primary flex items-center justify-center space-x-2"
          >
            {registering ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Registering Voters...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Register Voters with ZK Credentials</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
