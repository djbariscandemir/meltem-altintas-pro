import { useState, useEffect, useMemo } from 'react'
import { Clock } from 'lucide-react'
import { fetchAllNotes, insertNote, updateNote, deleteNote } from '../../services/notesRepository'
import { toast } from '../Toast/ToastContainer'
import EmptyState from '../EmptyState/EmptyState'
import './Notes.css'

function Notes({ user, listings, onUpdateListings }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedNote, setSelectedNote] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [reminderDate, setReminderDate] = useState('')
  const [reminderTime, setReminderTime] = useState('')

  // Supabase'den notları çek
  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    try {
      setLoading(true)
      console.log('[Notes] loadNotes başlatılıyor...')
      const allNotes = await fetchAllNotes()
      console.log(`[Notes] ✅ ${allNotes?.length || 0} not yüklendi`)
      setNotes(allNotes || [])
    } catch (error) {
      console.error('[Notes] ❌ loadNotes ERROR:', error)
      setNotes([])
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNote = async () => {
    if (!selectedNote || !noteText.trim()) {
      console.warn('[Notes] handleSaveNote: selectedNote veya noteText eksik')
      return
    }

    try {
      console.log('[Notes] handleSaveNote başlatılıyor...', {
        noteId: selectedNote.id,
        listing_id: selectedNote.listing_id,
        noteTextLength: noteText.trim().length
      })

      let reminderAt = null
      if (reminderDate) {
        const dateTime = reminderTime 
          ? `${reminderDate}T${reminderTime}:00`
          : `${reminderDate}T12:00:00`
        reminderAt = new Date(dateTime).toISOString()
      }

      if (selectedNote.id) {
        // Güncelle
        console.log('[Notes] Not güncelleniyor...')
        const updated = await updateNote(selectedNote.id, {
          note_text: noteText.trim(),
          reminder_at: reminderAt
        })
        console.log('[Notes] ✅ Not güncellendi:', updated?.id)
      } else {
        // Yeni not ekle
        console.log('[Notes] Yeni not ekleniyor...')
        const inserted = await insertNote({
          listing_id: selectedNote.listing_id,
          note_text: noteText.trim(),
          reminder_at: reminderAt
        })
        console.log('[Notes] ✅ Yeni not eklendi:', inserted?.id)
      }

      // Notları yeniden yükle
      console.log('[Notes] Notlar yeniden yükleniyor...')
      await loadNotes()
      
      toast.success(selectedNote.id ? 'Not güncellendi' : 'Not kaydedildi')
      setNoteText('')
      setReminderDate('')
      setReminderTime('')
      setSelectedNote(null)
      console.log('[Notes] ✅ handleSaveNote tamamlandı')
    } catch (error) {
      console.error('[Notes] ❌ handleSaveNote ERROR:', error)
      console.error('[Notes] Error message:', error.message)
      console.error('[Notes] Error stack:', error.stack)
      toast.error('Not kaydedilirken bir hata oluştu')
    }
  }

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId)
      await loadNotes()
      toast.success('Not silindi')
      setSelectedNote(null)
      setNoteText('')
      setReminderDate('')
      setReminderTime('')
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[Notes] handleDeleteNote error:', error)
      }
      toast.error('Not silinirken bir hata oluştu')
    }
  }

  const formatReminderDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getListingTitle = (listingId) => {
    const listing = listings.find(l => l.id === listingId)
    return listing?.title || 'Bilinmeyen İlan'
  }

  // Yeni not için ilan seçimi
  const handleSelectListingForNewNote = (listingId) => {
    console.log('[Notes] Yeni not için ilan seçildi:', listingId)
    setSelectedNote({
      id: null,
      listing_id: listingId,
      note_text: '',
      reminder_at: null
    })
    setNoteText('')
    setReminderDate('')
    setReminderTime('')
  }

  // Mevcut notu düzenle
  const handleSelectNote = (note) => {
    setSelectedNote(note)
    // note_text veya content (fallback)
    setNoteText(note.note_text || note.content || '')
    if (note.reminder_at) {
      const date = new Date(note.reminder_at)
      setReminderDate(date.toISOString().split('T')[0])
      setReminderTime(date.toTimeString().slice(0, 5))
    } else {
      setReminderDate('')
      setReminderTime('')
    }
  }

  if (loading) {
    return (
      <div className="notes-view">
        <div className="notes-header">
          <h2>Notlar</h2>
        </div>
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          <p>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="notes-view">
      <div className="notes-header">
        <h2>Notlar</h2>
        <p>İlanlar için notlar ve hatırlatıcılar ekleyin</p>
      </div>

      <div className="notes-content">
        <div className="notes-list">
          <h3>Notlar ({notes.length})</h3>
          {notes.length === 0 ? (
            <EmptyState type="notes" />
          ) : (
            <div className="notes-list-items">
              {notes.map(note => (
                <div 
                  key={note.id} 
                  className={`notes-item ${selectedNote?.id === note.id ? 'selected' : ''}`}
                  onClick={() => handleSelectNote(note)}
                >
                  <div className="notes-item-header">
                    <div className="notes-item-title">{getListingTitle(note.listing_id)}</div>
                    {note.reminder_at && (
                      <span className="notes-item-reminder-icon">
                        <Clock size={14} strokeWidth={2} />
                      </span>
                    )}
                  </div>
                  <div className="notes-item-content">
                    {note.note_text || note.content || ''}
                  </div>
                  <div className="notes-item-footer">
                    <span className="notes-item-date">{formatDate(note.created_at)}</span>
                    {note.reminder_at && (
                      <span className="notes-item-reminder">
                        {formatReminderDate(note.reminder_at)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Yeni Not Ekle</h3>
            <div className="notes-listings">
              {listings.map(listing => (
                <div 
                  key={listing.id} 
                  className={`notes-listing-item ${selectedNote?.listing_id === listing.id && !selectedNote?.id ? 'selected' : ''}`}
                  onClick={() => handleSelectListingForNewNote(listing.id)}
                >
                  <div className="notes-listing-title">{listing.title || 'İlan'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="notes-editor">
          {selectedNote ? (
            <>
              <h3>{getListingTitle(selectedNote.listing_id)}</h3>
              <textarea
                className="notes-textarea"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Notunuzu buraya yazın..."
                rows={8}
              />
              <div className="notes-reminder-section">
                <label>Hatırlatıcı Tarihi</label>
                <input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                />
                {reminderDate && (
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                  />
                )}
              </div>
              <div className="notes-actions">
                <button 
                  className="notes-save-btn"
                  onClick={handleSaveNote}
                  disabled={!noteText.trim()}
                >
                  Kaydet
                </button>
                {selectedNote.id && (
                  <button 
                    className="notes-delete-btn"
                    onClick={() => handleDeleteNote(selectedNote.id)}
                  >
                    Sil
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="notes-empty-state">
              <p>Not eklemek veya düzenlemek için bir not veya ilan seçin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Notes
