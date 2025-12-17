import { useState, useEffect } from 'react'
import { electionsAPI, votesAPI, adminAPI } from '../services/api'

export default function AdminPage({ isAdmin }) {
  const [activeTab, setActiveTab] = useState('create')
  const [elections, setElections] = useState([])
  const [loading, setLoading] = useState(false)
  const [adminCheckLoading, setAdminCheckLoading] = useState(true)
  const [hasAdminAccess, setHasAdminAccess] = useState(false)

  useEffect(() => {
    if (isAdmin === undefined) {
      checkAdminAccess()
    } else {
      setHasAdminAccess(isAdmin)
      setAdminCheckLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    if (activeTab === 'manage') {
      loadElections()
    }
  }, [activeTab])

  const checkAdminAccess = async () => {
    try {
      const response = await adminAPI.checkAccess()
      setHasAdminAccess(response.data.isAdmin)
    } catch (error) {
      console.error('Failed to check admin access:', error)
      setHasAdminAccess(false)
    } finally {
      setAdminCheckLoading(false)
    }
  }

  const loadElections = async () => {
    setLoading(true)
    try {
      const response = await electionsAPI.getAll()
      setElections(response.data)
    } catch (error) {
      console.error('Failed to load elections:', error)
    } finally {
      setLoading(false)
    }
  }

  if (adminCheckLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[var(--text-secondary)]">Checking access permissions...</div>
      </div>
    )
  }

  if (!hasAdminAccess) {
    return (
      <div className="space-y-6">
        <div className="card border-red-500/20 bg-red-500/5">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-red-400 mb-2">Access Denied</h1>
              <p className="text-[var(--text-secondary)] mb-4">
                Admin functions are only accessible from the host computer (localhost).
              </p>
              <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-primary)]">
                <p className="text-sm text-[var(--text-muted)] mb-2">
                  <strong className="text-[var(--text-primary)]">You can still:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-[var(--text-muted)]">
                  <li>Vote in active elections</li>
                  <li>View election results</li>
                  <li>Verify your vote receipt</li>
                  <li>Audit the blockchain trail</li>
                </ul>
              </div>
              <div className="mt-4 p-3 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 rounded-lg">
                <p className="text-sm text-[var(--accent-primary)]">
                  <strong>Tip:</strong> To access admin functions, open the application on the host computer at{' '}
                  <code className="bg-[var(--bg-tertiary)] px-2 py-0.5 rounded text-[var(--accent-primary)]">http://localhost:5173/admin</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="card">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">Admin Dashboard</h1>
        <p className="text-[var(--text-muted)]">Manage elections and view system statistics</p>
        <div className="mt-4 inline-flex items-center space-x-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-emerald-400 text-sm font-medium">Admin Access Granted</span>
        </div>
      </div>

      <div className="flex space-x-1 border-b border-[var(--border-primary)]">
        <TabButton
          active={activeTab === 'create'}
          onClick={() => setActiveTab('create')}
        >
          Create Election
        </TabButton>
        <TabButton
          active={activeTab === 'manage'}
          onClick={() => setActiveTab('manage')}
        >
          Manage Elections
        </TabButton>
        <TabButton
          active={activeTab === 'stats'}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </TabButton>
      </div>

      {activeTab === 'create' && <CreateElectionTab onSuccess={loadElections} />}
      {activeTab === 'manage' && (
        <ManageElectionsTab
          elections={elections}
          loading={loading}
          onRefresh={loadElections}
        />
      )}
      {activeTab === 'stats' && <StatisticsTab elections={elections} />}
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-px ${
        active
          ? 'text-[var(--accent-primary)] border-[var(--accent-primary)]'
          : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-secondary)]'
      }`}
    >
      {children}
    </button>
  )
}

function CreateElectionTab({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    candidates: ['', '']
  })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleAddCandidate = () => {
    setFormData({
      ...formData,
      candidates: [...formData.candidates, '']
    })
  }

  const handleRemoveCandidate = (index) => {
    setFormData({
      ...formData,
      candidates: formData.candidates.filter((_, i) => i !== index)
    })
  }

  const handleCandidateChange = (index, value) => {
    const newCandidates = [...formData.candidates]
    newCandidates[index] = value
    setFormData({ ...formData, candidates: newCandidates })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setCreating(true)

    try {
      const validCandidates = formData.candidates.filter(c => c.trim() !== '')
      if (validCandidates.length < 2) {
        setError('At least 2 candidates are required')
        return
      }

      await electionsAPI.create({
        ...formData,
        candidates: validCandidates
      })

      setSuccess('Election created successfully!')
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        candidates: ['', '']
      })
      
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Create election error:', error)
      setError(error.response?.data?.error || 'Failed to create election')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="card">
      <h2 className="text-lg font-medium text-[var(--text-primary)] mb-6">Create New Election</h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg mb-4 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Election Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Student Council Election 2025"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the election"
            rows={3}
            className="input-field resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Start Time</label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">End Time</label>
            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="input-field"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="label mb-0">Candidates</label>
            <button
              type="button"
              onClick={handleAddCandidate}
              className="text-sm text-[var(--accent-primary)] hover:text-[var(--accent-primary)]/80 flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Candidate</span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.candidates.map((candidate, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  value={candidate}
                  onChange={(e) => handleCandidateChange(index, e.target.value)}
                  placeholder={`Candidate ${index + 1} name`}
                  className="input-field flex-1"
                />
                {formData.candidates.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCandidate(index)}
                    className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={creating}
          className="btn-primary w-full"
        >
          {creating ? 'Creating...' : 'Create Election'}
        </button>
      </form>
    </div>
  )
}

function ManageElectionsTab({ elections, loading, onRefresh }) {
  const [actionLoading, setActionLoading] = useState(null)

  const handleAction = async (action, electionId) => {
    setActionLoading(`${action}-${electionId}`)
    try {
      if (action === 'start') {
        await electionsAPI.start(electionId)
      } else if (action === 'end') {
        await electionsAPI.end(electionId)
      } else if (action === 'tally') {
        await votesAPI.tally(electionId)
      }
      onRefresh()
    } catch (error) {
      console.error(`${action} error:`, error)
      alert(error.response?.data?.error || `Failed to ${action} election`)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-primary)] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {elections.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-[var(--text-muted)]">No elections found</p>
        </div>
      ) : (
        elections.map((election) => (
          <div key={election.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-[var(--text-primary)]">{election.title}</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">{election.description}</p>
              </div>
              <span
                className={`badge ${
                  election.status === 'Active'
                    ? 'badge-success'
                    : election.status === 'Created'
                    ? 'badge-info'
                    : election.status === 'Ended'
                    ? 'badge-warning'
                    : 'badge'
                }`}
              >
                {election.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p className="text-[var(--text-muted)]">Start</p>
                <p className="text-[var(--text-secondary)]">{new Date(election.startTime).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[var(--text-muted)]">End</p>
                <p className="text-[var(--text-secondary)]">{new Date(election.endTime).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex space-x-2">
              {election.status === 'Created' && (
                <button
                  onClick={() => handleAction('start', election.id)}
                  disabled={actionLoading === `start-${election.id}`}
                  className="btn-primary text-sm"
                >
                  Start Election
                </button>
              )}
              {election.status === 'Active' && (
                <button
                  onClick={() => handleAction('end', election.id)}
                  disabled={actionLoading === `end-${election.id}`}
                  className="btn-outline text-sm"
                >
                  End Election
                </button>
              )}
              {election.status === 'Ended' && (
                <button
                  onClick={() => handleAction('tally', election.id)}
                  disabled={actionLoading === `tally-${election.id}`}
                  className="btn-primary text-sm"
                >
                  Tally Votes
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function StatisticsTab({ elections }) {
  const stats = {
    total: elections.length,
    active: elections.filter(e => e.status === 'Active').length,
    ended: elections.filter(e => e.status === 'Ended').length,
    tallied: elections.filter(e => e.status === 'Tallied').length
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Elections" value={stats.total} icon={<ChartIcon />} />
      <StatCard title="Active" value={stats.active} icon={<PlayIcon />} color="emerald" />
      <StatCard title="Ended" value={stats.ended} icon={<StopIcon />} color="amber" />
      <StatCard title="Tallied" value={stats.tallied} icon={<CheckIcon />} color="indigo" />
    </div>
  )
}

function ChartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function StatCard({ title, value, icon, color = 'primary' }) {
  const colorClasses = {
    primary: 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-400',
    indigo: 'bg-indigo-500/10 text-indigo-400'
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        <span className="text-3xl font-semibold text-[var(--text-primary)]">{value}</span>
      </div>
      <h3 className="text-[var(--text-muted)] text-sm">{title}</h3>
    </div>
  )
}
