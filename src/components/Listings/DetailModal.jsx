import { useState, useEffect } from 'react'
import { X, Phone, FileText, ExternalLink, Lock } from 'lucide-react'
import NoteSheet from './NoteSheet'
import { formatPrice } from '../../utils/formatPrice'
import { getParseStatusLabel, getParseStatusClass } from '../../utils/parseStatusLabel'
import PhotoCarousel from '../PhotoCarousel'
import './DetailModal.css'

// Keyboard navigation for modal
function useKeyboardNavigation(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])
}

function DetailModal({ user, listing, onClose, onCall, onNoteSave }) {
  const [showNoteSheet, setShowNoteSheet] = useState(false)
  
  useKeyboardNavigation(true, onClose)

  const getTitle = () => {
    return listing.title || 'İlan'
  }

  const handleCall = () => {
    onCall(listing)
  }

  const handleNoteSave = (note) => {
    if (note) { onNoteSave(listing.id, note); setShowNoteSheet(false) }
  }

  const getGalleryImages = () => {
    const from = Array.isArray(listing.image_urls) && listing.image_urls.length > 0
      ? listing.image_urls
      : Array.isArray(listing.photos) ? listing.photos : []
    return from
  }
  const galleryImages = getGalleryImages()

  // Filter notes based on user role
  const getVisibleNotes = () => {
    if (user.role === 'broker' || user.role === 'admin') {
      return listing.notes || []
    }
    return (listing.notes || []).filter(note => 
      !note.isPrivate || note.userId === user.id
    )
  }

  const visibleNotes = getVisibleNotes()
  const visibleActivities = (user.role === 'broker' || user.role === 'admin')
    ? (listing.activities || [])
    : (listing.activities || []).filter(a => a.userId === user.id)

  const formattedDate = listing.listing_date
    ? new Date(listing.listing_date).toLocaleDateString('tr-TR')
    : ''

  // Keyboard navigation: ESC to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <>
      <div className="detail-modal-overlay" onClick={onClose}></div>
      <div className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
        <button 
          className="detail-modal-close" 
          onClick={onClose}
          aria-label="Kapat"
        >
          <X size={20} strokeWidth={2} />
        </button>
        
        <div className="detail-image-slider">
          <PhotoCarousel
            photos={galleryImages}
            variant="detail"
            title={getTitle()}
          />
        </div>

        <div className="detail-content">
          <h2 className="detail-title">{getTitle()}</h2>
          
          <div className="detail-info-grid">
            <div className="detail-info-item">
              <span className="detail-label">İlan Başlığı</span>
              <span className="detail-value">{listing.title}</span>
            </div>
            {listing.owner_type && (
              <div className="detail-info-item">
                <span className="detail-label">İlan Sahibi Türü</span>
                <span className="detail-value">{listing.owner_type === 'mulk_sahibi' ? 'Mülk Sahibi' : 'Emlak Ofisi'}</span>
              </div>
            )}
            {listing.owner_name && (
              <div className="detail-info-item">
                <span className="detail-label">İlan Sahibi Adı</span>
                <span className="detail-value">{listing.owner_name}</span>
              </div>
            )}
            {formattedDate && (
              <div className="detail-info-item">
                <span className="detail-label">İlan Tarihi</span>
                <span className="detail-value">{formattedDate}</span>
              </div>
            )}
            <div className="detail-info-item">
              <span className="detail-label">Fiyat</span>
              <span className="detail-value">{formatPrice(Number(listing.price || 0))}</span>
            </div>
            {listing.rooms && (
              <div className="detail-info-item">
                <span className="detail-label">Oda Sayısı</span>
                <span className="detail-value">{listing.rooms}</span>
              </div>
            )}
            {listing.net_area != null && (
              <div className="detail-info-item">
                <span className="detail-label">Net m²</span>
                <span className="detail-value">{listing.net_area}</span>
              </div>
            )}
            {listing.gross_area != null && (
              <div className="detail-info-item">
                <span className="detail-label">Brüt m²</span>
                <span className="detail-value">{listing.gross_area}</span>
              </div>
            )}
            {listing.parse_status && getParseStatusLabel(listing.parse_status) && (
              <div className="detail-info-item">
                <span className="detail-label">Parse durumu</span>
                <span className={`detail-value parse-status-badge ${getParseStatusClass(listing.parse_status)}`}>
                  {getParseStatusLabel(listing.parse_status)}
                  {listing.parse_error && (
                    <span className="parse-error-text" title={listing.parse_error}> ({listing.parse_error.slice(0, 30)}…)</span>
                  )}
                </span>
              </div>
            )}
          </div>

          {visibleNotes.length > 0 && (
            <div className="detail-notes">
              <h3>Notlar {(user.role === 'broker' || user.role === 'admin') ? '(Tümü)' : '(Senin Notların)'}</h3>
              {visibleNotes.map(note => (
                <div key={note.id} className="note-item">
                  <div className="note-header">
                    <span className="note-author">{note.userName}</span>
                    {note.isPrivate && (
                      <span className="note-private">
                        <Lock size={12} strokeWidth={2} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
                        Özel
                      </span>
                    )}
                    <span className="note-date">
                      {new Date(note.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <div className="note-content">{note.content}</div>
                </div>
              ))}
            </div>
          )}

          {visibleActivities.length > 0 && (user.role === 'broker' || user.role === 'admin') && (
            <div className="detail-activities">
              <h3>Aktiviteler</h3>
              {visibleActivities.map((activity, idx) => (
                <div key={idx} className="activity-item">
                  <span className="activity-type">
                    {activity.type === 'call' ? (
                      <Phone size={16} strokeWidth={2} />
                    ) : (
                      <FileText size={16} strokeWidth={2} />
                    )}
                  </span>
                  <span className="activity-text">
                    {activity.userName} {activity.type === 'call' ? 'aradı' : 'not yazdı'}
                  </span>
                  <span className="activity-time">
                    {new Date(activity.timestamp).toLocaleString('tr-TR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="detail-actions">
          <button className="detail-action-btn call-btn" onClick={handleCall}>
            <Phone size={18} strokeWidth={2} style={{ marginRight: '8px' }} />
            Ara
          </button>
          <button 
            className="detail-action-btn note-btn" 
            onClick={() => setShowNoteSheet(true)}
          >
            <FileText size={18} strokeWidth={2} style={{ marginRight: '8px' }} />
            Not Al
          </button>
          {listing.listing_url && (
            <button
              type="button"
              className="detail-action-btn view-listing-btn"
              onClick={() => window.open(listing.listing_url, '_blank')}
            >
              <ExternalLink size={18} strokeWidth={2} style={{ marginRight: '8px' }} />
              İlana Git
            </button>
          )}
          <button className="detail-action-btn close-btn" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>

      {showNoteSheet && (
        <NoteSheet
          onSave={handleNoteSave}
          onClose={() => setShowNoteSheet(false)}
        />
      )}
    </>
  )
}

export default DetailModal
