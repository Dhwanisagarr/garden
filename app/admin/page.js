'use client'

import { useState, useEffect, useCallback } from 'react'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(null) // null = loading, true/false
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Submissions state
  const [submissions, setSubmissions] = useState([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [activeTab, setActiveTab] = useState('all') // 'all', 'pending', 'approved', 'rejected'
  const [searchQuery, setSearchQuery] = useState('')
  
  // Selected detail modal
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  // Delete confirmation modal
  const [submissionToDelete, setSubmissionToDelete] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Trigger toast helper
  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type })
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Check authentication status on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/me')
        const data = await res.json()
        setIsAuthenticated(!!data.authenticated)
      } catch (err) {
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [])

  // Fetch submissions when authenticated or filter changes
  const fetchSubmissions = useCallback(async () => {
    if (!isAuthenticated) return
    setLoadingSubmissions(true)
    try {
      const queryParams = new URLSearchParams()
      if (activeTab !== 'all') queryParams.append('status', activeTab)
      if (searchQuery.trim()) queryParams.append('search', searchQuery.trim())

      const res = await fetch(`/api/admin/submissions?${queryParams.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data.submissions || [])
      } else if (res.status === 401) {
        setIsAuthenticated(false)
      }
    } catch (err) {
      console.error('Failed to load submissions:', err)
    } finally {
      setLoadingSubmissions(false)
    }
  }, [isAuthenticated, activeTab, searchQuery])

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubmissions()
    }
  }, [isAuthenticated, fetchSubmissions])

  // Handle Login submission
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!password) return
    setLoginError('')
    setLoginLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setIsAuthenticated(true)
        setPassword('')
      } else {
        setLoginError(data.error || 'Invalid admin password')
      }
    } catch (err) {
      setLoginError('An error occurred during login. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch (e) {}
    setIsAuthenticated(false)
    setSubmissions([])
  }

  // Update submission status (Approve/Reject/Pending)
  const handleUpdateStatus = async (id, newStatus) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast(`Submission marked as ${newStatus}`)
        // Update local state
        setSubmissions((prev) =>
          prev.map((item) => ((item.id || item._id) === id ? { ...item, status: newStatus } : item))
        )
        if ((selectedSubmission?.id || selectedSubmission?._id) === id) {
          setSelectedSubmission((prev) => ({ ...prev, status: newStatus }))
        }
      } else {
        showToast(data.error || 'Failed to update status', 'error')
      }
    } catch (err) {
      showToast('Server error updating status', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Delete submission
  const handleDeleteSubmission = async () => {
    if (!submissionToDelete) return
    const id = submissionToDelete.id || submissionToDelete._id
    setActionLoading(true)

    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Submission deleted successfully')
        setSubmissions((prev) => prev.filter((item) => (item.id || item._id) !== id))
        if ((selectedSubmission?.id || selectedSubmission?._id) === id) {
          setSelectedSubmission(null)
        }
        setSubmissionToDelete(null)
      } else {
        showToast(data.error || 'Failed to delete submission', 'error')
      }
    } catch (err) {
      showToast('Server error deleting submission', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Calculate status counters
  const counts = {
    all: submissions.length,
    pending: submissions.filter((s) => s.status === 'pending').length,
    approved: submissions.filter((s) => s.status === 'approved').length,
    rejected: submissions.filter((s) => s.status === 'rejected').length,
  }

  // Render initial checking state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#F7F3EA] dark:bg-[#1F251E] flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9A744A] dark:border-[#D8D0C4]"></div>
        <p className="mt-3 text-sm text-[#4F4A44]/70 dark:text-[#EAE4DA]/70 font-sans-clean">Loading admin portal...</p>
      </div>
    )
  }

  // Render Login Form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F7F3EA] dark:bg-[#1F251E] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#FAF8F3] dark:bg-[#2D382B] border border-[#E5E0D5] dark:border-[#3D4B3B] rounded-2xl p-8 shadow-xl paper-tile">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#C6D3B2]/30 text-[#4F4A44] dark:text-[#EAE4DA] mb-3 text-2xl">
              🌿
            </div>
            <h1 className="font-serif-display text-2xl font-semibold text-[#302035] dark:text-[#EAE4DA]">
              Admin Portal
            </h1>
            <p className="text-xs text-[#4F4A44]/70 dark:text-[#EAE4DA]/70 font-sans-clean mt-1">
              DAHLIA Memory Garden Moderation
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 font-sans-clean">
            <div>
              <label className="block text-xs font-medium text-[#4F4A44] dark:text-[#EAE4DA]/80 mb-1">
                Admin Security Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-2.5 rounded-xl border border-[#D5CFBE] dark:border-[#425240] bg-white dark:bg-[#1F251E] text-sm text-[#302035] dark:text-[#EAE4DA] focus:outline-none focus:ring-2 focus:ring-[#9A744A] transition-all"
                autoFocus
              />
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-[#9A744A] hover:bg-[#85613B] text-white font-medium rounded-xl text-sm transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Authenticating...
                </>
              ) : (
                'Unlock Admin Dashboard →'
              )}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Render Admin Dashboard
  return (
    <div className="min-h-screen bg-[#F7F3EA] dark:bg-[#1F251E] text-[#4F4A44] dark:text-[#EAE4DA] font-sans-clean">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm flex items-center gap-2 border transition-all animate-bounce ${
          toastMessage.type === 'error'
            ? 'bg-red-900 text-white border-red-700'
            : 'bg-[#2D382B] text-white border-[#425240]'
        }`}>
          <span>{toastMessage.type === 'error' ? '⚠️' : '✨'}</span>
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="bg-[#FAF8F3] dark:bg-[#2D382B] border-b border-[#E5E0D5] dark:border-[#3D4B3B] sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌱</span>
            <div>
              <h1 className="font-serif-display font-semibold text-lg sm:text-xl text-[#302035] dark:text-[#EAE4DA]">
                Guest Notes Admin
              </h1>
              <p className="text-[11px] text-[#4F4A44]/60 dark:text-[#EAE4DA]/60">
                DAHLIA Submissions Moderation System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              className="text-xs px-3 py-1.5 rounded-lg border border-[#D5CFBE] dark:border-[#425240] text-[#4F4A44] dark:text-[#EAE4DA] hover:bg-[#EAE4D6] dark:hover:bg-[#394737] transition-all"
            >
              View Memory Garden ↗
            </a>
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 font-medium transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls Bar: Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#EAE4D6] dark:bg-[#252E24] rounded-xl border border-[#D5CFBE] dark:border-[#354333] overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: 'All', count: counts.all },
              { id: 'pending', label: 'Pending', count: counts.pending, color: 'bg-amber-500' },
              { id: 'approved', label: 'Approved', count: counts.approved, color: 'bg-emerald-500' },
              { id: 'rejected', label: 'Rejected', count: counts.rejected, color: 'bg-rose-500' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-[#374535] text-[#302035] dark:text-white shadow-sm'
                    : 'text-[#4F4A44]/70 dark:text-[#EAE4DA]/70 hover:text-[#302035] dark:hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab.id
                    ? 'bg-[#EAE4D6] dark:bg-[#252E24] text-[#302035] dark:text-white'
                    : 'bg-black/5 dark:bg-white/10 text-current'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search submitter or text..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D5CFBE] dark:border-[#425240] bg-white dark:bg-[#2D382B] text-xs text-[#302035] dark:text-[#EAE4DA] focus:outline-none focus:ring-2 focus:ring-[#9A744A] transition-all"
            />
            <span className="absolute left-3 top-2.5 text-xs text-gray-400">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Submissions Table / Cards */}
        {loadingSubmissions ? (
          <div className="bg-[#FAF8F3] dark:bg-[#2D382B] rounded-2xl border border-[#E5E0D5] dark:border-[#3D4B3B] p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9A744A] mx-auto"></div>
            <p className="mt-3 text-xs text-gray-500">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-[#FAF8F3] dark:bg-[#2D382B] rounded-2xl border border-[#E5E0D5] dark:border-[#3D4B3B] p-12 text-center">
            <span className="text-4xl">💌</span>
            <h3 className="font-serif-display font-medium text-base text-[#302035] dark:text-[#EAE4DA] mt-3">
              No submissions found
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No submissions matched your search "${searchQuery}"`
                : `There are currently no ${activeTab === 'all' ? '' : activeTab} guest note submissions.`}
            </p>
          </div>
        ) : (
          <div className="bg-[#FAF8F3] dark:bg-[#2D382B] rounded-2xl border border-[#E5E0D5] dark:border-[#3D4B3B] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#EAE4D6]/60 dark:bg-[#232B22] border-b border-[#E5E0D5] dark:border-[#3D4B3B] text-[11px] font-semibold text-[#4F4A44]/70 dark:text-[#EAE4DA]/70 uppercase tracking-wider">
                    <th className="py-3 px-4">Submitter</th>
                    <th className="py-3 px-4">Month / Year</th>
                    <th className="py-3 px-4">Note Preview</th>
                    <th className="py-3 px-4">Photo</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E0D5]/70 dark:divide-[#3D4B3B]/70 text-xs">
                  {submissions.map((item) => {
                    const itemId = item.id || item._id
                    return (
                    <tr
                      key={itemId}
                      className="hover:bg-white/60 dark:hover:bg-[#344232]/50 transition-colors"
                    >
                      {/* Submitter Name */}
                      <td className="py-3.5 px-4 font-medium text-[#302035] dark:text-[#EAE4DA] whitespace-nowrap">
                        {item.name}
                      </td>

                      {/* Month / Year */}
                      <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                        {item.month} {item.year}
                      </td>

                      {/* Message Preview */}
                      <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {item.message}
                      </td>

                      {/* Photo Thumbnail */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.photoUrl ? (
                          <div
                            onClick={() => setSelectedSubmission(item)}
                            className="w-10 h-10 rounded-lg overflow-hidden border border-[#D5CFBE] dark:border-[#425240] cursor-pointer hover:opacity-80 transition-opacity bg-black/5"
                          >
                            <img
                              src={item.photoUrl}
                              alt="Thumbnail"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">No photo</span>
                        )}
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 whitespace-nowrap text-[11px]">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                              : item.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                          }`}
                        >
                          ● {item.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-1">
                        <button
                          onClick={() => setSelectedSubmission(item)}
                          className="px-2.5 py-1 rounded-md bg-[#EAE4D6] dark:bg-[#394737] hover:bg-[#D5CFBE] text-[#302035] dark:text-[#EAE4DA] text-[11px] font-medium transition-all"
                        >
                          View
                        </button>

                        {item.status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id || item._id, 'approved')}
                            disabled={actionLoading}
                            className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium transition-all"
                          >
                            Approve
                          </button>
                        )}

                        {item.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(item.id || item._id, 'rejected')}
                            disabled={actionLoading}
                            className="px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-medium transition-all"
                          >
                            Reject
                          </button>
                        )}

                        <button
                          onClick={() => setSubmissionToDelete(item)}
                          disabled={actionLoading}
                          className="px-2 py-1 rounded-md bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-700 dark:text-rose-300 text-[11px] font-medium transition-all"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Submission Detail View Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F3] dark:bg-[#2D382B] border border-[#E5E0D5] dark:border-[#3D4B3B] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-[#E5E0D5] dark:border-[#3D4B3B] pb-4">
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold mb-1 ${
                  selectedSubmission.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedSubmission.status === 'rejected'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  STATUS: {selectedSubmission.status.toUpperCase()}
                </span>
                <h2 className="font-serif-display text-xl font-semibold text-[#302035] dark:text-[#EAE4DA]">
                  Guest Note from {selectedSubmission.name}
                </h2>
                <p className="text-xs text-gray-500">
                  Target: {selectedSubmission.month} {selectedSubmission.year} • Submitted{' '}
                  {selectedSubmission.createdAt ? new Date(selectedSubmission.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-600 text-lg p-1"
              >
                ✕
              </button>
            </div>

            {/* Note Content */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Note Message
              </label>
              <div className="bg-white dark:bg-[#1F251E] p-4 rounded-xl border border-[#E5E0D5] dark:border-[#3D4B3B] text-sm text-[#302035] dark:text-[#EAE4DA] whitespace-pre-wrap font-serif-display leading-relaxed">
                "{selectedSubmission.message}"
              </div>
            </div>

            {/* Uploaded Photo Preview */}
            {selectedSubmission.photoUrl && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Uploaded Month-End Picture
                </label>
                <div className="rounded-xl overflow-hidden border border-[#E5E0D5] dark:border-[#3D4B3B] bg-black/10 max-h-96 flex items-center justify-center">
                  <img
                    src={selectedSubmission.photoUrl}
                    alt="Submission attachment"
                    className="max-h-96 w-auto object-contain rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E5E0D5] dark:border-[#3D4B3B]">
              <button
                onClick={() => {
                  setSubmissionToDelete(selectedSubmission)
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-200 text-xs font-medium transition-all"
              >
                🗑️ Delete Submission
              </button>

              <div className="flex items-center gap-2">
                {selectedSubmission.status !== 'approved' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedSubmission.id || selectedSubmission._id, 'approved')}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-all shadow-sm"
                  >
                    ✓ Approve Submission
                  </button>
                )}

                {selectedSubmission.status !== 'rejected' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedSubmission.id || selectedSubmission._id, 'rejected')}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition-all shadow-sm"
                  >
                    ✕ Reject Submission
                  </button>
                )}

                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 rounded-xl bg-[#EAE4D6] dark:bg-[#394737] hover:bg-[#D5CFBE] text-[#302035] dark:text-[#EAE4DA] text-xs font-medium transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {submissionToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F3] dark:bg-[#2D382B] border border-red-200 dark:border-red-900/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <span className="text-2xl">⚠️</span>
              <h3 className="font-serif-display font-semibold text-lg">Confirm Deletion</h3>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Are you sure you want to permanently delete the guest note submission from{' '}
              <strong className="text-red-700 dark:text-red-300">{submissionToDelete.name}</strong>?
              This action cannot be undone and will erase any associated photo from storage.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSubmissionToDelete(null)}
                className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-medium hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteSubmission}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-all shadow-md flex items-center gap-2"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
