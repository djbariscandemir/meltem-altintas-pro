import { useState, useEffect } from 'react'
import { Star, ChevronLeft, ChevronRight, MapPin, FileText } from 'lucide-react'
import { formatPrice } from '../../utils/formatPrice'
import { getCoverImageUrl } from '../../utils/getCoverImageUrl'
import LogoPlaceholder from '../LogoPlaceholder'
import EmptyState from '../EmptyState/EmptyState'
import './GameMode.css'

function GameMode({ listings, onSkip, onOpportunity, onDetail, onCall }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [queue, setQueue] = useState([])
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setQueue(listings)
    setCurrentIndex(0)
    setImageError(false)
  }, [listings])

  useEffect(() => {
    // İlan değiştiğinde image error durumunu sıfırla
    setImageError(false)
  }, [currentIndex])

  const currentListing = queue[currentIndex]

  // Boş liste kontrolü
  if (!listings || listings.length === 0) {
    return <EmptyState type="listings" />
  }

  // Current listing yoksa
  if (!currentListing) {
    return (
      <EmptyState 
        type="listings" 
        customTitle="Tüm ilanlar görüntülendi"
        customDescription="Baştan başlamak için sayfayı yenileyin"
      />
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
          {coverImageUrl && !imageError ? (
            <img
              src={coverImageUrl}
              alt={currentListing.title || 'İlan fotoğrafı'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              onError={() => {
                if (import.meta.env.DEV) console.warn('[GameMode] Image failed to load:', coverImageUrl?.substring(0, 50))
                setImageError(true)
              }}
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
          {(currentListing.property_type || currentListing.owner_type) && (
            <div className="game-card-meta">
              {currentListing.property_type && (
                <span className="game-card-category">
                  <FileText size={14} strokeWidth={2} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
                  {currentListing.property_type === 'konut' ? 'Konut' : 'Ticari'}
                  {currentListing.property_subtype && ` · ${currentListing.property_subtype}`}
                </span>
              )}
              {currentListing.owner_type && (
                <span className="game-card-source">
                  <MapPin size={14} strokeWidth={2} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
                  {currentListing.owner_type === 'mulk_sahibi' ? 'Mülk Sahibi' : 'Emlak Ofisi'}
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
