import { useState, useEffect } from 'react'
import { X, Phone, FileText, ExternalLink, Lock } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import NoteSheet from './NoteSheet'
import { formatPrice } from '../../utils/formatPrice'
import LogoPlaceholder from '../LogoPlaceholder'
import './DetailModal.css'

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

function DetailModal({ user, listing, onClose, onCall, onNoteSave }) {
  
  const getTitle = () => {
    return listing.title || 'İlan'
  }
  const [showNoteSheet, setShowNoteSheet] = useState(false)

  const handleCall = () => {
    onCall(listing)
  }

  const handleNoteSave = (note, isPrivate) => {
    onNoteSave(listing.id, note, isPrivate)
    setShowNoteSheet(false)
  }

  // Development'ta debug logging
  if (import.meta.env.DEV) {
    console.debug('[DetailModal] Listing render:', {
      id: listing.id,
      cover_image_url: listing.cover_image_url,
      image_urls_length: Array.isArray(listing.image_urls) ? listing.image_urls.length : null
    });
  }

  // Detay sayfası için galeri: SADECE image_urls kullanılır
  // cover_image_url galeriye DAHİL EDİLMEZ
  const getGalleryImages = () => {
    // image_urls array kontrolü
    if (Array.isArray(listing.image_urls) && listing.image_urls.length > 0) {
      // Sadece geçerli URL'leri filtrele
      return listing.image_urls.filter(url => 
        url && 
        typeof url === 'string' && 
        url.startsWith('http')
      )
    }
    
    // image_urls boşsa boş array döndür (placeholder gösterilecek)
    return []
  }

  const galleryImages = getGalleryImages()

  // Filter notes based on user role
  const getVisibleNotes = () => {
    if (user.role === 'broker') {
      return listing.notes || []
    }
    return (listing.notes || []).filter(note => 
      !note.isPrivate || note.userId === user.id
    )
  }

  const visibleNotes = getVisibleNotes()
  const visibleActivities = user.role === 'broker' 
    ? (listing.activities || [])
    : (listing.activities || []).filter(a => a.userId === user.id)

  const formattedDate = listing.listing_date
    ? new Date(listing.listing_date).toLocaleDateString('tr-TR')
    : ''

  return (
    <>
      <div className="detail-modal-overlay" onClick={onClose}></div>
      <div className="detail-modal">
        <button className="detail-modal-close" onClick={onClose}>
          <X size={20} strokeWidth={2} />
        </button>
        
        {/* Swipe edilebilir galeri - Sadece image_urls varsa göster */}
        {galleryImages.length > 0 ? (
          <div className="detail-image-slider">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation={galleryImages.length > 1}
              pagination={galleryImages.length > 1 ? { clickable: true } : false}
              spaceBetween={0}
              slidesPerView={1}
              className="detail-swiper"
            >
              {galleryImages.map((imageUrl, index) => (
                <SwiperSlide key={index}>
                  <div className="swiper-slide-wrapper">
                    <ImageWithLogoFallback
                      src={imageUrl}
                      alt={`${getTitle() || "İlan"} - Foto ${index + 1}`}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <div className="detail-image-placeholder">
            <LogoPlaceholder showText={true} />
          </div>
        )}

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
                <span className="detail-value">{listing.owner_type}</span>
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
          </div>

          {/* Telefon Numaraları */}
          {listing.phone_numbers && Array.isArray(listing.phone_numbers) && listing.phone_numbers.length > 0 && (
            <div className="detail-phone-numbers">
              <h3>Telefon Numaraları</h3>
              {listing.phone_numbers.map((phoneNumber, index) => (
                <div key={index} className="phone-number-item">
                  <span className="phone-number">{phoneNumber}</span>
                  <button
                    className="phone-call-btn"
                    onClick={() => {
                      window.location.href = `tel:${phoneNumber}`
                    }}
                  >
                    <Phone size={16} strokeWidth={2} style={{ marginRight: '6px' }} />
                    Ara
                  </button>
                </div>
              ))}
            </div>
          )}

          {visibleNotes.length > 0 && (
            <div className="detail-notes">
              <h3>Notlar {user.role === 'broker' ? '(Tümü)' : '(Senin Notların)'}</h3>
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

          {visibleActivities.length > 0 && user.role === 'broker' && (
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
