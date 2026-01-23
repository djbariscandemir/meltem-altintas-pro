import { useState, useEffect } from 'react'
import NoteSheet from './NoteSheet'
import './DetailModal.css'

function DetailModal({ listing, onClose, onCall, onNoteSave }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showNoteSheet, setShowNoteSheet] = useState(false)

  // Reset image index when listing changes
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [listing.id])

  const handleCall = () => {
    onCall(listing)
    // In real app, this would open phone dialer
    // window.location.href = `tel:${listing.phone}`
  }

  const handleNoteSave = (note) => {
    onNoteSave(listing.id, note)
    setShowNoteSheet(false)
  }

  const nextImage = () => {
    if (currentImageIndex < listing.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1)
    }
  }

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1)
    }
  }

  return (
    <>
      <div className="detail-modal-overlay" onClick={onClose}></div>
      <div className="detail-modal">
        <button className="detail-modal-close" onClick={onClose}>✕</button>
        
        <div className="detail-image-slider">
          {listing.images.length > 1 && (
            <>
              <button 
                className="slider-btn prev" 
                onClick={prevImage}
                disabled={currentImageIndex === 0}
              >
                ‹
              </button>
              <button 
                className="slider-btn next" 
                onClick={nextImage}
                disabled={currentImageIndex === listing.images.length - 1}
              >
                ›
              </button>
            </>
          )}
          <img 
            src={listing.images?.[currentImageIndex] || '/images/no-image.png'}
            onError={(e) => {
              e.currentTarget.src = '/images/no-image.png'
            }} 
            alt={listing.title}
          />
          <div className="slider-indicator">
            {currentImageIndex + 1} / {listing.images.length}
          </div>
        </div>

        <div className="detail-content">
          <h2 className="detail-title">{listing.title}</h2>
          
          <div className="detail-info-grid">
            <div className="detail-info-item">
              <span className="detail-label">Fiyat</span>
              <span className="detail-value">{listing.price}</span>
            </div>
            <div className="detail-info-item">
              <span className="detail-label">Alan</span>
              <span className="detail-value">{listing.area}</span>
            </div>
            <div className="detail-info-item">
              <span className="detail-label">Oda</span>
              <span className="detail-value">{listing.rooms}</span>
            </div>
            <div className="detail-info-item">
              <span className="detail-label">Konum</span>
              <span className="detail-value">{listing.location}</span>
            </div>
          </div>

          <div className="detail-description">
            <h3>Açıklama</h3>
            <p>{listing.description}</p>
          </div>

          {listing.note && (
            <div className="detail-note">
              <h3>Notlarım</h3>
              <p>{listing.note}</p>
            </div>
          )}
        </div>

        <div className="detail-actions">
          <button className="detail-action-btn call-btn" onClick={handleCall}>
            📞 Ara
          </button>
          <button 
            className="detail-action-btn note-btn" 
            onClick={() => setShowNoteSheet(true)}
          >
            📝 Not Al
          </button>
          <button className="detail-action-btn close-btn" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>

      {showNoteSheet && (
        <NoteSheet
          listing={listing}
          onSave={handleNoteSave}
          onClose={() => setShowNoteSheet(false)}
        />
      )}
    </>
  )
}

export default DetailModal
