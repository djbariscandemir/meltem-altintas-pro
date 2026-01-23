import { useState, useEffect } from 'react'
import './GameMode.css'

function GameMode({ listings, onSkip, onOpportunity, onDetail, onCall }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [queue, setQueue] = useState([])

  useEffect(() => {
    // Initialize queue with all listings
    setQueue(listings)
    setCurrentIndex(0)
  }, [listings])

  const currentListing = queue[currentIndex]

  const handleSkip = () => {
    if (currentListing) {
      onSkip(currentListing)
      nextListing()
    }
  }

  const handleOpportunity = () => {
    if (currentListing) {
      onOpportunity(currentListing)
      nextListing()
    }
  }

  const handleDetail = () => {
    if (currentListing) {
      onDetail(currentListing)
    }
  }

  const nextListing = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // Queue finished, reset or show message
      setCurrentIndex(0)
    }
  }

  if (!currentListing) {
    return (
      <div className="game-mode-empty">
        <p>Henüz ilan bulunmuyor.</p>
      </div>
    )
  }

  return (
    <div className="game-mode">
      <div className="game-card">
        <div className="game-card-image">
          <img 
            src={
              currentListing.cover_image_url &&
              currentListing.cover_image_url.startsWith("http")
                ? currentListing.cover_image_url
                : "/images/no-image.png"
            }
            onError={(e) => {
              e.currentTarget.src = '/images/no-image.png'
            }} 
            alt={currentListing.title || "İlan fotoğrafı"}
            loading="lazy"
          />
          {currentListing.isOpportunity && (
            <div className="opportunity-badge">⭐ Fırsat</div>
          )}
        </div>
        
        <div className="game-card-info">
          <h2 className="game-card-price">{currentListing.price}</h2>
          <div className="game-card-details">
            <span>{currentListing.area}</span>
            <span>•</span>
            <span>{currentListing.rooms}</span>
            <span>•</span>
            <span>{currentListing.location}</span>
          </div>
        </div>
      </div>

      <div className="game-actions">
        <button className="action-btn skip-btn" onClick={handleSkip}>
          👈 Geç
        </button>
        <button 
          className={`action-btn opportunity-btn ${currentListing.isOpportunity ? 'active' : ''}`}
          onClick={handleOpportunity}
        >
          ⭐ Fırsat
        </button>
        <button className="action-btn detail-btn" onClick={handleDetail}>
          👉 Detay
        </button>
      </div>

      <div className="game-progress">
        {currentIndex + 1} / {queue.length}
      </div>
    </div>
  )
}

export default GameMode
