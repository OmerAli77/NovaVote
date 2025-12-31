import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function LoginPage() {
  const [voterId, setVoterId] = useState('')
  const [commitment, setCommitment] = useState('')
  const [voterSecret, setVoterSecret] = useState('')
  const [voterIndex, setVoterIndex] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const electionId = searchParams.get('electionId')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!voterId || !electionId || !commitment || !voterSecret || !voterIndex) {
        setError('All fields are required')
        setLoading(false)
        return
      }

      // Store credentials in localStorage for voting
      localStorage.setItem('voterId', voterId)
      localStorage.setItem('commitment', commitment)
      localStorage.setItem('voterSecret', voterSecret)
      localStorage.setItem('voterIndex', voterIndex)
      localStorage.setItem('electionId', electionId)

      // Navigate to voting page
      navigate(`/vote/${electionId}`)
    } catch (error) {
      console.error('Login error:', error)
      setError('Failed to authenticate')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card space-y-6">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-[var(--accent-primary)]/10 rounded-xl mx-auto flex items-center justify-center">
            <svg className="w-7 h-7 text-[var(--accent-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Voter Login</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Enter your credentials from the JSON file to cast your vote
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="label">Voter ID</label>
            <input
              type="text"
              value={voterId}
              onChange={(e) => setVoterId(e.target.value)}
              placeholder="e.g., V001"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">Election ID</label>
            <input
              type="text"
              value={electionId || ''}
              readOnly
              className="input-field bg-[var(--bg-tertiary)] cursor-not-allowed opacity-60"
            />
          </div>

          <div>
            <label className="label">Commitment</label>
            <input
              type="text"
              value={commitment}
              onChange={(e) => setCommitment(e.target.value)}
              placeholder="Enter your commitment (from JSON file)"
              className="input-field font-mono text-xs"
              required
            />
            <p className="text-xs text-[var(--text-muted)] mt-1.5">
              Poseidon hash commitment from your credentials file
            </p>
          </div>

          <div>
            <label className="label">Voter Secret</label>
            <input
              type="password"
              value={voterSecret}
              onChange={(e) => setVoterSecret(e.target.value)}
              placeholder="Enter your voterSecret (from JSON file)"
              className="input-field font-mono text-xs"
              required
            />
            <p className="text-xs text-[var(--text-muted)] mt-1.5">
              Secret key from your credentials - NEVER share this!
            </p>
          </div>

          <div>
            <label className="label">Voter Index</label>
            <input
              type="number"
              value={voterIndex}
              onChange={(e) => setVoterIndex(e.target.value)}
              placeholder="Enter your voterIndex (from JSON file)"
              className="input-field"
              required
            />
            <p className="text-xs text-[var(--text-muted)] mt-1.5">
              Your position in the voter registry (0, 1, 2, etc.)
            </p>
          </div>

          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg p-4 space-y-2">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-xs text-[var(--text-muted)]">
                <p className="font-medium text-amber-400 mb-1.5">Important:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Copy values from your voter-credentials JSON file</li>
                  <li>You need: voterId, commitment, voterSecret, and voterIndex</li>
                  <li>Never share your voterSecret with anyone</li>
                  <li>You can only vote once with these credentials</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !voterId || !commitment || !voterSecret || !voterIndex}
            className="btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              'Login & Vote'
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            ← Back to Elections
          </button>
        </div>
      </div>
    </div>
  )
}
