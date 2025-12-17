import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function LoginPage() {
  const [voterId, setVoterId] = useState('')
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
      if (!voterId || !electionId) {
        setError('Voter ID and Election ID are required')
        return
      }

      const response = await authAPI.login(voterId, electionId)

      localStorage.setItem('sessionId', response.data.sessionId)
      localStorage.setItem('credential', response.data.credential)
      localStorage.setItem('credentialHash', response.data.credentialHash)
      localStorage.setItem('voterId', voterId)

      navigate(`/vote/${electionId}`)
    } catch (error) {
      console.error('Login error:', error)
      setError(error.response?.data?.error || 'Failed to authenticate')
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
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Voter Authentication</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Enter your voter ID to receive a cryptographic credential
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
              placeholder="Enter your voter ID (e.g., V12345)"
              className="input-field"
              required
            />
            <p className="text-xs text-[var(--text-muted)] mt-1.5">
              This is your unique identifier for this election
            </p>
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

          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg p-4 space-y-2">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-[var(--accent-primary)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-xs text-[var(--text-muted)]">
                <p className="font-medium text-[var(--text-secondary)] mb-1.5">How it works:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>A unique cryptographic credential will be generated</li>
                  <li>Your credential is used only for this election</li>
                  <li>No personal information is stored on the blockchain</li>
                  <li>You can vote only once per credential</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !voterId}
            className="btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </span>
            ) : (
              'Get Credential & Continue'
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
