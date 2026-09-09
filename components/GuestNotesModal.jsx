'use client'

import { useState } from 'react'

export default function GuestNotesModal({ isOpen, onClose }) {
  const [name, setName] = useState('')
  const [month, setMonth] = useState('September')
  const [year, setYear] = useState('2026')
  const [message, setMessage] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Photo must be smaller than 5MB')
      return
    }

    setSubmitError('')
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  const handleSubmitNote = async (e) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) {
      setSubmitError('Please enter your name and a note message.')
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('month', month)
      formData.append('year', year)
      formData.append('message', message.trim())
      if (photoFile) {
        formData.append('photo', photoFile)
      }

      const res = await fetch('/api/guest-notes', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSubmitSuccess(true)
        setName('')
        setMessage('')
        setPhotoFile(null)
        setPhotoPreview(null)
      } else {
        setSubmitError(data.error || 'Failed to submit guest note. Please try again.')
      }
    } catch (err) {
      setSubmitError('Server error while submitting note.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in font-sans-clean">
      <div className="bg-card text-card-foreground border border-border rounded-3xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden relative paper-tile">
        {/* Modal Header */}
        <div className="p-6 sm:p-8 border-b border-border bg-muted/40 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[hsl(var(--daisy-clay))] font-semibold mb-1">
              <span>✍️</span> Guest Book Entry
            </div>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-foreground">
              Guest Notes
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-serif-display italic mt-1">
              Leave a little note. Share a little memory.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all flex items-center justify-center text-base shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 bg-card">
          {submitSuccess ? (
            <div className="py-8 text-center space-y-4 bg-muted/30 border border-emerald-500/30 rounded-2xl p-8 shadow-sm">
              <span className="text-5xl block animate-bounce">💌</span>
              <h3 className="font-serif-display font-semibold text-xl text-foreground">
                Thank You for Sharing
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                Your note has been submitted to the DAHLIA Memory Garden curation queue. Once reviewed, it will be added to the Community Wall.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[hsl(var(--daisy-clay))] text-[hsl(var(--daisy-paper))] hover:opacity-90 text-xs font-medium rounded-xl transition-all shadow-md"
                >
                  Write Another Note
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 border border-border text-xs font-medium rounded-xl text-foreground hover:bg-muted/50 transition-all"
                >
                  Return to Garden
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitNote} className="space-y-5">
              {/* Name Input */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[hsl(var(--daisy-clay))] focus:ring-1 focus:ring-[hsl(var(--daisy-clay))] transition-all"
                />
              </div>

              {/* Target Month & Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Select Month *
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-border bg-background text-xs sm:text-sm text-foreground focus:outline-none focus:border-[hsl(var(--daisy-clay))] focus:ring-1 focus:ring-[hsl(var(--daisy-clay))] transition-all"
                  >
                    {monthsList.map((m) => (
                      <option key={m} value={m} className="bg-card text-foreground">
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Select Year *
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-border bg-background text-xs sm:text-sm text-foreground focus:outline-none focus:border-[hsl(var(--daisy-clay))] focus:ring-1 focus:ring-[hsl(var(--daisy-clay))] transition-all"
                  >
                    {['2024', '2025', '2026', '2027', '2028'].map((y) => (
                      <option key={y} value={y} className="bg-card text-foreground">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Note Message */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <label className="font-medium text-foreground">
                    Your Note *
                  </label>
                  <span className="text-muted-foreground/70 text-[10px]">{message.length}/500</span>
                </div>
                <textarea
                  required
                  maxLength={500}
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your reflection, story, or memory note here..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[hsl(var(--daisy-clay))] focus:ring-1 focus:ring-[hsl(var(--daisy-clay))] resize-none leading-relaxed font-serif-display italic transition-all"
                />
              </div>

              {/* Optional Month-End Picture */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">
                  Optional Month-End Picture (Max 5MB)
                </label>

                {photoPreview ? (
                  <div className="relative rounded-xl border border-border overflow-hidden p-2 bg-background flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <span className="text-xs text-foreground truncate max-w-[180px]">
                        {photoFile?.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="px-3 py-1 bg-destructive/15 text-destructive text-xs rounded-lg hover:bg-destructive/25 transition-all font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-[hsl(var(--daisy-clay))] transition-all bg-muted/20 hover:bg-muted/40 group">
                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🖼️</span>
                    <span className="text-xs font-medium text-foreground">
                      Upload a photo memory
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">JPG, PNG, WEBP, or GIF</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {submitError && (
                <div className="p-3 bg-destructive/15 border border-destructive/30 rounded-xl text-xs text-destructive">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[hsl(var(--daisy-clay))] text-[hsl(var(--daisy-paper))] hover:opacity-90 font-medium rounded-xl text-xs sm:text-sm transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    Submitting Note...
                  </>
                ) : (
                  'Submit Note to Garden Curation →'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
