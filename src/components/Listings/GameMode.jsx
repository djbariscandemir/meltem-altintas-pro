import { useState, useEffect } from 'react'
import { Star, ChevronLeft, ChevronRight, MapPin, FileText } from 'lucide-react'
import { formatPrice } from '../../utils/formatPrice'
import { getCoverImageUrl } from '../../utils/getCoverImageUrl'
import LogoPlaceholder from '../LogoPlaceholder'
import './GameMode.css'

// Image component with logo fallback
function ImageWithLogoFallback({ src, alt }) {
  const [imageError, setImageError] = useState(false)
  
  if (imageError) {
    return <LogoPlaceholder showText={false} />
  }
  
  return (
    <img 
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setImageError(true)}
    />
  )
}

function GameMode({ listings, onSkip, onOpportunity, onDetail, onCall }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [queue, setQueue] = useState([])

  useEffect(() => {
    setQueue(listings)
    setCurrentIndex(0)
  }, [listings])

  const currentListing = queue[currentIndex]

  // Boş liste kontrolü
  if (!listings || listings.length === 0) {
    return (
      <div className="game-mode-empty">
        <p>Henüz ilan bulunmuyor.</p>
      </div>
    )
  }

  // Current listing yoksa
  if (!currentListing) {
    return (
      <div className="game-mode-empty">
        <p>Tüm ilanlar görüntülendi.</p>
      </div>
    )
  }

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

  // Development'ta debug logging
  if (import.meta.env.DEV) {
    console.debug('[GameMode] Listing render:', {
      id: currentListing.id,
      cover_image_url: currentListing.cover_image_url,
      image_urls_length: Array.isArray(currentListing.image_urls) ? currentListing.image_urls.length : null
    });
  }

  // Kapak fotoğrafı URL'ini belirle
  const coverImageUrl = getCoverImageUrl(currentListing)

  return (
    <div className="game-mode">
      <div className="game-card">
        {currentListing.isCustomStock && (
          <div className="custom-stock-badge">
            <Star size={14} strokeWidth={2.5} fill="currentColor" style={{ marginRight: '6px' }} />
            Özel Stok
          </div>
        )}
        <div className="game-card-image">
          {coverImageUrl ? (
            <ImageWithLogoFallback 
              src={coverImageUrl}
              alt={currentListing.title || "İlan fotoğrafı"}
            />
          ) : (
            <LogoPlaceholder showText={false} />
          )}
          {currentListing.isOpportunity && (
            <div className="opportunity-badge">
              <Star size={14} strokeWidth={2.5} fill="currentColor" style={{ marginRight: '6px' }} />
              Fırsat
            </div>
          )}
        </div>
        
        <div className="game-card-info">
          <h2 className="game-card-price">{formatPrice(currentListing.price)}</h2>
          <div className="game-card-details">
            {(currentListing.net_area || currentListing.netArea) && <span>{(currentListing.net_area || currentListing.netArea)} m²</span>}
            {(currentListing.net_area || currentListing.netArea) && currentListing.rooms && <span>•</span>}
            {currentListing.rooms && <span>{currentListing.rooms}</span>}
            {((currentListing.net_area || currentListing.netArea) || currentListing.rooms) && currentListing.district && <span>•</span>}
            {currentListing.district && <span>{currentListing.district}</span>}
            {currentListing.district && currentListing.neighborhood && <span> / {currentListing.neighborhood}</span>}
          </div>
          {((currentListing.property_category || currentListing.propertyCategory) || currentListing.source) && (
            <div className="game-card-meta">
              {(currentListing.property_category || currentListing.propertyCategory) && (
                <span className="game-card-category">
                  <FileText size={14} strokeWidth={2} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
                  {(currentListing.property_category || currentListing.propertyCategory)}
                </span>
              )}
              {currentListing.source && (
                <span className="game-card-source">
                  <MapPin size={14} strokeWidth={2} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
                  {currentListing.source}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="game-actions">
        <button className="action-btn skip-btn" onClick={handleSkip}>
          <ChevronLeft size={18} strokeWidth={2} style={{ marginRight: '6px' }} />
          Geç
        </button>
        <button 
          className={`action-btn opportunity-btn ${currentListing.isOpportunity ? 'active' : ''}`}
          onClick={handleOpportunity}
        >
          <Star size={18} strokeWidth={2} style={{ marginRight: '6px' }} />
          Fırsat
        </button>
        <button className="action-btn detail-btn" onClick={handleDetail}>
          <ChevronRight size={18} strokeWidth={2} style={{ marginRight: '6px' }} />
          Detay
        </button>
      </div>

      <div className="game-progress">
        {currentIndex + 1} / {queue.length}
      </div>
    </div>
  )
}

export default GameMode
