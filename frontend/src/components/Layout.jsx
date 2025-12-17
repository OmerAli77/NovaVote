import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

export default function Layout({ children, isAdmin }) {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-300">
      <nav className="bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-[var(--accent-primary)] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">NovaVote</span>
            </Link>

            <div className="flex items-center space-x-2">
              <NavLink to="/" active={location.pathname === '/'}>
                Home
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" active={location.pathname === '/admin'}>
                  <span className="flex items-center space-x-2">
                    <span>Admin</span>
                    <span className="text-xs bg-[var(--accent-primary)] text-white px-2 py-0.5 rounded-md font-medium">Host</span>
                  </span>
                </NavLink>
              )}
              
              <button
                onClick={toggleTheme}
                className="ml-4 p-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)] transition-colors duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>

      <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-primary)] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center text-[var(--text-muted)] text-sm space-y-2">
            <p className="font-medium text-[var(--text-secondary)]">© 2025 NovaVote</p>
            <p>Privacy-Preserving Blockchain Voting System</p>
            {isAdmin && (
              <p className="text-[var(--accent-primary)] flex items-center justify-center space-x-2 mt-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Admin Mode Active</span>
              </p>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-[var(--accent-primary)] text-white'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
      }`}
    >
      {children}
    </Link>
  )
}
