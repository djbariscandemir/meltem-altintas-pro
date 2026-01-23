import { useState } from 'react'
import { Phone, Star, Eye, FileText, MapPin, Tag } from 'lucide-react'
import { formatPrice } from '../../utils/formatPrice'
import { getCoverImageUrl } from '../../utils/getCoverImageUrl'
import LogoPlaceholder from '../LogoPlaceholder'
import './ListMode.css'

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

function ListMode({ user, listings, onOpportunity, onDetail, onCall, onNoteSave }) {
  const [logoLoaded, setLogoLoaded] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const handleLogoLoad = () => {
    setLogoLoaded(true)
    setLogoError(false)
  }

  const handleLogoError = () => {
    setLogoError(true)
    setLogoLoaded(false)
  }

  if (listings.length === 0) {
    return (
      <div className="list-mode-empty">
        <div className="empty-state-logo-wrapper">
          <img 
            src="/logo.png" 
            alt="Meltem Altıntaş Pro" 
            className={`empty-state-logo ${logoLoaded ? 'logo-loaded' : ''} ${logoError ? 'logo-error' : ''}`}
            onLoad={handleLogoLoad}
            onError={handleLogoError}
            style={{ display: logoError ? 'none' : 'block' }}
          />
          {logoError && (
            <span className="empty-state-logo-fallback">Meltem Altıntaş Pro</span>
          )}
        </div>
        <h3 className="empty-state-title">Henüz ilan bulunmuyor</h3>
        <p className="empty-state-text">Filtreleri değiştirerek daha fazla sonuç görebilirsiniz</p>
      </div>
    )
  }

  // Filter notes based on user role
  const getVisibleNotes = (listing) => {
    if (user.role === 'broker') {
      return listing.notes || []
    }
    return (listing.notes || []).filter(note => 
      !note.isPrivate || note.userId === user.id
    )
  }

  // Kategori label'ı (konut / ticari)
  const getCategoryLabel = (category) => {
    if (!category) return ''
    if (category.toLowerCase() === 'konut') return 'Konut'
    if (category.toLowerCase() === 'ticari') return 'Ticari'
    return category
  }

  // Kaynak label'ı
  const getSourceLabel = (source) => {
    if (!source) return ''
    if (source.includes('Mülk Sahibi') || source.includes('mülk sahibi')) return 'Mülk Sahibi'
    if (source.includes('Emlak Ofisi') || source.includes('emlak ofisi')) return 'Emlak Ofisi'
    return source
  }

  return (
    <div className="list-mode">
      {listings.map(listing => {
        // Development'ta debug logging
        if (import.meta.env.DEV) {
          console.debug('[ListMode] Listing render:', {
            id: listing.id,
            cover_image_url: listing.cover_image_url,
            image_urls_length: Array.isArray(listing.image_urls) ? listing.image_urls.length : null
          });
        }
        
        const visibleNotes = getVisibleNotes(listing)
        
        // Kapak fotoğrafı URL'ini belirle
        const coverImageUrl = getCoverImageUrl(listing)
        
        return (
          <div 
            key={listing.id} 
            className={`list-card ${listing.isOpportunity ? 'opportunity' : ''} ${listing.isCustomStock ? 'custom-stock' : ''}`}
          >
            <div className="list-card-image">
              {coverImageUrl ? (
                <ImageWithLogoFallback 
                  src={coverImageUrl}
                  alt={listing.title || "İlan fotoğrafı"}
                />
              ) : (
                <LogoPlaceholder showText={false} />
              )}
              {listing.isOpportunity && (
                <div className="opportunity-badge-small">
                  <Star size={14} strokeWidth={2.5} fill="currentColor" />
                </div>
              )}
              {listing.isCustomStock && (
                <div className="custom-stock-badge-small">
                  <Star size={12} strokeWidth={2.5} fill="currentColor" style={{ marginRight: '4px' }} />
                  Özel
                </div>
              )}
            </div>

            <div className="list-card-content">
              {/* Rozetler: İlan Durumu ve İlan Tipi */}
              <div className="list-card-badges">
                {listing.is_active !== null && listing.is_active !== undefined && (
                  <span className={`status-badge ${listing.is_active ? 'status-active' : 'status-passive'}`}>
                    {listing.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                )}
                {listing.listing_type && (
                  <span className="type-badge">
                    {listing.listing_type === 'satilik' ? 'Satılık' : listing.listing_type === 'kiralik' ? 'Kiralık' : listing.listing_type}
                  </span>
                )}
              </div>
              
              <h3 className="list-card-title">{listing.title}</h3>
              
              {/* Zorunlu alanlar: fiyat, oda sayısı, net m², ilçe/mahalle, kategori, kaynak */}
              <div className="list-card-info">
                <div className="list-card-info-row">
                  <span className="list-card-price">{formatPrice(listing.price)}</span>
                  {listing.rooms && (
                    <span className="list-card-rooms">{listing.rooms}</span>
                  )}
                  {(listing.net_area || listing.netArea) && (
                    <span className="list-card-area">{(listing.net_area || listing.netArea)} m²</span>
                  )}
                </div>
                <div className="list-card-info-row">
                  {listing.district && listing.neighborhood && (
                    <span className="list-card-location">{listing.district} / {listing.neighborhood}</span>
                  )}
                  {listing.district && !listing.neighborhood && (
                    <span className="list-card-location">{listing.district}</span>
                  )}
                  {!listing.district && listing.neighborhood && (
                    <span className="list-card-location">{listing.neighborhood}</span>
                  )}
                </div>
                <div className="list-card-meta">
                  {(listing.property_category || listing.propertyCategory) && (
                    <span className="list-card-category">
                      <Tag size={14} strokeWidth={2} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
                      {getCategoryLabel(listing.property_category || listing.propertyCategory)}
                    </span>
                  )}
                  {listing.source && (
                    <span className="list-card-source">
                      <MapPin size={14} strokeWidth={2} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />
                      {getSourceLabel(listing.source)}
                    </span>
                  )}
                </div>
              </div>
              
              {listing.isCustomStock && listing.contractor && (
                <div className="list-card-contractor">
                  Müteahhit: {listing.contractor} {listing.commissionRate && `(${listing.commissionRate}% komisyon)`}
                </div>
              )}
              {visibleNotes.length > 0 && (
                <div className="list-card-notes-preview">
                  {visibleNotes.length} not
                </div>
              )}
            </div>

            <div className="list-card-actions">
              <button 
                className="action-icon-btn"
                onClick={() => onCall(listing)}
                title="Ara"
              >
                <Phone size={18} strokeWidth={2} />
              </button>
              <button 
                className={`action-icon-btn ${listing.isOpportunity ? 'active' : ''}`}
                onClick={() => onOpportunity(listing)}
                title="Fırsat"
              >
                <Star size={18} strokeWidth={2} />
              </button>
              <button 
                className="action-icon-btn"
                onClick={() => onDetail(listing)}
                title="Detay"
              >
                <Eye size={18} strokeWidth={2} />
              </button>
              <button 
                className="action-icon-btn"
                onClick={() => {
                  const note = prompt('Not (Özel not için başına "özel:" yazın):', '')
                  if (note !== null && note.trim()) {
                    const isPrivate = note.trim().toLowerCase().startsWith('özel:')
                    const noteContent = isPrivate ? note.trim().substring(5).trim() : note.trim()
                    if (noteContent) {
                      onNoteSave(listing.id, noteContent, isPrivate)
                    }
                  }
                }}
                title="Not"
              >
                <FileText size={18} strokeWidth={2} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ListMode
