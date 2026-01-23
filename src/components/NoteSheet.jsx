import { useState, useEffect } from 'react'
import './NoteSheet.css'

function NoteSheet({ listing, onSave, onClose }) {
  const [note, setNote] = useState(listing.note || '')

  useEffect(() => {
    setNote(listing.note || '')
  }, [listing])

  const handleSave = () => {
    onSave(note)
  }

  return (
    <>
      <div className="note-sheet-overlay" onClick={onClose}></div>
      <div className="note-sheet">
        <div className="note-sheet-header">
          <h3>Not Al</h3>
          <button className="note-sheet-close" onClick={onClose}>✕</button>
        </div>
        <div className="note-sheet-content">
          <textarea
            className="note-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notunuzu buraya yazın..."
            autoFocus
          />
        </div>
        <div className="note-sheet-actions">
          <button className="note-save-btn" onClick={handleSave}>
            Kaydet
          </button>
        </div>
      </div>
    </>
  )
}

export default NoteSheet
