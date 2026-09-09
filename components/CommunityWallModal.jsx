'use client'

import { useState, useEffect, useCallback } from 'react'

export default function CommunityWallModal({ isOpen, onClose, onOpenWriteNote }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchFilter, setSearchFilter] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  const fetchApprovedNotes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/guest-notes')
      if (res.ok) {
        const data = await res.json()
        setNotes(data.notes || [])
      }
    } catch (err) {
      console.error('Failed to fetch community notes:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchApprovedNotes()
    }
  }, [isOpen, fetchApprovedNotes])

  // Filter notes by search query
  const filteredNotes = notes.filter((n) => {
    if (!searchFilter.trim()) return true
    const q = searchFilter.toLowerCase().trim()
    return (
      n.name.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q) ||
      `${n.month} ${n.year}`.toLowerCase().includes(q)
    )
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in font-sans-clean">
      <div className="bg-card text-card-foreground border border-border rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative paper-tile">
        {/* Header Bar */}
        <div className="p-6 sm:p-8 border-b border-border bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[hsl(var(--daisy-clay))] font-semibold mb-1">
              <span>🌸</span> Public Memory Wall
            </div>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-foreground">
              Garden Community Wall
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-serif-display italic mt-0.5">
              Discover reflections, stories, and month-end memories shared by guests of the garden.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {onOpenWriteNote && (
              <button
                onClick={() => {
                  onClose()
                  onOpenWriteNote()
                }}
                className="px-4 py-2 bg-[hsl(var(--daisy-clay))] text-[hsl(var(--daisy-paper))] hover:opacity-90 text-xs font-medium rounded-xl transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>✍️</span> Leave a Note
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all flex items-center justify-center text-base shrink-0"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        {notes.length > 0 && (
          <div className="px-6 py-3 border-b border-border/70 bg-card flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground font-medium">
              {filteredNotes.length} {filteredNotes.length === 1 ? 'memory' : 'memories'} shared
            </span>

            <div className="relative w-full max-w-xs">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search notes, names, or months..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[hsl(var(--daisy-clay))] focus:ring-1 focus:ring-[hsl(var(--daisy-clay))]"
              />
              <span className="absolute left-2.5 top-2 text-xs text-muted-foreground/60">🔍</span>
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2.5 top-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Community Wall Grid Container */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-card">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--daisy-clay))] mx-auto"></div>
              <p className="text-xs text-muted-foreground font-sans-clean">Gathering community memories...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="py-20 text-center space-y-4 max-w-md mx-auto">
              <span className="text-5xl block">🌱</span>
              <h3 className="font-serif-display font-semibold text-xl text-foreground">
                {notes.length === 0 ? 'The Garden Wall is quiet' : 'No memories found'}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {notes.length === 0
                  ? 'Be the first visitor to plant a memory note in the garden wall.'
                  : `No community memories matched "${searchFilter}".`}
              </p>
              {onOpenWriteNote && notes.length === 0 && (
                <button
                  onClick={() => {
                    onClose()
                    onOpenWriteNote()
                  }}
                  className="px-5 py-2.5 bg-[hsl(var(--daisy-clay))] text-[hsl(var(--daisy-paper))] hover:opacity-90 text-xs font-medium rounded-xl transition-all shadow-md inline-flex items-center gap-2"
                >
                  ✍️ Write the First Memory Note
                </button>
              )}
            </div>
          ) : (
            /* Responsive Masonry Composition */
            <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
              {filteredNotes.map((note) => (
                <div
                  key={note.id || note._id}
                  className="break-inside-avoid bg-popover border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between group"
                >
                  {/* Card Header: Month/Year */}
                  <div className="flex items-center justify-between text-xs text-[hsl(var(--daisy-clay))] border-b border-border/60 pb-2">
                    <span className="font-semibold tracking-wide">{note.month} {note.year}</span>
                    <span className="text-[10px] opacity-60">
                      {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>

                  {/* Prominent Photo Attachment */}
                  {note.photoUrl && (
                    <div
                      onClick={() => setSelectedPhoto(note.photoUrl)}
                      className="relative rounded-xl overflow-hidden border border-border cursor-pointer bg-muted/20"
                    >
                      <img
                        src={note.photoUrl}
                        alt={`Memory photo by ${note.name}`}
                        className="w-full max-h-72 object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                        🔍 Click to enlarge photo
                      </div>
                    </div>
                  )}

                  {/* Note Message */}
                  <p className="font-serif-display text-sm sm:text-base text-foreground leading-relaxed italic pt-1">
                    "{note.message}"
                  </p>

                  {/* Card Footer: Submitter */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">
                      — {note.name}
                    </span>
                    <span className="text-[hsl(var(--daisy-clay))] text-[10px] bg-muted px-2.5 py-0.5 rounded-full font-medium border border-border/40">
                      🌿 Community Memory
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox for Photo Enlarge */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer animate-fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedPhoto}
              alt="Enlarged community photo"
              className="max-h-[85vh] w-auto object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 text-white text-base font-medium hover:text-gray-300"
            >
              Close ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
