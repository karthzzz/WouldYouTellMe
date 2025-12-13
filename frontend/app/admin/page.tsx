'use client'

import { useState, useEffect } from 'react'

interface Submission {
  id: string
  message: string
  recipient_name: string
  recipient_contact: string
  contact_type: string
  plan: string
  status: string
  created_at: string
  revealed: boolean
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'delivered' | 'failed'>('all')
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(true)

  useEffect(() => {
    if (authenticated) {
      fetchSubmissions()
    }
  }, [filter, authenticated])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple password check (in production, use proper JWT auth)
    if (password === 'test-admin-secret') {
      setAuthenticated(true)
      setShowPasswordPrompt(false)
      localStorage.setItem('adminToken', 'test-admin-secret')
    } else {
      alert('Invalid password')
    }
  }

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/submissions?status=${filter}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions || [])
      } else if (response.status === 401) {
        setAuthenticated(false)
        setShowPasswordPrompt(true)
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsDelivered = async (submissionId: string) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/submissions/${submissionId}/deliver`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        fetchSubmissions()
      } else {
        alert('Failed to mark as delivered')
      }
    } catch (error) {
      console.error('Failed to mark as delivered:', error)
    }
  }

  const handleReveal = async (submissionId: string) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/submissions/${submissionId}/reveal`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        fetchSubmissions()
        alert('Submission revealed!')
      } else {
        alert('Failed to reveal submission')
      }
    } catch (error) {
      console.error('Failed to reveal:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-400'
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-400'
      case 'revealed':
        return 'bg-blue-500/20 text-blue-400 border-blue-400'
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-400'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-400'
    }
  }

  if (showPasswordPrompt) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
        <div className="glass p-8 max-w-md w-full">
          <h1 className="gradient-text text-3xl font-bold mb-6 text-center">Admin Access</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
            >
              Sign In
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-4">
            Demo password: test-admin-secret
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="gradient-text text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage confession submissions and deliveries</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('adminToken')
              setAuthenticated(false)
              setShowPasswordPrompt(true)
              setPassword('')
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'delivered', 'failed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
          <button
            onClick={() => fetchSubmissions()}
            className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Refresh
          </button>
        </div>

        {/* Submissions Table */}
        {loading ? (
          <div className="text-center text-gray-300">Loading...</div>
        ) : submissions.length === 0 ? (
          <div className="glass p-8 text-center text-gray-300">
            No submissions found
          </div>
        ) : (
          <div className="glass overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-600">
                <tr className="text-left">
                  <th className="px-6 py-4 text-gray-300 font-semibold">ID</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Recipient</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Contact</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Plan</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Status</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Date</th>
                  <th className="px-6 py-4 text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id} className="border-b border-gray-700 hover:bg-white/5 transition">
                    <td className="px-6 py-4 text-gray-300 text-sm font-mono">{submission.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 text-gray-300">{submission.recipient_name}</td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{submission.recipient_contact}</td>
                    <td className="px-6 py-4 text-gray-300">
                      <span className={`text-xs px-2 py-1 rounded ${submission.plan === 'anonymous' ? 'bg-purple-500/20 text-purple-300' : 'bg-pink-500/20 text-pink-300'}`}>
                        {submission.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(submission.created_at)}</td>
                    <td className="px-6 py-4 space-x-2">
                      {submission.status === 'pending' && (
                        <button
                          onClick={() => handleMarkAsDelivered(submission.id)}
                          className="text-sm px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition"
                        >
                          Deliver
                        </button>
                      )}
                      {submission.plan === 'reveal' && !submission.revealed && (
                        <button
                          onClick={() => handleReveal(submission.id)}
                          className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                        >
                          Reveal
                        </button>
                      )}
                      {submission.status === 'delivered' && (
                        <span className="text-sm text-green-400">✓ Done</span>
                      )}
                      {submission.revealed && (
                        <span className="text-sm text-blue-400">✓ Revealed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
