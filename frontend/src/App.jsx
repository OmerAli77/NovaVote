import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import VotingPage from './pages/VotingPage'
import ReceiptPage from './pages/ReceiptPage'
import AdminPage from './pages/AdminPage'
import AuditPage from './pages/AuditPage'
import { adminAPI } from './services/api'
import './App.css'

function App() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const response = await adminAPI.checkAccess()
      setIsAdmin(response.data.isAdmin)
    } catch (error) {
      console.error('Failed to check admin access:', error)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-[var(--text-secondary)]">Loading...</div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <Router>
        <Layout isAdmin={isAdmin}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/vote/:electionId" element={<VotingPage />} />
            <Route path="/receipt" element={<ReceiptPage />} />
            <Route path="/admin" element={<AdminPage isAdmin={isAdmin} />} />
            <Route path="/audit/:electionId" element={<AuditPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App
