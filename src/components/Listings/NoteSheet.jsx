import { useState } from 'react'
import { X, Lock } from 'lucide-react'
import './NoteSheet.css'

function NoteSheet({ onSave, onClose }) {
  const [note, setNote] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  const handleSave = () => {
    if (note.trim()) {
      onSave(note.trim(), isPrivate)
      setNote('')
      setIsPrivate(false)
    }
  }

  return (
    <>
      <div className="note-sheet-overlay" onClick={onClose}></div>
      <div className="note-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="note-sheet-header">
          <h3>Not Al</h3>
          <button className="note-sheet-close" onClick={onClose}>
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        <div className="note-sheet-content">
          <textarea
            className="note-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notunuzu buraya yazın..."
            autoFocus
          />
          <label className="private-checkbox">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            <span>
              <Lock size={14} strokeWidth={2} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
              Özel not (sadece ben görebilirim)
            </span>
          </label>
        </div>
        <div className="note-sheet-actions">
          <button className="note-cancel-btn" onClick={onClose}>
            İptal
          </button>
          <button className="note-save-btn" onClick={handleSave}>
            Kaydet
          </button>
        </div>
      </div>
    </>
  )
}

export default NoteSheet
