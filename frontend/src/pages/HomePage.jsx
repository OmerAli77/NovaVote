import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { electionsAPI } from '../services/api'

export default function HomePage() {
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadElections()
  }, [])

  const loadElections = async () => {
    try {
      const response = await electionsAPI.getAll()
      setElections(response.data)
    } catch (error) {
      console.error('Failed to load elections:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = (electionId) => {
    navigate(`/login?electionId=${electionId}`)
  }

  const handleViewAudit = (electionId) => {
    navigate(`/audit/${electionId}`)
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-8">
        <h1 className="text-4xl md:text-5xl font-semibold text-[var(--text-primary)] tracking-tight">
          NovaVote
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
          Privacy-preserving electronic voting powered by blockchain and zero-knowledge cryptography
        </p>
        <div className="flex justify-center pt-2">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-[var(--text-muted)]">System Online</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          icon={<ShieldIcon />}
          title="Private & Secure"
          description="Zero-knowledge proofs ensure your vote remains confidential"
        />
        <FeatureCard
          icon={<BlockchainIcon />}
          title="Blockchain Verified"
          description="Votes are cryptographically secured and immutable on-chain"
        />
        <FeatureCard
          icon={<AuditIcon />}
          title="Publicly Auditable"
          description="Verify election integrity without compromising voter privacy"
        />
      </div>

      {/* Elections Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Active Elections</h2>
          <button
            onClick={loadElections}
            className="btn-ghost text-sm flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-primary)] border-t-transparent"></div>
            <p className="mt-4 text-[var(--text-muted)] text-sm">Loading elections...</p>
          </div>
        ) : elections.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-[var(--text-secondary)]">No elections available</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Elections can be created from the Admin panel
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {elections.map((election) => (
              <ElectionCard
                key={election.id}
                election={election}
                onVote={handleVote}
                onViewAudit={handleViewAudit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Icon Components
function ShieldIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
}

function BlockchainIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  )
}

function AuditIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="card text-center space-y-4 hover:border-[var(--accent-primary)]/30 transition-colors duration-200">
      <div className="w-12 h-12 mx-auto rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)]">
        {icon}
      </div>
      <h3 className="text-base font-medium text-[var(--text-primary)]">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] leading-relaxed">{description}</p>
    </div>
  )
}

function ElectionCard({ election, onVote, onViewAudit }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <span className="badge-success">Active</span>
      case 'Created':
        return <span className="badge-info">Upcoming</span>
      case 'Ended':
        return <span className="badge-warning">Ended</span>
      case 'Tallied':
        return <span className="badge-info">Results Available</span>
      default:
        return <span className="badge">{status}</span>
    }
  }

  return (
    <div className="card space-y-4 hover:border-[var(--accent-primary)]/30 transition-colors duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-[var(--text-primary)] truncate">{election.title}</h3>
          <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-2">{election.description}</p>
        </div>
        {getStatusBadge(election.status)}
      </div>

      <div className="space-y-2 text-sm text-[var(--text-muted)]">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Starts: {new Date(election.startTime).toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Ends: {new Date(election.endTime).toLocaleString()}</span>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => onVote(election.id)}
          disabled={election.status !== 'Active'}
          className="btn-primary flex-1"
        >
          Cast Vote
        </button>
        <button
          onClick={() => onViewAudit(election.id)}
          className="btn-outline"
        >
          Audit
        </button>
      </div>
    </div>
  )
}
